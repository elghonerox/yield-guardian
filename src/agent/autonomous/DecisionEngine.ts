/**
 * Decision Engine - Makes autonomous optimization decisions
 * 
 * Uses AI/ML to analyze opportunities and make rebalancing decisions
 * 
 * @module DecisionEngine
 */

import { YieldMonitor } from '../monitoring/YieldMonitor';
import { RiskManager } from '../risk/RiskManager';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import type { OptimizationDecision, YieldOpportunity, Position, RiskMetrics, AgentConfig } from '../../types';

/**
 * Decision Engine class
 */
export class DecisionEngine {
  private yieldMonitor: YieldMonitor;
  private riskManager: RiskManager;
  private config: AgentConfig;

  constructor(
    yieldMonitor: YieldMonitor,
    riskManager: RiskManager,
    config: AgentConfig
  ) {
    this.yieldMonitor = yieldMonitor;
    this.riskManager = riskManager;
    this.config = config;
  }

  /**
   * Initialize the decision engine
   */
  async initialize(): Promise<void> {
    logger.info('🧠 Initializing Decision Engine...');
    // TODO: Initialize AI/ML models if needed
  }

  /**
   * Make optimization decision
   */
  async makeDecision(
    yieldOpportunities: YieldOpportunity[],
    currentPositions: Position[],
    riskMetrics: RiskMetrics
  ): Promise<OptimizationDecision> {
    logger.debug('🤔 Making optimization decision...');

    // 1. Calculate current portfolio yield
    const currentYield = this.calculatePortfolioYield(currentPositions);
    
    // 2. Find best opportunities
    const bestOpportunities = this.findBestOpportunities(
      yieldOpportunities,
      currentPositions,
      riskMetrics
    );

    // 3. Calculate potential improvement
    const targetYield = this.calculateTargetYield(bestOpportunities);
    const expectedImprovement = targetYield - currentYield;

    // 4. Check if improvement meets threshold
    const minImprovement = this.config.risk.minYieldImprovement;
    const shouldRebalance = expectedImprovement >= minImprovement;

    // 5. Calculate risk impact
    const riskImpact = this.calculateRiskImpact(
      currentPositions,
      bestOpportunities,
      riskMetrics
    );

    // 6. Generate rebalancing actions
    const actions = shouldRebalance
      ? this.generateRebalancingActions(currentPositions, bestOpportunities)
      : [];

    // 7. Estimate gas costs
    const gasEstimate = this.estimateGasCost(actions);

    // 8. Final decision
    const decision: OptimizationDecision = {
      shouldRebalance,
      reason: shouldRebalance
        ? `Yield improvement of ${(expectedImprovement * 100).toFixed(2)}% exceeds threshold`
        : `Yield improvement of ${(expectedImprovement * 100).toFixed(2)}% below threshold of ${(minImprovement * 100).toFixed(2)}%`,
      expectedImprovement,
      currentYield,
      targetYield,
      actions,
      riskImpact,
      gasEstimate
    };

    logger.debug(`Decision: ${decision.shouldRebalance ? 'REBALANCE' : 'HOLD'}`);
    logger.debug(`Current yield: ${(currentYield * 100).toFixed(2)}%`);
    logger.debug(`Target yield: ${(targetYield * 100).toFixed(2)}%`);
    logger.debug(`Expected improvement: ${(expectedImprovement * 100).toFixed(2)}%`);

    return decision;
  }

  /**
   * Calculate current portfolio yield
   */
  private calculatePortfolioYield(positions: Position[]): number {
    if (positions.length === 0) return 0;

    let totalValue = 0;
    let weightedYield = 0;

    for (const position of positions) {
      totalValue += position.value;
      weightedYield += position.value * position.currentYield;
    }

    return totalValue > 0 ? weightedYield / totalValue : 0;
  }

  /**
   * Find best opportunities considering risk
   */
  private findBestOpportunities(
    opportunities: YieldOpportunity[],
    currentPositions: Position[],
    riskMetrics: RiskMetrics
  ): YieldOpportunity[] {
    // Calculate risk-adjusted yields (Sharpe-like ratio)
    const riskAdjustedOpportunities = opportunities.map(opp => ({
      ...opp,
      riskAdjustedYield: opp.currentYield / (1 + opp.riskScore) // Simple risk adjustment
    }));

    // Sort by risk-adjusted yield
    riskAdjustedOpportunities.sort((a, b) => 
      b.riskAdjustedYield - a.riskAdjustedYield
    );

    // Filter by risk constraints
    const maxRisk = this.config.risk.maxRiskExposure;
    const filtered = riskAdjustedOpportunities.filter(
      opp => opp.riskScore <= maxRisk
    );

    // Return top opportunities (limit to avoid over-concentration)
    return filtered.slice(0, 5);
  }

  /**
   * Calculate target yield from best opportunities
   */
  private calculateTargetYield(opportunities: YieldOpportunity[]): number {
    if (opportunities.length === 0) return 0;

    // Simple average of top opportunities
    // In production, this would consider allocation amounts
    const totalYield = opportunities.reduce(
      (sum, opp) => sum + opp.currentYield,
      0
    );
    return totalYield / opportunities.length;
  }

  /**
   * Calculate risk impact of rebalancing
   */
  private calculateRiskImpact(
    currentPositions: Position[],
    opportunities: YieldOpportunity[],
    currentRisk: RiskMetrics
  ): {
    before: number;
    after: number;
    change: number;
  } {
    const before = currentRisk.currentRisk;

    // Estimate new risk (simplified)
    // In production, this would recalculate full risk metrics
    const avgOpportunityRisk = opportunities.length > 0
      ? opportunities.reduce((sum, opp) => sum + opp.riskScore, 0) / opportunities.length
      : before;

    const after = Math.min(avgOpportunityRisk, this.config.risk.maxRiskExposure);
    const change = after - before;

    return { before, after, change };
  }

  /**
   * Generate rebalancing actions
   */
  private generateRebalancingActions(
    currentPositions: Position[],
    opportunities: YieldOpportunity[]
  ): any[] {
    const actions: any[] = [];

    // Simple strategy: Move funds to best opportunity
    // In production, this would be more sophisticated
    
    if (opportunities.length === 0) return actions;

    const bestOpportunity = opportunities[0];
    
    // For each current position, consider moving to best opportunity
    for (const position of currentPositions) {
      if (position.currentYield < bestOpportunity.currentYield) {
        // Calculate amount to move (simplified - could be partial)
        const amountToMove = position.amount; // Move all for simplicity
        
        actions.push({
          type: 'withdraw',
          protocol: position.protocol,
          asset: position.asset,
          amount: amountToMove
        });

        actions.push({
          type: 'deposit',
          protocol: bestOpportunity.protocol,
          asset: bestOpportunity.asset,
          amount: amountToMove
        });
      }
    }

    return actions;
  }

  /**
   * Estimate gas cost for actions
   */
  private estimateGasCost(actions: any[]): bigint {
    // Simple estimation: ~100k gas per action
    const gasPerAction = BigInt(100000);
    const gasPrice = BigInt(20000000000); // 20 gwei (example)
    
    return BigInt(actions.length) * gasPerAction * gasPrice;
  }
}

