// Protocol Adapter Interface
export interface ProtocolAdapter {
    name: string;
    getYield(asset: string): Promise<YieldData>;
    getTVL(asset: string): Promise<string>;
    getRiskScore(): Promise<number>;
}

export interface YieldData {
    protocol: string;
    asset: string;
    apy: number; // Annual Percentage Yield
    tvl: string; // Total Value Locked
    riskScore: number; // 0-100
    lastUpdated: Date;
}

export interface RebalanceDecision {
    shouldRebalance: boolean;
    fromProtocol: string;
    toProtocol: string;
    amount: string;
    reasoning: string;
    expectedGain: number; // % APY improvement
    estimatedGasCost: string;
}
