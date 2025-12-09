import { ProtocolAdapter, YieldData } from '@yield-guardian/shared';

export class YearnAdapter implements ProtocolAdapter {
    name = 'Yearn Finance';
    private rpcUrl: string;

    constructor(rpcUrl: string) {
        this.rpcUrl = rpcUrl;
    }

    async getYield(asset: string): Promise<YieldData> {
        // TODO: Integrate with Yearn API
        const mockApys: Record<string, number> = {
            USDC: 4.5,
            USDT: 4.4,
            DAI: 4.3,
            WETH: 3.2,
        };

        return {
            protocol: 'Yearn Finance',
            asset,
            apy: mockApys[asset] || 0,
            tvl: '650000000', // $650M
            riskScore: 20, // Low risk (established vaults)
            lastUpdated: new Date(),
        };
    }

    async getTVL(asset: string): Promise<string> {
        return '650000000';
    }

    async getRiskScore(): Promise<number> {
        return 20; // Low risk
    }
}
