import { AaveAdapter } from './AaveAdapter';
import { CompoundAdapter } from './CompoundAdapter';
import { FraxAdapter } from './FraxAdapter';
import { YearnAdapter } from './YearnAdapter';
import { ProtocolAdapter, YieldData, RebalanceDecision } from '@yield-guardian/shared';
import { memoryCache } from '../cache/MemoryCache';

export class YieldAggregator {
    private protocols: ProtocolAdapter[];

    constructor(rpcUrl: string) {
        this.protocols = [
            new AaveAdapter(rpcUrl),
            new CompoundAdapter(rpcUrl),
            new FraxAdapter(rpcUrl),
            new YearnAdapter(rpcUrl),
        ];
    }

    /**
     * Get yields from all protocols for a specific asset
     * Results are cached for 5 minutes to reduce API calls
     */
    async getAllYields(asset: string): Promise<YieldData[]> {
        const cacheKey = `yields:${asset}`;

        // Check cache first
        const cached = memoryCache.get<YieldData[]>(cacheKey);
        if (cached) {
            return cached;
        }

        // Fetch from protocols if not cached
        const yields = await Promise.all(
            this.protocols.map(protocol => protocol.getYield(asset))
        );
        const sorted = yields.sort((a, b) => b.apy - a.apy);

        // Cache for 5 minutes (300 seconds)
        memoryCache.set(cacheKey, sorted, 300);

        return sorted;
    }

    /**
     * Find the best yield opportunity for an asset
     */
    async getBestYield(asset: string): Promise<YieldData> {
        const yields = await this.getAllYields(asset);
        return yields[0]; // Highest APY
    }

    /**
     * Determine if rebalancing is profitable
     */
    async shouldRebalance(
        currentProtocol: string,
        asset: string,
        amount: string,
        gasPrice: bigint
    ): Promise<RebalanceDecision> {
        const yields = await this.getAllYields(asset);

        const current = yields.find(y => y.protocol === currentProtocol);
        const best = yields[0];

        if (!current) {
            throw new Error(`Current protocol ${currentProtocol} not found`);
        }

        // Calculate APY improvement
        const apyGain = best.apy - current.apy;

        // Estimate gas cost (2 transactions: withdraw + deposit)
        const estimatedGas = BigInt(200000); // ~200k gas for withdraw + deposit
        const gasCostWei = estimatedGas * gasPrice;
        const gasCostEth = Number(gasCostWei) / 1e18;
        const gasCostUsd = gasCostEth * 2000; // Assume $2000 ETH

        // Calculate break-even: how long to recover gas cost
        const amountNum = parseFloat(amount);
        const annualGainUsd = (amountNum * apyGain) / 100;
        const daysToBreakEven = (gasCostUsd / annualGainUsd) * 365;

        // Decision logic
        const shouldRebalance =
            apyGain >= 0.5 && // Min 0.5% improvement
            daysToBreakEven <= 30 && // Recover gas cost within 30 days
            best.protocol !== currentProtocol;

        // Invalidate cache on rebalance decision to force fresh data
        if (shouldRebalance) {
            memoryCache.delete(`yields:${asset}`);
        }

        return {
            shouldRebalance,
            fromProtocol: currentProtocol,
            toProtocol: best.protocol,
            amount,
            reasoning: shouldRebalance
                ? `${apyGain.toFixed(2)}% APY improvement. Gas cost recovered in ${Math.round(daysToBreakEven)} days.`
                : `Insufficient gain (${apyGain.toFixed(2)}%) or high gas cost (${daysToBreakEven.toFixed(0)} days to break even)`,
            expectedGain: apyGain,
            estimatedGasCost: gasCostUsd.toFixed(2),
        };
    }

    /**
     * Get protocol comparison matrix
     */
    async getProtocolComparison(asset: string): Promise<{
        asset: string;
        protocols: YieldData[];
        bestProtocol: string;
        avgApy: number;
    }> {
        const yields = await this.getAllYields(asset);
        const avgApy = yields.reduce((sum, y) => sum + y.apy, 0) / yields.length;

        return {
            asset,
            protocols: yields,
            bestProtocol: yields[0].protocol,
            avgApy,
        };
    }
}
