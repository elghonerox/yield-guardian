import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { yieldRoutes } from '../../src/routes/yield';

describe('API Integration Tests - Yield Routes', () => {
    let server: FastifyInstance;

    beforeAll(async () => {
        server = Fastify({ logger: false });
        await server.register(cors);
        await server.register(yieldRoutes);
        await server.ready();
    });

    afterAll(async () => {
        await server.close();
    });

    describe('GET /api/v1/yields/:asset', () => {
        it('should return all yields for USDC', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/yields/USDC'
            });

            expect(response.statusCode).toBe(200);
            const yields = response.json();
            expect(Array.isArray(yields)).toBe(true);
            expect(yields.length).toBe(4); // Aave, Compound, Frax, Yearn
            expect(yields[0]).toHaveProperty('protocol');
            expect(yields[0]).toHaveProperty('asset');
            expect(yields[0]).toHaveProperty('apy');
        });

        it('should handle lowercase asset names', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/yields/usdc'
            });

            expect(response.statusCode).toBe(200);
            const yields = response.json();
            expect(yields[0].asset).toBe('USDC'); // Should be uppercase
        });

        it('should return yields for USDT', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/yields/USDT'
            });

            expect(response.statusCode).toBe(200);
            const yields = response.json();
            expect(yields.length).toBeGreaterThan(0);
        });

        it('should handle unsupported assets gracefully', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/yields/UNKNOWN'
            });

            expect(response.statusCode).toBe(200);
            const yields = response.json();
            expect(Array.isArray(yields)).toBe(true);
        });
    });

    describe('GET /api/v1/yields/:asset/best', () => {
        it('should return best yield for USDC', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/yields/USDC/best'
            });

            expect(response.statusCode).toBe(200);
            const bestYield = response.json();
            expect(bestYield).toHaveProperty('protocol');
            expect(bestYield).toHaveProperty('apy');
            expect(bestYield.protocol).toBe('Yearn Finance'); // Should be highest for USDC
            expect(bestYield.apy).toBe(4.5);
        });

        it('should handle lowercase asset names', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/yields/dai/best'
            });

            expect(response.statusCode).toBe(200);
            const bestYield = response.json();
            expect(bestYield.asset).toBe('DAI');
        });

        it('should return valid yield data structure', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/yields/WETH/best'
            });

            const yieldData = response.json();
            expect(yieldData).toHaveProperty('protocol');
            expect(yieldData).toHaveProperty('asset');
            expect(yieldData).toHaveProperty('apy');
            expect(yieldData).toHaveProperty('tvl');
            expect(yieldData).toHaveProperty('riskScore');
            expect(yieldData).toHaveProperty('lastUpdated');
        });
    });

    describe('GET /api/v1/protocols/compare/:asset', () => {
        it('should return protocol comparison for USDC', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/protocols/compare/USDC'
            });

            expect(response.statusCode).toBe(200);
            const comparison = response.json();
            expect(comparison).toHaveProperty('asset');
            expect(comparison).toHaveProperty('protocols');
            expect(comparison).toHaveProperty('bestProtocol');
            expect(comparison).toHaveProperty('avgApy');
        });

        it('should include all protocols in comparison', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/protocols/compare/USDC'
            });

            const comparison = response.json();
            expect(comparison.protocols.length).toBe(4);
            expect(comparison.bestProtocol).toBe('Yearn Finance');
        });

        it('should calculate average APY correctly', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/protocols/compare/USDC'
            });

            const comparison = response.json();
            expect(comparison.avgApy).toBeGreaterThan(0);
            expect(typeof comparison.avgApy).toBe('number');
        });

        it('should handle lowercase asset names', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/protocols/compare/dai'
            });

            expect(response.statusCode).toBe(200);
            const comparison = response.json();
            expect(comparison.asset).toBe('DAI');
        });
    });

    describe('POST /api/v1/rebalance/check', () => {
        it('should check rebalancing recommendation', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/api/v1/rebalance/check',
                payload: {
                    currentProtocol: 'Compound V3',
                    asset: 'USDC',
                    amount: '10000',
                    gasPrice: 30
                }
            });

            expect(response.statusCode).toBe(200);
            const decision = response.json();
            expect(decision).toHaveProperty('shouldRebalance');
            expect(decision).toHaveProperty('fromProtocol');
            expect(decision).toHaveProperty('toProtocol');
            expect(decision).toHaveProperty('reasoning');
        });

        it('should use default gas price if not provided', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/api/v1/rebalance/check',
                payload: {
                    currentProtocol: 'Aave V3',
                    asset: 'USDC',
                    amount: '5000'
                }
            });

            expect(response.statusCode).toBe(200);
            const decision = response.json();
            expect(decision).toHaveProperty('estimatedGasCost');
        });

        it('should handle uppercase asset conversion', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/api/v1/rebalance/check',
                payload: {
                    currentProtocol: 'Compound V3',
                    asset: 'usdc', // lowercase
                    amount: '10000',
                    gasPrice: 50
                }
            });

            expect(response.statusCode).toBe(200);
            const decision = response.json();
            expect(decision.fromProtocol).toBe('Compound V3');
        });

        it('should handle high gas prices correctly', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/api/v1/rebalance/check',
                payload: {
                    currentProtocol: 'Compound V3',
                    asset: 'USDC',
                    amount: '1000',
                    gasPrice: 1000 // Very high gas
                }
            });

            const decision = response.json();
            expect(decision.shouldRebalance).toBe(false);
            expect(decision.reasoning).toContain('gas cost');
        });

        it('should handle small amounts correctly', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/api/v1/rebalance/check',
                payload: {
                    currentProtocol: 'Compound V3',
                    asset: 'USDC',
                    amount: '100', // Small amount
                    gasPrice: 50
                }
            });

            const decision = response.json();
            expect(decision.shouldRebalance).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle invalid HTTP methods', async () => {
            const response = await server.inject({
                method: 'POST',
                url: '/api/v1/yields/USDC' // GET endpoint called with POST
            });

            expect(response.statusCode).toBe(404);
        });

        it('should handle missing route parameters gracefully', async () => {
            const response = await server.inject({
                method: 'GET',
                url: '/api/v1/yields/' // Missing asset parameter
            });

            expect(response.statusCode).toBe(404);
        });
    });
});
