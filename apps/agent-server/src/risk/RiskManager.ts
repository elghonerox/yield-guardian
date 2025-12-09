import { ProtocolAdapter } from '@yield-guardian/shared';

export interface RiskFactors {
    protocolSafety: number; // 0-40 (lower = safer)
    auditScore: number; // 0-20 (based on audit quality)
    tvlRisk: number; // 0-15 (lower TVL = higher risk)
    volatility: number; // 0-15 (historical yield volatility)
    concentration: number; // 0-10 (portfolio concentration)
}

export interface PortfolioPosition {
    protocol: string;
    asset: string;
    amount: string;
    percentage: number;
}

export class RiskManager {
    /**
     * Calculate protocol safety score based on multiple factors
     */
    static calculateProtocolRisk(
        protocolName: string,
        tvl: string,
        historicalVolatility: number = 0
    ): RiskFactors {
        // Protocol Safety Scores (based on battle-testing, audits)
        const protocolScores: Record<string, number> = {
            'Aave V3': 10, // Very safe (multiple audits, large TVL, established)
            'Compound V3': 12, // Very safe
            'Frax Finance': 18, // Safe (newer but audited)
            'Yearn Finance': 15, // Safe (established)
        };

        const protocolSafety = protocolScores[protocolName] || 30; // Default high risk

        // Audit Score (simulated - would fetch from DeFiSafety.com)
        const auditScore = protocolSafety < 15 ? 5 : protocolSafety < 20 ? 10 : 15;

        // TVL Risk (higher TVL = lower risk)
        const tvlNum = parseInt(tvl);
        const tvlRisk = tvlNum > 1e9 ? 3 : tvlNum > 5e8 ? 7 : tvlNum > 1e8 ? 12 : 15;

        // Volatility Risk
        const volatility = historicalVolatility;

        // Concentration (calculated separately for portfolio)
        const concentration = 0;

        return {
            protocolSafety,
            auditScore,
            tvlRisk,
            volatility,
            concentration,
        };
    }

    /**
     * Calculate total risk score for a portfolio
     */
    static calculatePortfolioRisk(positions: PortfolioPosition[]): {
        totalScore: number;
        breakdown: Record<string, number>;
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    } {
        if (positions.length === 0) {
            return { totalScore: 0, breakdown: {}, riskLevel: 'LOW' };
        }

        // Calculate concentration risk (Herfindahl index)
        const concentrationIndex = positions.reduce(
            (sum, p) => sum + Math.pow(p.percentage / 100, 2),
            0
        );
        const concentrationRisk = concentrationIndex * 10; // 0-10 scale

        // Weighted average of protocol risks
        let weightedRisk = 0;
        for (const position of positions) {
            const factors = this.calculateProtocolRisk(
                position.protocol,
                '1000000000', // Mock TVL for now
                0
            );
            const protocolRisk =
                factors.protocolSafety + factors.auditScore + factors.tvlRisk + factors.volatility;
            weightedRisk += (protocolRisk * position.percentage) / 100;
        }

        const totalScore = Math.round(weightedRisk + concentrationRisk);

        const breakdown = {
            protocolRisk: Math.round(weightedRisk),
            concentration: Math.round(concentrationRisk),
        };

        const riskLevel =
            totalScore < 30 ? 'LOW' : totalScore < 50 ? 'MEDIUM' : 'HIGH';

        return { totalScore, breakdown, riskLevel };
    }

    /**
     * Check if portfolio violates risk limits
     */
    static checkRiskLimits(
        totalScore: number,
        positions: PortfolioPosition[],
        maxRiskScore: number = 60,
        maxSingleProtocol: number = 50
    ): {
        violations: string[];
        isWithinLimits: boolean;
    } {
        const violations: string[] = [];

        // Check total risk
        if (totalScore > maxRiskScore) {
            violations.push(
                `Total risk score (${totalScore}) exceeds limit (${maxRiskScore})`
            );
        }

        // Check concentration
        for (const position of positions) {
            if (position.percentage > maxSingleProtocol) {
                violations.push(
                    `${position.protocol} concentration (${position.percentage}%) exceeds limit (${maxSingleProtocol}%)`
                );
            }
        }

        return {
            violations,
            isWithinLimits: violations.length === 0,
        };
    }

    /**
     * Suggest rebalancing to reduce risk
     */
    static suggestRiskReduction(
        positions: PortfolioPosition[],
        targetRisk: number
    ): {
        suggestions: string[];
        targetPositions: PortfolioPosition[];
    } {
        const suggestions: string[] = [];

        // Find highest risk protocol
        const risks = positions.map(p => ({
            ...p,
            risk: this.calculateProtocolRisk(p.protocol, '1000000000', 0).protocolSafety,
        }));

        risks.sort((a, b) => b.risk - a.risk);

        if (risks.length > 1) {
            const highest = risks[0];
            const lowest = risks[risks.length - 1];

            suggestions.push(
                `Move 10-20% from ${highest.protocol} (risk: ${highest.risk}) to ${lowest.protocol} (risk: ${lowest.risk})`
            );
        }

        // For now, return original positions (would calculate optimal distribution)
        return {
            suggestions,
            targetPositions: positions,
        };
    }
}
