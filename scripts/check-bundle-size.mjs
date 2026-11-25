#!/usr/bin/env node
/**
 * Fails the build when the initial web JavaScript exceeds the gzip budget.
 *
 * "Initial" means the scripts the exported dist/index.html loads before the
 * app renders, plus any modulepreload links. Route chunks and the lazy 3D /
 * mascot chunks are fetched on demand, so they are reported but not counted.
 */

import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const DIST = path.resolve('dist');
const LIMIT_BYTES = 400 * 1024; // 400 KiB gzip
const LAZY_PATTERN = /(mascot|three|3d|model)/i;

const indexPath = path.join(DIST, 'index.html');
if (!existsSync(indexPath)) {
  console.error(`check-bundle-size: ${indexPath} not found. Run the web export first.`);
  process.exit(1);
}

const html = readFileSync(indexPath, 'utf8');
const refs = new Set();
for (const match of html.matchAll(/<script[^>]*\bsrc="([^"]+\.js)"/g)) refs.add(match[1]);
for (const match of html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+\.js)"/g)) refs.add(match[1]);

const initial = [];
const lazy = [];
for (const ref of refs) {
  const file = path.join(DIST, ref.replace(/^\//, ''));
  if (!existsSync(file)) {
    console.error(`check-bundle-size: referenced file missing: ${ref}`);
    process.exit(1);
  }
  const gzipBytes = gzipSync(readFileSync(file)).length;
  const entry = { ref, gzipBytes };
  if (LAZY_PATTERN.test(path.basename(ref))) lazy.push(entry);
  else initial.push(entry);
}

const total = initial.reduce((sum, entry) => sum + entry.gzipBytes, 0);
const kib = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`;

console.log('Initial web JS (gzip):');
for (const entry of initial) console.log(`  ${kib(entry.gzipBytes).padStart(10)}  ${entry.ref}`);
console.log(`  ${kib(total).padStart(10)}  total (limit ${kib(LIMIT_BYTES)})`);
if (lazy.length > 0) {
  console.log(`Excluded lazy 3D/mascot chunks: ${lazy.map((e) => e.ref).join(', ')}`);
}

if (total > LIMIT_BYTES) {
  console.error(`check-bundle-size: initial JS is ${kib(total)}, above the ${kib(LIMIT_BYTES)} limit.`);
  process.exit(1);
}
