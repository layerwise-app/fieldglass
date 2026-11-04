#!/usr/bin/env node
// Builds every icon from public/logo.svg.
//
//   pnpm icons
//
// Writes public/logo.png (1024 px), favicon.svg, favicon.ico (16, 32, 48),
// favicon.png, favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png
// and the android-chrome icons used by site.webmanifest.

import { copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (name) => path.join(root, 'public', name);

// The background behind iOS's rounded mask, which fills transparent corners
// with black otherwise. Matches `colors.paper` in src/portfolio.config.ts.
const PAPER = '#F2F2EE';

/** Packs PNG images into a .ico file (PNG-compressed entries). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + 16 * images.length;
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += data.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function main() {
  const svg = await readFile(pub('logo.svg'));
  const master = await sharp(svg, { density: 300 })
    .resize(1024, 1024)
    .png()
    .toBuffer();
  await writeFile(pub('logo.png'), master);

  const at = (size) =>
    sharp(master).resize(size, size, { kernel: 'lanczos3' }).png().toBuffer();

  const outputs = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'favicon.png': 32,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512
  };
  for (const [name, size] of Object.entries(outputs)) {
    await writeFile(pub(name), await at(size));
  }

  await sharp(master)
    .flatten({ background: PAPER })
    .resize(180, 180, { kernel: 'lanczos3' })
    .png()
    .toFile(pub('apple-touch-icon.png'));

  const icoSizes = [16, 32, 48];
  const images = await Promise.all(
    icoSizes.map(async (size) => ({ size, data: await at(size) }))
  );
  await writeFile(pub('favicon.ico'), ico(images));

  await copyFile(pub('logo.svg'), pub('favicon.svg'));
  console.log('Icons written to public/.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
