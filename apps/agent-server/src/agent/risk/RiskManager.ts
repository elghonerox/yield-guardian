/**
 * Risk Manager - Manages risk assessment and constraints
 * 
 * @module RiskManager
 */

import { config } from '../../config';
import { logger } from '../../utils/logger';
import type { RiskMetrics, Position, YieldOpportunity } from '../../types';

/**
 * Risk Manager class
 */
export class RiskManager {
  /**
   * Initialize the risk manager
   */
  async initialize(): Promise<void> {
    logger.info('🛡️ Initializing Risk Manager...');
  }

  /**
   * Calculate risk metrics for current positions
   */
  async calculateRiskMetrics(
    positions: Position[],
    opportunities: YieldOpportunity[]
  ): Promise<RiskMetrics> {
    logger.debug('📊 Calculating risk metrics...');

    // Calculate current risk (weighted average of position risks)
    const currentRisk = this.calculateCurrentRisk(positions);

    // Calculate diversification
    const diversification = this.calculateDiversification(positions);

    // Calculate protocol concentration
    const protocolConcentration = this.calculateProtocolConcentration(positions);

    // Calculate asset concentration
    const assetConcentration = this.calculateAssetConcentration(positions);

    const metrics: RiskMetrics = {
      currentRisk,
      maxRisk: config.risk.maxRiskExposure,
      diversification,
      protocolConcentration,
      assetConcentration
    };

    logger.debug(`Current risk: ${(currentRisk * 100).toFixed(2)}%`);
    logger.debug(`Diversification: ${(diversification * 100).toFixed(2)}%`);

    return metrics;
  }

  /**
   * Calculate current risk level
   */
  private calculateCurrentRisk(positions: Position[]): number {
    if (positions.length === 0) return 0;

    let totalValue = 0;
    let weightedRisk = 0;

    for (const position of positions) {
      totalValue += position.value;
      weightedRisk += position.value * position.riskScore;
    }

    return totalValue > 0 ? weightedRisk / totalValue : 0;
  }

  /**
   * Calculate diversification score (0-1, higher is more diversified)
   */
  private calculateDiversification(positions: Position[]): number {
    if (positions.length === 0) return 0;
    if (positions.length === 1) return 0;

    // Calculate Herfindahl-Hirschman Index (HHI)
    // Lower HHI = more diversified
    let totalValue = 0;
    const protocolValues: Record<string, number> = {};

    for (const position of positions) {
      totalValue += position.value;
      const key = `${position.protocol.name}-${position.asset}`;
      protocolValues[key] = (protocolValues[key] || 0) + position.value;
    }

    if (totalValue === 0) return 0;

    let hhi = 0;
    for (const value of Object.values(protocolValues)) {
      const share = value / totalValue;
      hhi += share * share;
    }

    // Convert HHI to diversification score (inverse, normalized)
    // HHI ranges from 1/n (most diversified) to 1 (least diversified)
    const maxHHI = 1;
    const minHHI = 1 / positions.length;
    const diversification = (maxHHI - hhi) / (maxHHI - minHHI);

    return Math.max(0, Math.min(1, diversification));
  }

  /**
   * Calculate protocol concentration
   */
  private calculateProtocolConcentration(positions: Position[]): Record<string, number> {
    const concentration: Record<string, number> = {};
    let totalValue = 0;

    for (const position of positions) {
      totalValue += position.value;
      const protocolName = position.protocol.name;
      concentration[protocolName] = (concentration[protocolName] || 0) + position.value;
    }

    // Convert to percentages
    for (const protocol in concentration) {
      concentration[protocol] = totalValue > 0 ? concentration[protocol] / totalValue : 0;
    }

    return concentration;
  }

  /**
   * Calculate asset concentration
   */
  private calculateAssetConcentration(positions: Position[]): Record<string, number> {
    const concentration: Record<string, number> = {};
    let totalValue = 0;

    for (const position of positions) {
      totalValue += position.value;
      const asset = position.asset;
      concentration[asset] = (concentration[asset] || 0) + position.value;
    }

    // Convert to percentages
    for (const asset in concentration) {
      concentration[asset] = totalValue > 0 ? concentration[asset] / totalValue : 0;
    }

    return concentration;
  }

  /**
   * Check if a rebalancing action would violate risk constraints
   */
  async checkRiskConstraints(
    currentRisk: number,
    proposedRisk: number
  ): Promise<{ allowed: boolean; reason?: string }> {
    const maxRisk = config.risk.maxRiskExposure;

    if (proposedRisk > maxRisk) {
      return {
        allowed: false,
        reason: `Proposed risk ${(proposedRisk * 100).toFixed(2)}% exceeds maximum ${(maxRisk * 100).toFixed(2)}%`
      };
    }

    return { allowed: true };
  }

  /**
   * Calculate risk-adjusted yield (Sharpe-like ratio)
   */
  calculateRiskAdjustedYield(yield: number, risk: number): number {
    // Simple risk-adjusted yield: yield / (1 + risk)
    // Higher risk reduces the effective yield
    return yield / (1 + risk);
  }
}

