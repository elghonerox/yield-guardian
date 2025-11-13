/**
 * TypeScript type definitions for YieldGuardian
 */

/**
 * Protocol information
 */
export interface Protocol {
  name: string;
  address: string;
  type: 'lending' | 'staking' | 'amm' | 'other';
  chainId: number;
}

/**
 * Yield opportunity
 */
export interface YieldOpportunity {
  protocol: Protocol;
  asset: string;
  currentYield: number; // APY as decimal (e.g., 0.05 for 5%)
  riskScore: number; // 0-1, higher is riskier
  liquidity: number; // Available liquidity
  timestamp: Date;
}

/**
 * Position in a protocol
 */
export interface Position {
  protocol: Protocol;
  asset: string;
  amount: bigint; // Amount in wei/smallest unit
  value: number; // USD value
  currentYield: number;
  riskScore: number;
}

/**
 * Risk metrics
 */
export interface RiskMetrics {
  currentRisk: number; // 0-1
  maxRisk: number; // 0-1
  diversification: number; // 0-1, higher is more diversified
  protocolConcentration: Record<string, number>; // Protocol name -> percentage
  assetConcentration: Record<string, number>; // Asset -> percentage
}

/**
 * Optimization decision
 */
export interface OptimizationDecision {
  shouldRebalance: boolean;
  reason: string;
  expectedImprovement: number; // Expected yield improvement as decimal
  currentYield: number;
  targetYield: number;
  actions: RebalancingAction[];
  riskImpact: {
    before: number;
    after: number;
    change: number;
  };
  gasEstimate: bigint;
}

/**
 * Rebalancing action
 */
export interface RebalancingAction {
  type: 'deposit' | 'withdraw' | 'transfer';
  protocol: Protocol;
  asset: string;
  amount: bigint;
  fromProtocol?: Protocol;
  toProtocol?: Protocol;
}

/**
 * Execution result
 */
export interface ExecutionResult {
  success: boolean;
  transactionHashes?: string[];
  error?: string;
  gasUsed?: bigint;
  timestamp: Date;
}

/**
 * Agent state
 */
export interface AgentState {
  isInitialized: boolean;
  lastOptimization: {
    timestamp: Date;
    decision: OptimizationDecision;
    result: ExecutionResult;
  } | null;
  currentPositions: Position[];
  protocolStates: Record<string, any>;
  riskMetrics: RiskMetrics;
}

/**
 * Configuration
 */
export interface AgentConfig {
  agent: {
    name: string;
    description: string;
    version: string;
  };
  blockchain: {
    rpcUrl: string;
    chainId: number;
    privateKey: string;
    walletAddress: string;
  };
  protocols: string[];
  risk: {
    maxRiskExposure: number;
    minYieldImprovement: number;
    gasPriceMultiplier: number;
  };
  monitoring: {
    interval: number; // milliseconds
    rebalancingThreshold: number; // minimum improvement to rebalance
  };
  ai: {
    openaiApiKey: string;
    model: string;
  };
}

