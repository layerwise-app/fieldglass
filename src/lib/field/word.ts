// The footer word: letters sampled into a dense grid of dots. Around the
// pointer the dots scatter like dust and drift back. A few thousand floats a
// frame on the CPU, drawn as WebGL points; it sleeps when everything is home.

const vert = /* glsl */ `
attribute vec3 aState;
attribute float aRand;
attribute float aCover;
uniform vec2 uRes;
uniform float uSize;
uniform float uDpr;
uniform float uBleed;
varying float vDisp;
varying float vFade;
varying float vRand;
varying float vCover;
void main() {
  vec2 p = aState.xy / uRes * 2.0 - 1.0;
  // Edge dots are partly covered by the letter: fainter at rest, full once loose.
  vCover = mix(aCover, 1.0, smoothstep(1.0, 8.0, aState.z));
  gl_Position = vec4(p.x, -p.y, 0.0, 1.0);
  float d = aState.z;
  vDisp = d;
  // Loose dots fade out before they reach the canvas edge instead of being cut.
  float room = max(uBleed * 0.85, 1.0);
  float edgeFade = smoothstep(0.0, room, aState.y) * smoothstep(0.0, room, uRes.y - aState.y);
  vFade = mix(1.0, edgeFade, smoothstep(1.0, 8.0, d));
  vRand = aRand;
  float shrink = mix(1.0, 0.52 + 0.25 * aRand, smoothstep(1.5, 22.0, d));
  gl_PointSize = uSize * shrink * uDpr;
}
`;

const frag = /* glsl */ `
precision mediump float;
uniform vec3 uInk;
uniform vec3 uAccent;
varying float vDisp;
varying float vRand;
varying float vCover;
varying float vFade;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(q, q);
  if (r2 > 1.0) discard;
  float edge = 1.0 - smoothstep(0.78, 1.0, r2);
  float lit = step(vRand, 0.16) * smoothstep(4.0, 24.0, vDisp);
  vec3 c = mix(uInk, uAccent, lit);
  float a = edge * vCover * vFade * mix(1.0, 0.85, smoothstep(2.0, 30.0, vDisp));
  gl_FragColor = vec4(c * a, a);
}
`;

export type WordLayout = {
  /** Font size in viewBox units for a 1000-wide viewBox. */
  fontSize: number;
  /** viewBox height. */
  height: number;
  /** Baseline y in viewBox units. */
  baseline: number;
};

export const WORD_VIEW_WIDTH = 1000;
export const WORD_WEIGHT = 680;
export const WORD_STRETCH = 'semi-condensed';
/** Cap height ÷ em for Instrument Sans. */
const CAP = 0.7;
/** Average uppercase advance ÷ em at this weight and width. */
const ADVANCE = 0.665;

/** Size the word so it fills a 1000-unit-wide box edge to edge. */
export function wordLayout(word: string): WordLayout {
  const letters = Math.max(1, [...word].length);
  const fontSize = Math.min(560, WORD_VIEW_WIDTH / (letters * ADVANCE));
  const pad = fontSize * 0.02;
  const height = Math.round(fontSize * CAP + pad * 2);
  return { fontSize, height, baseline: height - pad };
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export class WordEngine {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private stateBuffer: WebGLBuffer;
  private randBuffer: WebGLBuffer;
  private loc: Record<string, WebGLUniformLocation | null> = {};
  private aState = 0;
  private aRand = 0;
  private aCover = 0;
  private coverBuffer: WebGLBuffer;
  private n = 0;
  private hx = new Float32Array(0);
  private hy = new Float32Array(0);
  private vx = new Float32Array(0);
  private vy = new Float32Array(0);
  private k = new Float32Array(0);
  private rnd = new Float32Array(0);
  private state = new Float32Array(0);
  private width = 1;
  private height = 1;
  /** Extra canvas above and below the word, so glyph overshoot and loose dots aren't clipped. */
  private bleed = 0;
  private dpr = 1;
  private spacing = 2.4;
  private raf = 0;
  private last = 0;
  private awake = false;
  private visible = false;
  private pointer = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0, active: false };
  private seed = 9001;

  static create(canvas: HTMLCanvasElement, ink: string, accent: string) {
    const gl = canvas.getContext('webgl', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false
    });
    if (!gl || gl.isContextLost()) return null;
    try {
      return new WordEngine(canvas, gl, ink, accent);
    } catch {
      return null;
    }
  }

  private constructor(
    private canvas: HTMLCanvasElement,
    gl: WebGLRenderingContext,
    ink: string,
    accent: string
  ) {
    this.gl = gl;
    const compile = (type: number, source: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
      }
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link');
    this.program = program;
    gl.useProgram(program);
    for (const name of ['uRes', 'uSize', 'uDpr', 'uBleed', 'uInk', 'uAccent']) {
      this.loc[name] = gl.getUniformLocation(program, name);
    }
    this.aState = gl.getAttribLocation(program, 'aState');
    this.aRand = gl.getAttribLocation(program, 'aRand');
    this.aCover = gl.getAttribLocation(program, 'aCover');
    this.coverBuffer = gl.createBuffer()!;
    this.stateBuffer = gl.createBuffer()!;
    this.randBuffer = gl.createBuffer()!;
    gl.uniform3fv(this.loc.uInk!, hexToRgb(ink));
    gl.uniform3fv(this.loc.uAccent!, hexToRgb(accent));
  }

  private rand() {
    this.seed = (this.seed * 1664525 + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  /** Sample the word at the element's size. */
  layout(word: string, cssWidth: number, family: string) {
    const layout = wordLayout(word);
    const s = cssWidth / WORD_VIEW_WIDTH;
    const w = Math.max(1, Math.round(cssWidth));
    const box = Math.max(1, Math.round(layout.height * s));
    const bleed = Math.round(box * 0.32);
    const h = box + bleed * 2;
    this.width = w;
    this.height = h;
    this.bleed = bleed;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.top = `${-bleed}px`;
    this.canvas.style.height = `${h}px`;
    // A whole number of device pixels between dots, so every dot renders
    // the same and the grid never beats against the pixel grid.
    const wanted = Math.min(2.6, Math.max(1.25, w / 560));
    this.spacing = Math.max(2, Math.round(wanted * this.dpr)) / this.dpr;

    const raster = document.createElement('canvas');
    raster.width = w;
    raster.height = h;
    const ctx = raster.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const size = layout.fontSize * s;
    ctx.font = `${WORD_WEIGHT} ${size}px "${family}", sans-serif`;
    if ('fontStretch' in ctx) {
      (ctx as CanvasRenderingContext2D & { fontStretch: string }).fontStretch =
        WORD_STRETCH;
    }
    const measured = ctx.measureText(word).width || 1;
    ctx.fillStyle = '#000';
    ctx.save();
    ctx.translate(0, bleed + layout.baseline * s);
    ctx.scale(w / measured, 1);
    ctx.fillText(word, 0, 0);
    ctx.restore();
    const data = ctx.getImageData(0, 0, w, h).data;

    const sp = this.spacing;
    const xs: number[] = [];
    const ys: number[] = [];
    const cover: number[] = [];
    // Average the raster under each dot so edge dots carry partial coverage.
    const alphaAt = (x: number, y: number) => {
      const ix = Math.min(w - 1, Math.max(0, Math.floor(x)));
      const iy = Math.min(h - 1, Math.max(0, Math.floor(y)));
      return data[(iy * w + ix) * 4 + 3]! / 255;
    };
    const o = sp * 0.3;
    for (let y = sp / 2; y < h; y += sp) {
      for (let x = sp / 2; x < w; x += sp) {
        const c =
          (alphaAt(x, y) * 2 +
            alphaAt(x - o, y - o) +
            alphaAt(x + o, y - o) +
            alphaAt(x - o, y + o) +
            alphaAt(x + o, y + o)) /
          6;
        if (c > 0.12) {
          xs.push(x);
          ys.push(y);
          cover.push(Math.min(1, c * 1.15));
        }
      }
    }
    const n = xs.length;
    this.n = n;
    this.hx = new Float32Array(xs);
    this.hy = new Float32Array(ys);
    this.vx = new Float32Array(n);
    this.vy = new Float32Array(n);
    this.k = new Float32Array(n);
    this.rnd = new Float32Array(n);
    this.state = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = this.rand();
      this.rnd[i] = r;
      this.k[i] = 9 + 26 * this.rand();
      this.state[i * 3] = xs[i]!;
      this.state[i * 3 + 1] = ys[i]!;
      this.state[i * 3 + 2] = 0;
    }
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.randBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.rnd, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.coverBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cover), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.stateBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.state, gl.DYNAMIC_DRAW);
    this.draw();
  }

  get particles() {
    return this.n;
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    if (visible && this.awake) this.loop();
    if (!visible) cancelAnimationFrame(this.raf);
  }

  /** Pointer position relative to the word's box (not the taller canvas). */
  pointerAt(x: number, boxY: number) {
    const y = boxY + this.bleed;
    const now = performance.now();
    const p = this.pointer;
    const inside =
      x > -120 && y > -120 && x < this.width + 120 && y < this.height + 120;
    if (p.active && inside) {
      const dt = Math.max(8, now - p.t) / 1000;
      p.vx += ((x - p.x) / dt - p.vx) * 0.3;
      p.vy += ((y - p.y) / dt - p.vy) * 0.3;
    } else {
      p.vx = 0;
      p.vy = 0;
    }
    p.x = x;
    p.y = y;
    p.t = now;
    p.active = inside;
    if (inside) this.wake();
  }

  pointerOut() {
    this.pointer.active = false;
  }

  private wake() {
    if (this.awake) return;
    this.awake = true;
    this.last = performance.now();
    if (this.visible) this.loop();
  }

  private loop = () => {
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.tick);
  };

  private tick = (now: number) => {
    if (!this.awake || !this.visible || document.hidden) return;
    const dt = Math.min(1 / 30, Math.max(0.001, (now - this.last) / 1000));
    this.last = now;
    const settled = this.simulate(dt, now);
    this.draw();
    if (settled) {
      this.awake = false;
      return;
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  private simulate(dt: number, now: number) {
    const p = this.pointer;
    if (now - p.t > 50) {
      p.vx *= Math.exp(-dt * 8);
      p.vy *= Math.exp(-dt * 8);
    }
    const R = Math.min(120, Math.max(46, this.width * 0.075));
    const R2 = R * R;
    const damp = Math.exp(-dt * 3.6);
    const st = this.state;
    let moving = 0;
    const active = p.active;
    const t = now * 0.001;
    for (let i = 0; i < this.n; i++) {
      const o = i * 3;
      let x = st[o]!;
      let y = st[o + 1]!;
      const hx = this.hx[i]!;
      const hy = this.hy[i]!;
      let ax = (hx - x) * this.k[i]!;
      let ay = (hy - y) * this.k[i]!;
      if (active) {
        const dx = x - p.x;
        const dy = y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) + 0.01;
          const f = 1 - d / R;
          const f2 = f * f;
          const r = this.rnd[i]!;
          // Out from the pointer, along its motion, and a little upward,
          // with a shimmer so the dust never settles while the pointer stays.
          ax += (dx / d) * f2 * 2400 + p.vx * f2 * 2.2;
          ay += (dy / d) * f2 * 2400 + p.vy * f2 * 2.2 - f2 * 420;
          ax += Math.sin(t * 7 + r * 40) * f * 900;
          ay += Math.cos(t * 6 + r * 53) * f * 900;
        }
      }
      let vx = (this.vx[i]! + ax * dt) * damp;
      let vy = (this.vy[i]! + ay * dt) * damp;
      x += vx * dt;
      y += vy * dt;
      const disp = Math.abs(x - hx) + Math.abs(y - hy);
      if (disp > 0.15 || Math.abs(vx) + Math.abs(vy) > 0.5) moving++;
      else {
        x = hx;
        y = hy;
        vx = 0;
        vy = 0;
      }
      this.vx[i] = vx;
      this.vy[i] = vy;
      st[o] = x;
      st[o + 1] = y;
      st[o + 2] = disp;
    }
    return moving === 0 && !active;
  }

  private draw() {
    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!this.n) return;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.program);
    gl.uniform2f(this.loc.uRes!, this.width, this.height);
    gl.uniform1f(this.loc.uBleed!, this.bleed);
    gl.uniform1f(this.loc.uSize!, this.spacing + 1 / this.dpr);
    gl.uniform1f(this.loc.uDpr!, this.dpr);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.stateBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.state);
    gl.enableVertexAttribArray(this.aState);
    gl.vertexAttribPointer(this.aState, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.randBuffer);
    gl.enableVertexAttribArray(this.aRand);
    gl.vertexAttribPointer(this.aRand, 1, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.coverBuffer);
    gl.enableVertexAttribArray(this.aCover);
    gl.vertexAttribPointer(this.aCover, 1, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, this.n);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.awake = false;
    this.visible = false;
    const gl = this.gl;
    gl.deleteBuffer(this.stateBuffer);
    gl.deleteBuffer(this.randBuffer);
    gl.deleteBuffer(this.coverBuffer);
    gl.deleteProgram(this.program);
  }
}
