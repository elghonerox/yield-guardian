import { describe, it, expect, beforeEach } from 'vitest';
import { YearnAdapter } from '../../src/protocols/YearnAdapter';

describe('YearnAdapter', () => {
    let adapter: YearnAdapter;

    beforeEach(() => {
        adapter = new YearnAdapter('http://localhost:8545');
    });

    describe('constructor', () => {
        it('should initialize with correct name', () => {
            expect(adapter.name).toBe('Yearn Finance');
        });

        it('should store RPC URL', () => {
            const customAdapter = new YearnAdapter('https://eth-mainnet.example.com');
            expect(customAdapter).toBeDefined();
        });
    });

    describe('getYield', () => {
        it('should return yield data for USDC', async () => {
            const yieldData = await adapter.getYield('USDC');

            expect(yieldData.protocol).toBe('Yearn Finance');
            expect(yieldData.asset).toBe('USDC');
            expect(yieldData.apy).toBe(4.5);
            expect(yieldData.tvl).toBe('650000000');
            expect(yieldData.riskScore).toBe(20);
            expect(yieldData.lastUpdated).toBeInstanceOf(Date);
        });

        it('should return yield data for USDT', async () => {
            const yieldData = await adapter.getYield('USDT');

            expect(yieldData.apy).toBe(4.4);
            expect(yieldData.asset).toBe('USDT');
        });

        it('should return yield data for DAI', async () => {
            const yieldData = await adapter.getYield('DAI');

            expect(yieldData.apy).toBe(4.3);
            expect(yieldData.asset).toBe('DAI');
        });

        it('should return yield data for WETH', async () => {
            const yieldData = await adapter.getYield('WETH');

            expect(yieldData.apy).toBe(3.2);
            expect(yieldData.asset).toBe('WETH');
        });

        it('should return 0 APY for unsupported assets', async () => {
            const yieldData = await adapter.getYield('FRAX');

            expect(yieldData.apy).toBe(0);
            expect(yieldData.asset).toBe('FRAX');
        });

        it('should have highest USDC APY among major protocols', async () => {
            const yearnUSDC = await adapter.getYield('USDC');
            // Yearn USDC at 4.5% should beat Aave (4.2%) and Compound (3.8%)
            expect(yearnUSDC.apy).toBeGreaterThan(4.2);
        });

        it('should support same assets as Aave/Compound', async () => {
            const usdc = await adapter.getYield('USDC');
            const usdt = await adapter.getYield('USDT');
            const dai = await adapter.getYield('DAI');
            const weth = await adapter.getYield('WETH');

            expect(usdc.apy).toBeGreaterThan(0);
            expect(usdt.apy).toBeGreaterThan(0);
            expect(dai.apy).toBeGreaterThan(0);
            expect(weth.apy).toBeGreaterThan(0);
        });

        it('should have mid-range TVL', async () => {
            const yieldData = await adapter.getYield('USDC');
            const tvlNum = parseInt(yieldData.tvl);
            // Should be between Frax (450M) and Compound (850M)
            expect(tvlNum).toBeGreaterThan(450000000);
            expect(tvlNum).toBeLessThan(850000000);
        });

        it('should return recent timestamp', async () => {
            const beforeCall = new Date();
            const yieldData = await adapter.getYield('USDC');
            const afterCall = new Date();

            expect(yieldData.lastUpdated.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
            expect(yieldData.lastUpdated.getTime()).toBeLessThanOrEqual(afterCall.getTime());
        });
    });

    describe('getTVL', () => {
        it('should return TVL for any asset', async () => {
            const tvl = await adapter.getTVL('USDC');
            expect(tvl).toBe('650000000');
        });

        it('should return TVL as string', async () => {
            const tvl = await adapter.getTVL('DAI');
            expect(typeof tvl).toBe('string');
        });

        it('should return consistent TVL', async () => {
            const tvl1 = await adapter.getTVL('USDC');
            const tvl2 = await adapter.getTVL('WETH');
            expect(tvl1).toBe(tvl2);
        });
    });

    describe('getRiskScore', () => {
        it('should return low risk score', async () => {
            const riskScore = await adapter.getRiskScore();
            expect(riskScore).toBe(20);
        });

        it('should have risk between Compound and Frax', async () => {
            const riskScore = await adapter.getRiskScore();
            // Compound: 18, Yearn: 20, Frax: 22
            expect(riskScore).toBeGreaterThan(18);
            expect(riskScore).toBeLessThan(22);
        });

        it('should be in low risk category', async () => {
            const riskScore = await adapter.getRiskScore();
            expect(riskScore).toBeLessThan(30); // Below medium risk threshold
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

        it('should handle case sensitivity', async () => {
            const lowerCase = await adapter.getYield('usdc');
            expect(lowerCase.apy).toBe(0); // Only uppercase supported
        });

        it('should handle Frax-specific assets', async () => {
            const frax = await adapter.getYield('FRAX');
            const frxETH = await adapter.getYield('frxETH');

            expect(frax.apy).toBe(0);
            expect(frxETH.apy).toBe(0);
        });

        it('should handle numeric asset names', async () => {
            const yieldData = await adapter.getYield('123');
            expect(yieldData.apy).toBe(0);
            expect(yieldData.asset).toBe('123');
        });

        it('should handle very long asset names', async () => {
            const longName = 'X'.repeat(500);
            const yieldData = await adapter.getYield(longName);
            expect(yieldData.asset).toBe(longName);
            expect(yieldData.apy).toBe(0);
        });
    });

    describe('comparison with other protocols', () => {
        it('should offer competitive APY for USDC', async () => {
            const yearnUSDC = await adapter.getYield('USDC');
            // Should be competitive (within top 2 for USDC)
            expect(yearnUSDC.apy).toBeGreaterThanOrEqual(4.0);
        });

        it('should have moderate TVL', async () => {
            const tvl = await adapter.getTVL('USDC');
            const tvlNum = parseInt(tvl);
            // Not the highest, not the lowest
            expect(tvlNum).toBeGreaterThan(400000000);
            expect(tvlNum).toBeLessThan(900000000);
        });

        it('should have balanced risk-reward profile', async () => {
            const yieldData = await adapter.getYield('USDC');
            const riskScore = await adapter.getRiskScore();

            // Good APY (4.5%) with reasonable risk (20)
            expect(yieldData.apy).toBeGreaterThan(4.0);
            expect(riskScore).toBeLessThan(25);
        });
    });
});
