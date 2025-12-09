# Integrating Real Protocols

Right now, the project uses mock data because I didn't want to burn real gas or deal with unstable testnet RPCs during the hackathon demo. But the architecture is designed to swap these mocks for real SDKs easily.

Here's my plan for how to do that when we go live.

## The Strategy

I've isolated all protocol interactions into "Adapter" classes (`src/protocols/*`). This means the rest of the agent (decision engine, risk manager) doesn't care if the data is real or fake—it just asks for `YieldData`.

To go live, we just need to rewrite the `getYield()` method in each adapter.

## 1. Aave V3 Integration

Aave is actually the easiest one because their SDK is solid.

**File:** `src/protocols/AaveAdapter.ts`

Instead of returning a static object, we'll use `@aave/contract-helpers`.

```typescript
// Proposed Implementation
import { UiPoolDataProvider } from '@aave/contract-helpers';

async getYield(asset: string) {
  // Connect to Aave's data provider contract
  const poolDataProvider = new UiPoolDataProvider({ ... });
  
  // They give us "humanized" data which saves a lot of BigNumber math
  const reserves = await poolDataProvider.getReservesHumanized({ ... });
  
  // Find our asset (e.g., USDC)
  const assetData = reserves.find(r => r.symbol === asset);

  // Return formatted for our system
  return {
    protocol: 'Aave V3',
    asset,
    apy: parseFloat(assetData.supplyAPY) * 100, // They return decimal, we use percentage
    tvl: assetData.totalLiquidity
  };
}
```

## 2. Compound V3 Integration

Compound is a bit trickier because V3 (Comet) is different from the old cToken model.

**File:** `src/protocols/CompoundAdapter.ts`

We'll use their JS SDK to fetch the "supply rate".

```typescript
import Compound from '@compound-finance/compound-js';

async getYield(asset: string) {
  // Compound V3 uses a single contract for the base asset
  const cometAddress = getCometAddress(asset); 
  const supplyRate = await compound.getSupplyRate(cometAddress);
  
  // Math for converting per-block rate to APY
  const apy = calculateAPY(supplyRate); 

  return {
    protocol: 'Compound V3',
    asset,
    apy: apy,
    // ...
  };
}
```

## 3. Yearn & Frax

For Yearn and Frax, honestly, using their REST APIs is way more stable than querying contracts directly for just reading APY. It's faster and less RPC-intensive.

**File:** `src/protocols/YearnAdapter.ts`

```typescript
async getYield(asset: string) {
  // Yearn's API is great
  const res = await fetch('https://api.yearn.finance/v1/chains/1/vaults/all');
  const vaults = await res.json();
  // ... filter for asset and return APY
}
```

## Moving Money (The Risky Part)

Reading data is safe. Moving funds is where we need to be careful.

in `BlockchainIntegration.ts`, I've stubbed out `deposit` and `withdraw`.

**The Production Plan:**
1. **Approve First**: We always need to `token.approve(protocol, amount)` before depositing.
2. **Gas Estimation**: Don't just send it. Estimate gas first. If it's too high (> $50 maybe?), abort the rebalance. The yield gain won't cover it.
3. **Slippage**: For Compound/Aave it's usually fine, but for Yearn vaults, we need to check slippage settings so we don't get wrecked entering a pool.

## Risk Management

I added a "Risk Score" to the adapters. In the mock version, it's hardcoded. In production, I want to calculate this dynamically based on:
- **TVL**: Lower TVL = Higher Risk (harder to exit).
- **Utilization**: If 99% of the pool is borrowed, we might not be able to withdraw.

## Next Steps

1. Get API keys for Alchemy/Infura (the free tier won't cut it for high-frequency polling).
2. Install the SDKs (`npm install @aave/contract-helpers ...`).
3. Write extensive integration tests on a forked mainnet (using Hardhat or Anvil) to verify the math matches real payouts.
