import type { ShapeName } from '~/content/types';
import { field, type FieldMode } from '~/lib/field/store';
import { generateShape, type GlyphPoints, type ShapeData } from './shapes';
import {
  blurFrag,
  compositeFrag,
  fullscreenVert,
  pointsFrag,
  pointsVert,
  simFrag
} from './shaders';

/** Texture side lengths. Particles = side². */
export const TIERS = {
  high: 317, // 100,489
  mid: 245, // 60,025
  low: 173, // 29,929
  minimal: 126 // 15,876
} as const;

export type Tier = keyof typeof TIERS;

export function pickTier(): Tier {
  if (typeof window === 'undefined') return 'mid';
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  if (coarse && small) return 'low';
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency || 4;
  const memory = nav.deviceMemory ?? 8;
  if (coarse) return cores >= 8 ? 'mid' : 'low';
  if (cores <= 4 || memory <= 4) return 'mid';
  return 'high';
}

type Vec3 = [number, number, number];

function hexToRgb(hex: string): Vec3 {
  const v = hex.replace('#', '');
  const n = parseInt(v.length === 3 ? v.replace(/./g, '$&$&') : v, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function perspective(fovY: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  // prettier-ignore
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0
  ]);
}

/** Column-major model matrix: uniform scale then rotation X then Y. */
function modelMatrix(scale: number, rx: number, ry: number) {
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  // R = Ry * Rx
  const r = [
    cy, 0, -sy,
    sy * sx, cx, cy * sx,
    sy * cx, -sx, cy * cx
  ];
  // prettier-ignore
  const m = new Float32Array([
    r[0]! * scale, r[1]! * scale, r[2]! * scale, 0,
    r[3]! * scale, r[4]! * scale, r[5]! * scale, 0,
    r[6]! * scale, r[7]! * scale, r[8]! * scale, 0,
    0, 0, 0, 1
  ]);
  // Inverse rotation (transpose), column-major mat3.
  // prettier-ignore
  const inv = new Float32Array([
    r[0]!, r[3]!, r[6]!,
    r[1]!, r[4]!, r[7]!,
    r[2]!, r[5]!, r[8]!
  ]);
  return { m, inv };
}

function viewMatrix(dist: number) {
  // prettier-ignore
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, -dist, 1
  ]);
}

function multiply(a: Float32Array, b: Float32Array) {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r]! * b[c * 4 + k]!;
      out[c * 4 + r] = s;
    }
  }
  return out;
}

/** A value that eases toward a target like a critically damped spring. */
class Smooth {
  v: number;
  vel = 0;
  constructor(
    value: number,
    public omega: number
  ) {
    this.v = value;
  }
  step(target: number, dt: number) {
    const w = this.omega;
    const x = this.v - target;
    const e = Math.exp(-w * dt);
    const temp = (this.vel + w * x) * dt;
    this.vel = (this.vel - w * temp) * e;
    this.v = target + (x + temp) * e;
    return this.v;
  }
  set(value: number) {
    this.v = value;
    this.vel = 0;
  }
}

type Program = {
  program: WebGLProgram;
  uniforms: Map<string, WebGLUniformLocation | null>;
};

type Layer = { fbo: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number };

type Target = {
  fbo: WebGLFramebuffer;
  pos: WebGLTexture;
  vel: WebGLTexture;
};

export type EngineOptions = {
  ink: string;
  accent: string;
  reducedMotion: boolean;
  tier: Tier;
  glyphs: () => Promise<GlyphPoints>;
  onMode: (mode: FieldMode, count: number) => void;
};

const FOV = (34 * Math.PI) / 180;
const CAM = 4;

export class FieldEngine {
  private gl: WebGL2RenderingContext;
  private side: number;
  private count: number;
  private floatType: number;
  private internalFormat: number;
  private sim!: Program;
  private points!: Program;
  private composite!: Program;
  private vao!: WebGLVertexArrayObject;
  private targets: Target[] = [];
  private read = 0;
  private targetTex!: WebGLTexture;
  private layers!: [Layer, Layer];
  private blur!: Program;
  private shapes = new Map<ShapeName, ShapeData>();
  private glyphs: GlyphPoints | null = null;
  private currentShape: ShapeName | null = null;
  private raf = 0;
  private running = false;
  private lost = false;
  private startTime = 0;
  private lastTime = 0;
  private simTime = 0;
  private morphAt = -10;
  private width = 1;
  private height = 1;
  private dpr = 1;
  private keep = 1;
  private frameLog: number[] = [];
  private downsteps = 0;
  private ink: Vec3;
  private accent: Vec3;
  private depth = new Smooth(0, 5.5);
  private offX = new Smooth(0, 5);
  private offY = new Smooth(0, 5);
  private pointer = { x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0, t: 0, active: false };
  private parallax = { x: new Smooth(0, 2.2), y: new Smooth(0, 2.2) };
  private needsDraw = true;
  private lastScene = '';
  private morphWaiters: { at: number; resolve: () => void }[] = [];

  static create(canvas: HTMLCanvasElement, options: EngineOptions): FieldEngine | null {
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    });
    if (!gl) return null;
    const float = gl.getExtension('EXT_color_buffer_float');
    const half = float ? null : gl.getExtension('EXT_color_buffer_half_float');
    if (!float && !half) return null;
    try {
      return new FieldEngine(canvas, gl, options, Boolean(float));
    } catch (error) {
      if (import.meta.env.DEV) console.info('[field] falling back to still', error);
      return null;
    }
  }

  private constructor(
    private canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
    private options: EngineOptions,
    fullFloat: boolean
  ) {
    this.gl = gl;
    this.floatType = fullFloat ? gl.FLOAT : gl.HALF_FLOAT;
    this.internalFormat = fullFloat ? gl.RGBA32F : gl.RGBA16F;
    let tier = options.tier;
    const renderer = this.rendererName();
    if (/swiftshader|llvmpipe|software/i.test(renderer)) tier = 'minimal';
    this.side = TIERS[tier];
    this.count = this.side * this.side;
    this.ink = hexToRgb(options.ink);
    this.accent = hexToRgb(options.accent);
    this.init();
    canvas.addEventListener('webglcontextlost', this.onLost, false);
    canvas.addEventListener('webglcontextrestored', this.onRestored, false);
  }

  get particleCount() {
    return Math.round(this.count * this.keep);
  }

  private rendererName() {
    const ext = this.gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return '';
    return String(this.gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? '');
  }

  // --- setup -------------------------------------------------------------

  private compile(frag: string, vert = fullscreenVert): Program {
    const gl = this.gl;
    const make = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
        throw new Error(gl.getShaderInfoLog(shader) ?? 'shader');
      }
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, make(gl.VERTEX_SHADER, vert));
    gl.attachShader(program, make(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS) && !gl.isContextLost()) {
      throw new Error(gl.getProgramInfoLog(program) ?? 'link');
    }
    return { program, uniforms: new Map() };
  }

  private u(p: Program, name: string) {
    if (!p.uniforms.has(name)) {
      p.uniforms.set(name, this.gl.getUniformLocation(p.program, name));
    }
    return p.uniforms.get(name) ?? null;
  }

  private dataTexture(data: Float32Array | null) {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const src =
      data && this.floatType === gl.HALF_FLOAT ? toHalf(data) : data;
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      this.internalFormat,
      this.side,
      this.side,
      0,
      gl.RGBA,
      this.floatType,
      src
    );
    return tex;
  }

  private init() {
    const gl = this.gl;
    this.sim = this.compile(simFrag);
    this.points = this.compile(pointsFrag, pointsVert);
    this.composite = this.compile(compositeFrag);
    this.blur = this.compile(blurFrag);
    this.vao = gl.createVertexArray()!;

    const { pos, vel } = this.initialState();
    this.targets = [0, 1].map((i) => {
      const p = this.dataTexture(i === 0 ? pos : null);
      const v = this.dataTexture(i === 0 ? vel : null);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, p, 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, v, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        throw new Error('Float render targets are not supported');
      }
      return { fbo, pos: p, vel: v };
    });
    this.read = 0;
    this.targetTex = this.dataTexture(null);
    this.layers = [this.createLayer(1, 1), this.createLayer(1, 1)];
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.currentShape = null;
  }

  private createLayer(w: number, h: number) {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { fbo, tex, w, h };
  }

  /** A scattered burst: everything starts near the centre, flying outward. */
  private initialState() {
    const n = this.count;
    const pos = new Float32Array(n * 4);
    const vel = new Float32Array(n * 4);
    let seed = 1234567;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < n; i++) {
      const u = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const dir: Vec3 = [Math.cos(a) * s, u, Math.sin(a) * s];
      const r = Math.pow(rand(), 2) * 0.06;
      const speed = 1.6 + Math.pow(rand(), 1.8) * 5.2;
      const o = i * 4;
      pos[o] = dir[0] * r;
      pos[o + 1] = dir[1] * r;
      pos[o + 2] = dir[2] * r * 0.6;
      pos[o + 3] = 0;
      vel[o] = dir[0] * speed;
      vel[o + 1] = dir[1] * speed;
      vel[o + 2] = dir[2] * speed * 0.5;
      vel[o + 3] = 0.6;
    }
    return { pos, vel };
  }

  // --- shapes ------------------------------------------------------------

  private async shapeData(name: ShapeName): Promise<ShapeData> {
    const cached = this.shapes.get(name);
    if (cached) return cached;
    if (name === 'iris' && !this.glyphs) {
      this.glyphs = await this.options.glyphs();
    }
    const data = generateShape(name, this.count, this.glyphs ?? undefined);
    this.shapes.set(name, data);
    return data;
  }

  private shapeRequest: ShapeName | null = null;

  private requestShape(name: ShapeName) {
    if (this.shapeRequest === name) return;
    this.shapeRequest = name;
    void this.shapeData(name).then((data) => {
      if (this.shapeRequest !== name || this.lost || this.destroyed) return;
      this.uploadTarget(data);
      const first = this.currentShape === null;
      this.currentShape = name;
      if (!first) this.morphAt = this.simTime;
      if (this.options.reducedMotion) this.snap = true;
      this.needsDraw = true;
    });
  }

  private snap = false;

  private uploadTarget(data: ShapeData) {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.targetTex);
    const src = this.floatType === gl.HALF_FLOAT ? toHalf(data) : data;
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.side, this.side, gl.RGBA, this.floatType, src);
  }

  /** Generate the other shapes while the browser is idle. */
  private warmShapes() {
    const order: ShapeName[] = ['contour', 'orbit', 'lattice', 'waveform', 'volume', 'ribbon', 'iris'];
    const idle =
      (window as Window & { requestIdleCallback?: (cb: () => void) => number })
        .requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const next = () => {
      const name = order.shift();
      if (!name || this.lost || this.destroyed) return;
      void this.shapeData(name).then(() => idle(next));
    };
    idle(next);
  }

  // --- lifecycle ---------------------------------------------------------

  start() {
    if (this.running) return;
    this.running = true;
    this.startTime = performance.now();
    this.lastTime = this.startTime;
    if (this.options.reducedMotion) this.snap = true;
    this.requestShape(field.getScene().shape);
    this.warmShapes();
    field.onMorph((shape) => this.morph(shape));
    this.options.onMode(this.options.reducedMotion ? 'static' : 'live', this.particleCount);
    this.raf = requestAnimationFrame(this.frame);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  private destroyed = false;

  destroy() {
    this.destroyed = true;
    this.running = false;
    cancelAnimationFrame(this.raf);
    if (!this.lost) {
      const gl = this.gl;
      for (const t of this.targets) {
        gl.deleteTexture(t.pos);
        gl.deleteTexture(t.vel);
        gl.deleteFramebuffer(t.fbo);
      }
      for (const l of this.layers) {
        gl.deleteTexture(l.tex);
        gl.deleteFramebuffer(l.fbo);
      }
      gl.deleteTexture(this.targetTex);
      for (const p of [this.sim, this.points, this.composite, this.blur]) {
        gl.deleteProgram(p.program);
      }
      gl.deleteVertexArray(this.vao);
    }
    field.onMorph(null);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.canvas.removeEventListener('webglcontextlost', this.onLost);
    this.canvas.removeEventListener('webglcontextrestored', this.onRestored);
    this.morphWaiters.forEach((w) => w.resolve());
    this.morphWaiters = [];
  }

  private onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(this.raf);
    } else if (this.running && !this.lost) {
      this.lastTime = performance.now();
      this.raf = requestAnimationFrame(this.frame);
    }
  };

  private onLost = (event: Event) => {
    event.preventDefault();
    this.lost = true;
    cancelAnimationFrame(this.raf);
  };

  private onRestored = () => {
    if (this.destroyed) return;
    const gl = this.gl;
    // Extensions don't survive a lost context.
    const float = gl.getExtension('EXT_color_buffer_float');
    if (!float) gl.getExtension('EXT_color_buffer_half_float');
    this.lost = false;
    this.shapeRequest = null;
    try {
      this.init();
    } catch {
      this.running = false;
      this.options.onMode('still', 0);
      return;
    }
    this.width = 0;
    this.resize(this.cssWidth, this.cssHeight, window.devicePixelRatio || 1);
    this.snap = true;
    this.requestShape(field.getScene().shape);
    this.lastTime = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  };

  morph(shape: ShapeName): Promise<void> {
    if (this.options.reducedMotion || this.lost) {
      this.requestShape(shape);
      return Promise.resolve();
    }
    // Come forward faster than scrolling does, so the shape is sharp in time.
    this.depth.omega = 14;
    return new Promise((resolve) => {
      this.morphWaiters.push({
        at: performance.now() + 960,
        resolve: () => {
          this.depth.omega = 5.5;
          resolve();
        }
      });
    });
  }

  private cssWidth = 1;
  private cssHeight = 1;

  resize(cssWidth: number, cssHeight: number, devicePixelRatio: number) {
    this.cssWidth = cssWidth;
    this.cssHeight = cssHeight;
    // Cap pixels on very large screens.
    let dpr = Math.min(devicePixelRatio, 2);
    const maxPixels = 4.2e6;
    if (cssWidth * cssHeight * dpr * dpr > maxPixels) {
      dpr = Math.sqrt(maxPixels / (cssWidth * cssHeight));
    }
    if (this.downsteps >= 2) dpr = Math.min(dpr, 1.25);
    this.dpr = dpr;
    const w = Math.max(1, Math.round(cssWidth * dpr));
    const h = Math.max(1, Math.round(cssHeight * dpr));
    if (w === this.width && h === this.height && this.layers[0].w === w) return;
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    const gl = this.gl;
    for (const layer of this.layers) {
      gl.deleteTexture(layer.tex);
      gl.deleteFramebuffer(layer.fbo);
    }
    this.layers = [this.createLayer(w, h), this.createLayer(w, h)];
    this.needsDraw = true;
  }

  pointerMove(clientX: number, clientY: number, cssWidth: number, cssHeight: number) {
    const now = performance.now();
    const x = (clientX / cssWidth) * 2 - 1;
    const y = 1 - (clientY / cssHeight) * 2;
    const p = this.pointer;
    if (p.active) {
      const dt = Math.max(1, now - p.t) / 1000;
      const vx = (x - p.x) / dt;
      const vy = (y - p.y) / dt;
      p.vx += (Math.max(-8, Math.min(8, vx)) - p.vx) * 0.35;
      p.vy += (Math.max(-8, Math.min(8, vy)) - p.vy) * 0.35;
    }
    p.x = x;
    p.y = y;
    p.t = now;
    p.active = true;
  }

  pointerLeave() {
    this.pointer.active = false;
  }

  // --- frame -------------------------------------------------------------

  private frame = (now: number) => {
    if (!this.running || this.lost) return;
    this.raf = requestAnimationFrame(this.frame);
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(Math.max(rawDt, 0), 1 / 20);
    this.monitor(rawDt * 1000, now);

    const scene = field.getScene();
    if (scene.shape !== this.shapeRequest) this.requestShape(scene.shape);

    // Resolve morph promises once the form has had time to gather.
    if (this.morphWaiters.length) {
      this.morphWaiters = this.morphWaiters.filter((w) => {
        if (now >= w.at) {
          w.resolve();
          return false;
        }
        return true;
      });
    }

    if (this.options.reducedMotion) {
      const key = `${scene.shape}|${scene.depth.toFixed(3)}|${scene.x}|${scene.y}|${this.width}x${this.height}`;
      if (key === this.lastScene && !this.needsDraw && !this.snap) return;
      this.lastScene = key;
      this.depth.set(scene.depth);
      this.offX.set(scene.x);
      this.offY.set(scene.y);
      if (this.currentShape) {
        this.step(0, true);
        this.snap = false;
        this.render(0);
        this.needsDraw = false;
      }
      return;
    }

    this.simTime += dt;
    this.depth.step(scene.depth, dt);
    this.offX.step(scene.x, dt);
    this.offY.step(scene.y, dt);
    const p = this.pointer;
    // Velocity decays when the pointer rests.
    if (now - p.t > 60) {
      p.vx *= Math.exp(-dt * 9);
      p.vy *= Math.exp(-dt * 9);
    }
    this.parallax.x.step(p.active ? p.x : 0, dt);
    this.parallax.y.step(p.active ? p.y : 0, dt);

    if (!this.currentShape) return;
    // Two half steps keep the stiffest springs stable.
    this.step(dt / 2, this.snap);
    this.step(dt / 2, false);
    this.snap = false;
    this.render(this.simTime);
  };

  private camera(time: number) {
    const aspect = this.width / this.height;
    const d = this.depth.v;
    const dist = CAM * (1 + 0.55 * d);
    const proj = perspective(FOV, aspect, 0.1, 40);
    const halfH = Math.tan(FOV / 2) * CAM;
    // The form's radius is ~0.38 of the smaller viewport side.
    const minSide = Math.min(1, aspect);
    const fit = 0.76 * minSide * halfH;
    const idle = this.options.reducedMotion ? 0 : 1;
    const ry = idle * (Math.sin(time * 0.11) * 0.22 + this.parallax.x.v * 0.16);
    const rx = idle * (Math.sin(time * 0.07 + 1.3) * 0.06 - this.parallax.y.v * 0.1);
    const { m, inv } = modelMatrix(fit, rx, ry);
    const viewProj = multiply(proj, viewMatrix(dist));
    return { aspect, proj, viewProj, model: m, invRot: inv, dist };
  }

  private step(dt: number, snap: boolean) {
    const gl = this.gl;
    const src = this.targets[this.read]!;
    const dst = this.targets[1 - this.read]!;
    const t = this.simTime;
    const cam = this.camera(t);

    // Load: springs ramp in after the burst. Morphs: a short turbulence spike.
    const since = t;
    const gather = smoothstep(0.12, 1.9, since);
    const sinceMorph = t - this.morphAt;
    const morphSpike = sinceMorph >= 0 && sinceMorph < 2 ? Math.exp(-sinceMorph * 3.2) : 0;
    // During a morph the springs stiffen for a moment, so the new shape is
    // recognisable before the case study fades in, then relax back.
    const morphBoost =
      sinceMorph >= 0 && sinceMorph < 2.5 ? 1.3 * Math.exp(-sinceMorph * 1.1) : 0;
    const spring = (0.04 + 0.96 * Math.pow(gather, 1.3)) * (1 + morphBoost);
    const drag = (1.1 + 4.6 * smoothstep(0.05, 1.5, since)) * (1 + 0.35 * morphBoost);
    const settle = smoothstep(1.0, 2.5, since);
    const idleTurb = 0.012 + 0.03 * this.depth.v;
    const turb = idleTurb + (1 - settle) * 0.5 + morphSpike * 0.75;

    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    gl.viewport(0, 0, this.side, this.side);
    gl.disable(gl.BLEND);
    const p = this.sim;
    gl.useProgram(p.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, src.pos);
    gl.uniform1i(this.u(p, 'uPos'), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, src.vel);
    gl.uniform1i(this.u(p, 'uVel'), 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.targetTex);
    gl.uniform1i(this.u(p, 'uTarget'), 2);
    gl.uniform1f(this.u(p, 'uDt'), dt);
    gl.uniform1f(this.u(p, 'uTime'), t);
    gl.uniform1f(this.u(p, 'uSpring'), spring);
    gl.uniform1f(this.u(p, 'uDrag'), drag);
    gl.uniform1f(this.u(p, 'uTurb'), turb);
    gl.uniform1f(this.u(p, 'uSnap'), snap ? 1 : 0);
    gl.uniformMatrix4fv(this.u(p, 'uViewProj'), false, cam.viewProj);
    gl.uniformMatrix4fv(this.u(p, 'uModel'), false, cam.model);
    gl.uniformMatrix3fv(this.u(p, 'uInvRot'), false, cam.invRot);
    gl.uniform2f(this.u(p, 'uProjScale'), cam.proj[0]!, cam.proj[5]!);
    gl.uniform2f(this.u(p, 'uOffset'), this.offX.v, this.offY.v);
    gl.uniform1f(this.u(p, 'uAspect'), cam.aspect);
    const ptr = this.pointer;
    gl.uniform2f(this.u(p, 'uPointer'), ptr.x, ptr.y);
    gl.uniform2f(this.u(p, 'uPointerVel'), ptr.vx, ptr.vy);
    const wind = ptr.active && !this.options.reducedMotion ? gather * (1 - 0.6 * this.depth.v) : 0;
    gl.uniform1f(this.u(p, 'uWind'), wind);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.read = 1 - this.read;
  }

  private render(time: number) {
    const gl = this.gl;
    const cur = this.targets[this.read]!;
    const cam = this.camera(time);
    const d = this.depth.v;
    const blur = smoothstep(0.02, 1, d);
    // Depth of field: a Gaussian blur over a low-resolution copy of the
    // points. The layer shrinks as the blur grows so the kernel never skips
    // pixels, and the cost stays flat whatever the particle count.
    const sigma = 24 * blur; // CSS px
    const scale = Math.min(1, Math.max(0.1, 6.3 / Math.max(0.01, sigma * this.dpr)));
    const lw = Math.max(1, Math.round(this.width * scale));
    const lh = Math.max(1, Math.round(this.height * scale));
    // Keep fewer particles when blurred: they overlap anyway.
    const keep = this.keep * (1 - 0.4 * blur);
    const [a, b] = this.layers;

    gl.bindFramebuffer(gl.FRAMEBUFFER, b.fbo);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, a.fbo);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, lw, lh);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const p = this.points;
    gl.useProgram(p.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cur.pos);
    gl.uniform1i(this.u(p, 'uPos'), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, cur.vel);
    gl.uniform1i(this.u(p, 'uVel'), 1);
    gl.uniform1i(this.u(p, 'uSide'), this.side);
    gl.uniformMatrix4fv(this.u(p, 'uViewProj'), false, cam.viewProj);
    gl.uniformMatrix4fv(this.u(p, 'uModel'), false, cam.model);
    gl.uniform2f(this.u(p, 'uOffset'), this.offX.v, this.offY.v);
    // Sizes are in CSS px; uScale turns them into layer pixels.
    const small = Math.min(this.width, this.height) / this.dpr < 600;
    const burst = 1 - smoothstep(0.4, 2.2, this.simTime);
    gl.uniform1f(this.u(p, 'uSize'), small ? 1.15 : 1.35);
    gl.uniform1f(this.u(p, 'uGrow'), 1 + 0.6 * blur + 0.9 * burst);
    gl.uniform1f(this.u(p, 'uBlur'), blur);
    gl.uniform1f(this.u(p, 'uSpread'), 1.45 * smoothstep(0.15, 1, d));
    gl.uniform1f(this.u(p, 'uTime'), time);
    gl.uniform1f(this.u(p, 'uScale'), this.dpr * scale);
    gl.uniform1f(this.u(p, 'uKeep'), keep);
    gl.uniform1f(
      this.u(p, 'uAlpha'),
      (small ? 0.62 : 0.55) * Math.min(1, 100489 / this.count) ** 0.35
    );
    gl.uniform1f(this.u(p, 'uCamDist'), cam.dist);
    gl.uniform3fv(this.u(p, 'uInk'), this.ink);
    gl.uniform3fv(this.u(p, 'uAccent'), this.accent);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.POINTS, 0, this.count);
    gl.disable(gl.BLEND);

    const uv = [lw / a.w, lh / a.h] as const;
    if (sigma > 0.4) {
      const bp = this.blur;
      gl.useProgram(bp.program);
      gl.uniform1i(this.u(bp, 'uTex'), 0);
      gl.uniform2f(this.u(bp, 'uUvScale'), uv[0], uv[1]);
      // Two iterations of a 15-tap kernel (sigma 2.8 steps each).
      const stepPx = (sigma / Math.SQRT2 / 2.8) * this.dpr * scale;
      for (let i = 0; i < 2; i++) {
        for (const [src, dst, dx, dy] of [
          [a, b, 1, 0],
          [b, a, 0, 1]
        ] as const) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
          gl.viewport(0, 0, lw, lh);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, src.tex);
          gl.uniform2f(this.u(bp, 'uStep'), (dx * stepPx) / a.w, (dy * stepPx) / a.h);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
      }
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    const c = this.composite;
    gl.useProgram(c.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, a.tex);
    gl.uniform1i(this.u(c, 'uTex'), 0);
    gl.uniform2f(this.u(c, 'uUvScale'), uv[0], uv[1]);
    gl.uniform1f(this.u(c, 'uOpacity'), 1 - 0.1 * blur);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /** Step particle count and resolution down if frames run long. */
  private monitor(ms: number, now: number) {
    if (this.options.reducedMotion || document.hidden) return;
    if (now - this.startTime < 1800 || ms > 250) return;
    this.frameLog.push(ms);
    if (this.frameLog.length < 90) return;
    const avg = this.frameLog.reduce((a, b) => a + b, 0) / this.frameLog.length;
    this.frameLog = [];
    if (avg > 20 && this.downsteps < 3) {
      this.downsteps++;
      if (this.downsteps === 1) this.keep = 0.7;
      if (this.downsteps === 2) {
        this.keep = 0.5;
        this.resize(this.cssWidth, this.cssHeight, window.devicePixelRatio || 1);
      }
      if (this.downsteps === 3) this.keep = 0.32;
      this.options.onMode('live', this.particleCount);
    }
  }

  /** Dev only: draw one settled frame and return it as a PNG data URL. */
  capture(): string {
    this.render(this.simTime);
    return this.canvas.toDataURL('image/png');
  }
}

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Float32 → IEEE half floats for devices without float render targets. */
function toHalf(data: Float32Array): Uint16Array {
  const out = new Uint16Array(data.length);
  const f = new Float32Array(1);
  const i = new Uint32Array(f.buffer);
  for (let k = 0; k < data.length; k++) {
    f[0] = data[k]!;
    const x = i[0]!;
    const sign = (x >> 16) & 0x8000;
    let exp = ((x >> 23) & 0xff) - 127 + 15;
    let mant = x & 0x7fffff;
    if (exp <= 0) {
      out[k] = sign;
    } else if (exp >= 31) {
      out[k] = sign | 0x7c00;
    } else {
      mant >>= 13;
      exp <<= 10;
      out[k] = sign | exp | mant;
    }
  }
  return out;
}
