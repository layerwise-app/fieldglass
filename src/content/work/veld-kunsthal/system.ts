// Veld Kunsthal identity system: floor plans → contour field → two-ink poster.
// Shared by the case-study screens and the live generator demo.

export type Point = readonly [number, number];
export type Wall = readonly [Point, Point];

export type Plan = {
  id: string;
  name: string;
  /** Wall segments in plan space: x and y from 0 to 1 across the field. */
  walls: Wall[];
};

export type InkPair = {
  id: string;
  name: string;
  a: { name: string; hex: string };
  b: { name: string; hex: string };
};

export const PAPER = '#F3F0E8';

export const inkPairs: InkPair[] = [
  {
    id: 'green-yellow',
    name: 'Winter–spring',
    a: { name: 'Hunter Green', hex: '#407060' },
    b: { name: 'Fluorescent Yellow', hex: '#FFE800' }
  },
  {
    id: 'blue-pink',
    name: 'Summer',
    a: { name: 'Medium Blue', hex: '#3255A4' },
    b: { name: 'Fluorescent Pink', hex: '#FF48B0' }
  },
  {
    id: 'burgundy-aqua',
    name: 'Autumn',
    a: { name: 'Burgundy', hex: '#914E72' },
    b: { name: 'Aqua', hex: '#5EC8E5' }
  }
];

export function inkPair(id: string): InkPair {
  return inkPairs.find((pair) => pair.id === id) ?? inkPairs[0]!;
}

// ---------------------------------------------------------------------------
// Floor plans. The outer walls are the building; partitions change per show.

const O = 0.12;
const I = 0.88;

/** The building's shell, with the entrance gap on the south wall. */
const shell: Wall[] = [
  [
    [O, O],
    [I, O]
  ],
  [
    [I, O],
    [I, I]
  ],
  [
    [O, I],
    [0.44, I]
  ],
  [
    [0.56, I],
    [I, I]
  ],
  [
    [O, O],
    [O, I]
  ]
];

function arc(
  cx: number,
  cy: number,
  r: number,
  from: number,
  to: number,
  steps = 12
): Wall[] {
  const walls: Wall[] = [];
  for (let i = 0; i < steps; i++) {
    const a0 = from + ((to - from) * i) / steps;
    const a1 = from + ((to - from) * (i + 1)) / steps;
    walls.push([
      [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r],
      [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r]
    ]);
  }
  return walls;
}

export const plans: Plan[] = [
  {
    id: 'open-floor',
    name: 'Open floor',
    walls: [
      ...shell,
      [
        [0.3, 0.34],
        [0.46, 0.27]
      ],
      [
        [0.6, 0.48],
        [0.74, 0.62]
      ],
      [
        [0.27, 0.64],
        [0.4, 0.72]
      ]
    ]
  },
  {
    id: 'enfilade',
    name: 'Enfilade',
    walls: [
      ...shell,
      [
        [0.37, O],
        [0.37, 0.44]
      ],
      [
        [0.37, 0.56],
        [0.37, I]
      ],
      [
        [0.63, O],
        [0.63, 0.44]
      ],
      [
        [0.63, 0.56],
        [0.63, I]
      ],
      [
        [O, 0.5],
        [0.2, 0.5]
      ],
      [
        [0.3, 0.5],
        [0.47, 0.5]
      ],
      [
        [0.53, 0.5],
        [0.7, 0.5]
      ],
      [
        [0.8, 0.5],
        [I, 0.5]
      ]
    ]
  },
  {
    id: 'long-gallery',
    name: 'Long gallery',
    walls: [
      ...shell,
      [
        [0.5, 0.26],
        [0.5, 0.74]
      ],
      [
        [O, 0.36],
        [0.3, 0.36]
      ],
      [
        [0.7, 0.62],
        [I, 0.62]
      ],
      [
        [0.3, 0.74],
        [0.3, I]
      ]
    ]
  },
  {
    id: 'corridor',
    name: 'Corridor',
    walls: [
      ...shell,
      [
        [0.3, O],
        [0.3, 0.7]
      ],
      [
        [0.3, 0.7],
        [0.72, 0.7]
      ],
      [
        [0.44, O],
        [0.44, 0.56]
      ],
      [
        [0.44, 0.56],
        [I, 0.56]
      ]
    ]
  },
  {
    id: 'market',
    name: 'Market',
    walls: [
      ...shell,
      ...[0, 1, 2, 3, 4].flatMap(
        (i): Wall[] => [
          [
            [0.22 + 0.14 * i, 0.26],
            [0.22 + 0.14 * i, 0.42]
          ],
          [
            [0.22 + 0.14 * i, 0.58],
            [0.22 + 0.14 * i, 0.74]
          ]
        ]
      )
    ]
  },
  {
    id: 'pavilion',
    name: 'Pavilion',
    walls: [
      ...shell,
      ...arc(0.5, 0.52, 0.22, Math.PI * 0.9, Math.PI * 2.05, 14),
      [
        [0.2, 0.22],
        [0.36, 0.38]
      ]
    ]
  }
];

export function plan(id: string): Plan {
  return plans.find((p) => p.id === id) ?? plans[0]!;
}

// ---------------------------------------------------------------------------
// Seeded noise.

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(seed: number) {
  const random = mulberry32(seed * 9973 + 17);
  const perm = new Uint8Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [p[i], p[j]] = [p[j]!, p[i]!];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]!;
  const grad = (h: number, x: number, y: number) => {
    switch (h & 7) {
      case 0:
        return x + y;
      case 1:
        return -x + y;
      case 2:
        return x - y;
      case 3:
        return -x - y;
      case 4:
        return x;
      case 5:
        return -x;
      case 6:
        return y;
      default:
        return -y;
    }
  };
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const noise = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const X = xi & 255;
    const Y = yi & 255;
    const u = fade(xf);
    const v = fade(yf);
    const aa = perm[perm[X]! + Y]!;
    const ab = perm[perm[X]! + Y + 1]!;
    const ba = perm[perm[X + 1]! + Y]!;
    const bb = perm[perm[X + 1]! + Y + 1]!;
    const x1 =
      grad(aa, xf, yf) + u * (grad(ba, xf - 1, yf) - grad(aa, xf, yf));
    const x2 =
      grad(ab, xf, yf - 1) +
      u * (grad(bb, xf - 1, yf - 1) - grad(ab, xf, yf - 1));
    return x1 + v * (x2 - x1);
  };
  return (x: number, y: number) =>
    noise(x, y) * 0.65 + noise(x * 2.1 + 5.2, y * 2.1 + 1.3) * 0.35;
}

// ---------------------------------------------------------------------------
// The field.

export type Field = {
  cols: number;
  rows: number;
  values: Float32Array;
  min: number;
  max: number;
};

function distanceToWall(px: number, py: number, wall: Wall, aspect: number) {
  const [[x0, y0], [x1, y1]] = wall;
  const ax = x0 * aspect;
  const bx = x1 * aspect;
  const qx = px * aspect;
  const dx = bx - ax;
  const dy = y1 - y0;
  const len = dx * dx + dy * dy;
  let t = len === 0 ? 0 : ((qx - ax) * dx + (py - y0) * dy) / len;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx - qx;
  const cy = y0 + t * dy - py;
  return Math.sqrt(cx * cx + cy * cy);
}

/**
 * Walls become ridges: height falls off with distance to the nearest wall,
 * then drift bends it with seeded noise.
 */
export function computeField(
  planWalls: Wall[],
  seed: number,
  drift: number,
  cols: number,
  rows: number,
  aspect: number
): Field {
  const noise = makeNoise(seed);
  const values = new Float32Array(cols * rows);
  let min = Infinity;
  let max = -Infinity;
  const offsetX = (seed % 97) * 0.37;
  const offsetY = (seed % 89) * 0.53;
  for (let j = 0; j < rows; j++) {
    const y = j / (rows - 1);
    for (let i = 0; i < cols; i++) {
      const x = i / (cols - 1);
      let d = Infinity;
      for (const wall of planWalls) {
        const dist = distanceToWall(x, y, wall, aspect);
        if (dist < d) d = dist;
      }
      const ridge = Math.exp(-Math.pow(d / 0.085, 0.82));
      const n = noise(x * aspect * 2.3 + offsetX, y * 2.3 + offsetY);
      const v = ridge + n * drift * 0.62 + (1 - y) * 0.04;
      values[j * cols + i] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  return { cols, rows, values, min, max };
}

/**
 * Marching squares, chained into polylines. Points are in grid units.
 */
export function isolines(field: Field, level: number): number[][] {
  const { cols, rows, values } = field;
  const hKey = (i: number, j: number) => j * cols + i;
  const vKey = (i: number, j: number) => cols * rows + j * cols + i;
  const points = new Map<number, [number, number]>();
  const segments: [number, number][] = [];

  const point = (key: number, x: number, y: number) => {
    if (!points.has(key)) points.set(key, [x, y]);
    return key;
  };
  const lerp = (a: number, b: number) => (level - a) / (b - a);

  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const v0 = values[j * cols + i]!;
      const v1 = values[j * cols + i + 1]!;
      const v2 = values[(j + 1) * cols + i + 1]!;
      const v3 = values[(j + 1) * cols + i]!;
      let index = 0;
      if (v0 > level) index |= 1;
      if (v1 > level) index |= 2;
      if (v2 > level) index |= 4;
      if (v3 > level) index |= 8;
      if (index === 0 || index === 15) continue;

      const top = () => point(hKey(i, j), i + lerp(v0, v1), j);
      const right = () => point(vKey(i + 1, j), i + 1, j + lerp(v1, v2));
      const bottom = () => point(hKey(i, j + 1), i + lerp(v3, v2), j + 1);
      const left = () => point(vKey(i, j), i, j + lerp(v0, v3));

      switch (index) {
        case 1:
        case 14:
          segments.push([left(), top()]);
          break;
        case 2:
        case 13:
          segments.push([top(), right()]);
          break;
        case 3:
        case 12:
          segments.push([left(), right()]);
          break;
        case 4:
        case 11:
          segments.push([right(), bottom()]);
          break;
        case 6:
        case 9:
          segments.push([top(), bottom()]);
          break;
        case 7:
        case 8:
          segments.push([left(), bottom()]);
          break;
        case 5:
        case 10: {
          const centre = (v0 + v1 + v2 + v3) / 4 > level;
          if ((index === 5) === centre) {
            segments.push([left(), top()]);
            segments.push([right(), bottom()]);
          } else {
            segments.push([top(), right()]);
            segments.push([left(), bottom()]);
          }
          break;
        }
      }
    }
  }

  // Chain segments that share an endpoint.
  const byPoint = new Map<number, number[]>();
  segments.forEach(([a, b], index) => {
    for (const key of [a, b]) {
      const list = byPoint.get(key);
      if (list) list.push(index);
      else byPoint.set(key, [index]);
    }
  });
  const used = new Uint8Array(segments.length);
  const lines: number[][] = [];

  const walk = (start: number, from: number) => {
    const chain: number[] = [];
    let current = from;
    let segment = start;
    for (;;) {
      const [a, b] = segments[segment]!;
      const next = a === current ? b : a;
      chain.push(next);
      current = next;
      const candidates = byPoint.get(current) ?? [];
      const following = candidates.find((s) => !used[s]);
      if (following === undefined) break;
      used[following] = 1;
      segment = following;
    }
    return chain;
  };

  for (let s = 0; s < segments.length; s++) {
    if (used[s]) continue;
    used[s] = 1;
    const a = segments[s]![0];
    const forward = walk(s, a);
    // Walk the other way from `a`, then join.
    const back: number[] = [];
    let current = a;
    for (;;) {
      const candidates = byPoint.get(current) ?? [];
      const next = candidates.find((c) => !used[c]);
      if (next === undefined) break;
      used[next] = 1;
      const [p, q] = segments[next]!;
      current = p === current ? q : p;
      back.push(current);
    }
    const keys = [...back.reverse(), a, ...forward];
    const flat: number[] = [];
    for (const key of keys) {
      const p = points.get(key)!;
      flat.push(p[0], p[1]);
    }
    if (flat.length >= 4) lines.push(flat);
  }
  return lines;
}

export function sampleField(field: Field, gx: number, gy: number) {
  const { cols, rows, values } = field;
  const x = Math.max(0, Math.min(cols - 1.001, gx));
  const y = Math.max(0, Math.min(rows - 1.001, gy));
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const a = values[j * cols + i]!;
  const b = values[j * cols + i + 1]!;
  const c = values[(j + 1) * cols + i]!;
  const d = values[(j + 1) * cols + i + 1]!;
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

// ---------------------------------------------------------------------------
// The poster. Drawn in a 1000 × 1414 unit space (A-series portrait).

export const POSTER_W = 1000;
export const POSTER_H = 1414;

export type PosterSpec = {
  planId: string;
  seed: number;
  /** Number of contour lines, 6–32. */
  density: number;
  /** 0–1: how far noise bends the field away from the plan. */
  drift: number;
  inkId: string;
  title: string;
  artists: string;
  dates: string;
  number: string;
  /** Show both inks, or one master on its own. */
  layer?: 'both' | 'a' | 'b';
};

const SANS = "'Instrument Sans', ui-sans-serif, system-ui, sans-serif";

type Ctx = CanvasRenderingContext2D;

function setFont(
  ctx: Ctx,
  weight: number,
  size: number,
  stretch: CanvasFontStretch = 'normal',
  spacing = 0
) {
  ctx.font = `${weight} ${size}px ${SANS}`;
  ctx.fontStretch = stretch;
  ctx.letterSpacing = `${spacing}px`;
}

function wrap(ctx: Ctx, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1]}…`;
    return kept;
  }
  return lines;
}

function strokeLines(
  ctx: Ctx,
  lines: number[][],
  scaleX: number,
  scaleY: number,
  offsetX: number,
  offsetY: number
) {
  ctx.beginPath();
  for (const line of lines) {
    const n = line.length / 2;
    const x = (k: number) => offsetX + line[k * 2]! * scaleX;
    const y = (k: number) => offsetY + line[k * 2 + 1]! * scaleY;
    ctx.moveTo(x(0), y(0));
    if (n === 2) {
      ctx.lineTo(x(1), y(1));
      continue;
    }
    for (let k = 1; k < n - 1; k++) {
      const mx = (x(k) + x(k + 1)) / 2;
      const my = (y(k) + y(k + 1)) / 2;
      ctx.quadraticCurveTo(x(k), y(k), mx, my);
    }
    ctx.lineTo(x(n - 1), y(n - 1));
  }
  ctx.stroke();
}

export type FieldDrawing = {
  field: Field;
  lines: { level: number; index: boolean; paths: number[][] }[];
};

const FIELD_TOP = 84;
const FIELD_BOTTOM = 1046;

/** Field geometry for a spec. Cached by the caller if it redraws often. */
export function buildField(spec: PosterSpec, cols = 150): FieldDrawing {
  const fieldH = FIELD_BOTTOM - FIELD_TOP;
  const aspect = POSTER_W / fieldH;
  const rows = Math.round(cols / aspect);
  const field = computeField(
    plan(spec.planId).walls,
    spec.seed,
    spec.drift,
    cols,
    rows,
    aspect
  );
  const count = Math.max(4, Math.round(spec.density));
  const lines = [];
  for (let k = 0; k < count; k++) {
    const level = field.min + ((k + 0.6) / (count + 0.2)) * (field.max - field.min);
    lines.push({ level, index: k % 5 === 4, paths: isolines(field, level) });
  }
  return { field, lines };
}


export const FIELD_W = POSTER_W;
export const FIELD_H = FIELD_BOTTOM - FIELD_TOP;

/** Halftone dots of the field height, in field units from the field's corner. */
export function drawDots(ctx: Ctx, drawing: FieldDrawing, color: string) {
  const { field } = drawing;
  const gx = FIELD_W / (field.cols - 1);
  const gy = FIELD_H / (field.rows - 1);
  ctx.fillStyle = color;
  const step = 13;
  const angle = (15 * Math.PI) / 180;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const span = 1500;
  const range = field.max - field.min;
  for (let v = -span / 2; v < span; v += step) {
    for (let u = -span / 2; u < span; u += step) {
      const x = 500 + u * cos - v * sin;
      const y = v * cos + u * sin;
      if (x < -step || x > FIELD_W + step) continue;
      if (y < -step || y > FIELD_H + step) continue;
      const h = sampleField(field, x / gx, y / gy);
      const t = Math.max(0, Math.min(1, (h - field.min) / range));
      const r = step * 0.62 * Math.pow(t, 1.35);
      if (r < 0.7) continue;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Contour lines, every fifth one heavier, in field units. */
export function drawContours(
  ctx: Ctx,
  drawing: FieldDrawing,
  color: string,
  minLine = 0
) {
  const { field } = drawing;
  const gx = FIELD_W / (field.cols - 1);
  const gy = FIELD_H / (field.rows - 1);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const set of drawing.lines) {
    ctx.lineWidth = Math.max(set.index ? 4.4 : 2.3, minLine);
    strokeLines(ctx, set.paths, gx, gy, 0, 0);
  }
}

/** The plan's walls, in field units. */
export function drawWalls(ctx: Ctx, planId: string, color: string, width = 9) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'square';
  ctx.beginPath();
  for (const [[x0, y0], [x1, y1]] of plan(planId).walls) {
    ctx.moveTo(x0 * FIELD_W, y0 * FIELD_H);
    ctx.lineTo(x1 * FIELD_W, y1 * FIELD_H);
  }
  ctx.stroke();
}

export type Rect = { x: number; y: number; w: number; h: number };

/**
 * Runs `draw` in field units with the field covering `rect` (device pixels),
 * like `object-fit: cover`, clipped to it.
 */
export function inField(
  ctx: Ctx,
  rect: Rect,
  draw: (unit: number) => void,
  align: { x?: number; y?: number } = {}
) {
  const scale = Math.max(rect.w / FIELD_W, rect.h / FIELD_H);
  const ox = rect.x + (rect.w - FIELD_W * scale) * (align.x ?? 0.5);
  const oy = rect.y + (rect.h - FIELD_H * scale) * (align.y ?? 0.5);
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);
  draw(scale);
  ctx.restore();
}

/**
 * Draws a Veld poster into `ctx`, which must be `width` × `height` device
 * pixels with the poster's aspect ratio.
 */
export function drawPoster(
  ctx: Ctx,
  width: number,
  height: number,
  spec: PosterSpec,
  drawing: FieldDrawing = buildField(spec)
) {
  const inks = inkPair(spec.inkId);
  const layer = spec.layer ?? 'both';
  const s = width / POSTER_W;
  const fieldH = FIELD_BOTTOM - FIELD_TOP;

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, height);
  ctx.scale(s, s);

  // Master 2: halftone of the field height, slightly out of register.
  if (layer !== 'a') {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, FIELD_TOP, POSTER_W, fieldH);
    ctx.clip();
    ctx.translate(1.6, FIELD_TOP - 1.1);
    drawDots(ctx, drawing, inks.b.hex);
    ctx.restore();
  }

  // Master 1 is drawn on its own canvas so the wordmark can knock a halo out
  // of the contour lines, then multiplied over master 2.
  if (layer !== 'b') {
    const off = document.createElement('canvas');
    off.width = width;
    off.height = height;
    const a = off.getContext('2d')!;
    a.scale(s, s);
    a.fillStyle = inks.a.hex;

    a.save();
    a.beginPath();
    a.rect(0, FIELD_TOP, POSTER_W, fieldH);
    a.clip();
    a.translate(0, FIELD_TOP);
    drawContours(a, drawing, inks.a.hex, 1.05 / s);
    a.restore();

    // Wordmark: VELD, condensed, solid, with a paper halo so it reads over
    // the field; the field shows through its counters.
    setFont(a, 700, 100, 'condensed', -1);
    const markWidth = a.measureText('VELD').width;
    const markSize = (100 * 888) / markWidth;
    setFont(a, 700, markSize, 'condensed', -markSize * 0.01);
    a.textBaseline = 'alphabetic';
    const markY = FIELD_TOP + 34 + markSize * 0.72;
    a.globalCompositeOperation = 'destination-out';
    a.lineWidth = 16;
    a.strokeText('VELD', 56, markY);
    a.globalCompositeOperation = 'source-over';
    a.fillText('VELD', 56, markY);

    // Top band.
    setFont(a, 600, 22, 'normal', 0.2);
    a.fillText('Kunsthal Utrecht', 56, 54);
    a.textAlign = 'right';
    a.fillText(`Seizoen 2025  ·  ${spec.number}`, 944, 54);
    a.textAlign = 'left';

    // Bottom band.
    setFont(a, 600, 104, 'condensed', -1.6);
    const titleLines = wrap(a, spec.title || 'Untitled', 888, 2);
    const titleTop = titleLines.length > 1 ? 1128 : 1150;
    titleLines.forEach((line, i) => a.fillText(line, 56, titleTop + i * 94));
    const afterTitle = titleTop + (titleLines.length - 1) * 94;
    setFont(a, 500, 30, 'normal', 0);
    wrap(a, spec.artists, 888, 1).forEach((line) =>
      a.fillText(line, 56, afterTitle + 50)
    );

    a.fillRect(56, 1302, 888, 2.5);
    setFont(a, 600, 40, 'condensed', 0);
    a.fillText(spec.dates, 56, 1358);
    setFont(a, 500, 20, 'normal', 0.2);
    a.textAlign = 'right';
    a.fillText('Veldkade 3, Utrecht', 944, 1338);
    a.fillText('wo–zo 11–18  ·  veldkunsthal.nl', 944, 1364);
    a.textAlign = 'left';

    // Riso grain: tiny voids where the ink didn't take.
    a.globalCompositeOperation = 'destination-out';
    const random = mulberry32(spec.seed * 31 + 7);
    a.fillStyle = 'rgba(0,0,0,0.45)';
    for (let k = 0; k < 2200; k++) {
      const x = random() * POSTER_W;
      const y = random() * POSTER_H;
      const r = 0.6 + random() * 1.1;
      a.beginPath();
      a.arc(x, y, r, 0, Math.PI * 2);
      a.fill();
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = layer === 'both' ? 'multiply' : 'source-over';
    ctx.drawImage(off, 0, 0);
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Season 2025: six of the eleven campaigns.

export type Show = Omit<PosterSpec, 'layer'> & { slug: string };

export const season: Show[] = [
  {
    slug: 'soft-ground',
    number: 'No. 01',
    title: 'Soft Ground',
    artists: 'Maren Holt, Yaw Boateng, Lin Qiao',
    dates: '18.01 — 09.03.2025',
    planId: 'open-floor',
    seed: 112,
    density: 18,
    drift: 0.35,
    inkId: 'green-yellow'
  },
  {
    slug: 'weight-of-rooms',
    number: 'No. 02',
    title: 'The Weight of Rooms',
    artists: 'Esther Vos',
    dates: '15.03 — 27.04.2025',
    planId: 'enfilade',
    seed: 431,
    density: 22,
    drift: 0.2,
    inkId: 'green-yellow'
  },
  {
    slug: 'field-notes',
    number: 'No. 03',
    title: 'Field Notes for a Flood',
    artists: 'Ravi Menon & Saar Jonker',
    dates: '03.05 — 22.06.2025',
    planId: 'long-gallery',
    seed: 77,
    density: 20,
    drift: 0.5,
    inkId: 'blue-pink'
  },
  {
    slug: 'low-light',
    number: 'No. 04',
    title: 'Low Light',
    artists: 'Céline Arbaud',
    dates: '28.06 — 17.08.2025',
    planId: 'corridor',
    seed: 903,
    density: 16,
    drift: 0.28,
    inkId: 'blue-pink'
  },
  {
    slug: 'common-measures',
    number: 'No. 05',
    title: 'Common Measures',
    artists: 'Ada Okafor, Pim de Ruiter, Hana Sato, Jonas Ek',
    dates: '23.08 — 05.10.2025',
    planId: 'market',
    seed: 268,
    density: 24,
    drift: 0.18,
    inkId: 'burgundy-aqua'
  },
  {
    slug: 'night-shift',
    number: 'No. 06',
    title: 'Night Shift',
    artists: 'Oona Saarinen',
    dates: '11.10 — 30.11.2025',
    planId: 'pavilion',
    seed: 540,
    density: 19,
    drift: 0.42,
    inkId: 'burgundy-aqua'
  }
];
