/**
 * YieldGuardian - Autonomous Multi-Protocol Yield Optimizer
 * 
 * Main agent entry point using ADK-TS framework
 * 
 * @module YieldGuardian
 */

import { AgentBuilder } from '@iqai/adk';
import { YieldGuardianAgent } from './core/YieldGuardianAgent';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Initialize and start the YieldGuardian agent
 */
async function main() {
  try {
    logger.info('🚀 Initializing YieldGuardian Agent...');
    
    // Initialize ADK-TS agent builder
    const agentBuilder = new AgentBuilder()
      .withName(config.agent.name)
      .withDescription(config.agent.description)
      .withVersion(config.agent.version);

    // Create YieldGuardian agent instance
    const agent = new YieldGuardianAgent(agentBuilder);
    
    // Initialize agent
    await agent.initialize();
    
    logger.info('✅ YieldGuardian Agent initialized successfully');
    logger.info(`📊 Monitoring protocols: ${config.protocols.join(', ')}`);
    
    // Start autonomous operation
    await agent.start();
    
    logger.info('🔄 YieldGuardian Agent is now running autonomously...');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('🛑 Shutting down YieldGuardian Agent...');
      await agent.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('🛑 Shutting down YieldGuardian Agent...');
      await agent.stop();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('❌ Failed to start YieldGuardian Agent:', error);
    process.exit(1);
  }
}

// Start the agent
main().catch((error) => {
  logger.error('Fatal error:', error);
  process.exit(1);
});

