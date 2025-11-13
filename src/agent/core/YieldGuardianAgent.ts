/**
 * YieldGuardian Agent - Core Agent Implementation
 * 
 * Autonomous multi-protocol yield optimizer using ADK-TS framework
 * 
 * @module YieldGuardianAgent
 */

import { AgentBuilder } from '@iqai/adk';
import { DecisionEngine } from '../autonomous/DecisionEngine';
import { BlockchainIntegration } from '../blockchain/BlockchainIntegration';
import { YieldMonitor } from '../monitoring/YieldMonitor';
import { RiskManager } from '../risk/RiskManager';
import { ExecutionLayer } from '../execution/ExecutionLayer';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import type { AgentState, OptimizationDecision } from '../../types';

/**
 * YieldGuardian Agent - Main agent class
 */
export class YieldGuardianAgent {
  private agentBuilder: AgentBuilder;
  private decisionEngine: DecisionEngine;
  private blockchainIntegration: BlockchainIntegration;
  private yieldMonitor: YieldMonitor;
  private riskManager: RiskManager;
  private executionLayer: ExecutionLayer;
  private state: AgentState;
  private isRunning: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(agentBuilder: AgentBuilder) {
    this.agentBuilder = agentBuilder;
    this.state = {
      isInitialized: false,
      lastOptimization: null,
      currentPositions: [],
      protocolStates: {},
      riskMetrics: {
        currentRisk: 0,
        maxRisk: config.risk.maxRiskExposure,
        diversification: 0
      }
    };
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    try {
      logger.info('🔧 Initializing YieldGuardian components...');

      // Initialize blockchain integration
      this.blockchainIntegration = new BlockchainIntegration();
      await this.blockchainIntegration.initialize();

      // Initialize yield monitor
      this.yieldMonitor = new YieldMonitor(this.blockchainIntegration);
      await this.yieldMonitor.initialize();

      // Initialize risk manager
      this.riskManager = new RiskManager();
      await this.riskManager.initialize();

      // Initialize decision engine
      this.decisionEngine = new DecisionEngine(
        this.yieldMonitor,
        this.riskManager,
        config
      );
      await this.decisionEngine.initialize();

      // Initialize execution layer
      this.executionLayer = new ExecutionLayer(
        this.blockchainIntegration,
        this.riskManager
      );
      await this.executionLayer.initialize();

      this.state.isInitialized = true;
      logger.info('✅ All components initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize agent:', error);
      throw error;
    }
  }

  /**
   * Start autonomous operation
   */
  async start(): Promise<void> {
    if (!this.state.isInitialized) {
      throw new Error('Agent must be initialized before starting');
    }

    if (this.isRunning) {
      logger.warn('⚠️ Agent is already running');
      return;
    }

    this.isRunning = true;
    logger.info('🔄 Starting autonomous monitoring and optimization...');

    // Start continuous monitoring loop
    this.startMonitoringLoop();

    // Initial optimization check
    await this.optimizationCycle();
  }

  /**
   * Stop autonomous operation
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    logger.info('🛑 Stopping autonomous operation...');

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    // Cleanup components
    await this.yieldMonitor.stop();
    await this.executionLayer.stop();

    logger.info('✅ Agent stopped successfully');
  }

  /**
   * Start the monitoring loop
   */
  private startMonitoringLoop(): void {
    const interval = config.monitoring.interval;
    
    this.monitoringInterval = setInterval(async () => {
      if (this.isRunning) {
        try {
          await this.optimizationCycle();
        } catch (error) {
          logger.error('Error in optimization cycle:', error);
        }
      }
    }, interval);

    logger.info(`📊 Monitoring loop started (interval: ${interval}ms)`);
  }

  /**
   * Single optimization cycle
   */
  private async optimizationCycle(): Promise<void> {
    try {
      logger.debug('🔄 Starting optimization cycle...');

      // 1. Monitor yields across protocols
      const yieldData = await this.yieldMonitor.monitorAllProtocols();
      logger.debug(`📊 Monitored ${yieldData.length} protocol opportunities`);

      // 2. Get current positions
      const currentPositions = await this.blockchainIntegration.getCurrentPositions();
      this.state.currentPositions = currentPositions;

      // 3. Calculate risk metrics
      const riskMetrics = await this.riskManager.calculateRiskMetrics(
        currentPositions,
        yieldData
      );
      this.state.riskMetrics = riskMetrics;

      // 4. Make optimization decision
      const decision = await this.decisionEngine.makeDecision(
        yieldData,
        currentPositions,
        riskMetrics
      );

      // 5. Execute if decision is to rebalance
      if (decision.shouldRebalance) {
        logger.info(`💰 Optimization opportunity detected: ${decision.reason}`);
        logger.info(`📈 Expected improvement: ${(decision.expectedImprovement * 100).toFixed(2)}%`);
        
        const executionResult = await this.executionLayer.executeRebalancing(
          decision
        );

        if (executionResult.success) {
          logger.info('✅ Rebalancing executed successfully');
          this.state.lastOptimization = {
            timestamp: new Date(),
            decision,
            result: executionResult
          };
        } else {
          logger.error('❌ Rebalancing execution failed:', executionResult.error);
        }
      } else {
        logger.debug('ℹ️ No rebalancing needed at this time');
      }

    } catch (error) {
      logger.error('❌ Error in optimization cycle:', error);
      // Continue running despite errors (autonomous resilience)
    }
  }

  /**
   * Get current agent state
   */
  getState(): AgentState {
    return { ...this.state };
  }

  /**
   * Get agent status
   */
  getStatus(): {
    isRunning: boolean;
    isInitialized: boolean;
    lastOptimization: Date | null;
    currentRisk: number;
  } {
    return {
      isRunning: this.isRunning,
      isInitialized: this.state.isInitialized,
      lastOptimization: this.state.lastOptimization?.timestamp || null,
      currentRisk: this.state.riskMetrics.currentRisk
    };
  }
}

