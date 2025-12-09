import { ProtocolAdapter, YieldData } from '@yield-guardian/shared/protocol-types';

export class FraxAdapter implements ProtocolAdapter {
    name = 'Frax Finance';
    private rpcUrl: string;

    constructor(rpcUrl: string) {
        this.rpcUrl = rpcUrl;
    }

    async getYield(asset: string): Promise<YieldData> {
        // TODO: Integrate with Frax API
        const mockApys: Record<string, number> = {
            FRAX: 5.1, // sFRAX
            frxETH: 3.8, // sfrxETH
        };

        return {
            protocol: 'Frax Finance',
            asset,
            apy: mockApys[asset] || 0,
            tvl: '450000000', // $450M
            riskScore: 22, // Low-medium risk
            lastUpdated: new Date(),
        };
    }

    async getTVL(asset: string): Promise<string> {
        return '450000000';
    }

    async getRiskScore(): Promise<number> {
        return 22; // Low-medium risk
    }
}
