import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

describe('API Integration Tests - Control Plane & Core Endpoints', () => {
    let server: FastifyInstance;

    beforeAll(async () => {
        server = Fastify({ logger: false });
        await server.register(cors);

        // Mock agent state
        let isRunning = false;

        // Register control plane endpoints (simplified versions for testing)
        server.post('/api/v1/control/start', async (request, reply) => {
            const authHeader = request.headers['authorization'];
            const apiKey = request.headers['x-api-key'];

            // Simple API key check for testing
            const validKey = process.env.API_KEY || 'test-api-key';
            const providedKey = (authHeader as string)?.replace('Bearer ', '') || apiKey;

            if (!providedKey || providedKey !== validKey) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            if (isRunning) {
                return { status: 'already_running' };
            }

            isRunning = true;
            return { status: 'started' };
        });

        server.post('/api/v1/control/stop', async (request, reply) => {
            const authHeader = request.headers['authorization'];
            const apiKey = request.headers['x-api-key'];

            const validKey = process.env.API_KEY || 'test-api-key';
            const providedKey = (authHeader as string)?.replace('Bearer ', '') || apiKey;

            if (!providedKey || providedKey !== validKey) {
                return reply.code(401).send({ error: 'Unauthorized' });
            }

            if (!isRunning) {
                return { status: 'not_running' };
            }

            isRunning = false;
            return { status: 'stopped' };
        });

        server.get('/api/v1/status', async () => {
            return {
                isRunning,
                currentStrategy: 'Yield Maximization (Risk Adjusted)',
                activePositions: 3,
                lastHeartbeat: new Date()
            };
        });

        server.get('/api/v1/risk', async () => {
            return {
                address: '0x0000000000000000000000000000000000000000',
                riskScore: isRunning ? 24 : 0,
                lastUpdated: new Date()
            };
        });

        server.get('/health', async () => {
            return { status: 'ok', timestamp: new Date().toISOString() };
        });

        await server.ready();
    });

    afterAll(async () => {
        await server.close();
    });

    describe('POST /api/v1/control/start', () => {
        it('should start agent with valid API key', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/api/v1/control/start',
                headers: {
                    'authorization': 'Bearer test-api-key'
                }
            });

            expect(response.statusCode).toBe(200);
            const data = response.json();
            expect(data.status).toBe('started');
        });

        it('should reject request without API key', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/api/v1/control/start'
            });

            expect(response.statusCode).toBe(401);
            const data = response.json();
            expect(data.error).toBe('Unauthorized');
        });

        it('should reject request with invalid API key', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/api/v1/control/start',
                headers: {
                    'authorization': 'Bearer invalid-key'
                }
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return already_running if agent already started', async () => {
            // First start
            await server.inject({
                method: 'POST',
                url: '/api/v1/control/start',
                headers: { 'authorization': 'Bearer test-api-key' }
            });

            // Try to start again
            const response = await server.inject({
                method: 'POST',
                url: '/api/v1/control/start',
                headers: { 'authorization': 'Bearer test-api-key' }
            });

            const data = response.json();
            expect(data.status).toBe('already_running');
        });

        it('should accept API key via x-api-key header', async () => {
            // First stop the agent
            await server.inject({
                method: 'POST',
                url: '/api/v1/control/stop',
                headers: { 'x-api-key': 'test-api-key' }
            });

            const response = await server.inject({
                method: 'POST',
                url: '/api/v1/control/start',
                headers: { 'x-api-key': 'test-api-key' }
            });

            expect(response.statusCode).toBe(200);
            const data = response.json();
            expect(data.status).toBe('started');
        });
    });

    describe('POST /api/v1/control/stop', () => {
        beforeEach(async () => {
            // Ensure agent is started before stop tests
            await server.inject({
                method: 'POST',
                url: '/api/v1/control/start',
                headers: { 'authorization': 'Bearer test-api-key' }
            });
        });

        it('should stop agent with valid API key', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/api/v1/control/stop',
                headers: { 'authorization': 'Bearer test-api-key' }
            });

            expect(response.statusCode).toBe(200);
            const data = response.json();
            expect(data.status).toBe('stopped');
        });

        it('should reject request without API key', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/api/v1/control/stop'
            });

            expect(response.statusCode).toBe(401);
        });

        it('should return not_running if agent not started', async () => {
            // Stop once
            await server.inject({
                method: 'POST',
                url: '/api/v1/control/stop',
                headers: { 'authorization': 'Bearer test-api-key' }
            });

            // Try to stop again
            const response = await server.inject({
                method: 'POST',
                url: '/api/v1/control/stop',
                headers: { 'authorization': 'Bearer test-api-key' }
            });

            const data = response.json();
            expect(data.status).toBe('not_running');
        });
    });

    describe('GET /api/v1/status', () => {
        it('should return status without authentication', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/status'
            });

            expect(response.statusCode).toBe(200);
            const status = response.json();
            expect(status).toHaveProperty('isRunning');
            expect(status).toHaveProperty('currentStrategy');
            expect(status).toHaveProperty('activePositions');
            expect(status).toHaveProperty('lastHeartbeat');
        });

        it('should reflect agent running state', async () => {
            // Start agent
            await server.inject({
                method: 'POST',
                url: '/api/v1/control/start',
                headers: { 'authorization': 'Bearer test-api-key' }
            });

            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/status'
            });

            const status = response.json();
            expect(status.isRunning).toBe(true);
        });

        it('should show correct strategy', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/status'
            });

            const status = response.json();
            expect(status.currentStrategy).toBe('Yield Maximization (Risk Adjusted)');
        });

        it('should have valid timestamp format', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/status'
            });

            const status = response.json();
            expect(new Date(status.lastHeartbeat)).toBeInstanceOf(Date);
        });
    });

    describe('GET /api/v1/risk', () => {
        it('should return risk profile without authentication', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/risk'
            });

            expect(response.statusCode).toBe(200);
            const risk = response.json();
            expect(risk).toHaveProperty('address');
            expect(risk).toHaveProperty('riskScore');
            expect(risk).toHaveProperty('lastUpdated');
        });

        it('should show zero risk when agent not running', async () => {
            // Stop agent
            await server.inject({
                method: 'POST',
                url: '/api/v1/control/stop',
                headers: { 'authorization': 'Bearer test-api-key' }
            });

            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/risk'
            });

            const risk = response.json();
            expect(risk.riskScore).toBe(0);
        });

        it('should show non-zero risk when agent running', async () => {
            // Start agent
            await server.inject({
                method: 'POST',
                url: '/api/v1/control/start',
                headers: { 'authorization': 'Bearer test-api-key' }
            });

            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/risk'
            });

            const risk = response.json();
            expect(risk.riskScore).toBeGreaterThan(0);
            expect(risk.riskScore).toBe(24);
        });

        it('should have valid address format', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/risk'
            });

            const risk = response.json();
            expect(risk.address).toMatch(/^0x[0-9a-fA-F]{40}$/);
        });
    });

    describe('GET /health', () => {
        it('should return healthy status', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/health'
            });

            expect(response.statusCode).toBe(200);
            const health = response.json();
            expect(health.status).toBe('ok');
            expect(health.timestamp).toBeDefined();
        });

        it('should have ISO timestamp format', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/health'
            });

            const health = response.json();
            expect(health.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        });

        it('should respond quickly (< 100ms)', async () => {
            const start = Date.now();
            await server.inject({
                method: 'GET',
                url: '/health'
            });
            const duration = Date.now() - start;

            expect(duration).toBeLessThan(100);
        });
    });

    describe('API Flow Integration', () => {
        it('should handle complete start-stop cycle', async () => {
            // 1. Start agent
            const startResp = await server.inject({
                method: 'POST',
                url: '/api/v1/control/start',
                headers: { 'authorization': 'Bearer test-api-key' }
            });
            expect(startResp.json().status).toBe('started');

            // 2. Check status
            const statusResp = await server.inject({
                method: 'GET',
                url: '/api/v1/status'
            });
            expect(statusResp.json().isRunning).toBe(true);

            // 3. Check risk
            const riskResp = await server.inject({
                method: 'GET',
                url: '/api/v1/risk'
            });
            expect(riskResp.json().riskScore).toBeGreaterThan(0);

            // 4. Stop agent
            const stopResp = await server.inject({
                method: 'POST',
                url: '/api/v1/control/stop',
                headers: { 'authorization': 'Bearer test-api-key' }
            });
            expect(stopResp.json().status).toBe('stopped');

            // 5. Verify stopped
            const finalStatusResp = await server.inject({
                method: 'GET',
                url: '/api/v1/status'
            });
            expect(finalStatusResp.json().isRunning).toBe(false);
        });
    });
});
