import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { AgentBuilder } from '@iqai/adk';
import { YieldGuardianAgent } from './agent/core/YieldGuardianAgent';
import { config } from './config';
import { logger } from './utils/logger';
import { AgentStatus, RiskProfile } from '@yield-guardian/shared';
import { yieldRoutes } from './routes/yield';
import {
    rateLimitConfig,
    rateLimitErrorHandler,
    rateLimitKeyGenerator,
    rateLimitOnExceeding,
    rateLimitOnBanReach
} from './middleware/rateLimiter';
import { validateRequest, StartAgentRequestSchema, StopAgentRequestSchema } from './validation/schemas';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const fastify = Fastify({ logger: true });

// Register Swagger Documentation
fastify.register(swagger, {
    openapi: {
        info: {
            title: 'Yield Guardian Agent API',
            description: 'Enterprise Control Plane for Autonomous DeFi Agent',
            version: '1.0.0'
        },
        servers: [{ url: 'http://localhost:3001' }]
    }
});

fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false
    }
});

// Register plugins
fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://yieldguardian.vercel.app']
        : true // Allow all in development
});

// Enhanced rate limiting with per-endpoint limits
fastify.register(rateLimit, {
    global: false, // We'll apply per-route
    ...rateLimitConfig.global,
    keyGenerator: rateLimitKeyGenerator,
    errorResponseBuilder: rateLimitErrorHandler as any,
    onExceeding: rateLimitOnExceeding,
    onBanReach: rateLimitOnBanReach,
});

// Register routes
fastify.register(yieldRoutes);

// Register error handlers
fastify.setErrorHandler(errorHandler);
fastify.setNotFoundHandler(notFoundHandler);

// Type-safe API key verification middleware
const verifyApiKey = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const authHeader = request.headers['authorization'];
    const apiKeyHeader = request.headers['x-api-key'];

    const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : typeof apiKeyHeader === 'string' ? apiKeyHeader : undefined;

    const validKey = config.api.apiKey || process.env.API_KEY;

    if (!token || !validKey || token !== validKey) {
        reply.code(401).send({ error: 'Unauthorized', message: 'Valid API key required' });
        return;
    }
};

// Singleton Agent instance
let agent: YieldGuardianAgent | null = null;
let isRunning = false;

// Agent Control Plane with validation
fastify.post('/api/v1/control/start', {
    preHandler: [verifyApiKey, validateRequest(StartAgentRequestSchema)],
    config: {
        rateLimit: rateLimitConfig.byEndpoint['POST /api/v1/control/start']
    }
}, async (request, reply) => {
    if (isRunning) return { status: 'already_running' };

    try {
        const agentBuilder = new AgentBuilder()
            .withName(config.agent.name)
            .withDescription(config.agent.description)
            .withVersion(config.agent.version);

        agent = new YieldGuardianAgent(agentBuilder);
        await agent.initialize();

        // Start in background to not block HTTP response
        agent.start().catch(err => logger.error('Agent runtime error', err));

        isRunning = true;
        return { status: 'started' };
    } catch (err) {
        logger.error('Failed to start agent', err);
        return reply.code(500).send({ error: 'Failed to start agent' });
    }
});

fastify.post('/api/v1/control/stop', {
    preHandler: [verifyApiKey, validateRequest(StopAgentRequestSchema)],
    config: {
        rateLimit: rateLimitConfig.byEndpoint['POST /api/v1/control/stop']
    }
}, async (request, reply) => {
    if (!agent || !isRunning) return { status: 'not_running' };

    await agent.stop();
    isRunning = false;
    return { status: 'stopped' };
});

fastify.get('/api/v1/status', {
    config: {
        rateLimit: rateLimitConfig.byEndpoint['GET /api/v1/status']
    }
}, async (request, reply) => {
    const status: AgentStatus = {
        isRunning,
        currentStrategy: 'Yield Maximization (Risk Adjusted)',
        activePositions: 3, // Mock for now
        lastHeartbeat: new Date()
    };
    return status;
});

// Mock Risk Data Endpoint (until DB is ready)
fastify.get('/api/v1/risk', {
    config: {
        rateLimit: rateLimitConfig.byEndpoint['GET /api/v1/risk']
    }
}, async (request, reply) => {
    const mockRisk: RiskProfile = {
        address: config.blockchain.walletAddress || '0x0000',
        riskScore: isRunning ? 24 : 0, // Dynamic risk score
        lastUpdated: new Date()
    };
    return mockRisk;
});

fastify.get('/health', {
    config: {
        rateLimit: rateLimitConfig.byEndpoint['GET /health']
    }
}, async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
    try {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
        await fastify.listen({ port, host: '0.0.0.0' });
        logger.info(`Agent Control Plane running on port ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
