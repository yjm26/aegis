/**
 * Generate a dedicated testnet service wallet for Shelby backend uploads.
 * Usage: node scripts/generate-service-wallet.mjs
 *
 * This is NOT the user's Petra wallet.
 * User wallet = identity in the app.
 * Service wallet = server signer for Shelby blob registration (APTOS_PRIVATE_KEY).
 */
import { Account } from '@aptos-labs/ts-sdk';
import { writeFileSync, existsSync } from 'node:fs';

const account = Account.generate();
const address = account.accountAddress.toString();
// Prefer hex form for env (also accepted with ed25519-priv- prefix by API)
const privateKeyHex = account.privateKey.toString().replace(/^ed25519-priv-/i, '');
const aip80 = account.privateKey.toString();

const block = `# Blobbed service wallet (TESTNET) — generated ${new Date().toISOString()}
# Paste into Vercel → Settings → Environment Variables
# DO NOT commit this file. DO NOT use mainnet keys.

APTOS_NETWORK=testnet
APTOS_PRIVATE_KEY=${privateKeyHex}

# Address (for faucet + explorer):
# ${address}

# AIP-80 form (optional alternate):
# ${aip80}
`;

console.log('\n=== Blobbed service wallet (TESTNET) ===\n');
console.log('Address:     ', address);
console.log('Private key:', privateKeyHex);
console.log('\n1) Fund APT (testnet faucet):');
console.log('   https://aptos.dev/network/faucet');
console.log('   Paste address above → mint\n');
console.log('2) Vercel → Project → Settings → Environment Variables:');
console.log('   APTOS_PRIVATE_KEY =' + privateKeyHex);
console.log('   APTOS_NETWORK     = testnet');
console.log('   (Production + Preview)\n');
console.log('3) Redeploy, then retry upload.\n');

const out = '.env.service-wallet.local';
if (!existsSync(out)) {
  writeFileSync(out, block, { mode: 0o600 });
  console.log(`Also wrote ${out} (gitignored locally if you add it).\n`);
} else {
  console.log(`(Skipped writing ${out} — already exists)\n`);
}
