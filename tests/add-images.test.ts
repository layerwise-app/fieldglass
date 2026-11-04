import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { addImages, processImage, removeImage } from '../scripts/add-images.mjs';

let dir: string;
let src: string;

beforeAll(async () => {
  dir = await mkdtemp(path.join(os.tmpdir(), 'fieldglass-add-images-'));
  src = path.join(dir, 'source');
  await rm(src, { recursive: true, force: true });
  await import('node:fs/promises').then((fs) => fs.mkdir(src));
  await sharp({ create: { width: 3000, height: 1875, channels: 3, background: '#2f6b3f' } })
    .png()
    .toFile(path.join(src, 'Cover Shot.png'));
  await sharp({ create: { width: 1000, height: 1000, channels: 3, background: '#f24e10' } })
    .jpeg()
    .toFile(path.join(src, 'small.jpg'));
  await sharp({ create: { width: 40, height: 20, channels: 3, background: '#000' } })
    .gif()
    .toFile(path.join(src, 'loop.gif'));
  await writeFile(path.join(src, 'mark.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('scripts/add-images', () => {
  it('writes 800, 1600 and 2880 px WebP files, size and placeholder', async () => {
    const out = path.join(dir, 'project');
    const manifest = await addImages(out, [path.join(src, 'Cover Shot.png')], ['cover']);
    expect(manifest.cover.widths).toEqual([800, 1600, 2880]);
    expect(manifest.cover).toMatchObject({ width: 3000, height: 1875, og: true });
    expect(manifest.cover.placeholder).toMatch(/^data:image\/webp;base64,/);
    for (const w of [800, 1600, 2880]) {
      const meta = await sharp(path.join(out, `cover-${w}.webp`)).metadata();
      expect(meta.format).toBe('webp');
      expect(meta.width).toBe(w);
    }
    const og = await sharp(path.join(out, 'cover-og.jpg')).metadata();
    expect([og.width, og.height]).toEqual([1200, 630]);
    const module = await readFile(path.join(out, 'images.ts'), 'utf8');
    expect(module).toContain("'cover': image(3000, 1875");
    expect(module).toContain("import coverOg from './cover-og.jpg';");
  });

  it('names files from their file name and never upscales', async () => {
    const out = path.join(dir, 'project');
    const manifest = await addImages(out, [path.join(src, 'small.jpg')]);
    expect(manifest.small.widths).toEqual([800]);
    expect(manifest.cover, 'keeps earlier images').toBeTruthy();
  });

  it('copies GIFs untouched', async () => {
    const out = path.join(dir, 'project');
    await addImages(out, [path.join(src, 'loop.gif')]);
    const [a, b] = await Promise.all([
      readFile(path.join(src, 'loop.gif')),
      readFile(path.join(out, 'loop.gif'))
    ]);
    expect(b.equals(a)).toBe(true);
    const module = await readFile(path.join(out, 'images.ts'), 'utf8');
    expect(module).toContain("import loop from './loop.gif';");
  });

  it('rejects SVG', async () => {
    await expect(processImage(dir, path.join(src, 'mark.svg'))).rejects.toThrow(/SVG/);
  });

  it('removes an image and its files', async () => {
    const out = path.join(dir, 'project');
    await removeImage(out, 'small');
    expect(existsSync(path.join(out, 'small-800.webp'))).toBe(false);
    const module = await readFile(path.join(out, 'images.ts'), 'utf8');
    expect(module).not.toContain('small');
  });
});
