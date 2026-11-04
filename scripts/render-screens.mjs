#!/usr/bin/env node
// Captures a sample case study's React screens as images.
//
//   pnpm render-screens <slug> [name...] [--url http://127.0.0.1:5173]
//
// Needs the dev server running. Opens /render-screen/<slug>/<name> for each
// screen in src/content/work/<slug>/screens.tsx, captures it at 2× and runs it
// through scripts/add-images. Uses installed Google Chrome by default; set
// PLAYWRIGHT_CHANNEL=chromium to use Playwright's own browser.

import { existsSync, readFileSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { addImages, resolveFolder } from './add-images.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function devServerUrl() {
  const log = path.join(root, '.layerwise/dev-server.log');
  if (existsSync(log)) {
    const match = /Local:\s+(http:\/\/[^\s/]+)/.exec(readFileSync(log, 'utf8'));
    if (match) return match[1];
  }
  return 'http://localhost:5173';
}

async function main(argv) {
  const args = [...argv];
  const urlIndex = args.indexOf('--url');
  const base =
    urlIndex === -1 ? devServerUrl() : args.splice(urlIndex, 2)[1];
  const [slug, ...only] = args;
  if (!slug) {
    console.log('Usage: pnpm render-screens <slug> [name...] [--url <dev server>]');
    process.exit(1);
  }

  const channel = process.env.PLAYWRIGHT_CHANNEL ?? 'chrome';
  const browser = await chromium.launch(
    channel === 'chromium' ? {} : { channel }
  );
  const out = path.join(os.tmpdir(), 'fieldglass-screens', slug);
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });

  try {
    const listPage = await browser.newPage();
    await listPage.goto(`${base}/render-screen/${slug}/_list`);
    const listText = await listPage
      .locator('#screen-list, #screen-error')
      .first()
      .textContent({ timeout: 30000 });
    await listPage.close();
    const list = JSON.parse(listText ?? '[]');
    const wanted = only.length ? list.filter((s) => only.includes(s.name)) : list;
    if (wanted.length === 0) throw new Error(`No screens found for ${slug}.`);

    const files = [];
    for (const screen of wanted) {
      const context = await browser.newContext({
        viewport: { width: screen.width, height: screen.height },
        deviceScaleFactor: 2880 / screen.width,
        reducedMotion: 'reduce'
      });
      const page = await context.newPage();
      page.on('pageerror', (e) => console.error(`  ${screen.name}: ${e.message}`));
      await page.goto(`${base}/render-screen/${slug}/${screen.name}`);
      await page.waitForFunction(() => window.__screenReady === true, null, {
        timeout: 30000
      });
      const file = path.join(out, `${screen.name}.png`);
      await page.locator('#screen').screenshot({ path: file });
      files.push(file);
      console.log(`  captured ${screen.name}`);
      await context.close();
    }

    await addImages(
      resolveFolder(slug),
      files,
      wanted.map((s) => s.name)
    );
  } finally {
    await browser.close();
  }
}

main(process.argv.slice(2)).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
