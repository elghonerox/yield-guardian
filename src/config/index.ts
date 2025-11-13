/**
 * Configuration management for YieldGuardian
 */

import dotenv from 'dotenv';
import type { AgentConfig } from '../types';

// Load environment variables
dotenv.config();

/**
 * Validate required environment variables
 */
function validateConfig(): void {
  const required = [
    'AGENT_NAME',
    'ETHEREUM_RPC_URL',
    'PRIVATE_KEY',
    'WALLET_ADDRESS',
    'OPENAI_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Validate on import
validateConfig();

/**
 * Application configuration
 */
export const config: AgentConfig = {
  agent: {
    name: process.env.AGENT_NAME || 'YieldGuardian',
    description: process.env.AGENT_DESCRIPTION || 'Autonomous multi-protocol yield optimizer',
    version: process.env.AGENT_VERSION || '1.0.0'
  },
  blockchain: {
    rpcUrl: process.env.ETHEREUM_RPC_URL!,
    chainId: parseInt(process.env.CHAIN_ID || '1'), // 1 = Ethereum mainnet
    privateKey: process.env.PRIVATE_KEY!,
    walletAddress: process.env.WALLET_ADDRESS!
  },
  protocols: (process.env.PROTOCOLS || 'frax,aave,compound').split(','),
  risk: {
    maxRiskExposure: parseFloat(process.env.MAX_RISK_EXPOSURE || '0.8'),
    minYieldImprovement: parseFloat(process.env.MIN_YIELD_IMPROVEMENT || '0.005'), // 0.5%
    gasPriceMultiplier: parseFloat(process.env.GAS_PRICE_MULTIPLIER || '1.2')
  },
  monitoring: {
    interval: parseInt(process.env.MONITORING_INTERVAL || '30000'), // 30 seconds
    rebalancingThreshold: parseFloat(process.env.REBALANCING_THRESHOLD || '0.01') // 1%
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY!,
    model: process.env.OPENAI_MODEL || 'gpt-4'
  }
};

/**
 * Protocol addresses (can be moved to separate config file)
 */
export const protocolAddresses = {
  frax: {
    lendingPool: process.env.FRAX_LENDING_POOL_ADDRESS || '0x...',
    staking: process.env.FRAX_STAKING_ADDRESS || '0x...',
    fraxToken: process.env.FRAX_TOKEN_ADDRESS || '0x...'
  },
  aave: {
    lendingPool: process.env.AAVE_LENDING_POOL_ADDRESS || '0x...',
    dataProvider: process.env.AAVE_DATA_PROVIDER_ADDRESS || '0x...'
  },
  compound: {
    comptroller: process.env.COMPOUND_COMPTROLLER_ADDRESS || '0x...',
    cTokenRegistry: process.env.COMPOUND_CTOKEN_REGISTRY || '0x...'
  }
};

