import { z } from 'zod';

export const RiskProfileSchema = z.object({
    address: z.string(),
    riskScore: z.number().min(0).max(100),
    lastUpdated: z.date(),
});

export type RiskProfile = z.infer<typeof RiskProfileSchema>;

export const AgentStatusSchema = z.object({
    isRunning: z.boolean(),
    currentStrategy: z.string(),
    activePositions: z.number(),
    lastHeartbeat: z.date(),
});

export type AgentStatus = z.infer<typeof AgentStatusSchema>;

// Protocol Types
export interface ProtocolAdapter {
    name: string;
    getYield(asset: string): Promise<YieldData>;
    getTVL(asset: string): Promise<string>;
    getRiskScore(): Promise<number>;
}

export interface YieldData {
    protocol: string;
    asset: string;
    apy: number;
    tvl: string;
    riskScore: number;
    lastUpdated: Date;
}

export interface RebalanceDecision {
    shouldRebalance: boolean;
    fromProtocol: string;
    toProtocol: string;
    amount: string;
    reasoning: string;
    expectedGain: number;
    estimatedGasCost: string;
}
