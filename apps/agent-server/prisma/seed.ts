import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding demo data...');

    // Seed Agent Logs
    await prisma.agentLog.createMany({
        data: [
            { level: 'INFO', message: 'Agent initialized successfully', metadata: JSON.stringify({ version: '1.0.0' }) },
            { level: 'INFO', message: 'Scanning Aave V3 for yield opportunities...', metadata: JSON.stringify({ protocol: 'Aave' }) },
            { level: 'INFO', message: 'Current APY: 4.2%', metadata: JSON.stringify({ apy: 4.2 }) },
            { level: 'INFO', message: 'Comparing with Compound V3...', metadata: JSON.stringify({ protocol: 'Compound' }) },
            { level: 'WARN', message: 'Gas price elevated: 45 gwei', metadata: JSON.stringify({ gasPrice: 45 }) },
            { level: 'INFO', message: 'Deferring rebalance until gas < 30 gwei', metadata: null },
        ],
    });

    // Seed Trade Decisions
    await prisma.tradeDecision.createMany({
        data: [
            {
                protocol: 'Aave V3',
                action: 'DEPOSIT',
                amount: '5000.00',
                reasoning: 'Initial deposit to secure 4.2% APY on USDC',
                txHash: '0x1234567890abcdef1234567890abcdef12345678',
                status: 'COMPLETED',
            },
            {
                protocol: 'Aave V3',
                action: 'HARVEST',
                amount: '12.50',
                reasoning: 'Compounding accrued rewards back into principal',
                txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
                status: 'COMPLETED',
            },
            {
                protocol: 'Frax Finance',
                action: 'REBALANCE',
                amount: '2500.00',
                reasoning: 'Moving 50% to sFRAX for higher yield (5.1% vs 4.2%)',
                txHash: '0x7890abcdef1234567890abcdef1234567890abcd',
                status: 'COMPLETED',
            },
            {
                protocol: 'Compound V3',
                action: 'REBALANCE',
                amount: '1000.00',
                reasoning: 'Diversification into Compound for risk mitigation',
                txHash: null,
                status: 'PENDING',
            },
        ],
    });

    // Seed Risk Snapshots
    await prisma.riskSnapshot.createMany({
        data: [
            { riskScore: 18, protocolBreakdown: JSON.stringify({ Aave: 60, Frax: 40 }), timestamp: new Date('2025-12-01') },
            { riskScore: 22, protocolBreakdown: JSON.stringify({ Aave: 50, Frax: 30, Compound: 20 }), timestamp: new Date('2025-12-05') },
            { riskScore: 24, protocolBreakdown: JSON.stringify({ Aave: 40, Frax: 35, Compound: 25 }), timestamp: new Date('2025-12-09') },
        ],
    });

    console.log('✅ Demo data seeded successfully!');
    console.log('   - Agent Logs: 6');
    console.log('   - Trade Decisions: 4');
    console.log('   - Risk Snapshots: 3');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
