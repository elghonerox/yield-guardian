
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

// Minimal mock server for testing route logic
describe('Agent Server API Config', () => {
    let server: FastifyInstance;

    beforeAll(async () => {
        server = Fastify();
        await server.register(cors);

        server.get('/health', async () => {
            return { status: 'ok' };
        });
    });

    afterAll(async () => {
        await server.close();
    });

    it('should respond to health check', async () => {
        const response = await server.inject({
            method: 'GET',
            url: '/health'
        });
        expect(response.statusCode).toBe(200);
        expect(response.json()).toEqual({ status: 'ok' });
    });
});
