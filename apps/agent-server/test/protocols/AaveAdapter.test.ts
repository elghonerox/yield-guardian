import { describe, it, expect, beforeEach } from 'vitest';
import { AaveAdapter } from '../../src/protocols/AaveAdapter';

describe('AaveAdapter', () => {
    let adapter: AaveAdapter;

    beforeEach(() => {
        adapter = new AaveAdapter('http://localhost:8545');
    });

    describe('constructor', () => {
        it('should initialize with correct name', () => {
            expect(adapter.name).toBe('Aave V3');
        });

        it('should store RPC URL', () => {
            const customAdapter = new AaveAdapter('https://eth-mainnet.example.com');
            expect(customAdapter).toBeDefined();
        });
    });

    describe('getYield', () => {
        it('should return yield data for USDC', async () => {
            const yieldData = await adapter.getYield('USDC');

            expect(yieldData.protocol).toBe('Aave V3');
            expect(yieldData.asset).toBe('USDC');
            expect(yieldData.apy).toBe(4.2);
            expect(yieldData.tvl).toBe('1200000000');
            expect(yieldData.riskScore).toBe(15);
            expect(yieldData.lastUpdated).toBeInstanceOf(Date);
        });

        it('should return yield data for USDT', async () => {
            const yieldData = await adapter.getYield('USDT');

            expect(yieldData.apy).toBe(4.1);
            expect(yieldData.asset).toBe('USDT');
        });

        it('should return yield data for DAI', async () => {
            const yieldData = await adapter.getYield('DAI');

            expect(yieldData.apy).toBe(3.9);
            expect(yieldData.asset).toBe('DAI');
        });

        it('should return yield data for WETH', async () => {
            const yieldData = await adapter.getYield('WETH');

            expect(yieldData.apy).toBe(2.8);
            expect(yieldData.asset).toBe('WETH');
        });

        it('should return 0 APY for unsupported assets', async () => {
            const yieldData = await adapter.getYield('UNSUPPORTED');

            expect(yieldData.apy).toBe(0);
            expect(yieldData.asset).toBe('UNSUPPORTED');
        });

        it('should return consistent TVL across assets', async () => {
            const usdcData = await adapter.getYield('USDC');
            const daiData = await adapter.getYield('DAI');

            expect(usdcData.tvl).toBe(daiData.tvl);
        });

        it('should return consistent risk score across assets', async () => {
            const usdcData = await adapter.getYield('USDC');
            const wethData = await adapter.getYield('WETH');

            expect(usdcData.riskScore).toBe(wethData.riskScore);
        });

        it('should have recent lastUpdated timestamp', async () => {
            const beforeCall = new Date();
            const yieldData = await adapter.getYield('USDC');
            const afterCall = new Date();

            expect(yieldData.lastUpdated.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
            expect(yieldData.lastUpdated.getTime()).toBeLessThanOrEqual(afterCall.getTime());
        });
    });

    describe('getTVL', () => {
        it('should return TVL for USDC', async () => {
            const tvl = await adapter.getTVL('USDC');
            expect(tvl).toBe('1200000000');
        });

        it('should return TVL for any asset', async () => {
            const tvl = await adapter.getTVL('RANDOM_ASSET');
            expect(tvl).toBe('1200000000');
        });

        it('should return string (not number)', async () => {
            const tvl = await adapter.getTVL('USDC');
            expect(typeof tvl).toBe('string');
        });
    });

    describe('getRiskScore', () => {
        it('should return low risk score', async () => {
            const riskScore = await adapter.getRiskScore();
            expect(riskScore).toBe(15);
        });

        it('should return number (not string)', async () => {
            const riskScore = await adapter.getRiskScore();
            expect(typeof riskScore).toBe('number');
        });

        it('should return risk score below 20 (very safe protocol)', async () => {
            const riskScore = await adapter.getRiskScore();
            expect(riskScore).toBeLessThan(20);
        });
    });

    describe('edge cases', () => {
        it('should handle empty string asset', async () => {
            const yieldData = await adapter.getYield('');
            expect(yieldData.apy).toBe(0);
            expect(yieldData.asset).toBe('');
        });

        it('should handle null-like asset names gracefully', async () => {
            const yieldData = await adapter.getYield('null');
            expect(yieldData.apy).toBe(0);
        });

        it('should handle case-sensitive asset names', async () => {
            const lowerCase = await adapter.getYield('usdc');
            expect(lowerCase.apy).toBe(0); // Only uppercase supported
        });
    });
});
