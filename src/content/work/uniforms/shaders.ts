// Shaders for the Uniforms case study: the playground's starter sketches and
// the student sketches shown in the gallery. Every sketch is the body of a
// fragment shader; `HEADER` is prepended before compiling, exactly as the
// real tool does, so students never have to type the boilerplate.

export const HEADER = `precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
`;
export const HEADER_LINES = 4;

export type Param = {
  id: string;
  label: string;
  /** Finds the number in the code: group 1 is the text before it, group 2 the number. */
  anchor: RegExp;
  min: number;
  max: number;
  step: number;
  decimals: number;
};

export type Preset = {
  id: string;
  label: string;
  lesson: string;
  code: string;
  params: Param[];
  /** The classic beginner mistake behind "Make a mistake", and its fix. */
  mistake: { make: Edit; fix: Edit };
};

/** Rewrites the code, or returns null when the pattern isn't there. */
export type Edit = (code: string) => string | null;

const swap =
  (pattern: RegExp, replacement: string): Edit =>
  (code) =>
    pattern.test(code) ? code.replace(pattern, replacement) : null;

export const presets: Preset[] = [
  {
    id: 'stripes',
    label: 'Stripes',
    lesson: 'Lesson 4 — Stripes are just sin()',
    code: `// Lesson 4 — Stripes are just sin()
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float wave = sin(uv.x * 24.0 + u_time * 2.0);
  float stripe = smoothstep(0.0, 0.08, wave);
  vec3 ink = vec3(0.18, 0.27, 1.0);
  vec3 paper = vec3(0.96, 0.95, 0.92);
  gl_FragColor = vec4(mix(ink, paper, stripe), 1.0);
}
`,
    params: [
      {
        id: 'frequency',
        label: 'Frequency',
        anchor: /(uv\.x \* )(-?\d+\.\d*)/,
        min: 2,
        max: 80,
        step: 0.5,
        decimals: 1
      },
      {
        id: 'speed',
        label: 'Speed',
        anchor: /(u_time \* )(-?\d+\.\d*)/,
        min: 0,
        max: 8,
        step: 0.1,
        decimals: 1
      },
      {
        id: 'softness',
        label: 'Softness',
        anchor: /(smoothstep\(0\.0, )(-?\d+\.\d*)/,
        min: 0.01,
        max: 1,
        step: 0.01,
        decimals: 2
      }
    ],
    mistake: {
      make: swap(/(uv\.x \* )(\d+)\.\d*/, '$1$2'),
      fix: swap(/(uv\.x \* )(\d+)(?![\d.])/, '$1$2.0')
    }
  },
  {
    id: 'rings',
    label: 'Rings',
    lesson: 'Lesson 5 — Circles are distance',
    code: `// Lesson 5 — Circles are distance
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.y;
  vec2 centre = u_mouse * u_resolution / u_resolution.y;
  float d = distance(uv, centre);
  float rings = fract(d * 12.0 - u_time * 0.5);
  float line = smoothstep(0.0, 0.1, rings) * smoothstep(1.0, 0.6, rings);
  vec3 colour = mix(vec3(0.07), vec3(1.0, 0.42, 0.36), line);
  gl_FragColor = vec4(colour, 1.0);
}
`,
    params: [
      {
        id: 'count',
        label: 'Rings',
        anchor: /(d \* )(-?\d+\.\d*)/,
        min: 1,
        max: 40,
        step: 0.5,
        decimals: 1
      },
      {
        id: 'speed',
        label: 'Speed',
        anchor: /(u_time \* )(-?\d+\.\d*)/,
        min: 0,
        max: 4,
        step: 0.05,
        decimals: 2
      },
      {
        id: 'edge',
        label: 'Edge',
        anchor: /(smoothstep\(1\.0, )(-?\d+\.\d*)/,
        min: 0.05,
        max: 0.95,
        step: 0.01,
        decimals: 2
      }
    ],
    mistake: {
      make: swap(/distance\(uv, centre\)/, 'distance(uv, center)'),
      fix: swap(/distance\(uv, center\)/, 'distance(uv, centre)')
    }
  },
  {
    id: 'lattice',
    label: 'Lattice',
    lesson: 'Lesson 6 — Grids with fract()',
    code: `// Lesson 6 — Grids with fract()
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.y;
  float n = 10.0;
  vec2 cell = fract(uv * n) - 0.5;
  vec2 id = floor(uv * n);
  float pulse = sin(u_time * 2.0 + id.x * 0.6 + id.y * 0.4);
  float r = 0.18 + 0.12 * pulse;
  float spot = smoothstep(r, r - 0.04, length(cell));
  vec3 paper = vec3(0.94, 0.93, 0.9);
  vec3 ink = vec3(0.18, 0.27, 1.0);
  gl_FragColor = vec4(mix(paper, ink, spot), 1.0);
}
`,
    params: [
      {
        id: 'cells',
        label: 'Cells',
        anchor: /(float n = )(-?\d+\.\d*)/,
        min: 2,
        max: 40,
        step: 1,
        decimals: 1
      },
      {
        id: 'speed',
        label: 'Speed',
        anchor: /(u_time \* )(-?\d+\.\d*)/,
        min: 0,
        max: 8,
        step: 0.1,
        decimals: 1
      },
      {
        id: 'size',
        label: 'Dot size',
        anchor: /(float r = )(-?\d+\.\d*)/,
        min: 0.02,
        max: 0.4,
        step: 0.01,
        decimals: 2
      }
    ],
    mistake: {
      make: swap(/(float n = -?\d+\.\d*);/, '$1'),
      fix: swap(/(float n = -?\d+\.\d*)[ \t]*(?=\n)/, '$1;')
    }
  },
  {
    id: 'moire',
    label: 'Moiré',
    lesson: 'Free sketch — two sets of rings',
    code: `// Free sketch — two sets of rings
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.y;
  float k = 90.0;
  vec2 a = vec2(0.6 + 0.2 * sin(u_time * 0.7), 0.5);
  vec2 b = vec2(1.0, 0.5);
  float ringsA = sin(distance(uv, a) * k);
  float ringsB = sin(distance(uv, b) * k);
  float m = step(0.0, ringsA * ringsB);
  gl_FragColor = vec4(vec3(m * 0.9 + 0.05), 1.0);
}
`,
    params: [
      {
        id: 'density',
        label: 'Density',
        anchor: /(float k = )(-?\d+\.\d*)/,
        min: 10,
        max: 200,
        step: 1,
        decimals: 1
      },
      {
        id: 'drift',
        label: 'Drift',
        anchor: /(0\.6 \+ )(-?\d+\.\d*)/,
        min: 0,
        max: 0.6,
        step: 0.01,
        decimals: 2
      }
    ],
    mistake: {
      make: swap(/vec2 b = vec2\(/, 'vec2 b = vec3('),
      fix: swap(/vec2 b = vec3\(/, 'vec2 b = vec2(')
    }
  }
];

/** Reads a parameter's current value from the code, or null if it's gone. */
export function readParam(code: string, param: Param): number | null {
  const match = param.anchor.exec(code);
  if (!match) return null;
  const value = Number.parseFloat(match[2]!);
  return Number.isFinite(value) ? value : null;
}

/** Writes a value back into the code as a float literal. */
export function writeParam(code: string, param: Param, value: number): string {
  const literal = value.toFixed(Math.max(1, param.decimals));
  return code.replace(param.anchor, (_, before: string) => `${before}${literal}`);
}

const NOISE = `float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
`;

export type Sketch = {
  title: string;
  student: string;
  lesson: string;
  time: number;
  code: string;
};

export const sketches: Sketch[] = [
  {
    title: 'Tram lines',
    student: 'Daan K.',
    lesson: 'Lesson 4',
    time: 1.2,
    code: `void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.y;
  float s = sin((uv.x * 0.8 + uv.y) * 38.0 + u_time);
  float k = smoothstep(-0.15, 0.15, s);
  vec3 a = vec3(0.12, 0.2, 0.95);
  vec3 b = vec3(0.95, 0.94, 0.9);
  gl_FragColor = vec4(mix(a, b, k), 1.0);
}`
  },
  {
    title: 'Fog over the Maas',
    student: 'Yara E.',
    lesson: 'Free sketch',
    time: 4.0,
    code: `${NOISE}
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float n = noise(vec2(uv.x * 3.0 + u_time * 0.1, uv.y * 8.0)) * 0.6 + noise(uv * 14.0) * 0.25;
  float shore = smoothstep(0.34, 0.345, uv.y + n * 0.07);
  vec3 water = vec3(0.3, 0.36, 0.4) + n * 0.1 + 0.04 * sin(uv.y * 240.0);
  vec3 fog = vec3(0.88, 0.89, 0.88) - (1.0 - uv.y) * 0.18 + n * 0.08;
  vec3 skyline = vec3(0.52, 0.55, 0.58);
  float column = floor(uv.x * 34.0);
  float tall = 0.35 + 0.05 * fract(sin(column * 12.9898) * 43758.5453) + 0.14 * step(0.86, fract(sin(column * 4.1) * 917.3));
  float towers = step(uv.y, tall) * smoothstep(0.62, 0.36, uv.y);
  vec3 col = mix(water, mix(fog, skyline, towers * 0.7), shore);
  gl_FragColor = vec4(col, 1.0);
}`
  },
  {
    title: 'Ripple',
    student: 'Sem B.',
    lesson: 'Lesson 5',
    time: 2.0,
    code: `void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  float d = length(uv);
  float r = sin(d * 60.0 - u_time * 3.0) * exp(-d * 2.5);
  vec3 col = mix(vec3(0.07, 0.07, 0.09), vec3(1.0, 0.45, 0.35), smoothstep(0.0, 0.25, r));
  gl_FragColor = vec4(col, 1.0);
}`
  },
  {
    title: 'Bent checkerboard',
    student: 'Lina M.',
    lesson: 'Lesson 6',
    time: 0.8,
    code: `void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  uv += 0.12 * vec2(sin(uv.y * 6.0 + u_time), cos(uv.x * 5.0));
  vec2 g = floor(uv * 8.0);
  float c = mod(g.x + g.y, 2.0);
  gl_FragColor = vec4(mix(vec3(0.1), vec3(0.94, 0.92, 0.86), c), 1.0);
}`
  },
  {
    title: 'Three-band sunset',
    student: 'Joris V.',
    lesson: 'Lesson 3',
    time: 0.0,
    code: `void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;
  vec3 top = vec3(0.24, 0.2, 0.52);
  vec3 mid = vec3(0.96, 0.42, 0.45);
  vec3 low = vec3(1.0, 0.76, 0.42);
  vec3 col = mix(low, mid, smoothstep(0.32, 0.55, uv.y));
  col = mix(col, top, smoothstep(0.55, 0.95, uv.y));
  float sun = smoothstep(0.155, 0.15, distance(uv * vec2(aspect, 1.0), vec2(0.5 * aspect, 0.34)));
  col = mix(col, vec3(1.0, 0.95, 0.84), sun);
  float sea = step(uv.y, 0.3);
  float glint = step(0.6, sin(uv.y * 220.0)) * smoothstep(0.2, 0.0, abs(uv.x - 0.5)) * 0.35;
  col = mix(col, vec3(0.17, 0.15, 0.33) + glint, sea);
  gl_FragColor = vec4(col, 1.0);
}`
  },
  {
    title: 'Moiré',
    student: 'Aylin T.',
    lesson: 'Free sketch',
    time: 0.0,
    code: `void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.y;
  vec2 a = vec2(0.44, 0.5);
  vec2 b = vec2(0.6, 0.47);
  float m = step(0.0, sin(distance(uv, a) * 120.0) * sin(distance(uv, b) * 120.0));
  gl_FragColor = vec4(vec3(0.08) + m * vec3(0.86, 0.85, 0.8), 1.0);
}`
  },
  {
    title: 'Random dots',
    student: 'Ruben H.',
    lesson: 'Lesson 6',
    time: 0.0,
    code: `void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.y;
  float n = 9.0;
  vec2 cell = fract(uv * n) - 0.5;
  vec2 id = floor(uv * n);
  float r = 0.08 + 0.32 * fract(sin(dot(id, vec2(12.9898, 78.233))) * 43758.5453);
  float spot = smoothstep(r, r - 0.03, length(cell));
  gl_FragColor = vec4(mix(vec3(0.95, 0.94, 0.9), vec3(0.18, 0.27, 1.0), spot), 1.0);
}`
  },
  {
    title: 'Heartbeat',
    student: 'Mila S.',
    lesson: 'Lesson 7',
    time: 0.78,
    code: `void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  float beat = pow(abs(sin(u_time * 2.0)), 8.0);
  float r = 0.22 + 0.06 * beat;
  float d = length(uv);
  float fill = smoothstep(r, r - 0.008, d);
  float halo = smoothstep(0.014, 0.0, abs(d - r - 0.05 * beat - 0.03)) * beat;
  vec3 col = mix(vec3(0.08, 0.06, 0.07), vec3(1.0, 0.42, 0.33), fill);
  col += vec3(1.0, 0.6, 0.5) * halo * 0.7;
  gl_FragColor = vec4(col, 1.0);
}`
  },
  {
    title: 'Kade at night',
    student: 'Fenna D.',
    lesson: 'Free sketch',
    time: 1.4,
    code: `void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float horizon = 0.42;
  vec3 col = mix(vec3(0.03, 0.04, 0.08), vec3(0.1, 0.12, 0.24), smoothstep(horizon, 1.0, uv.y));
  vec2 g = vec2(uv.x * 22.0, (uv.y - horizon) * 30.0);
  vec2 id = floor(g);
  float on = step(0.55, fract(sin(dot(id, vec2(41.3, 17.9))) * 3758.5));
  float tall = step(id.y, 2.0 + floor(4.0 * fract(sin(id.x * 7.13) * 91.7)));
  float win = step(0.25, fract(g.x)) * step(0.3, fract(g.y)) * on * tall * step(horizon, uv.y);
  col += vec3(1.0, 0.74, 0.38) * win;
  float wob = sin(uv.y * 90.0 + u_time * 2.0) * 0.004;
  vec2 rg = vec2((uv.x + wob) * 22.0, (horizon - uv.y) * 30.0);
  vec2 rid = floor(rg);
  float ron = step(0.55, fract(sin(dot(rid, vec2(41.3, 17.9))) * 3758.5));
  float rtall = step(rid.y, 2.0 + floor(4.0 * fract(sin(rid.x * 7.13) * 91.7)));
  float refl = step(0.3, fract(rg.x)) * ron * rtall * step(uv.y, horizon) * (uv.y / horizon);
  col += vec3(1.0, 0.7, 0.36) * refl * 0.45;
  gl_FragColor = vec4(col, 1.0);
}`
  },
  {
    title: 'Zebra',
    student: 'Tobias R.',
    lesson: 'Lesson 4',
    time: 0.6,
    code: `void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.y;
  float w = uv.x * 18.0 + sin(uv.y * 7.0 + u_time) * 1.6 + sin(uv.y * 23.0) * 0.3;
  float s = smoothstep(-0.1, 0.1, sin(w));
  gl_FragColor = vec4(vec3(0.07 + s * 0.88), 1.0);
}`
  },
  {
    title: 'Plaid',
    student: 'Imane A.',
    lesson: 'Lesson 4',
    time: 0.0,
    code: `void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.y;
  float a = smoothstep(0.3, 0.33, abs(sin(uv.x * 14.0)));
  float b = smoothstep(0.3, 0.33, abs(sin(uv.y * 14.0)));
  float t = step(0.92, fract(uv.x * 7.0 + 0.03)) + step(0.92, fract(uv.y * 7.0 + 0.03));
  vec3 col = vec3(0.68, 0.12, 0.14);
  col = mix(col, vec3(0.12, 0.16, 0.38), (1.0 - a) * 0.75);
  col = mix(col, vec3(0.12, 0.16, 0.38), (1.0 - b) * 0.75);
  col = mix(col, vec3(0.95, 0.86, 0.56), clamp(t, 0.0, 1.0) * 0.85);
  gl_FragColor = vec4(col, 1.0);
}`
  },
  {
    title: 'Orbit',
    student: 'Iris P.',
    lesson: 'Lesson 7',
    time: 2.2,
    code: `void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  vec3 col = vec3(0.93, 0.92, 0.88);
  float d = length(uv);
  col = mix(col, vec3(0.17, 0.17, 0.2), smoothstep(0.004, 0.0, abs(d - 0.3)));
  col = mix(col, vec3(0.17, 0.17, 0.2), smoothstep(0.035, 0.03, d));
  for (int i = 0; i < 40; i++) {
    float t = u_time - float(i) * 0.035;
    vec2 p = 0.3 * vec2(cos(t), sin(t));
    float r = 0.045 - float(i) * 0.001;
    float k = smoothstep(r, r - 0.004, length(uv - p)) * pow(1.0 - float(i) / 40.0, 1.5);
    col = mix(col, vec3(0.18, 0.27, 1.0), k);
  }
  gl_FragColor = vec4(col, 1.0);
}`
  }
];
