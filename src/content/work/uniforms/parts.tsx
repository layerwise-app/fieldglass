// Static pieces of the Uniforms product, composed into the case-study screens.
import type { CSSProperties, ReactNode } from 'react';
import { presets, sketches } from './shaders';
import { CodeLine, Mark, Pixel, ShaderImage, Wordmark, uf } from './ui';

const stripes = presets[0]!;

export const lessons = [
  'A colour is four numbers',
  'uv: where am I?',
  'Mixing two colours',
  'Stripes are just sin()',
  'Circles are distance',
  'Grids with fract()',
  'Moving with u_time',
  'Your own sketch'
];

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

export type Scrub = {
  line: number;
  index: number;
  label: string;
  min: number;
  max: number;
  value: number;
};

export type HistoryItem = {
  label: string;
  code: string;
  time: number;
  state?: 'current' | 'broken';
};

export type InlineError = {
  line: number;
  title: string;
  hint: string;
  raw: string;
};

function StatusPill({ error }: { error: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 13px 6px 11px',
        borderRadius: 999,
        background: error ? uf.coralSoft : uf.white,
        boxShadow: `inset 0 0 0 1px ${error ? '#F6C3B9' : uf.line}`
      }}
    >
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          background: error ? uf.coral : uf.blue
        }}
      />
      <Pixel color={error ? uf.coralDeep : uf.body}>
        {error ? '1 thing to fix · line 4' : 'Compiled in 3 ms'}
      </Pixel>
    </span>
  );
}

function Button({
  children,
  dark,
  style
}: {
  children: ReactNode;
  dark?: boolean;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 36,
        padding: '0 15px',
        borderRadius: 10,
        fontFamily: uf.sans,
        fontSize: 14,
        fontWeight: 500,
        background: dark ? uf.ink : 'transparent',
        color: dark ? uf.white : uf.body,
        boxShadow: dark ? 'none' : `inset 0 0 0 1px ${uf.line}`,
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {children}
    </span>
  );
}

function ScrubPopover({ scrub }: { scrub: Scrub }) {
  const frac = (scrub.value - scrub.min) / (scrub.max - scrub.min);
  const ticks = Array.from({ length: 41 }, (_, i) => i);
  return (
    <span
      style={{
        position: 'absolute',
        bottom: 'calc(100% + 12px)',
        left: '50%',
        transform: 'translateX(-34%)',
        width: 300,
        padding: '12px 14px 12px',
        borderRadius: 12,
        background: uf.ink,
        color: uf.white,
        boxShadow: '0 18px 40px -12px rgba(23,23,26,.45)',
        zIndex: 5,
        whiteSpace: 'normal',
        textDecoration: 'none'
      }}
    >
      <span style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Pixel color='#B9BCFF'>{scrub.label}</Pixel>
        <Pixel color='#9A9AA2'>Drag ← →</Pixel>
      </span>
      <svg width='272' height='30' viewBox='0 0 272 30' style={{ display: 'block', marginTop: 10 }}>
        {ticks.map((i) => (
          <line
            key={i}
            x1={i * 6.8}
            x2={i * 6.8}
            y1={i % 5 === 0 ? 8 : 14}
            y2={22}
            stroke={i / 40 <= frac ? '#8D97FF' : '#4A4A52'}
            strokeWidth='1.2'
          />
        ))}
        <rect x={frac * 272 - 2} y='2' width='4' height='26' rx='2' fill={uf.blue} />
        <circle cx={frac * 272} cy='2' r='3' fill={uf.blue} />
      </svg>
      <span style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <Pixel color='#7C7C85'>{scrub.min.toFixed(1)}</Pixel>
        <Pixel color={uf.white}>{scrub.value.toFixed(1)}</Pixel>
        <Pixel color='#7C7C85'>{scrub.max.toFixed(1)}</Pixel>
      </span>
      <span
        style={{
          position: 'absolute',
          left: '34%',
          bottom: -6,
          width: 12,
          height: 12,
          background: uf.ink,
          transform: 'translateX(-50%) rotate(45deg)',
          borderRadius: 2
        }}
      />
    </span>
  );
}

function InlineErrorCard({ error }: { error: InlineError }) {
  return (
    <div
      style={{
        margin: '6px 16px 10px 0',
        padding: '14px 16px 14px 16px',
        borderRadius: 12,
        background: uf.white,
        boxShadow: `inset 0 0 0 1px #F6C3B9, inset 3px 0 0 ${uf.coral}, 0 10px 24px -14px rgba(184,57,42,.35)`,
        fontFamily: uf.sans,
        whiteSpace: 'normal'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <Pixel color={uf.coralDeep}>Line {error.line}</Pixel>
        <span style={{ fontSize: 17, fontWeight: 600, color: uf.ink, letterSpacing: '-0.01em' }}>
          {error.title}
        </span>
      </div>
      <p style={{ margin: '6px 0 0', fontSize: 15, lineHeight: 1.45, color: uf.body, maxWidth: 520 }}>
        {error.hint}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <Button dark style={{ height: 32, fontSize: 13 }}>
          Fix it for me
        </Button>
        <Button style={{ height: 32, fontSize: 13 }}>Why decimals?</Button>
        <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
          <Pixel color={uf.faint}>{error.raw}</Pixel>
        </span>
      </div>
    </div>
  );
}

function CodePanel({
  code,
  width,
  height,
  scrub,
  error,
  tabs = true,
  note,
  history
}: {
  code: string;
  width: number;
  height: number;
  scrub?: Scrub;
  error?: InlineError;
  tabs?: boolean;
  note?: string;
  history?: HistoryItem[];
}) {
  const lines = code.replace(/\n$/, '').split('\n');
  const rowH = 26;
  return (
    <div
      style={{
        width,
        height,
        background: uf.white,
        borderRadius: 16,
        boxShadow: `0 0 0 1px ${uf.line}`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {tabs ? (
        <div
          style={{
            height: 48,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 14px 0 10px',
            borderBottom: `1px solid ${uf.lineSoft}`
          }}
        >
          <span
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: uf.panel,
              boxShadow: `inset 0 0 0 1px ${uf.lineSoft}`
            }}
          >
            <Pixel color={uf.ink}>sketch.frag</Pixel>
          </span>
          <span style={{ padding: '6px 10px' }}>
            <Pixel color={uf.faint}>starter.frag · read only</Pixel>
          </span>
          <span style={{ marginLeft: 'auto' }}>
            <Pixel color={uf.muted}>{note ?? 'Remix of the starter · 2 changes'}</Pixel>
          </span>
        </div>
      ) : null}
      <div
        style={{
          flex: 1,
          paddingTop: 16,
          fontFamily: uf.mono,
          fontSize: 15,
          lineHeight: `${rowH}px`,
          whiteSpace: 'pre',
          position: 'relative'
        }}
      >
        {lines.map((line, i) => {
          const n = i + 1;
          const isError = error?.line === n;
          return (
            <div key={i}>
              <div
                style={{
                  display: 'flex',
                  background: isError ? uf.coralSoft : undefined,
                  boxShadow: isError ? `inset 3px 0 0 ${uf.coral}` : undefined
                }}
              >
                <span
                  style={{
                    width: 56,
                    flex: 'none',
                    textAlign: 'right',
                    paddingRight: 18,
                    color: isError ? uf.coral : uf.faint
                  }}
                >
                  {isError ? '● ' : ''}
                  {n}
                </span>
                <span style={{ flex: 1 }}>
                  <CodeLine
                    text={line}
                    decorateNumber={
                      scrub && scrub.line === n
                        ? {
                            index: scrub.index,
                            render: () => (
                              <span
                                style={{
                                  position: 'relative',
                                  color: uf.white,
                                  background: uf.blue,
                                  borderRadius: 4,
                                  boxShadow: `0 0 0 3px ${uf.blueSoft}`
                                }}
                              >
                                {scrub.value.toFixed(1)}
                                <ScrubPopover scrub={scrub} />
                              </span>
                            )
                          }
                        : undefined
                    }
                  />
                </span>
              </div>
              {isError ? (
                <div style={{ paddingLeft: 56 }}>
                  <InlineErrorCard error={error} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {history ? <HistoryStrip items={history} /> : null}
    </div>
  );
}

function HistoryStrip({ items }: { items: HistoryItem[] }) {
  return (
    <div style={{ borderTop: `1px solid ${uf.lineSoft}`, padding: '14px 18px 16px', background: '#FBFBF9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <Pixel color={uf.ink}>History · {items.length + 6} saves</Pixel>
        <Pixel color={uf.faint}>Every save is a sketch you can go back to</Pixel>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {items.map((item) => {
          const ring =
            item.state === 'current'
              ? `0 0 0 2px ${uf.blue}`
              : item.state === 'broken'
                ? `0 0 0 2px ${uf.coral}`
                : `0 0 0 1px ${uf.line}`;
          return (
            <div key={item.label} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: ring }}>
                <ShaderImage code={item.code} width={84} height={52} time={item.time} style={{ width: '100%', height: 52 }} />
              </div>
              <div style={{ marginTop: 7 }}>
                <Pixel color={item.state === 'broken' ? uf.coralDeep : item.state === 'current' ? uf.blue : uf.muted}>
                  {item.label}
                </Pixel>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Badge({ children, error }: { children: ReactNode; error?: boolean }) {
  return (
    <span
      style={{
        position: 'absolute',
        left: 14,
        top: 14,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '5px 11px 5px 9px',
        borderRadius: 999,
        background: 'rgba(255,255,255,.94)'
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: 4, background: error ? uf.coral : uf.blue }} />
      <Pixel color={uf.ink}>{children}</Pixel>
    </span>
  );
}

function UniformsPanel({ width, values }: { width: number; values: [string, string, string] }) {
  const rows: [string, string, number][] = [
    ['u_time', values[0], 0.62],
    ['u_mouse', values[1], 0.41],
    ['u_resolution', values[2], 1]
  ];
  return (
    <div
      style={{
        width,
        padding: '14px 18px 16px',
        borderRadius: 16,
        background: uf.panel,
        boxShadow: `inset 0 0 0 1px ${uf.line}`
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Pixel>Uniforms</Pixel>
        <Pixel color={uf.faint}>Live · every sketch gets these</Pixel>
      </div>
      {rows.map(([name, value, bar]) => (
        <div
          key={name}
          style={{
            display: 'grid',
            gridTemplateColumns: '130px 1fr auto',
            alignItems: 'center',
            gap: 14,
            height: 28,
            fontFamily: uf.mono,
            fontSize: 15
          }}
        >
          <span style={{ color: uf.blueDeep }}>{name}</span>
          <span style={{ height: 3, borderRadius: 2, background: uf.lineSoft, position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${bar * 100}%`,
                borderRadius: 2,
                background: name === 'u_resolution' ? uf.line : uf.blue
              }}
            />
          </span>
          <span style={{ color: uf.ink, textAlign: 'right', minWidth: 110 }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function TaskCard({ width, height }: { width: number; height: number }) {
  const tasks: [string, boolean][] = [
    ['Get eight stripes across the preview', true],
    ['Make them move with u_time', true],
    ['Make them thinner, not more', false],
    ['Remix: turn them diagonal', false]
  ];
  return (
    <div
      style={{
        width,
        height,
        padding: '16px 18px',
        borderRadius: 16,
        background: uf.white,
        boxShadow: `0 0 0 1px ${uf.line}`,
        overflow: 'hidden',
        fontFamily: uf.sans
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Pixel color={uf.blue}>Your turn · 3 of 4</Pixel>
        <Pixel color={uf.faint}>Hint available</Pixel>
      </div>
      <p style={{ margin: '8px 0 12px', fontSize: 18, lineHeight: 1.3, fontWeight: 600, letterSpacing: '-0.015em', color: uf.ink }}>
        Make the stripes thinner without adding more.
      </p>
      <div style={{ display: 'grid', gap: 7 }}>
        {tasks.map(([label, done]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: done ? uf.muted : uf.body }}>
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 5,
                flex: 'none',
                background: done ? uf.blue : uf.white,
                boxShadow: done ? 'none' : `inset 0 0 0 1.5px ${uf.line}`,
                display: 'grid',
                placeItems: 'center'
              }}
            >
              {done ? (
                <svg width='10' height='10' viewBox='0 0 10 10' aria-hidden>
                  <path d='M2 5.2 4.1 7.3 8 2.8' stroke='#fff' strokeWidth='1.6' fill='none' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              ) : null}
            </span>
            <span style={{ textDecoration: done ? 'line-through' : 'none', textDecorationColor: uf.faint }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Sidebar({ height, current = 4 }: { height: number; current?: number }) {
  return (
    <div
      style={{
        width: 248,
        height,
        flex: 'none',
        background: uf.paper,
        borderRight: `1px solid ${uf.line}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 16px 18px',
        fontFamily: uf.sans
      }}
    >
      <div style={{ padding: '0 8px' }}>
        <Wordmark size={19} />
      </div>
      <div style={{ padding: '26px 8px 12px' }}>
        <Pixel>Light &amp; Number</Pixel>
        <div style={{ fontSize: 13, color: uf.muted, marginTop: 2 }}>Kade School of Interaction · K1-B</div>
      </div>
      <div style={{ display: 'grid', gap: 2 }}>
        {lessons.map((title, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          return (
            <div
              key={title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                height: 36,
                padding: '0 8px',
                borderRadius: 9,
                background: active ? uf.white : 'transparent',
                boxShadow: active ? `0 0 0 1px ${uf.line}` : 'none',
                color: active ? uf.ink : done ? uf.body : uf.muted,
                fontSize: 14,
                fontWeight: active ? 600 : 400
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  flex: 'none',
                  display: 'grid',
                  placeItems: 'center',
                  background: done ? uf.blue : 'transparent',
                  boxShadow: done ? 'none' : `inset 0 0 0 1.5px ${active ? uf.blue : uf.line}`
                }}
              >
                {done ? (
                  <svg width='10' height='10' viewBox='0 0 10 10' aria-hidden>
                    <path d='M2 5.2 4.1 7.3 8 2.8' stroke='#fff' strokeWidth='1.6' fill='none' strokeLinecap='round' strokeLinejoin='round' />
                  </svg>
                ) : active ? (
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: uf.blue }} />
                ) : null}
              </span>
              <span style={{ fontFamily: uf.mono, fontSize: 11, color: uf.faint, width: 14 }}>{n}</span>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 10px',
          borderRadius: 12,
          background: uf.panel,
          boxShadow: `inset 0 0 0 1px ${uf.line}`
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            background: uf.blueSoft,
            color: uf.blueDeep,
            display: 'grid',
            placeItems: 'center',
            fontSize: 12,
            fontWeight: 600
          }}
        >
          YE
        </span>
        <span style={{ lineHeight: 1.25 }}>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 500, color: uf.ink }}>Yara El Amrani</span>
          <span style={{ fontSize: 12.5, color: uf.muted }}>14 sketches saved</span>
        </span>
      </div>
    </div>
  );
}

/** The full Uniforms editor at a given screen size. */
export function EditorUI({
  width,
  height,
  sidebar = true,
  code,
  previewCode,
  previewTime = 2.4,
  scrub,
  error,
  lessonTitle = 'Stripes are just sin()',
  uniforms = ['14.27 s', '0.62, 0.41', '976 × 704'],
  history
}: {
  width: number;
  height: number;
  sidebar?: boolean;
  code: string;
  previewCode: string;
  previewTime?: number;
  scrub?: Scrub;
  error?: InlineError;
  lessonTitle?: string;
  uniforms?: [string, string, string];
  history?: HistoryItem[];
}) {
  const sideW = sidebar ? 248 : 0;
  const bar = 64;
  const pad = 20;
  const gap = 20;
  const mainW = width - sideW;
  const avail = mainW - pad * 2 - gap;
  const rightW = Math.round(avail * 0.46);
  const codeW = avail - rightW;
  const contentH = height - bar - pad * 2;
  const previewH = Math.round(Math.min(rightW * 0.72, contentH * 0.5));
  const uniformsH = 132;
  const taskH = contentH - previewH - uniformsH - gap * 2;
  return (
    <div style={{ width, height, display: 'flex', background: uf.panel, color: uf.ink, fontFamily: uf.sans, overflow: 'hidden' }}>
      {sidebar ? <Sidebar height={height} /> : null}
      <div style={{ width: mainW, height, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            height: bar,
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: `0 ${pad}px 0 ${pad + 4}px`,
            borderBottom: `1px solid ${uf.lineSoft}`,
            background: uf.panel
          }}
        >
          {sidebar ? null : <Wordmark size={18} />}
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginLeft: sidebar ? 0 : 12 }}>
            <Pixel color={uf.muted}>Lesson 4</Pixel>
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>{lessonTitle}</span>
          </span>
          <span style={{ marginLeft: 16 }}>
            <StatusPill error={Boolean(error)} />
          </span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Pixel color={uf.faint}>Saved 12:41</Pixel>
            <Button>Reset to starter</Button>
            <Button dark>Share sketch</Button>
          </span>
        </div>
        <div style={{ display: 'flex', gap, padding: pad }}>
          <CodePanel code={code} width={codeW} height={contentH} scrub={scrub} error={error} history={history} />
          <div style={{ width: rightW, display: 'flex', flexDirection: 'column', gap }}>
            <div
              style={{
                width: rightW,
                height: previewH,
                borderRadius: 16,
                overflow: 'hidden',
                position: 'relative',
                boxShadow: `0 0 0 1px ${uf.line}`
              }}
            >
              <ShaderImage code={previewCode} width={rightW} height={previewH} time={previewTime} />
              <Badge error={Boolean(error)}>{error ? 'Last working frame · 12:40:18' : 'Live · 60 fps'}</Badge>
            </div>
            <UniformsPanel width={rightW} values={uniforms} />
            {taskH > 120 ? <TaskCard width={rightW} height={taskH} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/** The editor the course used before: a generic dark one. */
export function OldEditor({ width, height, code, log }: { width: number; height: number; code: string; log: string[] }) {
  const lines = code.replace(/\n$/, '').split('\n');
  const mono = 'ui-monospace, Menlo, Consolas, monospace';
  const consoleH = 236;
  return (
    <div style={{ width, height, background: '#1C1D20', color: '#D4D4D8', fontFamily: mono, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '0 24px',
          borderBottom: '1px solid #2B2C31',
          fontSize: 14
        }}
      >
        <span style={{ fontFamily: uf.sans, fontSize: 15, fontWeight: 600, color: '#EDEDEF' }}>Shader Editor</span>
        <span style={{ color: '#7D7E86' }}>/</span>
        <span>untitled-3.frag</span>
        <span style={{ marginLeft: 'auto', color: '#7D7E86' }}>Auto-compile: off</span>
        <span
          style={{
            fontFamily: uf.sans,
            fontSize: 14,
            padding: '7px 16px',
            borderRadius: 6,
            background: '#33343A',
            color: '#EDEDEF'
          }}
        >
          Compile (Ctrl+Enter)
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flex: 1.12, padding: '18px 0', fontSize: 15, lineHeight: '26px', whiteSpace: 'pre', borderRight: '1px solid #2B2C31' }}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex' }}>
              <span style={{ width: 56, textAlign: 'right', paddingRight: 18, color: '#55565E' }}>{i + 1}</span>
              <span style={{ color: line.trim().startsWith('//') ? '#6B6C74' : '#D4D4D8' }}>{line || ' '}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 0.88, background: '#000', position: 'relative' }}>
          <span style={{ position: 'absolute', left: 16, top: 14, fontSize: 12, color: '#4B4C53' }}>output 976×704</span>
        </div>
      </div>
      <div style={{ height: consoleH, background: '#141517', borderTop: '1px solid #2B2C31', padding: '14px 24px', fontSize: 13.5, lineHeight: '23px' }}>
        <div style={{ color: '#7D7E86', marginBottom: 6 }}>Console</div>
        {log.map((line, i) => (
          <div key={i} style={{ color: i === log.length - 1 ? '#9A9BA3' : '#FF6B6B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Devices                                                             */
/* ------------------------------------------------------------------ */

/** A Chromebook-style laptop with its screen at 1366 × 768. */
export function Laptop({ width, children }: { width: number; children: ReactNode }) {
  const bezel = Math.round(width * 0.026);
  const screenW = width - bezel * 2;
  const scale = screenW / 1366;
  const screenH = Math.round(768 * scale);
  const lidH = screenH + bezel * 2 + Math.round(bezel * 0.4);
  const baseW = Math.round(width * 1.14);
  const baseH = Math.round(width * 0.03);
  return (
    <div style={{ width: baseW, position: 'relative' }}>
      <div
        style={{
          width,
          height: lidH,
          margin: '0 auto',
          borderRadius: `${Math.round(width * 0.022)}px ${Math.round(width * 0.022)}px 6px 6px`,
          background: '#1F2023',
          boxShadow: 'inset 0 0 0 1.5px #3A3B40, inset 0 2px 0 #44454B',
          padding: bezel,
          position: 'relative'
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: bezel / 2 - 3,
            left: '50%',
            width: 6,
            height: 6,
            marginLeft: -3,
            borderRadius: 3,
            background: '#0B0B0D',
            boxShadow: 'inset 0 0 0 1px #2D2E33'
          }}
        />
        <div style={{ width: screenW, height: screenH, overflow: 'hidden', borderRadius: 3, position: 'relative', background: '#000' }}>
          <div style={{ width: 1366, height: 768, transform: `scale(${scale})`, transformOrigin: '0 0' }}>{children}</div>
        </div>
      </div>
      <div
        style={{
          width: baseW,
          height: baseH,
          borderRadius: `3px 3px ${baseH}px ${baseH}px / 3px 3px ${baseH * 0.9}px ${baseH * 0.9}px`,
          background: '#3B3C41',
          boxShadow: 'inset 0 2px 0 #5A5B61, inset 0 -3px 6px rgba(0,0,0,.35)',
          position: 'relative'
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: Math.round(width * 0.13),
            height: Math.round(baseH * 0.42),
            transform: 'translateX(-50%)',
            borderRadius: '0 0 10px 10px',
            background: '#2C2D31'
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: '6%',
          right: '6%',
          bottom: -26,
          height: 30,
          borderRadius: '50%',
          background: 'rgba(8, 12, 60, 0.45)',
          filter: 'blur(18px)',
          zIndex: -1
        }}
      />
    </div>
  );
}

/** A portrait tablet with its screen at 834 × 1194. */
export function Tablet({ width, children }: { width: number; children: ReactNode }) {
  const bezel = 26;
  const outerW = 834 + bezel * 2;
  const outerH = 1194 + bezel * 2;
  const scale = width / outerW;
  return (
    <div style={{ width, height: outerH * scale, position: 'relative' }}>
      <div
        style={{
          width: outerW,
          height: outerH,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
          borderRadius: 54,
          background: '#1D1E21',
          padding: bezel,
          boxShadow: 'inset 0 0 0 2px #3A3B40, 0 60px 100px -40px rgba(10,10,30,.5), 0 20px 40px -20px rgba(10,10,30,.35)'
        }}
      >
        <div style={{ width: 834, height: 1194, borderRadius: 30, overflow: 'hidden', position: 'relative', background: uf.panel }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lesson sheet                                                        */
/* ------------------------------------------------------------------ */

function SineDiagram({ width }: { width: number }) {
  const h = 200;
  const mid = 100;
  const amp = 70;
  const cycles = 24 / (Math.PI * 2);
  const points = Array.from({ length: 401 }, (_, i) => {
    const x = (i / 400) * width;
    const y = mid - Math.sin((i / 400) * 24) * amp;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const fill = `M0,${mid} L${points.join(' L')} L${width},${mid} Z`;
  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} style={{ display: 'block', overflow: 'visible' }} aria-hidden>
      <defs>
        <clipPath id='uf-above'>
          <rect x='0' y={mid} width={width} height={h - mid} />
        </clipPath>
      </defs>
      <path d={fill} fill={uf.blueSoft} clipPath='url(#uf-above)' />
      <line x1='0' x2={width} y1={mid} y2={mid} stroke={uf.ink} strokeWidth='1' strokeDasharray='3 5' />
      <polyline points={points.join(' ')} fill='none' stroke={uf.ink} strokeWidth='2' />
      {Array.from({ length: Math.floor(cycles) + 1 }, (_, i) => (
        <line key={i} x1={(i / cycles) * width} x2={(i / cycles) * width} y1={h - 6} y2={h} stroke={uf.faint} />
      ))}
    </svg>
  );
}

export function LessonSheet() {
  const starter = [
    '// Lesson 4 — Stripes are just sin()',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / u_resolution;',
    '  float wave = sin(uv.x * ???);',
    '  float stripe = smoothstep(0.0, 0.08, wave);',
    '  gl_FragColor = vec4(vec3(stripe), 1.0);',
    '}'
  ];
  const steps = [
    ['Run the starter.', 'You’ll see one soft edge, not stripes yet. That’s the sine wave crossing zero once.'],
    ['Replace ??? with a number.', 'Drag it until you can count eight stripes. Write down the number you landed on.'],
    ['Add u_time * 2.0 inside sin().', 'The stripes start to move. Try a minus sign and see which way they go.'],
    ['Remix it.', 'Add uv.y to the x position to turn them diagonal, then save it to the class gallery.']
  ];
  const sheetW = 1200;
  const inner = sheetW - 88 * 2;
  return (
    <div style={{ width: 1440, height: 1800, background: uf.paper, position: 'relative', fontFamily: uf.sans, color: uf.ink }}>
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 100,
          width: sheetW,
          height: 1600,
          background: uf.white,
          borderRadius: 28,
          boxShadow: `0 0 0 1px ${uf.line}, 0 40px 80px -50px rgba(23,23,26,.35)`,
          padding: '64px 88px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <Wordmark size={22} />
          <Pixel size={11}>Light &amp; Number</Pixel>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 18 }}>
            <Pixel color={uf.blue}>Lesson 4 of 8</Pixel>
            <Pixel>20 min</Pixel>
          </span>
        </div>
        <div style={{ height: 1, background: uf.lineSoft, margin: '28px 0 56px' }} />
        <h2 style={{ margin: 0, fontSize: 104, lineHeight: 0.95, fontWeight: 600, letterSpacing: '-0.045em', fontStretch: '92%' }}>
          Stripes are
          <br />
          just <span style={{ fontFamily: uf.mono, fontWeight: 400, fontSize: 92, letterSpacing: '-0.02em', color: uf.blue }}>sin()</span>
        </h2>
        <p style={{ margin: '36px 0 0', maxWidth: 820, fontSize: 26, lineHeight: 1.38, color: uf.body, letterSpacing: '-0.01em' }}>
          A sine wave goes up and down forever. Feed it the x position of every pixel and it turns into stripes. Today you change
          one number at a time and watch what it does.
        </p>

        <div style={{ marginTop: 60 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <Pixel color={uf.ink}>sin(uv.x * 24.0)</Pixel>
            <Pixel>Above zero: paper · below zero: ink</Pixel>
          </div>
          <SineDiagram width={inner} />
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0 18px' }}>
            <Pixel>uv.x = 0.0</Pixel>
            <Pixel>smoothstep cuts at 0</Pixel>
            <Pixel>uv.x = 1.0</Pixel>
          </div>
          <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: `0 0 0 1px ${uf.line}` }}>
            <ShaderImage
              code={stripes.code.replace('u_time * 2.0', 'u_time * 0.0').replace('0.08', '0.02')}
              width={inner}
              height={96}
              time={0}
            />
          </div>
        </div>

        <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: '1.18fr 0.82fr', gap: 44 }}>
          <div>
            <Pixel color={uf.ink}>The starter</Pixel>
            <div
              style={{
                marginTop: 14,
                padding: '18px 0',
                borderRadius: 14,
                background: uf.panel,
                boxShadow: `inset 0 0 0 1px ${uf.lineSoft}`,
                fontFamily: uf.mono,
                fontSize: 15,
                lineHeight: '27px',
                whiteSpace: 'pre'
              }}
            >
              {starter.map((line, i) => (
                <div key={i} style={{ display: 'flex' }}>
                  <span style={{ width: 44, textAlign: 'right', paddingRight: 16, color: uf.faint }}>{i + 1}</span>
                  {line.includes('???') ? (
                    <span>
                      <CodeLine text={line.split('???')[0]!} />
                      <span
                        style={{
                          padding: '1px 6px',
                          borderRadius: 5,
                          color: uf.blue,
                          background: uf.blueSoft,
                          boxShadow: `inset 0 0 0 1.5px ${uf.blue}`,
                          borderStyle: 'dashed'
                        }}
                      >
                        ???
                      </span>
                      <CodeLine text={line.split('???')[1]!} />
                    </span>
                  ) : (
                    <CodeLine text={line} />
                  )}
                </div>
              ))}
            </div>
            <p style={{ margin: '14px 0 0', fontSize: 16, color: uf.muted }}>
              One thing is missing, and it’s marked. The rest already works.
            </p>
          </div>
          <div>
            <Pixel color={uf.ink}>Steps</Pixel>
            <div style={{ marginTop: 14, display: 'grid', gap: 18 }}>
              {steps.map(([title, body], i) => (
                <div key={title} style={{ display: 'grid', gridTemplateColumns: '30px 1fr', gap: 12 }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      boxShadow: `inset 0 0 0 1.5px ${i === 0 ? uf.blue : uf.line}`,
                      background: i === 0 ? uf.blue : 'transparent',
                      display: 'grid',
                      placeItems: 'center',
                      fontFamily: uf.mono,
                      fontSize: 11,
                      color: i === 0 ? uf.white : uf.muted
                    }}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span style={{ display: 'block', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</span>
                    <span style={{ display: 'block', fontSize: 15, lineHeight: 1.45, color: uf.body, marginTop: 3 }}>{body}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 88,
            right: 88,
            bottom: 56,
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: `1px solid ${uf.lineSoft}`,
            paddingTop: 22
          }}
        >
          <Pixel>If something breaks, the last picture stays and the line tells you what to try</Pixel>
          <Pixel color={uf.ink}>kade.school/uniforms/4</Pixel>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Teacher view                                                        */
/* ------------------------------------------------------------------ */

type Student = { name: string; status: 'done' | 'remix' | 'working' | 'stuck'; sketch?: number };

const students: Student[] = [
  { name: 'Yara', status: 'remix', sketch: 1 },
  { name: 'Daan', status: 'done', sketch: 0 },
  { name: 'Sem', status: 'stuck' },
  { name: 'Lina', status: 'done', sketch: 3 },
  { name: 'Joris', status: 'working' },
  { name: 'Aylin', status: 'remix', sketch: 5 },
  { name: 'Ruben', status: 'done', sketch: 6 },
  { name: 'Mila', status: 'working' },
  { name: 'Fenna', status: 'stuck' },
  { name: 'Tobias', status: 'stuck' },
  { name: 'Imane', status: 'done', sketch: 10 },
  { name: 'Iris', status: 'remix', sketch: 11 },
  { name: 'Bram', status: 'done', sketch: 9 },
  { name: 'Noa', status: 'working' },
  { name: 'Kenji', status: 'done', sketch: 2 },
  { name: 'Sara', status: 'done', sketch: 4 },
  { name: 'Milan', status: 'working' },
  { name: 'Zeynep', status: 'done', sketch: 7 },
  { name: 'Luuk', status: 'done', sketch: 8 },
  { name: 'Femke', status: 'remix', sketch: 0 },
  { name: 'Omar', status: 'done', sketch: 6 },
  { name: 'Esmee', status: 'working' },
  { name: 'Jesse', status: 'done', sketch: 3 },
  { name: 'Hana', status: 'done', sketch: 10 }
];

const statusLabel: Record<Student['status'], [string, string, string]> = {
  done: ['Done', uf.blue, uf.blueSoft],
  remix: ['Remixing', uf.ink, uf.lineSoft],
  working: ['Working', uf.muted, uf.panel],
  stuck: ['Needs help', uf.coralDeep, uf.coralSoft]
};

export function TeacherView() {
  const needsHelp: [string, string, string][] = [
    ['Sem B.', 'Line 4', 'GLSL wants decimals here'],
    ['Fenna D.', 'Line 6', '“colour” doesn’t exist yet'],
    ['Tobias R.', 'Line 7', 'This line needs a semicolon']
  ];
  const common: [string, number][] = [
    ['Whole numbers in float maths', 7],
    ['Missing semicolon', 5],
    ['Name not defined yet', 4],
    ['vec3 where a vec4 goes', 2]
  ];
  return (
    <div style={{ width: 834, height: 1194, padding: '30px 34px', fontFamily: uf.sans, color: uf.ink, background: uf.panel }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Wordmark size={18} />
        <Pixel color={uf.muted}>Teacher</Pixel>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: uf.blue }} />
          <Pixel color={uf.ink}>In session · 41 min</Pixel>
        </span>
      </div>
      <div style={{ marginTop: 30 }}>
        <Pixel>K1-B · Thursday 09:00–10:30 · Bas Verhoef</Pixel>
        <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.03em', marginTop: 6 }}>Lesson 4 — Stripes are just sin()</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 24 }}>
        {[
          ['21 / 24', 'have a working shader'],
          ['6 min', 'median to first frame'],
          ['3', 'need help right now']
        ].map(([value, label], i) => (
          <div key={label} style={{ padding: '16px 18px', borderRadius: 16, background: uf.white, boxShadow: `0 0 0 1px ${uf.line}` }}>
            <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.035em', color: i === 2 ? uf.coralDeep : uf.ink }}>{value}</div>
            <div style={{ fontSize: 14, color: uf.muted, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
        <div style={{ padding: '16px 18px', borderRadius: 16, background: uf.white, boxShadow: `0 0 0 1px ${uf.line}` }}>
          <Pixel color={uf.coralDeep}>Needs help</Pixel>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {needsHelp.map(([name, line, msg]) => (
              <div key={name} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottom: `1px solid ${uf.lineSoft}` }}>
                <span style={{ lineHeight: 1.3 }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 600 }}>{name}</span>
                  <span style={{ fontSize: 13.5, color: uf.body }}>
                    <span style={{ fontFamily: uf.mono, fontSize: 11, color: uf.coralDeep, marginRight: 6 }}>{line.toUpperCase()}</span>
                    {msg}
                  </span>
                </span>
                <span style={{ fontSize: 13, padding: '6px 10px', borderRadius: 8, boxShadow: `inset 0 0 0 1px ${uf.line}` }}>Open</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '16px 18px', borderRadius: 16, background: uf.white, boxShadow: `0 0 0 1px ${uf.line}` }}>
          <Pixel>Most common this lesson</Pixel>
          <div style={{ display: 'grid', gap: 11, marginTop: 14 }}>
            {common.map(([label, count], i) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: i === 0 ? uf.ink : uf.body, fontWeight: i === 0 ? 600 : 400 }}>{label}</span>
                  <span style={{ fontFamily: uf.mono, fontSize: 12 }}>{count}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: uf.lineSoft, marginTop: 5 }}>
                  <div style={{ width: `${(count / 8) * 100}%`, height: 6, borderRadius: 3, background: i === 0 ? uf.coral : uf.faint }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 13.5, fontWeight: 500, padding: '8px 12px', borderRadius: 9, background: uf.ink, color: uf.white, display: 'inline-block' }}>
            Explain decimals to the class
          </div>
        </div>
      </div>

      <div style={{ marginTop: 22, display: 'flex', justifyContent: 'space-between' }}>
        <Pixel color={uf.ink}>Class · 24</Pixel>
        <Pixel>Sorted by who needs you</Pixel>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 12 }}>
        {[...students]
          .sort((a, b) => Number(b.status === 'stuck') - Number(a.status === 'stuck'))
          .map((student) => {
            const [label, color, bg] = statusLabel[student.status];
            return (
              <div
                key={student.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 8,
                  borderRadius: 12,
                  background: uf.white,
                  boxShadow: `0 0 0 1px ${student.status === 'stuck' ? '#F6C3B9' : uf.line}`
                }}
              >
                {student.sketch !== undefined ? (
                  <span style={{ borderRadius: 7, overflow: 'hidden', flex: 'none' }}>
                    <ShaderImage code={sketches[student.sketch]!.code} width={44} height={44} time={sketches[student.sketch]!.time} scale={2.4} />
                  </span>
                ) : (
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 7,
                      flex: 'none',
                      background: student.status === 'stuck' ? uf.coralSoft : uf.panel,
                      boxShadow: `inset 0 0 0 1px ${uf.lineSoft}`,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 15,
                      fontWeight: 600,
                      color: student.status === 'stuck' ? uf.coralDeep : uf.muted
                    }}
                  >
                    {student.name[0]}
                  </span>
                )}
                <span style={{ minWidth: 0, lineHeight: 1.25 }}>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 500 }}>{student.name}</span>
                  <span style={{ display: 'inline-block', marginTop: 3, padding: '1px 6px', borderRadius: 5, background: bg }}>
                    <Pixel color={color} size={11}>
                      {label}
                    </Pixel>
                  </span>
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

const remixes = [31, 12, 9, 17, 6, 22, 14, 8, 27, 11, 19, 15];

export function Gallery() {
  const pad = 72;
  const cols = 6;
  const gap = 24;
  const tile = (1440 - pad * 2 - gap * (cols - 1)) / cols;
  return (
    <div style={{ width: 1440, height: 900, background: uf.paper, padding: `56px ${pad}px`, fontFamily: uf.sans, color: uf.ink }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Wordmark size={20} />
            <Pixel>Gallery · Light &amp; Number · Term 1</Pixel>
          </div>
          <div style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 26 }}>
            2,300 sketches, all of them remixable
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '30px 0 28px' }}>
        {['All', 'Lesson 4', 'Lesson 5', 'Lesson 6', 'Lesson 7', 'Free sketch'].map((chip, i) => (
          <span
            key={chip}
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              fontSize: 14,
              background: i === 0 ? uf.ink : 'transparent',
              color: i === 0 ? uf.white : uf.body,
              boxShadow: i === 0 ? 'none' : `inset 0 0 0 1px ${uf.line}`
            }}
          >
            {chip}
          </span>
        ))}
        <span style={{ marginLeft: 'auto' }}>
          <Pixel>Sort: most remixed</Pixel>
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, ${tile}px)`, gap: `${gap + 4}px ${gap}px` }}>
        {sketches.map((sketch, i) => (
          <div key={sketch.title}>
            <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: `0 0 0 1px ${uf.line}` }}>
              <ShaderImage code={sketch.code} width={tile} height={tile} time={sketch.time} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 11 }}>
              <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{sketch.title}</span>
              <Pixel color={uf.faint}>↻ {remixes[i]}</Pixel>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
              <span style={{ fontSize: 13, color: uf.muted }}>{sketch.student}</span>
              <Pixel color={uf.faint}>{sketch.lesson}</Pixel>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 30,
          paddingTop: 18,
          borderTop: `1px solid ${uf.line}`
        }}
      >
        <Pixel>Showing 12 of 2,300 · rendered from the students’ own code</Pixel>
        <span style={{ fontSize: 14, fontWeight: 500, padding: '8px 14px', borderRadius: 10, boxShadow: `inset 0 0 0 1px ${uf.line}` }}>
          Load 24 more
        </span>
      </div>
    </div>
  );
}

export { Mark };
