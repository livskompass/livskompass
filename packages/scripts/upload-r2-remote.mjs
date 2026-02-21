#!/usr/bin/env node
/**
 * Re-upload media from local R2 to remote R2.
 * The migration script uploaded to local R2 by default.
 * This script copies all files to the remote bucket using --remote flag.
 *
 * Usage: node upload-r2-remote.mjs
 */

import { execSync, exec } from 'child_process';
import { join } from 'path';
import { mkdirSync, existsSync, writeFileSync, unlinkSync } from 'fs';

const API_DIR = join(import.meta.dirname, '../api');
const TMP_DIR = '/tmp/r2-remote-upload';
const BUCKET = 'livskompass-media';
const CONCURRENCY = 5;

// Ensure tmp dir
if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });

// Get all r2_keys from remote D1
console.log('Fetching media keys from remote D1...');
const dbResult = execSync(
  `npx wrangler d1 execute livskompass-db --remote --command="SELECT r2_key FROM media" --json`,
  { cwd: API_DIR, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
);
const keys = JSON.parse(dbResult)[0].results.map(r => r.r2_key);
console.log(`Found ${keys.length} media files to upload\n`);

// Mime type guessing
function guessMime(key) {
  const ext = key.split('.').pop()?.toLowerCase();
  const types = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
    webp: 'image/webp', svg: 'image/svg+xml', pdf: 'application/pdf',
    mp3: 'audio/mpeg', mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo',
    doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    key: 'application/x-iwork-keynote-sffkey', flv: 'video/x-flv',
  };
  return types[ext] || 'application/octet-stream';
}

// Upload a single file: local R2 → tmp file → remote R2
function uploadOne(key, index) {
  return new Promise((resolve) => {
    const safeFile = key.replace(/\//g, '__');
    const tmpPath = join(TMP_DIR, safeFile);
    const progress = `[${index + 1}/${keys.length}]`;

    try {
      // Get from local R2
      execSync(
        `npx wrangler r2 object get "${BUCKET}/${key}" --local --pipe > "${tmpPath}"`,
        { cwd: API_DIR, stdio: ['pipe', 'pipe', 'pipe'], shell: true }
      );

      // Upload to remote R2
      const ct = guessMime(key);
      execSync(
        `npx wrangler r2 object put "${BUCKET}/${key}" --remote --file="${tmpPath}" --content-type="${ct}"`,
        { cwd: API_DIR, stdio: ['pipe', 'pipe', 'pipe'] }
      );

      console.log(`${progress} ✅ ${key}`);
      resolve({ key, ok: true });
    } catch (err) {
      console.log(`${progress} ❌ ${key}: ${err.message.split('\n')[0]}`);
      resolve({ key, ok: false, error: err.message });
    } finally {
      try { unlinkSync(tmpPath); } catch {}
    }
  });
}

// Run with limited concurrency
let completed = 0;
let failed = 0;
let idx = 0;

async function runBatch() {
  while (idx < keys.length) {
    const batch = [];
    for (let i = 0; i < CONCURRENCY && idx < keys.length; i++) {
      batch.push(uploadOne(keys[idx], idx));
      idx++;
    }
    const results = await Promise.all(batch);
    for (const r of results) {
      completed++;
      if (!r.ok) failed++;
    }
  }
}

const start = Date.now();
await runBatch();
const elapsed = ((Date.now() - start) / 1000).toFixed(1);

console.log(`\n✅ Done in ${elapsed}s: ${completed - failed}/${completed} succeeded, ${failed} failed`);

// Cleanup
try { execSync(`rm -rf "${TMP_DIR}"`); } catch {}
