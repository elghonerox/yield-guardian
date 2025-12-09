import { FastifyInstance } from 'fastify';
import { YieldAggregator } from '../protocols/YieldAggregator';

export async function yieldRoutes(fastify: FastifyInstance) {
    const aggregator = new YieldAggregator(process.env.ETHEREUM_RPC_URL || '');

    // Get all yields for an asset
    fastify.get('/api/v1/yields/:asset', async (request, reply) => {
        const { asset } = request.params as { asset: string };
        const yields = await aggregator.getAllYields(asset.toUpperCase());
        return yields;
    });

    // Get best yield for an asset
    fastify.get('/api/v1/yields/:asset/best', async (request, reply) => {
        const { asset } = request.params as { asset: string };
        const bestYield = await aggregator.getBestYield(asset.toUpperCase());
        return bestYield;
    });

    // Get protocol comparison
    fastify.get('/api/v1/protocols/compare/:asset', async (request, reply) => {
        const { asset } = request.params as { asset: string };
        const comparison = await aggregator.getProtocolComparison(asset.toUpperCase());
        return comparison;
    });

    // Check if rebalancing is recommended
    fastify.post('/api/v1/rebalance/check', async (request, reply) => {
        const {
            currentProtocol,
            asset,
            amount,
            gasPrice = 30, // gwei
        } = request.body as {
            currentProtocol: string;
            asset: string;
            amount: string;
            gasPrice?: number;
        };

        const gasPriceWei = BigInt(gasPrice) * BigInt(1e9); // Convert gwei to wei
        const decision = await aggregator.shouldRebalance(
            currentProtocol,
            asset.toUpperCase(),
            amount,
            gasPriceWei
        );

        return decision;
    });
}
