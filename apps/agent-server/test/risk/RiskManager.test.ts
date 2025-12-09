import { describe, it, expect } from 'vitest';
import { RiskManager, PortfolioPosition } from '../../src/risk/RiskManager';

describe('RiskManager', () => {
    describe('calculateProtocolRisk', () => {
        it('should calculate Aave V3 as very safe', () => {
            const riskFactors = RiskManager.calculateProtocolRisk('Aave V3', '1200000000', 0);

            expect(riskFactors.protocolSafety).toBe(10); // Very safe
            expect(riskFactors.auditScore).toBe(5); // Good audits
            expect(riskFactors.tvlRisk).toBe(3); // High TVL = low risk
            expect(riskFactors.volatility).toBe(0);
            expect(riskFactors.concentration).toBe(0);
        });

        it('should calculate Compound V3 as very safe', () => {
            const riskFactors = RiskManager.calculateProtocolRisk('Compound V3', '850000000', 0);

            expect(riskFactors.protocolSafety).toBe(12);
            expect(riskFactors.auditScore).toBe(5);
        });

        it('should calculate Frax Finance as safe but slightly higher risk', () => {
            const riskFactors = RiskManager.calculateProtocolRisk('Frax Finance', '450000000', 0);

            expect(riskFactors.protocolSafety).toBe(18);
            expect(riskFactors.auditScore).toBe(10); // Medium audit score
        });

        it('should calculate Yearn Finance with moderate risk', () => {
            const riskFactors = RiskManager.calculateProtocolRisk('Yearn Finance', '650000000', 0);

            expect(riskFactors.protocolSafety).toBe(15);
        });

        it('should assign high risk to unknown protocols', () => {
            const riskFactors = RiskManager.calculateProtocolRisk('Unknown Protocol', '100000000', 0);

            expect(riskFactors.protocolSafety).toBe(30); // Default high risk
        });

        it('should factor in TVL for risk assessment', () => {
            const highTVL = RiskManager.calculateProtocolRisk('Aave V3', '2000000000', 0); // $2B
            const lowTVL = RiskManager.calculateProtocolRisk('Aave V3', '50000000', 0); // $50M

            expect(lowTVL.tvlRisk).toBeGreaterThan(highTVL.tvlRisk);
        });

        it('should handle volatility parameter', () => {
            const lowVol = RiskManager.calculateProtocolRisk('Aave V3', '1000000000', 5);
            const highVol = RiskManager.calculateProtocolRisk('Aave V3', '1000000000', 15);

            expect(highVol.volatility).toBeGreaterThan(lowVol.volatility);
        });
    });

    describe('calculatePortfolioRisk', () => {
        it('should return zero risk for empty portfolio', () => {
            const result = RiskManager.calculatePortfolioRisk([]);

            expect(result.totalScore).toBe(0);
            expect(result.riskLevel).toBe('LOW');
            expect(result.breakdown).toEqual({});
        });

        it('should calculate risk for single position', () => {
            const positions: PortfolioPosition[] = [
                { protocol: 'Aave V3', asset: 'USDC', amount: '10000', percentage: 100 }
            ];

            const result = RiskManager.calculatePortfolioRisk(positions);

            expect(result.totalScore).toBeGreaterThan(0);
            expect(result.breakdown.protocolRisk).toBeDefined();
            expect(result.breakdown.concentration).toBeDefined();
        });

        it('should have lower risk with diversified portfolio', () => {
            const concentrated: PortfolioPosition[] = [
                { protocol: 'Aave V3', asset: 'USDC', amount: '10000', percentage: 100 }
            ];

            const diversified: PortfolioPosition[] = [
                { protocol: 'Aave V3', asset: 'USDC', amount: '5000', percentage: 50 },
                { protocol: 'Compound V3', asset: 'USDC', amount: '5000', percentage: 50 }
            ];

            const concentratedRisk = RiskManager.calculatePortfolioRisk(concentrated);
            const diversifiedRisk = RiskManager.calculatePortfolioRisk(diversified);

            expect(diversifiedRisk.totalScore).toBeLessThan(concentratedRisk.totalScore);
        });

        it('should classify risk levels correctly', () => {
            const lowRisk: PortfolioPosition[] = [
                { protocol: 'Aave V3', asset: 'USDC', amount: '5000', percentage: 50 },
                { protocol: 'Compound V3', asset: 'USDC', amount: '5000', percentage: 50 }
            ];

            const result = RiskManager.calculatePortfolioRisk(lowRisk);
            expect(result.riskLevel).toBe('LOW');
        });

        it('should calculate concentration index correctly', () => {
            const evenSplit: PortfolioPosition[] = [
                { protocol: 'Aave V3', asset: 'USDC', amount: '5000', percentage: 50 },
                { protocol: 'Compound V3', asset: 'USDC', amount: '5000', percentage: 50 }
            ];

            const unevenSplit: PortfolioPosition[] = [
                { protocol: 'Aave V3', asset: 'USDC', amount: '9000', percentage: 90 },
                { protocol: 'Compound V3', asset: 'USDC', amount: '1000', percentage: 10 }
            ];

            const evenRisk = RiskManager.calculatePortfolioRisk(evenSplit);
            const unevenRisk = RiskManager.calculatePortfolioRisk(unevenSplit);

            // Uneven should have higher concentration risk
            expect(unevenRisk.breakdown.concentration).toBeGreaterThan(evenRisk.breakdown.concentration);
        });
    });

    describe('checkRiskLimits', () => {
        it('should pass with safe portfolio', () => {
            const positions: PortfolioPosition[] = [
                { protocol: 'Aave V3', asset: 'USDC', amount: '5000', percentage: 50 },
                { protocol: 'Compound V3', asset: 'USDC', amount: '5000', percentage: 50 }
            ];

            const result = RiskManager.checkRiskLimits(25, positions, 60, 50);

            expect(result.isWithinLimits).toBe(true);
            expect(result.violations).toHaveLength(0);
        });

        it('should flag total risk exceeding limit', () => {
            const positions: PortfolioPosition[] = [
                { protocol: 'Aave V3', asset: 'USDC', amount: '10000', percentage: 100 }
            ];

            const result = RiskManager.checkRiskLimits(70, positions, 60, 50);

            expect(result.isWithinLimits).toBe(false);
            expect(result.violations.length).toBeGreaterThan(0);
            expect(result.violations[0]).toContain('Total risk score');
        });

        it('should flag concentration exceeding limit', () => {
            const positions: PortfolioPosition[] = [
                { protocol: 'Aave V3', asset: 'USDC', amount: '6000', percentage: 60 },
                { protocol: 'Compound V3', asset: 'USDC', amount: '4000', percentage: 40 }
            ];

            const result = RiskManager.checkRiskLimits(30, positions, 60, 50);

            expect(result.isWithinLimits).toBe(false);
            expect(result.violations[0]).toContain('concentration');
            expect(result.violations[0]).toContain('Aave V3');
        });

        it('should flag multiple violations', () => {
            const positions: PortfolioPosition[] = [
                { protocol: 'Unknown', asset: 'USDC', amount: '10000', percentage: 100 }
            ];

            const risk = RiskManager.calculatePortfolioRisk(positions);
            const result = RiskManager.checkRiskLimits(risk.totalScore, positions, 30, 50);

            // Should violate both total risk and concentration
            expect(result.violations.length).toBeGreaterThanOrEqual(2);
        });

        it('should respect custom limits', () => {
            const positions: PortfolioPosition[] = [
                { protocol: 'Aave V3', asset: 'USDC', amount: '4000', percentage: 40 },
                { protocol: 'Compound V3', asset: 'USDC', amount: '6000', percentage: 60 }
            ];

            // Strict limit (30% max per protocol)
            const strictResult = RiskManager.checkRiskLimits(25, positions, 60, 30);
            expect(strictResult.isWithinLimits).toBe(false);

            // Lenient limit (70% max per protocol)
            const lenientResult = RiskManager.checkRiskLimits(25, positions, 60, 70);
            expect(lenientResult.isWithinLimits).toBe(true);
        });
    });

    describe('suggestRiskReduction', () => {
        it('should provide suggestions for high-risk portfolio', () => {
            const positions: PortfolioPosition[] = [
                { protocol: 'Frax Finance', asset: 'FRAX', amount: '7000', percentage: 70 },
                { protocol: 'Aave V3', asset: 'USDC', amount: '3000', percentage: 30 }
            ];

            const result = RiskManager.suggestRiskReduction(positions, 40);

            expect(result.suggestions.length).toBeGreaterThan(0);
            expect(result.suggestions[0]).toContain('Frax Finance'); // Highest risk
            expect(result.targetPositions).toBeDefined();
        });

        it('should suggest moving from high-risk to low-risk protocol', () => {
            const positions: PortfolioPosition[] = [
                { protocol: 'Frax Finance', asset: 'FRAX', amount: '5000', percentage: 50 },
                { protocol: 'Compound V3', asset: 'USDC', amount: '5000', percentage: 50 }
            ];

            const result = RiskManager.suggestRiskReduction(positions, 30);

            expect(result.suggestions[0]).toContain('Move 10-20%');
            expect(result.suggestions[0]).toContain('Frax');
            expect(result.suggestions[0]).toContain('Compound');
        });

        it('should return target positions', () => {
            const positions: PortfolioPosition[] = [
                { protocol: 'Aave V3', asset: 'USDC', amount: '10000', percentage: 100 }
            ];

            const result = RiskManager.suggestRiskReduction(positions, 20);

            expect(result.targetPositions).toEqual(positions);
        });
    });

    describe('edge cases', () => {
        it('should handle extremely concentrated portfolio', () => {
            const positions: PortfolioPosition[] = [
                { protocol: 'Unknown', asset: 'UNKNOWN', amount: '10000', percentage: 100 }
            ];

            const risk = RiskManager.calculatePortfolioRisk(positions);
            expect(risk.riskLevel).toBe('HIGH');
        });

        it('should handle many small positions', () => {
            const positions: PortfolioPosition[] = [
                { protocol: 'Aave V3', asset: 'USDC', amount: '2000', percentage: 20 },
                { protocol: 'Compound V3', asset: 'USDC', amount: '2000', percentage: 20 },
                { protocol: 'Frax Finance', asset: 'FRAX', amount: '2000', percentage: 20 },
                { protocol: 'Yearn Finance', asset: 'USDC', amount: '2000', percentage: 20 },
                { protocol: 'Aave V3', asset: 'DAI', amount: '2000', percentage: 20 }
            ];

            const risk = RiskManager.calculatePortfolioRisk(positions);
            expect(risk.breakdown.concentration).toBeLessThan(5); // Very diversified
        });

        it('should handle zero TVL', () => {
            const riskFactors = RiskManager.calculateProtocolRisk('Test', '0', 0);
            expect(riskFactors.tvlRisk).toBe(15); // Maximum TVL risk
        });
    });
});
