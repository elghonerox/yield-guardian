import { PortfolioPosition, RiskManager } from '../risk/RiskManager';

export interface PositionLimit {
    maxSingleProtocol: number; // Max % in any single protocol (e.g., 50)
    maxTotalRisk: number; // Max portfolio risk score (e.g., 60)
    maxHighRiskProtocols: number; // Max number of high-risk (score > 40) protocols
    minDiversification: number; // Min number of protocols (e.g., 2)
}

export class PositionLimitEnforcer {
    private limits: PositionLimit;

    constructor(limits?: Partial<PositionLimit>) {
        this.limits = {
            maxSingleProtocol: limits?.maxSingleProtocol ?? 50,
            maxTotalRisk: limits?.maxTotalRisk ?? 60,
            maxHighRiskProtocols: limits?.maxHighRiskProtocols ?? 1,
            minDiversification: limits?.minDiversification ?? 2,
        };
    }

    /**
     * Check if a new position would violate limits
     */
    validateNewPosition(
        currentPositions: PortfolioPosition[],
        newPosition: PortfolioPosition
    ): {
        isValid: boolean;
        violations: string[];
    } {
        const violations: string[] = [];

        // Check single protocol limit
        if (newPosition.percentage > this.limits.maxSingleProtocol) {
            violations.push(
                `Position size (${newPosition.percentage}%) exceeds max single protocol limit (${this.limits.maxSingleProtocol}%)`
            );
        }

        // Calculate new portfolio risk
        const newPositions = [...currentPositions, newPosition];
        const { totalScore } = RiskManager.calculatePortfolioRisk(newPositions);

        if (totalScore > this.limits.maxTotalRisk) {
            violations.push(
                `New portfolio risk score (${totalScore}) would exceed limit (${this.limits.maxTotalRisk})`
            );
        }

        // Check diversification
        if (newPositions.length < this.limits.minDiversification) {
            violations.push(
                `Portfolio must have at least ${this.limits.minDiversification} protocols`
            );
        }

        return {
            isValid: violations.length === 0,
            violations,
        };
    }

    /**
     * Suggest position sizes to stay within limits
     */
    suggestOptimalAllocation(
        protocols: string[],
        totalAmount: number
    ): PortfolioPosition[] {
        // Simple equal-weight distribution within limits
        const numProtocols = Math.max(protocols.length, this.limits.minDiversification);
        const targetPercentage = Math.min(
            100 / numProtocols,
            this.limits.maxSingleProtocol - 5 // 5% buffer
        );

        return protocols.map((protocol, idx) => ({
            protocol,
            asset: 'USDC',
            amount: ((totalAmount * targetPercentage) / 100).toFixed(2),
            percentage: targetPercentage,
        }));
    }

    /**
     * Check if rebalancing would violate limits
     */
    validateRebalance(
        currentPositions: PortfolioPosition[],
        fromProtocol: string,
        toProtocol: string,
        amount: number
    ): {
        isValid: boolean;
        violations: string[];
        adjustedAmount?: number;
    } {
        const violations: string[] = [];

        // Calculate new positions after rebalance
        const newPositions = currentPositions.map(p => {
            if (p.protocol === fromProtocol) {
                const newAmount = parseFloat(p.amount) - amount;
                const totalValue = currentPositions.reduce(
                    (sum, pos) => sum + parseFloat(pos.amount),
                    0
                );
                return {
                    ...p,
                    amount: newAmount.toFixed(2),
                    percentage: (newAmount / totalValue) * 100,
                };
            }
            if (p.protocol === toProtocol) {
                const newAmount = parseFloat(p.amount) + amount;
                const totalValue = currentPositions.reduce(
                    (sum, pos) => sum + parseFloat(pos.amount),
                    0
                );
                return {
                    ...p,
                    amount: newAmount.toFixed(2),
                    percentage: (newAmount / totalValue) * 100,
                };
            }
            return p;
        });

        // Check if any position exceeds limit
        const toPosition = newPositions.find(p => p.protocol === toProtocol);
        if (toPosition && toPosition.percentage > this.limits.maxSingleProtocol) {
            violations.push(
                `Rebalance would exceed max single protocol limit (${toPosition.percentage}% > ${this.limits.maxSingleProtocol}%)`
            );

            // Calculate adjusted amount
            const totalValue = currentPositions.reduce(
                (sum, p) => sum + parseFloat(p.amount),
                0
            );
            const maxAmount =
                (this.limits.maxSingleProtocol / 100) * totalValue -
                parseFloat(toPosition.amount);

            return {
                isValid: false,
                violations,
                adjustedAmount: Math.max(0, maxAmount),
            };
        }

        // Check total risk
        const { totalScore } = RiskManager.calculatePortfolioRisk(newPositions);
        if (totalScore > this.limits.maxTotalRisk) {
            violations.push(
                `Rebalance would exceed max risk score (${totalScore} > ${this.limits.maxTotalRisk})`
            );
        }

        return {
            isValid: violations.length === 0,
            violations,
        };
    }

    /**
     * Get current limit configuration
     */
    getLimits(): PositionLimit {
        return { ...this.limits };
    }

    /**
     * Update limits (for user configuration)
     */
    updateLimits(newLimits: Partial<PositionLimit>): void {
        this.limits = { ...this.limits, ...newLimits };
    }
}
