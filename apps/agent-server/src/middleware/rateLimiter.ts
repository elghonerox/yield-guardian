import { FastifyRequest, FastifyReply } from 'fastify';

export interface RateLimitConfig {
    global: RateLimitOptions;
    byEndpoint: Record<string, RateLimitOptions>;
}

export interface RateLimitOptions {
    max: number;
    timeWindow: string | number;
    ban?: number; // Ban duration in milliseconds after persistent violations
}

export const rateLimitConfig: RateLimitConfig = {
    // Global default rate limit
    global: {
        max: 100,
        timeWindow: '1 minute',
    },

    // Per-endpoint rate limits
    byEndpoint: {
        // Read endpoints - Higher limits
        'GET /api/v1/status': {
            max: 300,
            timeWindow: '1 minute',
        },
        'GET /api/v1/risk': {
            max: 300,
            timeWindow: '1 minute',
        },
        'GET /api/v1/yields/:asset': {
            max: 200,
            timeWindow: '1 minute',
        },
        'GET /api/v1/yields/:asset/best': {
            max: 200,
            timeWindow: '1 minute',
        },
        'GET /api/v1/protocols/compare/:asset': {
            max: 100,
            timeWindow: '1 minute',
        },

        // Write endpoints - Lower limits (potential side effects)
        'POST /api/v1/control/start': {
            max: 10,
            timeWindow: '1 minute',
            ban: 300000, // Ban for 5 minutes after excessive attempts
        },
        'POST /api/v1/control/stop': {
            max: 10,
            timeWindow: '1 minute',
        },
        'POST /api/v1/rebalance/check': {
            max: 30,
            timeWindow: '1 minute',
        },

        // Health check - Very high limit
        'GET /health': {
            max: 1000,
            timeWindow: '1 minute',
        },
    },
};

/**
 * Enhanced error handler for rate limit exceeded
 */
export function rateLimitErrorHandler(request: FastifyRequest, reply: FastifyReply) {
    return reply.code(429).send({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: reply.getHeader('Retry-After'),
        endpoint: `${request.method} ${request.url}`,
    });
}

/**
 * Custom key generator for rate limiting
 * Uses API key if present, otherwise falls back to IP
 */
export function rateLimitKeyGenerator(request: FastifyRequest): string {
    // Prefer API key for authenticated requests
    const apiKey = request.headers['x-api-key'] ||
        (request.headers['authorization'] as string)?.replace('Bearer ', '');

    if (apiKey) {
        return `key:${apiKey}`;
    }

    // Fall back to IP address
    const forwarded = request.headers['x-forwarded-for'] as string;
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.ip;

    return `ip:${ip}`;
}

/**
 * Hook to log rate limit violations
 */
export function rateLimitOnExceeding(request: FastifyRequest) {
    const key = rateLimitKeyGenerator(request);
    console.warn(`[RATE_LIMIT] Limit exceeded for ${key} on ${request.method} ${request.url}`);

    // TODO: Send alert for persistent violations (could indicate attack)
    // This would integrate with alerting system (email, Slack, etc.)
}

/**
 * Hook fired when a client is banned
 */
export function rateLimitOnBanReach(request: FastifyRequest) {
    const key = rateLimitKeyGenerator(request);
    console.error(`[RATE_LIMIT] Client BANNED: ${key} on ${request.method} ${request.url}`);

    // TODO: Integrate with security monitoring (e.g., log to SIEM, send critical alert)
}
