import { describe, it, expect, beforeEach } from 'vitest';
import { CompoundAdapter } from '../../src/protocols/CompoundAdapter';

describe('CompoundAdapter', () => {
    let adapter: CompoundAdapter;

    beforeEach(() => {
        adapter = new CompoundAdapter('http://localhost:8545');
    });

    describe('constructor', () => {
        it('should initialize with correct name', () => {
            expect(adapter.name).toBe('Compound V3');
        });

        it('should store RPC URL', () => {
            const customAdapter = new CompoundAdapter('https://eth-mainnet.example.com');
            expect(customAdapter).toBeDefined();
        });
    });

    describe('getYield', () => {
        it('should return yield data for USDC', async () => {
            const yieldData = await adapter.getYield('USDC');

            expect(yieldData.protocol).toBe('Compound V3');
            expect(yieldData.asset).toBe('USDC');
            expect(yieldData.apy).toBe(3.8);
            expect(yieldData.tvl).toBe('850000000');
            expect(yieldData.riskScore).toBe(18);
            expect(yieldData.lastUpdated).toBeInstanceOf(Date);
        });

        it('should return yield data for USDT', async () => {
            const yieldData = await adapter.getYield('USDT');

            expect(yieldData.apy).toBe(3.7);
            expect(yieldData.asset).toBe('USDT');
        });

        it('should return yield data for DAI', async () => {
            const yieldData = await adapter.getYield('DAI');

            expect(yieldData.apy).toBe(3.5);
            expect(yieldData.asset).toBe('DAI');
        });

        it('should return yield data for WETH', async () => {
            const yieldData = await adapter.getYield('WETH');

            expect(yieldData.apy).toBe(2.5);
            expect(yieldData.asset).toBe('WETH');
        });

        it('should return 0 APY for unsupported assets', async () => {
            const yieldData = await adapter.getYield('BTC');

            expect(yieldData.apy).toBe(0);
            expect(yieldData.asset).toBe('BTC');
        });

        it('should have lower APY than Aave for same asset', async () => {
            const compoundUSDC = await adapter.getYield('USDC');
            // Aave USDC is 4.2%, Compound is 3.8%
            expect(compoundUSDC.apy).toBeLessThan(4.2);
        });

        it('should have lower TVL than major protocols', async () => {
            const yieldData = await adapter.getYield('USDC');
            const tvlNum = parseInt(yieldData.tvl);
            expect(tvlNum).toBeLessThan(1000000000); // Less than $1B
        });

        it('should return recent lastUpdated timestamp', async () => {
            const beforeCall = new Date();
            const yieldData = await adapter.getYield('USDC');
            const afterCall = new Date();

            expect(yieldData.lastUpdated.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
            expect(yieldData.lastUpdated.getTime()).toBeLessThanOrEqual(afterCall.getTime());
        });
    });

    describe('getTVL', () => {
        it('should return consistent TVL', async () => {
            const tvl = await adapter.getTVL('USDC');
            expect(tvl).toBe('850000000');
        });

        it('should return TVL as string', async () => {
            const tvl = await adapter.getTVL('DAI');
            expect(typeof tvl).toBe('string');
        });

        it('should return same TVL for different assets', async () => {
            const tvlUSDC = await adapter.getTVL('USDC');
            const tvlDAI = await adapter.getTVL('DAI');
            expect(tvlUSDC).toBe(tvlDAI);
        });
    });

    describe('getRiskScore', () => {
        it('should return low-medium risk score', async () => {
            const riskScore = await adapter.getRiskScore();
            expect(riskScore).toBe(18);
        });

        it('should have slightly higher risk than Aave', async () => {
            const riskScore = await adapter.getRiskScore();
            // Aave is 15, Compound is 18
            expect(riskScore).toBeGreaterThan(15);
            expect(riskScore).toBeLessThan(20);
        });

        it('should return number type', async () => {
            const riskScore = await adapter.getRiskScore();
            expect(typeof riskScore).toBe('number');
        });
    });

    describe('edge cases', () => {
        it('should handle empty string asset', async () => {
            const yieldData = await adapter.getYield('');
            expect(yieldData.apy).toBe(0);
            expect(yieldData.asset).toBe('');
        });

        it('should handle special characters in asset name', async () => {
            const yieldData = await adapter.getYield('USD-C');
            expect(yieldData.apy).toBe(0);
        });

        it('should handle very long asset names', async () => {
            const longAssetName = 'A'.repeat(1000);
            const yieldData = await adapter.getYield(longAssetName);
            expect(yieldData.asset).toBe(longAssetName);
            expect(yieldData.apy).toBe(0);
        });
    });
});
