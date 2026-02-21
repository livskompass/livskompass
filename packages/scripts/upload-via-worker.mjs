#!/usr/bin/env node
import { execSync } from 'child_process';
import { join } from 'path';

const API_DIR = join(import.meta.dirname, '../api');
const BATCH_SIZE = 15;
const ENDPOINT = 'https://livskompass-api.livskompass-config.workers.dev/migrate-media';

// Get all r2_keys from remote D1
console.log('Fetching media keys from remote D1...');
const dbResult = execSync(
  'npx wrangler d1 execute livskompass-db --remote --command="SELECT r2_key FROM media" --json',
  { cwd: API_DIR, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
);
const keys = JSON.parse(dbResult)[0].results.map(r => r.r2_key);
console.log(`Found ${keys.length} media files to upload\n`);

let ok = 0;
let fail = 0;
const allFailures = [];
const totalBatches = Math.ceil(keys.length / BATCH_SIZE);

for (let i = 0; i < keys.length; i += BATCH_SIZE) {
  const batch = keys.slice(i, i + BATCH_SIZE);
  const batchNum = Math.floor(i / BATCH_SIZE) + 1;

  try {
    const resp = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys: batch }),
    });
    const data = await resp.json();
    ok += data.ok;
    fail += data.failed;
    if (data.failures?.length) allFailures.push(...data.failures);
    console.log(`Batch ${batchNum}/${totalBatches}: ${data.ok} ok, ${data.failed} failed | Total: ${ok}/${keys.length}`);
  } catch (err) {
    console.log(`Batch ${batchNum}/${totalBatches}: ERROR - ${err.message}`);
    fail += batch.length;
  }
}

console.log(`\nDone: ${ok} ok, ${fail} failed out of ${keys.length}`);
if (allFailures.length) {
  console.log('\nFailed files:');
  allFailures.forEach(f => console.log(`  ${f.key}: ${f.error}`));
}
