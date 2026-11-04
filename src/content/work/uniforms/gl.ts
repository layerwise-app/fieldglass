// A tiny WebGL 1 renderer for fragment-shader sketches, plus the plain-language
// rewrites of compiler errors that the Uniforms case study is about.
import { HEADER, HEADER_LINES } from './shaders';

const VERTEX = `attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

type Program = {
  program: WebGLProgram;
  time: WebGLUniformLocation | null;
  resolution: WebGLUniformLocation | null;
  mouse: WebGLUniformLocation | null;
};

export type CompileResult = { ok: true } | { ok: false; log: string };

export type Renderer = {
  compile(code: string): CompileResult;
  draw(time: number, mouse: readonly [number, number]): void;
  hasProgram(): boolean;
  destroy(): void;
};

export function createRenderer(canvas: HTMLCanvasElement): Renderer | null {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: true,
    powerPreference: 'low-power'
  });
  if (!gl) return null;

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );

  const vertex = gl.createShader(gl.VERTEX_SHADER)!;
  gl.shaderSource(vertex, VERTEX);
  gl.compileShader(vertex);

  let current: Program | null = null;

  return {
    compile(code) {
      const fragment = gl.createShader(gl.FRAGMENT_SHADER);
      if (!fragment) return { ok: false, log: 'ERROR: 0:0: context lost' };
      gl.shaderSource(fragment, HEADER + code);
      gl.compileShader(fragment);
      if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(fragment) ?? '';
        gl.deleteShader(fragment);
        return { ok: false, log };
      }
      const program = gl.createProgram()!;
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.bindAttribLocation(program, 0, 'p');
      gl.linkProgram(program);
      gl.detachShader(program, fragment);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(program) ?? '';
        gl.deleteProgram(program);
        return { ok: false, log };
      }
      if (current) gl.deleteProgram(current.program);
      current = {
        program,
        time: gl.getUniformLocation(program, 'u_time'),
        resolution: gl.getUniformLocation(program, 'u_resolution'),
        mouse: gl.getUniformLocation(program, 'u_mouse')
      };
      return { ok: true };
    },
    draw(time, mouse) {
      if (!current) return;
      const { width, height } = canvas;
      gl.viewport(0, 0, width, height);
      gl.useProgram(current.program);
      gl.uniform1f(current.time, time);
      gl.uniform2f(current.resolution, width, height);
      gl.uniform2f(current.mouse, mouse[0], mouse[1]);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    hasProgram: () => current !== null,
    destroy() {
      if (current) gl.deleteProgram(current.program);
      gl.deleteShader(vertex);
      gl.deleteBuffer(buffer);
      current = null;
    }
  };
}

export type Explained = {
  /** Line in the student's code, starting at 1. */
  line: number;
  title: string;
  hint: string;
  raw: string;
};

/**
 * Rewrites the first compiler error in plain language. Later errors are
 * almost always echoes of the first, so only one is ever shown.
 */
export function explainError(log: string, code: string): Explained {
  const first =
    log
      .split('\n')
      .map((l) => l.trim())
      .find((l) => l.startsWith('ERROR')) ?? log.trim();
  const match = /ERROR:\s*\d+:(\d+):\s*'([^']*)'\s*:\s*(.*)$/.exec(first);
  const lines = code.split('\n');
  const rawLine = match ? Number(match[1]) - HEADER_LINES : 1;
  const line = Math.min(Math.max(rawLine, 1), Math.max(lines.length, 1));
  const token = match?.[2] ?? '';
  const message = (match?.[3] ?? first).toLowerCase();
  const raw = first;

  if (message.includes('undeclared identifier')) {
    const near = closestName(token, code);
    return {
      line,
      raw,
      title: `“${token}” doesn’t exist yet`,
      hint: near
        ? `Did you mean “${near}”? Names have to match exactly, letter for letter.`
        : `Create it on an earlier line before you use it, like float ${token} = 0.0;`
    };
  }
  if (
    /int/.test(message) &&
    /float/.test(message) &&
    (message.includes('wrong operand types') ||
      message.includes('cannot convert'))
  ) {
    const whole = /(?<![\w.])(\d+)(?![\w.])/.exec(lines[line - 1] ?? '')?.[1];
    return {
      line,
      raw,
      title: 'GLSL wants decimals here',
      hint: whole
        ? `Write ${whole}.0 instead of ${whole}. A number that meets a float needs a decimal point.`
        : 'Add .0 to whole numbers. A number that meets a float needs a decimal point.'
    };
  }
  if (message.includes('not enough data') || message.includes('too many arguments')) {
    return {
      line,
      raw,
      title:
        token === 'constructor'
          ? 'This vector has the wrong number of values'
          : `${token}() has the wrong number of values`,
      hint: 'vec2 takes two numbers, vec3 three, vec4 four. Check the type or the values in the brackets.'
    };
  }
  if (message.includes('cannot convert')) {
    const sizes = [...message.matchAll(/(\d)-component vector/g)].map((m) => m[1]);
    return {
      line,
      raw,
      title: 'The types on both sides don’t match',
      hint:
        sizes.length === 2
          ? `You’re putting a vec${sizes[0]} where a vec${sizes[1]} goes. gl_FragColor needs four values: vec4(colour, 1.0).`
          : 'Both sides of = need the same type, like vec3 = vec3.'
    };
  }
  if (message.includes('no matching overloaded function')) {
    return {
      line,
      raw,
      title: `${token}() can’t take these values`,
      hint: 'Check how many values you passed, and that whole numbers have a decimal point.'
    };
  }
  if (message.includes('redefinition')) {
    return {
      line,
      raw,
      title: `“${token}” is already taken`,
      hint: 'Give it a different name. Built-in names like dot and length are taken too.'
    };
  }
  if (message.includes('syntax error')) {
    const previous = Math.max(1, line - 1);
    const missingSemicolon =
      line > 1 && !/[;{}]\s*$/.test(lines[previous - 1]?.replace(/\/\/.*$/, '') ?? '');
    if (missingSemicolon) {
      return {
        line: previous,
        raw,
        title: 'This line needs a semicolon',
        hint: 'Every statement ends with ; so the shader knows where the next one starts.'
      };
    }
    return {
      line,
      raw,
      title: token ? `Something’s missing before “${token}”` : 'A bracket isn’t closed',
      hint: 'Look for a missing ; at the end of a line, or a ( or { without its partner.'
    };
  }
  if (message.includes('main')) {
    return {
      line,
      raw,
      title: 'The shader needs a main()',
      hint: 'Every sketch runs void main() { … } once for each pixel.'
    };
  }
  return {
    line,
    raw,
    title: 'The shader didn’t compile here',
    hint: first.replace(/^ERROR:\s*\d+:\d+:\s*/, '')
  };
}

/** A declared name within two edits of `name`, for spelling hints. */
function closestName(name: string, code: string): string | null {
  const declared = new Set(['u_time', 'u_mouse', 'u_resolution', 'gl_FragCoord', 'gl_FragColor']);
  for (const match of code.matchAll(/\b(?:float|int|bool|vec[234]|mat[234])\s+([A-Za-z_]\w*)/g)) {
    declared.add(match[1]!);
  }
  let best: string | null = null;
  let bestDistance = 3;
  for (const candidate of declared) {
    const distance = editDistance(name.toLowerCase(), candidate.toLowerCase());
    if (distance > 0 && distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length]!;
}

let shared: { canvas: HTMLCanvasElement; renderer: Renderer } | null = null;

/**
 * Paints a sketch into a 2D canvas using one shared WebGL context, so a page
 * of thumbnails doesn't run out of contexts. Used by the still screens.
 */
export function paintShader(
  target: HTMLCanvasElement,
  code: string,
  time: number,
  mouse: readonly [number, number] = [0.5, 0.5]
): boolean {
  if (!shared) {
    const canvas = document.createElement('canvas');
    const renderer = createRenderer(canvas);
    if (!renderer) return false;
    shared = { canvas, renderer };
  }
  shared.canvas.width = target.width;
  shared.canvas.height = target.height;
  const result = shared.renderer.compile(code);
  if (!result.ok) {
    console.error(result.log);
    return false;
  }
  shared.renderer.draw(time, mouse);
  const context = target.getContext('2d');
  if (!context) return false;
  context.drawImage(shared.canvas, 0, 0);
  return true;
}
