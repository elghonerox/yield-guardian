
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet, sepolia } from 'viem/chains';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';

type LaunchArgs = {
    dryRun: boolean;
    metadataPath: string;
    agentName: string;
    chain: 'mainnet' | 'sepolia';
};

const parseArgs = (): LaunchArgs => {
    const args = process.argv.slice(2);
    const flags = Object.fromEntries(args.map(a => {
        const [k, v] = a.replace('--', '').split('=');
        return [k, v ?? true];
    }));

    return {
        dryRun: flags['dry-run'] === true || flags['dry-run'] === 'true',
        metadataPath: (flags['metadata'] as string) || './agent-metadata.json',
        agentName: (flags['name'] as string) || 'Yield-Guardian-v1',
        chain: ((flags['chain'] as string) === 'mainnet' ? 'mainnet' : 'sepolia')
    };
};

async function launch() {
    const { dryRun, metadataPath, agentName, chain } = parseArgs();
    console.log(`🚀 Starting ATP Launch Sequence for: ${agentName}`);
    console.log(`⚙️ Mode: ${dryRun ? 'DRY RUN' : 'LIVE'} | Chain: ${chain}`);

    // 1. Validate Environment
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://rpc.sepolia.org';
    const factory = process.env.ATP_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000';
    if (!privateKey) throw new Error("PRIVATE_KEY not found in env");
    if (!fs.existsSync(metadataPath)) throw new Error(`Metadata file not found: ${metadataPath}`);

    const metadata = JSON.parse(fs.readFileSync(path.resolve(metadataPath), 'utf-8'));
    console.log(`🧾 Loaded metadata: ${metadata.name || agentName}`);

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    console.log(`👤 Deploying as: ${account.address}`);

    // 2. Build Agent Artifact (assume built in CI prior to this step)
    console.log("📦 Ensure agent artifact is built (dist/agent.zip)");

    // 3. Upload metadata to IPFS (placeholder - user can replace with real client)
    const metadataCid = metadata.cid || metadata.ipfs || "QmMockCIDYieldGuardian";
    console.log(`☁️ Using metadata CID: ${metadataCid}`);

    // 4. Register on ATP
    if (dryRun) {
        const mockTxHash = "0x" + Math.random().toString(16).slice(2);
        console.log(`✅ DRY RUN: would call factory ${factory} with metadata ${metadataCid}`);
        console.log(`🧪 Mock TX: ${mockTxHash}`);
        return;
    }

    const client = createWalletClient({
        account,
        chain: chain === 'mainnet' ? mainnet : sepolia,
        transport: http(rpcUrl)
    });

    // NOTE: Replace with actual ABI/function once provided by ATP
    // This is a placeholder call to illustrate the flow.
    const hash = await client.sendTransaction({
        to: factory as `0x${string}`,
        value: 0n,
        data: '0x' // TODO: insert encoded createAgent(agentName, metadataCid)
    });

    console.log(`✅ Transaction sent! Hash: ${hash}`);
    console.log(`🌍 View Agent (once indexed): https://atp.iqai.com/agent/${metadataCid}`);
}

launch().catch(err => {
    console.error("❌ Launch failed:", err);
    process.exit(1);
});
