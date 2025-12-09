
import { AgentStatus, RiskProfile } from '@yield-guardian/shared';

export interface DecisionTrace {
    shouldRebalance: boolean;
    reason: string;
    expectedImprovement: number;
    currentYield: number;
    targetYield: number;
    gasEstimate: string | number | bigint;
    actions: { type: string; protocol: { name: string }; asset: string; amount: string | number | bigint }[];
    riskImpact: {
        before: number;
        after: number;
        change: number;
    };
}

const API_URL = process.env.NEXT_PUBLIC_AGENT_API || 'http://localhost:3001/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_AGENT_API_KEY;

const authHeaders = API_KEY
    ? {
        'x-api-key': API_KEY
    }
    : {};

export const api = {
    async getStatus(): Promise<AgentStatus> {
        const res = await fetch(`${API_URL}/status`);
        if (!res.ok) throw new Error('Failed to fetch status');
        return res.json();
    },

    async getRisk(): Promise<RiskProfile> {
        const res = await fetch(`${API_URL}/risk`);
        if (!res.ok) throw new Error('Failed to fetch risk');
        return res.json();
    },

    async startAgent() {
        const res = await fetch(`${API_URL}/control/start`, {
            method: 'POST',
            headers: {
                ...authHeaders
            }
        });
        if (!res.ok) throw new Error('Failed to start agent');
        return res.json();
    },

    async stopAgent() {
        const res = await fetch(`${API_URL}/control/stop`, {
            method: 'POST',
            headers: {
                ...authHeaders
            }
        });
        if (!res.ok) throw new Error('Failed to stop agent');
        return res.json();
    },

    async getDecision(): Promise<DecisionTrace> {
        const res = await fetch(`${API_URL}/decision`, {
            headers: {
                ...authHeaders
            }
        });
        if (!res.ok) throw new Error('Failed to fetch decision');
        return res.json();
    }
};
