import type { ShapeName } from '~/content/types';

/**
 * Target positions for every particle, per shape. Each shape is a flat
 * Float32Array of `count * 4` values: x, y, z and w, where
 * `w = tone + 2 * accent` (tone 0–1 is the particle's strength, accent 0 or 1
 * picks the highlight colour). Shapes fit inside a sphere of radius ~1 and are
 * deterministic, so every visit draws the same form.
 */

export type ShapeData = Float32Array;

/** Points inside the initials, as x/y pairs in a box about 1 unit tall. */
export type GlyphPoints = Float32Array;

type Rand = () => number;

function seeded(seed: number): Rand {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function gaussian(rand: Rand): number {
  const u = Math.max(rand(), 1e-9);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

class Writer {
  i = 0;
  constructor(
    readonly out: Float32Array,
    readonly count: number
  ) {}
  get full() {
    return this.i >= this.count;
  }
  push(x: number, y: number, z: number, tone: number, accent = 0) {
    if (this.i >= this.count) return;
    const o = this.i * 4;
    this.out[o] = x;
    this.out[o + 1] = y;
    this.out[o + 2] = z;
    this.out[o + 3] = Math.min(1, Math.max(0, tone)) + accent * 2;
    this.i++;
  }
}

/** Rotate every point around X then Y (radians). */
function rotate(out: Float32Array, count: number, rx: number, ry: number) {
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  for (let i = 0; i < count; i++) {
    const o = i * 4;
    const x = out[o]!;
    const y = out[o + 1]!;
    const z = out[o + 2]!;
    const y1 = y * cx - z * sx;
    const z1 = y * sx + z * cx;
    out[o] = x * cy + z1 * sy;
    out[o + 1] = y1;
    out[o + 2] = -x * sy + z1 * cy;
  }
}

/** Centre on the middle of the bounds, then scale so the farthest point
 * (ignoring the outermost 1%) sits at `radius`. */
function normalise(out: Float32Array, count: number, radius = 1) {
  const step0 = Math.max(1, Math.floor(count / 6000));
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < count; i += step0) {
    xs.push(out[i * 4]!);
    ys.push(out[i * 4 + 1]!);
  }
  xs.sort((a, b) => a - b);
  ys.sort((a, b) => a - b);
  const q = (v: number[], f: number) => v[Math.floor((v.length - 1) * f)]!;
  const cx = (q(xs, 0.01) + q(xs, 0.99)) / 2;
  const cy = (q(ys, 0.01) + q(ys, 0.99)) / 2;
  for (let i = 0; i < count; i++) {
    out[i * 4] -= cx;
    out[i * 4 + 1] -= cy;
  }
  const r: number[] = [];
  const step = Math.max(1, Math.floor(count / 4000));
  for (let i = 0; i < count; i += step) {
    const o = i * 4;
    r.push(Math.hypot(out[o]!, out[o + 1]!, out[o + 2]!));
  }
  r.sort((a, b) => a - b);
  const max = r[Math.floor(r.length * 0.99)] || 1;
  const s = radius / max;
  for (let i = 0; i < count; i++) {
    const o = i * 4;
    out[o] *= s;
    out[o + 1] *= s;
    out[o + 2] *= s;
  }
}

/** Fill whatever is left with a faint dust so every particle has a home. */
function dust(w: Writer, rand: Rand, radius: number, tone = 0.18) {
  while (!w.full) {
    const r = radius * Math.pow(rand(), 0.5);
    const a = rand() * Math.PI * 2;
    w.push(Math.cos(a) * r, Math.sin(a) * r, gaussian(rand) * 0.12, tone);
  }
}

// ---------------------------------------------------------------------------
// iris: the home form

function iris(count: number, rand: Rand, glyphs?: GlyphPoints): ShapeData {
  const out = new Float32Array(count * 4);
  const w = new Writer(out, count);
  const pupil = 0.34;

  // Initials in the pupil.
  if (glyphs && glyphs.length >= 2) {
    const n = Math.round(count * 0.135);
    const pairs = glyphs.length / 2;
    const scale = 0.25; // glyph box is ~1 tall
    for (let i = 0; i < n; i++) {
      const j = Math.floor(rand() * pairs) * 2;
      const jx = (rand() - 0.5) * 0.0022;
      const jy = (rand() - 0.5) * 0.0022;
      w.push(
        glyphs[j]! * scale + jx,
        glyphs[j + 1]! * scale + jy,
        (rand() - 0.5) * 0.004,
        0.92 + rand() * 0.08,
        1
      );
    }
  }

  // Rays. Three tiers: a dense short corona, a medium layer whose lengths
  // follow a slow envelope, and long crisp spikes at regular angles.
  type Ray = {
    a: number;
    len: number;
    tilt: number;
    weight: number;
    tone: number;
    start: number;
  };
  const rays: Ray[] = [];
  const envelope = (a: number) =>
    0.5 +
    0.22 * Math.sin(a * 3 + 0.6) +
    0.16 * Math.sin(a * 7 - 1.1) +
    0.12 * Math.sin(a * 13 + 2.3);

  const corona = 640;
  for (let i = 0; i < corona; i++) {
    const a = ((i + rand() * 0.8) / corona) * Math.PI * 2;
    const len = pupil + 0.1 + 0.16 * envelope(a) + rand() * 0.07;
    rays.push({
      a,
      len,
      tilt: (rand() - 0.5) * 0.5,
      weight: 1.15,
      tone: 0.95,
      start: pupil + 0.012 + rand() * 0.012
    });
  }
  const middle = 300;
  for (let i = 0; i < middle; i++) {
    const a = ((i + rand()) / middle) * Math.PI * 2;
    const len = pupil + 0.26 + 0.42 * envelope(a + 0.4) * (0.75 + rand() * 0.25);
    rays.push({
      a,
      len,
      tilt: (rand() - 0.5) * 0.7,
      weight: 0.8,
      tone: 0.85,
      start: pupil + 0.05 + rand() * 0.05
    });
  }
  const spikes = 96;
  for (let i = 0; i < spikes; i++) {
    const a = (i / spikes) * Math.PI * 2 + 0.0001;
    const major = i % 8 === 0;
    const len = major ? 1.08 : 0.8 + 0.14 * envelope(a) + (i % 2 ? 0 : 0.05);
    rays.push({
      a,
      len,
      tilt: (rand() - 0.5) * 0.12,
      weight: major ? 1.25 : 0.62,
      tone: major ? 1 : 0.8,
      start: pupil + 0.1
    });
  }

  const ringN = Math.round(count * 0.035);
  const hazeN = Math.round(count * 0.06);
  const rayBudget = count - w.i - ringN - hazeN;
  const total = rays.reduce((sum, r) => sum + (r.len - r.start) * r.weight, 0);
  for (const ray of rays) {
    const n = Math.round(((ray.len - ray.start) * ray.weight * rayBudget) / total);
    const ca = Math.cos(ray.a);
    const sa = Math.sin(ray.a);
    for (let k = 0; k < n; k++) {
      // More particles near the inner end of each ray.
      const t = Math.pow(rand(), 1.55);
      const r = ray.start + (ray.len - ray.start) * t;
      const perp = (rand() - 0.5) * 0.0016;
      const x = ca * r - sa * perp;
      const y = sa * r + ca * perp;
      const z = (r - pupil) * ray.tilt;
      w.push(x, y, z, ray.tone * (1 - 0.6 * t));
    }
  }

  // The pupil's edge: one crisp ring and a dotted inner ring.
  for (let i = 0; i < ringN; i++) {
    const inner = i % 5 === 0;
    const a = inner
      ? (Math.floor(rand() * 180) / 180) * Math.PI * 2 + rand() * 0.006
      : rand() * Math.PI * 2;
    const r = inner ? pupil - 0.035 : pupil + (rand() - 0.5) * 0.003;
    w.push(Math.cos(a) * r, Math.sin(a) * r, 0, inner ? 0.6 : 1);
  }

  // Haze around the form.
  while (w.i < count - 1 && !w.full) {
    const r = pupil + Math.abs(gaussian(rand)) * 0.38;
    const a = rand() * Math.PI * 2;
    w.push(Math.cos(a) * r, Math.sin(a) * r, gaussian(rand) * 0.12, 0.22);
  }
  dust(w, rand, 1.1);
  return out;
}

// ---------------------------------------------------------------------------
// contour: topographic isolines around three peaks

function contour(count: number, rand: Rand): ShapeData {
  const out = new Float32Array(count * 4);
  const w = new Writer(out, count);
  const peaks = [
    { x: -0.34, y: 0.08, s: 0.36, h: 1 },
    { x: 0.36, y: -0.2, s: 0.28, h: 0.78 },
    { x: 0.14, y: 0.42, s: 0.22, h: 0.55 }
  ];
  const height = (x: number, y: number) => {
    let h = 0;
    for (const p of peaks) {
      const dx = x - p.x;
      const dy = y - p.y;
      h += p.h * Math.exp(-(dx * dx + dy * dy) / (2 * p.s * p.s));
    }
    h += 0.035 * Math.sin(x * 6.1 + y * 2.3) + 0.025 * Math.sin(y * 7.7 - x * 3.1);
    return h;
  };
  const grad = (x: number, y: number) => {
    const e = 0.002;
    return [
      (height(x + e, y) - height(x - e, y)) / (2 * e),
      (height(x, y + e) - height(x, y - e)) / (2 * e)
    ] as const;
  };
  const levels = 22;
  const min = 0.08;
  const max = 1.02;
  let guard = 0;
  while (!w.full && guard++ < count * 60) {
    let x = (rand() * 2 - 1) * 1.15;
    let y = (rand() * 2 - 1) * 1.15;
    const h0 = height(x, y);
    if (h0 < min - 0.03) continue;
    const level = Math.round(((h0 - min) / (max - min)) * levels);
    if (level < 0 || level > levels) continue;
    const target = min + (level / levels) * (max - min);
    // Newton steps onto the isoline.
    for (let k = 0; k < 3; k++) {
      const h = height(x, y);
      const [gx, gy] = grad(x, y);
      const g2 = gx * gx + gy * gy + 1e-6;
      x -= ((h - target) * gx) / g2;
      y -= ((h - target) * gy) / g2;
    }
    if (Math.abs(height(x, y) - target) > 0.002) continue;
    if (x * x + y * y > 1.5) continue;
    // Even spacing along lines: flat areas would otherwise collect points.
    const [gx, gy] = grad(x, y);
    if (rand() > Math.min(1, Math.hypot(gx, gy) * 0.9)) continue;
    const major = level % 5 === 0;
    w.push(x, y, target * 0.42 + (rand() - 0.5) * 0.002, major ? 1 : 0.7);
    if (major && !w.full && rand() < 0.5) {
      w.push(x + (rand() - 0.5) * 0.003, y, target * 0.42, 1);
    }
  }
  dust(w, rand, 1);
  rotate(out, count, -1.0, 0.18);
  normalise(out, count, 1.02);
  return out;
}

// ---------------------------------------------------------------------------
// waveform: a sound wave in depth with sample bars

function waveform(count: number, rand: Rand): ShapeData {
  const out = new Float32Array(count * 4);
  const w = new Writer(out, count);
  const width = 1.25;
  const env = (x: number) => {
    const u = x / width;
    const body =
      0.3 +
      0.7 * Math.exp(-Math.pow((u - 0.18) / 0.42, 2)) +
      0.35 * Math.exp(-Math.pow((u + 0.55) / 0.16, 2));
    const taper = Math.pow(Math.max(0, 1 - u * u), 0.6);
    return 0.42 * body * taper;
  };
  const wave = (x: number, phase: number) =>
    0.62 * Math.sin(x * 8.5 + phase + 0.8 * Math.sin(x * 1.7)) +
    0.26 * Math.sin(x * 19.0 - phase * 1.4) +
    0.12 * Math.sin(x * 41.0 + phase * 2.1);

  // Strands: many thin waves with small phase offsets, spread in depth.
  const strands = 34;
  const strandN = Math.round(count * 0.66);
  for (let i = 0; i < strandN; i++) {
    const s = Math.floor(rand() * strands);
    const f = s / (strands - 1) - 0.5;
    const x = (rand() * 2 - 1) * width;
    const y = env(x) * wave(x, f * 0.9) * (0.92 + 0.08 * Math.cos(f * 6));
    w.push(x, y, f * 0.5, 1 - Math.abs(f) * 0.9);
  }
  // Sample bars: a waveform display under the strands.
  const bars = 150;
  const barN = Math.round(count * 0.24);
  for (let i = 0; i < barN; i++) {
    const b = Math.floor(rand() * bars);
    const x = ((b + 0.5) / bars) * 2 * width - width;
    const amp = env(x) * (0.55 + 0.45 * Math.abs(Math.sin(b * 1.7)));
    const y = (rand() * 2 - 1) * amp;
    w.push(x + (rand() - 0.5) * 0.0015, y, -0.34, 0.4);
  }
  // Baseline and ticks.
  while (!w.full && w.i < count * 0.985) {
    const tick = rand() < 0.25;
    if (tick) {
      const t = Math.floor(rand() * 25);
      const x = (t / 24) * 2 * width - width;
      w.push(x, -0.5 - rand() * (t % 4 === 0 ? 0.05 : 0.025), 0, 0.75);
    } else {
      w.push((rand() * 2 - 1) * width, -0.5, 0, 0.55);
    }
  }
  dust(w, rand, 1.1, 0.12);
  rotate(out, count, -0.22, -0.32);
  normalise(out, count, 1.08);
  return out;
}

// ---------------------------------------------------------------------------
// lattice: a vertex-displaced grid

function lattice(count: number, rand: Rand): ShapeData {
  const out = new Float32Array(count * 4);
  const w = new Writer(out, count);
  const lines = 38;
  const size = 1;
  const disp = (x: number, z: number) =>
    0.17 * Math.sin(x * 3.1 + 1.2) * Math.cos(z * 2.6 - 0.5) +
    0.34 * Math.exp(-((x - 0.28) ** 2 + (z + 0.12) ** 2) / 0.09) -
    0.12 * Math.exp(-((x + 0.45) ** 2 + (z - 0.4) ** 2) / 0.05);
  const lineN = Math.round(count * 0.92);
  for (let i = 0; i < lineN; i++) {
    const across = rand() < 0.5;
    const l = Math.floor(rand() * lines);
    const fixed = (l / (lines - 1)) * 2 * size - size;
    const t = (rand() * 2 - 1) * size;
    const x = across ? t : fixed;
    const z = across ? fixed : t;
    const fade = Math.max(0, 1 - Math.pow(Math.hypot(x, z) / 1.42, 4));
    const major = l % 6 === 0;
    w.push(x, disp(x, z), z, (major ? 1 : 0.62) * (0.35 + 0.65 * fade));
  }
  // Vertices.
  while (!w.full && w.i < count * 0.995) {
    const a = Math.floor(rand() * lines);
    const b = Math.floor(rand() * lines);
    const x = (a / (lines - 1)) * 2 * size - size + (rand() - 0.5) * 0.008;
    const z = (b / (lines - 1)) * 2 * size - size + (rand() - 0.5) * 0.008;
    w.push(x, disp(x, z), z, 1);
  }
  dust(w, rand, 1, 0.1);
  rotate(out, count, 0.95, 0.55);
  normalise(out, count, 1.05);
  return out;
}

// ---------------------------------------------------------------------------
// orbit: tilted rings around a dense core

function orbit(count: number, rand: Rand): ShapeData {
  const out = new Float32Array(count * 4);
  const w = new Writer(out, count);
  // Core.
  const coreN = Math.round(count * 0.09);
  for (let i = 0; i < coreN; i++) {
    const r = Math.abs(gaussian(rand)) * 0.055 + Math.pow(rand(), 3) * 0.08;
    const u = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    w.push(Math.cos(a) * s * r, u * r, Math.sin(a) * s * r, 1);
  }
  const rings = [
    { r: 0.22, tilt: 0.06, node: 0.2, weight: 0.6 },
    { r: 0.33, tilt: -0.05, node: 1.1, weight: 0.8 },
    { r: 0.45, tilt: 0.1, node: 2.4, weight: 1 },
    { r: 0.56, tilt: -0.02, node: 0.7, weight: 0.9 },
    { r: 0.66, tilt: 0.14, node: 3.6, weight: 1.1 },
    { r: 0.78, tilt: -0.08, node: 5.1, weight: 1 },
    { r: 0.9, tilt: 0.04, node: 1.9, weight: 0.85 },
    { r: 1.02, tilt: -0.12, node: 4.4, weight: 0.7 }
  ];
  const moons = [
    { ring: 2, a: 0.9, size: 0.028, accent: 0 },
    { ring: 4, a: 3.7, size: 0.034, accent: 1 },
    { ring: 5, a: 5.2, size: 0.022, accent: 0 },
    { ring: 7, a: 2.2, size: 0.026, accent: 0 }
  ];
  const ringPoint = (ring: (typeof rings)[number], a: number, wobble: number) => {
    const r = ring.r + wobble;
    let x = Math.cos(a) * r;
    let y = 0;
    let z = Math.sin(a) * r;
    // Tilt the ring around its node line.
    const cn = Math.cos(ring.node);
    const sn = Math.sin(ring.node);
    const px = x * cn + z * sn;
    const pz = -x * sn + z * cn;
    const ct = Math.cos(ring.tilt);
    const st = Math.sin(ring.tilt);
    y = pz * st;
    z = pz * ct;
    x = px;
    return [x * cn - z * sn, y, x * sn + z * cn] as const;
  };
  const totalWeight = rings.reduce((s, r) => s + r.r * r.weight, 0);
  const ringN = Math.round(count * 0.74);
  for (const ring of rings) {
    const n = Math.round((ring.r * ring.weight * ringN) / totalWeight);
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const [x, y, z] = ringPoint(ring, a, gaussian(rand) * 0.0035);
      w.push(x, y, z, 0.65 + 0.35 * ring.weight);
    }
  }
  const moonN = Math.round(count * 0.06);
  for (let i = 0; i < moonN; i++) {
    const moon = moons[i % moons.length]!;
    const [cx, cy, cz] = ringPoint(rings[moon.ring]!, moon.a, 0);
    const u = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const r = moon.size * Math.cbrt(rand());
    w.push(cx + Math.cos(a) * s * r, cy + u * r, cz + Math.sin(a) * s * r, 1, moon.accent);
  }
  // Dust in the orbital plane.
  while (!w.full) {
    const r = 0.12 + Math.pow(rand(), 0.7) * 1.0;
    const a = rand() * Math.PI * 2;
    w.push(Math.cos(a) * r, gaussian(rand) * 0.02, Math.sin(a) * r, 0.2);
  }
  rotate(out, count, -0.52, 0.28);
  normalise(out, count, 1.02);
  return out;
}

// ---------------------------------------------------------------------------
// ribbon: a twisting film strip with sprocket holes

function ribbon(count: number, rand: Rand): ShapeData {
  const out = new Float32Array(count * 4);
  const w = new Writer(out, count);
  const centre = (s: number) =>
    [1.15 * s, 0.2 * Math.sin(2.4 * s + 0.5), 0.32 * Math.cos(1.6 * s)] as const;
  const frame = (s: number) => {
    const e = 0.001;
    const a = centre(s - e);
    const b = centre(s + e);
    let tx = b[0] - a[0];
    let ty = b[1] - a[1];
    let tz = b[2] - a[2];
    const tl = Math.hypot(tx, ty, tz);
    tx /= tl;
    ty /= tl;
    tz /= tl;
    // Normal from world up, made perpendicular to the tangent.
    let nx = -tx * ty;
    let ny = 1 - ty * ty;
    let nz = -tz * ty;
    const nl = Math.hypot(nx, ny, nz);
    nx /= nl;
    ny /= nl;
    nz /= nl;
    const bx = ty * nz - tz * ny;
    const by = tz * nx - tx * nz;
    const bz = tx * ny - ty * nx;
    const twist = Math.PI * 0.95 * s + 0.35;
    const c = Math.cos(twist);
    const sn = Math.sin(twist);
    return {
      p: centre(s),
      n: [nx * c + bx * sn, ny * c + by * sn, nz * c + bz * sn] as const
    };
  };
  const half = 0.2; // half width of the strip
  const frames = 11;
  const point = (s: number, v: number, tone: number) => {
    const f = frame(s);
    w.push(f.p[0] + f.n[0] * v, f.p[1] + f.n[1] * v, f.p[2] + f.n[2] * v, tone);
  };
  const S = (u: number) => u * 2 - 1;
  const holeEvery = 1 / (frames * 4);
  const holeLen = holeEvery * 0.52;
  const holeInner = 0.135;
  const holeOuter = 0.175;
  const imageHalf = 0.11;

  const edgeN = Math.round(count * 0.2);
  for (let i = 0; i < edgeN; i++) {
    const s = S(rand());
    point(s, (rand() < 0.5 ? -1 : 1) * half + (rand() - 0.5) * 0.002, 1);
  }
  const holeN = Math.round(count * 0.3);
  for (let i = 0; i < holeN; i++) {
    const k = Math.floor(rand() * (frames * 4));
    const side = rand() < 0.5 ? -1 : 1;
    const s0 = S(k * holeEvery + holeEvery * 0.24);
    const len = holeLen * 2;
    const per = 2 * len + 2 * (holeOuter - holeInner);
    let d = rand() * per;
    let s = s0;
    let v = holeInner;
    if (d < len) {
      s = s0 + d;
      v = holeInner;
    } else if ((d -= len) < holeOuter - holeInner) {
      s = s0 + len;
      v = holeInner + d;
    } else if ((d -= holeOuter - holeInner) < len) {
      s = s0 + len - d;
      v = holeOuter;
    } else {
      d -= len;
      s = s0;
      v = holeOuter - d;
    }
    point(s, side * v, 0.85);
  }
  const borderN = Math.round(count * 0.22);
  for (let i = 0; i < borderN; i++) {
    if (rand() < 0.55) {
      point(S(rand()), (rand() < 0.5 ? -1 : 1) * imageHalf, 0.85);
    } else {
      const f = Math.floor(rand() * frames);
      point(S(f / frames + 0.004), (rand() * 2 - 1) * imageHalf, 0.85);
    }
  }
  // Faint image inside each frame: a horizon and a light patch.
  while (!w.full && w.i < count * 0.995) {
    const f = Math.floor(rand() * frames);
    const u = (f + 0.06 + rand() * 0.88) / frames;
    const v = (rand() * 2 - 1) * imageHalf * 0.92;
    const local = (u * frames) % 1;
    const horizon = Math.abs(v - (0.02 + 0.03 * Math.sin(f * 2.1))) < 0.004;
    const light = Math.hypot(local - 0.62, (v - 0.05) * 3) < 0.12;
    if (!horizon && !light && rand() > 0.35) continue;
    point(S(u), v, horizon ? 0.7 : light ? 0.45 : 0.22);
  }
  dust(w, rand, 1.1, 0.1);
  normalise(out, count, 1.08);
  return out;
}

// ---------------------------------------------------------------------------
// volume: a room with a floor grid, floating panels and a person for scale

function volume(count: number, rand: Rand): ShapeData {
  const out = new Float32Array(count * 4);
  const w = new Writer(out, count);
  const h = 0.6;
  const line = (
    a: readonly [number, number, number],
    b: readonly [number, number, number],
    n: number,
    tone: number,
    accent = 0
  ) => {
    for (let i = 0; i < n; i++) {
      const t = rand();
      w.push(
        a[0] + (b[0] - a[0]) * t + (rand() - 0.5) * 0.002,
        a[1] + (b[1] - a[1]) * t + (rand() - 0.5) * 0.002,
        a[2] + (b[2] - a[2]) * t + (rand() - 0.5) * 0.002,
        tone,
        accent
      );
    }
  };
  const c = [-h, h];
  const edges: [number, number, number][][] = [];
  for (const y of c)
    for (const z of c) edges.push([[-h, y, z], [h, y, z]]);
  for (const x of c)
    for (const z of c) edges.push([[x, -h, z], [x, h, z]]);
  for (const x of c)
    for (const y of c) edges.push([[x, y, -h], [x, y, h]]);
  const edgeN = Math.round((count * 0.3) / edges.length);
  for (const [a, b] of edges) line(a!, b!, edgeN, 1);

  // Floor grid.
  const floorN = Math.round(count * 0.22);
  const cells = 12;
  for (let i = 0; i < floorN; i++) {
    const k = Math.floor(rand() * (cells + 1));
    const t = (rand() * 2 - 1) * h;
    const f = (k / cells) * 2 * h - h;
    if (rand() < 0.5) w.push(f, -h, t, 0.55);
    else w.push(t, -h, f, 0.55);
  }
  // Back wall: a faint grid.
  const wallN = Math.round(count * 0.07);
  for (let i = 0; i < wallN; i++) {
    const k = Math.floor(rand() * 7);
    const f = (k / 6) * 2 * h - h;
    const t = (rand() * 2 - 1) * h;
    if (rand() < 0.5) w.push(f, t, -h, 0.3);
    else w.push(t, f, -h, 0.3);
  }
  // Floating panels.
  const panels = [
    { x: -0.12, y: 0.06, z: 0.18, w: 0.5, h: 0.31, ry: 0.32 },
    { x: 0.33, y: -0.12, z: -0.12, w: 0.26, h: 0.2, ry: -0.4 },
    { x: -0.36, y: 0.3, z: -0.28, w: 0.22, h: 0.3, ry: 0.6 }
  ];
  const panelN = Math.round(count * 0.3);
  for (let i = 0; i < panelN; i++) {
    const p = panels[i % panels.length]!;
    const outline = rand() < 0.55;
    let u = rand() - 0.5;
    let v = rand() - 0.5;
    if (outline) {
      if (rand() < 0.5) u = rand() < 0.5 ? -0.5 : 0.5;
      else v = rand() < 0.5 ? -0.5 : 0.5;
    } else if (rand() > 0.5) {
      // Content lines inside the panel.
      v = Math.round(v * 6) / 6 + (rand() - 0.5) * 0.01;
      if (Math.abs(v) > 0.4 || u > 0.3 - Math.abs(v)) continue;
    }
    const lx = u * p.w;
    const ly = v * p.h;
    const cy = Math.cos(p.ry);
    const sy = Math.sin(p.ry);
    w.push(p.x + lx * cy, p.y + ly, p.z - lx * sy, outline ? 0.95 : 0.4);
  }
  // A person standing on the floor, for scale.
  const fx = 0.2;
  const fz = 0.25;
  const figureN = Math.round(count * 0.018);
  for (let i = 0; i < figureN; i++) {
    const part = rand();
    if (part < 0.32) {
      // Head.
      const a = rand() * Math.PI * 2;
      const r = 0.026 * Math.sqrt(rand());
      w.push(fx + Math.cos(a) * r, -h + 0.262 + Math.sin(a) * r, fz, 1, 1);
    } else if (part < 0.72) {
      // Torso, wider at the shoulders.
      const t = rand();
      const half = 0.022 + 0.018 * t;
      w.push(fx + (rand() * 2 - 1) * half, -h + 0.12 + t * 0.105, fz, 1, 1);
    } else {
      // Legs.
      const t = rand();
      const side = rand() < 0.5 ? -1 : 1;
      w.push(fx + side * (0.009 + t * 0.004) + (rand() - 0.5) * 0.012, -h + t * 0.12, fz, 1, 1);
    }
  }
  dust(w, rand, 1, 0.08);
  rotate(out, count, 0.36, -0.62);
  normalise(out, count, 1.02);
  return out;
}

// ---------------------------------------------------------------------------

export function generateShape(
  name: ShapeName,
  count: number,
  glyphs?: GlyphPoints
): ShapeData {
  const rand = seeded(hashString(name));
  switch (name) {
    case 'iris':
      return iris(count, rand, glyphs);
    case 'contour':
      return contour(count, rand);
    case 'waveform':
      return waveform(count, rand);
    case 'lattice':
      return lattice(count, rand);
    case 'orbit':
      return orbit(count, rand);
    case 'ribbon':
      return ribbon(count, rand);
    case 'volume':
      return volume(count, rand);
  }
}

/**
 * Samples the inside of `text` drawn in the site's sans font. Browser only.
 * Returns x/y pairs centred on 0, about 1 unit tall.
 */
export async function sampleGlyphs(
  text: string,
  family: string
): Promise<GlyphPoints> {
  try {
    await document.fonts.load(`700 200px "${family}"`);
  } catch {
    // Fall back to whatever sans the browser has.
  }
  const height = 260;
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = height + 80;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return new Float32Array();
  ctx.fillStyle = '#000';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 ${height}px "${family}", sans-serif`;
  const letterSpacing = -0.02 * height;
  if ('letterSpacing' in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
      `${letterSpacing}px`;
  }
  const metrics = ctx.measureText(text);
  const width = metrics.width;
  const ascent = metrics.actualBoundingBoxAscent || height * 0.72;
  const x0 = (canvas.width - width) / 2;
  const baseline = 40 + ascent;
  ctx.fillText(text, x0, baseline);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const points: number[] = [];
  const cx = canvas.width / 2;
  const cy = baseline - ascent / 2;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (data[(y * canvas.width + x) * 4 + 3]! > 140) {
        points.push((x - cx) / ascent, -(y - cy) / ascent);
      }
    }
  }
  return new Float32Array(points);
}
