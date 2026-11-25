#!/usr/bin/env node
/**
 * Renders the brand SVG into the PNG icons the web app needs.
 *
 *   assets/brand/icon.svg → public/icons/icon-192.png   (maskable)
 *                         → public/icons/icon-512.png   (maskable)
 *                         → assets/favicon.png
 *
 * Run with `npm run icons:generate`. The outputs are committed, so this only
 * needs to run when the brand SVG changes.
 */
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export const ICON_SOURCE = resolve(ROOT, 'assets/brand/icon.svg');

export const ICON_TARGETS = [
  { file: resolve(ROOT, 'public/icons/icon-192.png'), size: 192 },
  { file: resolve(ROOT, 'public/icons/icon-512.png'), size: 512 },
  { file: resolve(ROOT, 'assets/favicon.png'), size: 64 },
];

export async function generatePwaIcons({
  source = ICON_SOURCE,
  targets = ICON_TARGETS,
} = {}) {
  for (const { file, size } of targets) {
    await mkdir(dirname(file), { recursive: true });
    await sharp(source, { density: 384 })
      .resize(size, size)
      .png()
      .toFile(file);
    console.log(`wrote ${file} (${size}x${size})`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generatePwaIcons().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
