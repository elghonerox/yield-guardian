/**
 * Execution Layer - Executes rebalancing transactions
 * 
 * @module ExecutionLayer
 */

import { BlockchainIntegration } from '../blockchain/BlockchainIntegration';
import { RiskManager } from '../risk/RiskManager';
import { logger } from '../../utils/logger';
import type { OptimizationDecision, ExecutionResult, RebalancingAction } from '../../types';

/**
 * Execution Layer class
 */
export class ExecutionLayer {
  private blockchainIntegration: BlockchainIntegration;
  private riskManager: RiskManager;

  constructor(
    blockchainIntegration: BlockchainIntegration,
    riskManager: RiskManager
  ) {
    this.blockchainIntegration = blockchainIntegration;
    this.riskManager = riskManager;
  }

  /**
   * Initialize the execution layer
   */
  async initialize(): Promise<void> {
    logger.info('⚙️ Initializing Execution Layer...');
  }

  /**
   * Stop the execution layer
   */
  async stop(): Promise<void> {
    logger.info('🛑 Stopping Execution Layer...');
  }

  /**
   * Execute rebalancing based on decision
   */
  async executeRebalancing(decision: OptimizationDecision): Promise<ExecutionResult> {
    logger.info('🚀 Executing rebalancing...');
    logger.info(`📋 ${decision.actions.length} actions to execute`);

    try {
      // Validate decision
      const validation = await this.validateDecision(decision);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.reason,
          timestamp: new Date()
        };
      }

      // Execute actions
      const transactionHashes: string[] = [];
      const gasUsed: bigint[] = [];

      for (const action of decision.actions) {
        try {
          const result = await this.executeAction(action);
          if (result.txHash) {
            transactionHashes.push(result.txHash);
            gasUsed.push(result.gasUsed || BigInt(0));
          }
        } catch (error) {
          logger.error(`Failed to execute action:`, error);
          // Continue with other actions (partial execution is acceptable)
        }
      }

      const totalGasUsed = gasUsed.reduce((sum, gas) => sum + gas, BigInt(0));

      logger.info(`✅ Rebalancing executed. ${transactionHashes.length} transactions`);
      logger.info(`⛽ Total gas used: ${totalGasUsed.toString()}`);

      return {
        success: true,
        transactionHashes,
        gasUsed: totalGasUsed,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('❌ Failed to execute rebalancing:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Validate decision before execution
   */
  private async validateDecision(decision: OptimizationDecision): Promise<{
    valid: boolean;
    reason?: string;
  }> {
    // Check if decision has actions
    if (decision.actions.length === 0) {
      return {
        valid: false,
        reason: 'No actions to execute'
      };
    }

    // Check risk constraints
    const riskCheck = await this.riskManager.checkRiskConstraints(
      decision.riskImpact.before,
      decision.riskImpact.after
    );

    if (!riskCheck.allowed) {
      return {
        valid: false,
        reason: riskCheck.reason
      };
    }

    // Check gas costs (ensure we have enough)
    const balance = await this.blockchainIntegration.getBalance();
    const gasCost = decision.gasEstimate;
    
    if (balance < gasCost) {
      return {
        valid: false,
        reason: `Insufficient balance for gas. Need ${gasCost.toString()}, have ${balance.toString()}`
      };
    }

    return { valid: true };
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: RebalancingAction): Promise<{
    txHash?: string;
    gasUsed?: bigint;
  }> {
    logger.debug(`Executing action: ${action.type} ${action.amount} ${action.asset}`);

    switch (action.type) {
      case 'deposit':
        const depositTx = await this.blockchainIntegration.deposit(
          action.protocol,
          action.asset,
          action.amount
        );
        return { txHash: depositTx };

      case 'withdraw':
        const withdrawTx = await this.blockchainIntegration.withdraw(
          action.protocol,
          action.asset,
          action.amount
        );
        return { txHash: withdrawTx };

      case 'transfer':
        // Transfer would be implemented if needed
        logger.warn('Transfer action not yet implemented');
        return {};

      default:
        logger.warn(`Unknown action type: ${(action as any).type}`);
        return {};
    }
  }
}

