import type { Position, YieldOpportunity, Protocol } from '../../types';

export const simulationProtocols: Record<string, Protocol> = {
  aave: {
    name: 'Aave',
    address: '0x0000000000000000000000000000000000000001',
    type: 'lending',
    chainId: 11155111
  },
  frax: {
    name: 'Frax Finance',
    address: '0x0000000000000000000000000000000000000002',
    type: 'lending',
    chainId: 11155111
  },
  compound: {
    name: 'Compound',
    address: '0x0000000000000000000000000000000000000003',
    type: 'lending',
    chainId: 11155111
  }
};

export const simulationPositions: Position[] = [
  {
    protocol: simulationProtocols.aave,
    asset: 'USDC',
    amount: BigInt('1000000000'), // 1,000 USDC (6 decimals)
    value: 1000,
    currentYield: 0.038,
    riskScore: 0.2
  },
  {
    protocol: simulationProtocols.frax,
    asset: 'FRAX',
    amount: BigInt('800000000000000000000'), // 800 FRAX (18 decimals)
    value: 800,
    currentYield: 0.052,
    riskScore: 0.25
  }
];

export const simulationOpportunities: YieldOpportunity[] = [
  {
    protocol: simulationProtocols.frax,
    asset: 'USDC',
    currentYield: 0.045,
    riskScore: 0.3,
    liquidity: 10000000,
    timestamp: new Date()
  },
  {
    protocol: simulationProtocols.frax,
    asset: 'FRAX',
    currentYield: 0.052,
    riskScore: 0.25,
    liquidity: 5000000,
    timestamp: new Date()
  },
  {
    protocol: simulationProtocols.aave,
    asset: 'USDC',
    currentYield: 0.038,
    riskScore: 0.2,
    liquidity: 50000000,
    timestamp: new Date()
  },
  {
    protocol: simulationProtocols.compound,
    asset: 'USDC',
    currentYield: 0.042,
    riskScore: 0.25,
    liquidity: 30000000,
    timestamp: new Date()
  }
];


