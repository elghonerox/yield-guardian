import { describe, it, expect } from 'vitest';
import { PositionLimitEnforcer } from '../src/risk/PositionLimitEnforcer';

describe('PositionLimitEnforcer', () => {
    const enforcer = new PositionLimitEnforcer({
        maxSingleProtocol: 50,
        maxTotalRisk: 60,
        minDiversification: 2,
    });

    it('should validate position within limits', () => {
        const currentPositions = [
            { protocol: 'Aave V3', asset: 'USDC', amount: '5000', percentage: 50 },
        ];

        const newPosition = {
            protocol: 'Compound V3',
            asset: 'USDC',
            amount: '5000',
            percentage: 50,
        };

        const result = enforcer.validateNewPosition(currentPositions, newPosition);
        expect(result.isValid).toBe(true);
        expect(result.violations).toHaveLength(0);
    });

    it('should reject position exceeding single protocol limit', () => {
        const currentPositions = [
            { protocol: 'Aave V3', asset: 'USDC', amount: '3000', percentage: 30 },
        ];

        const newPosition = {
            protocol: 'Compound V3',
            asset: 'USDC',
            amount: '6000',
            percentage: 60, // Exceeds 50% limit
        };

        const result = enforcer.validateNewPosition(currentPositions, newPosition);
        expect(result.isValid).toBe(false);
        expect(result.violations.length).toBeGreaterThan(0);
    });

    it('should suggest optimal allocation', () => {
        const protocols = ['Aave V3', 'Compound V3', 'Frax Finance'];
        const totalAmount = 10000;

        const allocation = enforcer.suggestOptimalAllocation(protocols, totalAmount);

        expect(allocation).toHaveLength(3);
        expect(allocation.every(p => p.percentage <= 50)).toBe(true);

        const totalPercentage = allocation.reduce((sum, p) => sum + p.percentage, 0);
        expect(totalPercentage).toBeCloseTo(100, 1);
    });

    it('should validate rebalance within limits', () => {
        const currentPositions = [
            { protocol: 'Aave V3', asset: 'USDC', amount: '6000', percentage: 60 },
            { protocol: 'Compound V3', asset: 'USDC', amount: '4000', percentage: 40 },
        ];

        const result = enforcer.validateRebalance(
            currentPositions,
            'Aave V3',
            'Compound V3',
            1000
        );

        expect(result.isValid).toBe(true);
    });

    it('should reject rebalance exceeding limits', () => {
        const currentPositions = [
            { protocol: 'Aave V3', asset: 'USDC', amount: '5000', percentage: 50 },
            { protocol: 'Compound V3', asset: 'USDC', amount: '5000', percentage: 50 },
        ];

        const result = enforcer.validateRebalance(
            currentPositions,
            'Aave V3',
            'Compound V3',
            2000 // Would make Compound 70%
        );

        expect(result.isValid).toBe(false);
        expect(result.adjustedAmount).toBeDefined();
    });
});
