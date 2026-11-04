#!/usr/bin/env node
// Adds images to a case study (or any folder under src/).
//
//   pnpm add-images <slug|folder> <file...> [--name <name>]
//   pnpm add-images <slug|folder> --remove <name>
//
// For every source image it writes 800, 1600 and 2880 px wide WebP files, the
// image's dimensions and a tiny blurred placeholder, then regenerates
// `images.ts` in that folder so content files can `import { images }`.
// GIFs are copied untouched. SVGs are rejected. An image named `cover` also
// gets a 1200×630 JPG for link previews.

import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

export const WIDTHS = [800, 1600, 2880];
const RASTER = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.avif',
  '.tif',
  '.tiff'
]);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** `veld-kunsthal` → src/content/work/veld-kunsthal; `src/x` stays as is. */
export function resolveFolder(target, cwd = root) {
  if (target.includes('/') || target.startsWith('.')) {
    return path.resolve(cwd, target);
  }
  return path.join(root, 'src/content/work', target);
}

export function toName(file) {
  return path
    .basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toIdentifier(name) {
  const camel = name.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
  return /^[0-9]/.test(camel) ? `img${camel}` : camel;
}

async function readManifest(folder) {
  const file = path.join(folder, 'images.json');
  if (!existsSync(file)) return {};
  return JSON.parse(await readFile(file, 'utf8'));
}

async function placeholderFor(input) {
  const buffer = await sharp(input, { animated: false })
    .rotate()
    .resize({ width: 16 })
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${buffer.toString('base64')}`;
}

export async function processImage(folder, file, name = toName(file)) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.svg') {
    throw new Error(
      `${path.basename(file)}: SVG isn't supported. Export it as PNG or JPG first.`
    );
  }
  if (!name) throw new Error(`${file}: can't make a name from this file.`);

  if (ext === '.gif') {
    const meta = await sharp(file, { animated: true }).metadata();
    await copyFile(file, path.join(folder, `${name}.gif`));
    return {
      name,
      entry: {
        gif: true,
        width: meta.width,
        height: meta.pageHeight ?? meta.height,
        placeholder: await placeholderFor(file)
      }
    };
  }

  if (!RASTER.has(ext)) {
    throw new Error(
      `${path.basename(file)}: use PNG, JPG, WebP, AVIF, TIFF or GIF.`
    );
  }

  const source = sharp(file).rotate();
  const meta = await source.metadata();
  const upright = (meta.orientation ?? 1) >= 5;
  const width = upright ? meta.height : meta.width;
  const height = upright ? meta.width : meta.height;
  if (!width || !height) throw new Error(`${file}: can't read its size.`);

  const widths = WIDTHS.filter((w) => w <= width);
  if (widths.length === 0) widths.push(width);
  if (width < WIDTHS[WIDTHS.length - 1]) {
    console.warn(
      `  ${name}: source is ${width}px wide, so the largest WebP is ${widths[widths.length - 1]}px.`
    );
  }

  for (const w of widths) {
    await sharp(file)
      .rotate()
      .resize({ width: w })
      .webp({ quality: w >= 2880 ? 78 : 82, effort: 5 })
      .toFile(path.join(folder, `${name}-${w}.webp`));
  }

  let og = false;
  if (name === 'cover') {
    await sharp(file)
      .rotate()
      .resize({ width: 1200, height: 630, fit: 'cover', position: 'attention' })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(path.join(folder, 'cover-og.jpg'));
    og = true;
  }

  return {
    name,
    entry: {
      width,
      height,
      widths,
      placeholder: await placeholderFor(file),
      ...(og ? { og: true } : {})
    }
  };
}

export function renderModule(manifest) {
  const names = Object.keys(manifest).sort();
  const imports = [];
  const entries = [];
  for (const name of names) {
    const entry = manifest[name];
    const id = toIdentifier(name);
    if (entry.gif) {
      imports.push(`import ${id} from './${name}.gif';`);
      entries.push(
        `  '${name}': image(${entry.width}, ${entry.height}, '${entry.placeholder}', [[${entry.width}, ${id}]]),`
      );
      continue;
    }
    const sources = entry.widths.map((w) => {
      imports.push(`import ${id}${w} from './${name}-${w}.webp';`);
      return `[${w}, ${id}${w}]`;
    });
    let og = '';
    if (entry.og) {
      imports.push(`import ${id}Og from './${name}-og.jpg';`);
      og = `, ${id}Og`;
    }
    entries.push(
      `  '${name}': image(${entry.width}, ${entry.height}, '${entry.placeholder}', [${sources.join(', ')}]${og}),`
    );
  }
  return [
    '// Generated by `pnpm add-images`. Don’t edit by hand: run the script again.',
    "import { image } from '~/content/types';",
    ...imports,
    '',
    'export const images = {',
    ...entries,
    '} as const;',
    ''
  ].join('\n');
}

async function writeOutputs(folder, manifest) {
  await writeFile(
    path.join(folder, 'images.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
  await writeFile(path.join(folder, 'images.ts'), renderModule(manifest));
}

/** Adds files to a folder and regenerates its `images.ts`. */
export async function addImages(folder, files, names = []) {
  await mkdir(folder, { recursive: true });
  const manifest = await readManifest(folder);
  for (const [index, file] of files.entries()) {
    const { name, entry } = await processImage(folder, file, names[index]);
    manifest[name] = entry;
    console.log(
      `  ${name}: ${entry.width}×${entry.height}${entry.gif ? ' (GIF, copied as is)' : `, ${entry.widths.join('/')} px WebP`}`
    );
  }
  await writeOutputs(folder, manifest);
  return manifest;
}

/** Deletes an image's files and drops it from `images.ts`. */
export async function removeImage(folder, name) {
  const manifest = await readManifest(folder);
  const entry = manifest[name];
  if (!entry) throw new Error(`No image named "${name}" in ${folder}.`);
  const files = entry.gif
    ? [`${name}.gif`]
    : [
        ...entry.widths.map((w) => `${name}-${w}.webp`),
        ...(entry.og ? [`${name}-og.jpg`] : [])
      ];
  await Promise.all(files.map((f) => rm(path.join(folder, f), { force: true })));
  delete manifest[name];
  await writeOutputs(folder, manifest);
}

async function main(argv) {
  const args = [...argv];
  const take = (flag) => {
    const i = args.indexOf(flag);
    if (i === -1) return undefined;
    const [, value] = args.splice(i, 2);
    return value;
  };
  const name = take('--name');
  const remove = take('--remove');
  const [target, ...files] = args;

  if (!target || (!remove && files.length === 0)) {
    console.log(
      'Usage: pnpm add-images <slug|folder> <file...> [--name <name>]\n       pnpm add-images <slug|folder> --remove <name>'
    );
    process.exit(1);
  }
  const folder = resolveFolder(target, process.cwd());
  if (remove) {
    await removeImage(folder, remove);
    console.log(`Removed ${remove} from ${path.relative(root, folder)}`);
    return;
  }
  if (name && files.length > 1) {
    throw new Error('--name only works with a single file.');
  }
  const missing = files.filter((f) => !existsSync(f));
  if (missing.length) throw new Error(`Not found: ${missing.join(', ')}`);

  console.log(`Adding to ${path.relative(root, folder)}/`);
  await addImages(
    folder,
    files.map((f) => path.resolve(process.cwd(), f)),
    name ? [name] : []
  );
  console.log(`Wrote images.ts. Use them as images['<name>'].`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
