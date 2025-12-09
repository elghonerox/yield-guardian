import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

/**
 * Lightweight IPFS publish helper (placeholder).
 * Computes a deterministic hash of the file to act as a pseudo CID for demos.
 * Replace with real IPFS client (web3.storage/pinata) when available.
 */
async function main() {
    const filePath = process.argv[2] || './agent-metadata.json';
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const data = fs.readFileSync(path.resolve(filePath));
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    const pseudoCid = `bafy${hash.slice(0, 46)}`;

    console.log(`✅ Pseudo-CID (replace with real IPFS upload): ${pseudoCid}`);
    fs.mkdirSync('.artifacts', { recursive: true });
    fs.writeFileSync('.artifacts/meta.json', JSON.stringify({ cid: pseudoCid, file: filePath }, null, 2));
    console.log('💾 Wrote .artifacts/meta.json');
}

main().catch(err => {
    console.error('❌ publish-metadata failed:', err);
    process.exit(1);
});

