import { describe, it, expect, beforeEach } from 'vitest';
import { FraxAdapter } from '../../src/protocols/FraxAdapter';

describe('FraxAdapter', () => {
    let adapter: FraxAdapter;

    beforeEach(() => {
        adapter = new FraxAdapter('http://localhost:8545');
    });

    describe('constructor', () => {
        it('should initialize with correct name', () => {
            expect(adapter.name).toBe('Frax Finance');
        });

        it('should store RPC URL', () => {
            const customAdapter = new FraxAdapter('https://eth-mainnet.example.com');
            expect(customAdapter).toBeDefined();
        });
    });

    describe('getYield', () => {
        it('should return yield data for FRAX', async () => {
            const yieldData = await adapter.getYield('FRAX');

            expect(yieldData.protocol).toBe('Frax Finance');
            expect(yieldData.asset).toBe('FRAX');
            expect(yieldData.apy).toBe(5.1);
            expect(yieldData.tvl).toBe('450000000');
            expect(yieldData.riskScore).toBe(22);
            expect(yieldData.lastUpdated).toBeInstanceOf(Date);
        });

        it('should return yield data for frxETH', async () => {
            const yieldData = await adapter.getYield('frxETH');

            expect(yieldData.apy).toBe(3.8);
            expect(yieldData.asset).toBe('frxETH');
            expect(yieldData.protocol).toBe('Frax Finance');
        });

        it('should return 0 APY for unsupported assets', async () => {
            const yieldData = await adapter.getYield('USDC');

            expect(yieldData.apy).toBe(0);
            expect(yieldData.asset).toBe('USDC');
        });

        it('should have highest APY among major stablecoins', async () => {
            const fraxData = await adapter.getYield('FRAX');
            // FRAX at 5.1% should be higher than Aave USDC (4.2%) and Compound USDC (3.8%)
            expect(fraxData.apy).toBeGreaterThan(4.2);
        });

        it('should support Frax-specific assets only', async () => {
            const frax = await adapter.getYield('FRAX');
            const frxETH = await adapter.getYield('frxETH');
            const usdc = await adapter.getYield('USDC');

            expect(frax.apy).toBeGreaterThan(0);
            expect(frxETH.apy).toBeGreaterThan(0);
            expect(usdc.apy).toBe(0);
        });

        it('should have consistent protocol name', async () => {
            const frax = await adapter.getYield('FRAX');
            const frxETH = await adapter.getYield('frxETH');

            expect(frax.protocol).toBe('Frax Finance');
            expect(frxETH.protocol).toBe('Frax Finance');
        });

        it('should return recent timestamp', async () => {
            const beforeCall = new Date();
            const yieldData = await adapter.getYield('FRAX');
            const afterCall = new Date();

            expect(yieldData.lastUpdated.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
            expect(yieldData.lastUpdated.getTime()).toBeLessThanOrEqual(afterCall.getTime());
        });
    });

    describe('getTVL', () => {
        it('should return TVL for FRAX', async () => {
            const tvl = await adapter.getTVL('FRAX');
            expect(tvl).toBe('450000000');
        });

        it('should return TVL as string', async () => {
            const tvl = await adapter.getTVL('frxETH');
            expect(typeof tvl).toBe('string');
        });

        it('should have lower TVL than Aave/Compound', async () => {
            const tvl = await adapter.getTVL('FRAX');
            const tvlNum = parseInt(tvl);
            expect(tvlNum).toBeLessThan(850000000); // Less than Compound
        });
    });

    describe('getRiskScore', () => {
        it('should return low-medium risk score', async () => {
            const riskScore = await adapter.getRiskScore();
            expect(riskScore).toBe(22);
        });

        it('should have higher risk than Aave/Compound', async () => {
            const riskScore = await adapter.getRiskScore();
            // Aave: 15, Compound: 18, Frax: 22
            expect(riskScore).toBeGreaterThan(18);
        });

        it('should still be in low-medium risk category', async () => {
            const riskScore = await adapter.getRiskScore();
            expect(riskScore).toBeLessThan(30); // Below 30 is still relatively safe
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

        it('should handle case-sensitive Frax assets', async () => {
            // "frax" (lowercase) should not match "FRAX"
            const yieldData = await adapter.getYield('frax');
            expect(yieldData.apy).toBe(0);
        });

        it('should handle non-Frax stablecoins', async () => {
            const usdc = await adapter.getYield('USDC');
            const dai = await adapter.getYield('DAI');
            const usdt = await adapter.getYield('USDT');

            expect(usdc.apy).toBe(0);
            expect(dai.apy).toBe(0);
            expect(usdt.apy).toBe(0);
        });

        it('should handle partial matches', async () => {
            const yieldData = await adapter.getYield('FRA');
            expect(yieldData.apy).toBe(0);
        });
    });
});
