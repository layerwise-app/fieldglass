// The Uniforms brand: colours, wordmark, highlighted code and shader stills,
// shared by the live demo and the case-study screens.
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { paintShader } from './gl';

export const uf = {
  paper: '#E9E7E1',
  panel: '#F5F4F0',
  white: '#FFFFFF',
  ink: '#17171A',
  body: '#3A3A3E',
  muted: '#6C6A64',
  faint: '#A3A099',
  line: '#DAD7CF',
  lineSoft: '#E7E5DF',
  blue: '#2F45FF',
  blueDeep: '#1F2FC4',
  blueSoft: '#E4E7FF',
  coral: '#F2604B',
  coralDeep: '#B8392A',
  coralSoft: '#FDE5E0',
  sans: 'var(--fg-font-sans)',
  mono: 'var(--fg-font-pixel)'
} as const;

/** The mark: a 2×2 lattice with one live cell. */
export function Mark({ size = 20, live = uf.blue, cell = uf.ink }: { size?: number; live?: string; cell?: string }) {
  return (
    <svg width={size} height={size} viewBox='0 0 10 10' aria-hidden style={{ display: 'block', flex: 'none' }}>
      <rect x='0' y='0' width='4.4' height='4.4' rx='1.1' fill={cell} />
      <rect x='5.6' y='0' width='4.4' height='4.4' rx={2.2} fill={live} />
      <rect x='0' y='5.6' width='4.4' height='4.4' rx='1.1' fill={cell} />
      <rect x='5.6' y='5.6' width='4.4' height='4.4' rx='1.1' fill={cell} />
    </svg>
  );
}

export function Wordmark({
  size = 18,
  color = uf.ink,
  live = uf.blue
}: {
  size?: number;
  color?: string;
  live?: string;
}) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.42, color }}>
      <Mark size={size * 0.95} live={live} cell={color} />
      <span
        style={{
          fontFamily: uf.sans,
          fontWeight: 600,
          fontSize: size,
          letterSpacing: '-0.03em',
          lineHeight: 1
        }}
      >
        uniforms
      </span>
    </span>
  );
}

const KEYWORDS = new Set([
  'void',
  'float',
  'int',
  'bool',
  'vec2',
  'vec3',
  'vec4',
  'mat2',
  'uniform',
  'return',
  'if',
  'else',
  'for',
  'const'
]);
const SPECIAL = /^(u_\w+|gl_\w+)$/;

type Token = { kind: 'comment' | 'number' | 'keyword' | 'special' | 'name' | 'punct' | 'space'; text: string };

export function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /(\/\/.*$)|(\d+\.\d*|\.\d+|\d+)|([A-Za-z_]\w*)|(\s+)|([^\sA-Za-z_\d])/g;
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(line))) {
    if (m[1]) tokens.push({ kind: 'comment', text: m[1] });
    else if (m[2]) tokens.push({ kind: 'number', text: m[2] });
    else if (m[3])
      tokens.push({
        kind: KEYWORDS.has(m[3]) ? 'keyword' : SPECIAL.test(m[3]) ? 'special' : 'name',
        text: m[3]
      });
    else if (m[4]) tokens.push({ kind: 'space', text: m[4] });
    else tokens.push({ kind: 'punct', text: m[5]! });
  }
  return tokens;
}

export const tokenStyle: Record<Token['kind'], CSSProperties> = {
  comment: { color: uf.faint },
  number: { color: uf.ink, textDecoration: `underline dotted ${uf.blue}`, textUnderlineOffset: 3 },
  keyword: { color: uf.blue },
  special: { color: uf.blueDeep, background: uf.blueSoft, borderRadius: 3 },
  name: { color: uf.ink },
  punct: { color: uf.muted },
  space: {}
};

/** One line of highlighted code. `decorate` can wrap the nth number token. */
export function CodeLine({
  text,
  decorateNumber
}: {
  text: string;
  decorateNumber?: { index: number; render: (token: string) => ReactNode };
}) {
  let n = -1;
  return (
    <>
      {tokenize(text).map((token, i) => {
        if (token.kind === 'number') {
          n += 1;
          if (decorateNumber && decorateNumber.index === n) {
            return <span key={i}>{decorateNumber.render(token.text)}</span>;
          }
        }
        return (
          <span key={i} style={tokenStyle[token.kind]}>
            {token.text}
          </span>
        );
      })}
      {text.length === 0 ? ' ' : null}
    </>
  );
}

/** A sketch rendered once, at a fixed time, into a canvas. */
export function ShaderImage({
  code,
  width,
  height,
  time = 2,
  mouse = [0.5, 0.5],
  scale = 2,
  style
}: {
  code: string;
  width: number;
  height: number;
  time?: number;
  mouse?: readonly [number, number];
  scale?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) paintShader(ref.current, code, time, mouse);
  }, [code, time, mouse]);
  return (
    <canvas
      ref={ref}
      width={Math.round(width * scale)}
      height={Math.round(height * scale)}
      style={{ width, height, display: 'block', ...style }}
    />
  );
}

/** Small label set in the pixel face. */
export function Pixel({ children, color = uf.muted, size = 11, style }: { children: ReactNode; color?: string; size?: number; style?: CSSProperties }) {
  return (
    <span
      style={{
        fontFamily: uf.mono,
        fontSize: size,
        lineHeight: 1.45,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        color,
        ...style
      }}
    >
      {children}
    </span>
  );
}
