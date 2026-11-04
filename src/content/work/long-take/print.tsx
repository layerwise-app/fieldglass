import type { CSSProperties, ReactNode } from 'react';
import { contents, essay, type Issue } from './copy';
import { credits, font, lt, masthead } from './palette';
import { Still } from './scenes';

/* The printed magazine: 230 × 300 mm, drawn at 2 px per mm. */
export const PAGE_W = 460;
export const PAGE_H = 600;

const ratioLabel = (r: number) => `${r.toFixed(2)}:1`;

function Scaled({
  width,
  base,
  baseHeight,
  children,
  style
}: {
  width: number;
  base: number;
  baseHeight: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const s = width / base;
  return (
    <div style={{ width, height: baseHeight * s, position: 'relative', ...style }}>
      <div
        style={{
          width: base,
          height: baseHeight,
          transform: `scale(${s})`,
          transformOrigin: '0 0',
          position: 'absolute',
          inset: 0
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** The masthead, set to fill its measure exactly. */
export function Masthead({
  width,
  height,
  color = lt.ink
}: {
  width: number;
  height: number;
  color?: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-label='Long Take'
      role='img'
      style={{ display: 'block' }}
    >
      <text
        x='0'
        y={height * 0.93}
        textLength={width}
        lengthAdjust='spacingAndGlyphs'
        fill={color}
        style={{
          ...masthead,
          fontSize: height * 1.18,
          fontVariationSettings: "'wdth' 75, 'wght' 700"
        }}
      >
        LONG TAKE
      </text>
    </svg>
  );
}

export function Barcode({
  seed,
  width = 44,
  height = 22,
  color = lt.ink
}: {
  seed: number;
  width?: number;
  height?: number;
  color?: string;
}) {
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  let s = seed * 9301 + 49297;
  while (x < width - 2) {
    s = (s * 9301 + 49297) % 233280;
    const w = 0.6 + (s / 233280) * 1.8;
    bars.push({ x, w });
    s = (s * 9301 + 49297) % 233280;
    x += w + 0.6 + (s / 233280) * 1.4;
  }
  return (
    <svg width={width} height={height + 7} aria-hidden style={{ display: 'block', overflow: 'visible' }}>
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={i % 11 === 0 ? height + 2 : height} fill={color} />
      ))}
      <text x={0} y={height + 7} fill={color} textLength={width} lengthAdjust='spacingAndGlyphs' style={{ fontFamily: font.pixel, fontSize: 5.5 }}>
        977203 {String(5600 + seed).padStart(4, '0')}
      </text>
    </svg>
  );
}

/** A cover at its print size (460 × 600). */
export function CoverArt({ issue }: { issue: Issue }) {
  const stillW = PAGE_W - 44;
  return (
    <div
      style={{
        width: PAGE_W,
        height: PAGE_H,
        background: lt.paper,
        position: 'relative',
        color: lt.ink,
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'absolute', left: 22, top: 22 }}>
        <Masthead width={stillW} height={86} />
      </div>
      <div style={{ position: 'absolute', left: 22, right: 22, top: 118, height: 1, background: lt.ink }} />
      <div
        style={{
          position: 'absolute',
          left: 22,
          right: 22,
          top: 125,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: font.pixel,
          fontSize: 9,
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}
      >
        <span style={{ background: lt.oxblood, color: lt.paper, padding: '2px 5px 1px' }}>N°{issue.number}</span>
        <span>Film quarterly</span>
        <span>{issue.season}</span>
        <span>€14</span>
      </div>
      <div style={{ position: 'absolute', left: 22, top: 152 }}>
        <Still scene={issue.scene} ratio={issue.ratio} width={stillW} t={issue.t} duo={issue.duo} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 6,
            fontSize: 8.5,
            ...credits
          }}
        >
          <span>{issue.film}</span>
          <span style={{ fontFamily: font.pixel, fontWeight: 400, fontStretch: '100%', letterSpacing: '0.02em' }}>
            {ratioLabel(issue.ratio)}
          </span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 22, right: 22, bottom: 22 }}>
        <div
          style={{
            fontFamily: font.serif,
            fontSize: 70,
            lineHeight: 0.9,
            letterSpacing: '-0.02em'
          }}
        >
          {issue.theme}
        </div>
        <div
          style={{
            marginTop: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 16
          }}
        >
          <div style={{ fontFamily: font.serif, fontStyle: 'italic', fontSize: 15, lineHeight: 1.15, maxWidth: 300 }}>
            {issue.line}
          </div>
          <Barcode seed={issue.number} />
        </div>
      </div>
    </div>
  );
}

export function Cover({ issue, width, style }: { issue: Issue; width: number; style?: CSSProperties }) {
  return (
    <Scaled width={width} base={PAGE_W} baseHeight={PAGE_H} style={style}>
      <CoverArt issue={issue} />
    </Scaled>
  );
}

/** A spine, lying flat: the magazine on a stack. */
export function Spine({
  issue,
  length,
  thickness = 30
}: {
  issue: Issue;
  length: number;
  thickness?: number;
}) {
  return (
    <div
      style={{
        width: length,
        height: thickness,
        background: lt.paper,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '0 14px 0 0',
        color: lt.ink,
        boxShadow: 'inset 0 -1px 0 rgba(0,0,0,.08), inset 0 1px 0 rgba(255,255,255,.6)'
      }}
    >
      <div style={{ width: 10, alignSelf: 'stretch', background: issue.duo?.[0] ?? lt.oxblood }} />
      <span style={{ ...credits, fontWeight: 700, fontSize: thickness * 0.5, letterSpacing: '0.01em' }}>Long Take</span>
      <span style={{ fontFamily: font.pixel, fontSize: thickness * 0.32, textTransform: 'uppercase' }}>N°{issue.number}</span>
      <span style={{ fontFamily: font.serif, fontSize: thickness * 0.55, marginLeft: 'auto' }}>{issue.theme}</span>
      <span style={{ fontFamily: font.pixel, fontSize: thickness * 0.3, textTransform: 'uppercase', color: lt.grey }}>
        {issue.season}
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* The essay spread: two pages, 600 × 782 each. Picture boxes are the text */
/* width or one column wide, at 1.37, 1.85 or 2.39.                        */

export const SPREAD_PAGE_W = 600;
export const SPREAD_PAGE_H = 782;

function RunningHead({ left, right }: { left: string; right: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: font.pixel,
        fontSize: 8,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: lt.inkSoft
      }}
    >
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );
}

function Caption({ tc, children, width }: { tc: string; children: ReactNode; width?: number | string }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 6, width, alignItems: 'baseline' }}>
      <span style={{ fontFamily: font.pixel, fontSize: 7.5, color: lt.oxblood, whiteSpace: 'nowrap' }}>{tc}</span>
      <span style={{ ...credits, fontSize: 7.5, fontWeight: 500, color: lt.inkSoft, lineHeight: 1.35 }}>{children}</span>
    </div>
  );
}

const bodyStyle: CSSProperties = {
  fontFamily: font.serif,
  fontSize: 11.2,
  lineHeight: 1.42,
  color: lt.ink,
  hyphens: 'auto',
  textAlign: 'left'
};

export function Spread() {
  const pad = { top: 40, outer: 40, inner: 46, bottom: 44 };
  const measure = SPREAD_PAGE_W - pad.outer - pad.inner;
  const col = (measure - 20) / 2;
  return (
    <div
      style={{
        width: SPREAD_PAGE_W * 2,
        height: SPREAD_PAGE_H,
        display: 'flex',
        position: 'relative',
        boxShadow: '0 40px 80px -40px rgba(20,10,8,.55), 0 10px 20px -10px rgba(20,10,8,.35)'
      }}
    >
      {/* Left page: the opener. */}
      <div
        style={{
          width: SPREAD_PAGE_W,
          height: SPREAD_PAGE_H,
          background: lt.paper,
          padding: `${pad.top}px ${pad.inner}px ${pad.bottom}px ${pad.outer}px`,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <RunningHead left='Long Take N°14 — Duration' right='08' />
        <div style={{ marginTop: 34, display: 'flex', gap: 10, alignItems: 'baseline' }}>
          <span style={{ ...credits, fontSize: 10, color: lt.oxblood }}>Essay</span>
          <span style={{ fontFamily: font.pixel, fontSize: 8, color: lt.inkSoft }}>11′04″ / ONE SHOT</span>
        </div>
        <div style={{ fontFamily: font.serif, fontSize: 70, lineHeight: 0.92, letterSpacing: '-0.02em', marginTop: 10 }}>
          The road
          <br />
          doesn’t cut
        </div>
        <p style={{ fontFamily: font.serif, fontStyle: 'italic', fontSize: 16, lineHeight: 1.3, marginTop: 18, maxWidth: 420, color: lt.inkSoft }}>
          {essay.standfirst}
        </p>
        <div style={{ ...credits, fontSize: 9, marginTop: 14 }}>Words Mathis Okafor — Stills courtesy Cinémathèque du Nord</div>
        <div style={{ marginTop: 'auto' }}>
          <Still scene='coast' ratio={1.37} width={measure} t={0.2} />
          <Caption tc='01:35:06'>Kustweg, Agnès Verhulst, 1991. 35mm, 1.37:1. The walker enters, two minutes and forty-eight seconds into the take.</Caption>
        </div>
      </div>
      {/* Gutter shadow. */}
      <div
        style={{
          position: 'absolute',
          left: SPREAD_PAGE_W - 40,
          top: 0,
          width: 80,
          height: '100%',
          background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(60,40,20,.16) 48%, rgba(60,40,20,.2) 50%, rgba(60,40,20,.1) 52%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />
      {/* Right page: running text with a 2.39 and a 1.85 box. */}
      <div
        style={{
          width: SPREAD_PAGE_W,
          height: SPREAD_PAGE_H,
          background: lt.paper,
          padding: `${pad.top}px ${pad.outer}px ${pad.bottom}px ${pad.inner}px`,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        <RunningHead left='The road doesn’t cut' right='09' />
        <div style={{ display: 'flex', gap: 20, marginTop: 34 }}>
          <div style={{ width: col }}>
            <p style={bodyStyle}>
              <span style={{ fontSize: 34, lineHeight: 0.8, float: 'left', marginRight: 4, marginTop: 4, color: lt.oxblood }}>F</span>
              {essay.body[0].slice(1)}
            </p>
            <p style={{ ...bodyStyle, textIndent: 14 }}>{essay.body[1]}</p>
          </div>
          <div style={{ width: col }}>
            <p style={bodyStyle}>{essay.body[2]}</p>
            <div
              style={{
                fontFamily: font.serif,
                fontStyle: 'italic',
                fontSize: 21,
                lineHeight: 1.12,
                color: lt.oxblood,
                margin: '14px 0',
                borderTop: `1px solid ${lt.oxblood}`,
                paddingTop: 10
              }}
            >
              {essay.pull}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Still scene='tram' ratio={2.39} width={measure} />
          <Caption tc='00:41:12'>Tram 81, Lieve Martens, 2016. Anamorphic, 2.39:1. Shown in the essay for contrast: a long take that never leaves the window.</Caption>
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 16, flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <div style={{ width: col }}>
            <Still scene='corridor' ratio={1.85} width={col} />
            <Caption tc='00:12:40'>Corridor Light, Tamás Rideg, 2004. 1.85:1. Rideg’s corridor holds for six minutes; Verhulst’s road for eleven.</Caption>
            <p style={{ ...bodyStyle, marginTop: 12 }}>
              Okafor’s fortieth viewing was at the Cinémathèque du Nord in March, on the restored print. Nobody left during the take. Two people left during the credits.
            </p>
          </div>
          <div style={{ width: col }}>
            <p style={{ ...bodyStyle, margin: 0 }}>{essay.body[3]}</p>
            <p
              style={{
                ...bodyStyle,
                textIndent: 14,
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 7,
                overflow: 'hidden'
              }}
            >
              {essay.body[4]}
            </p>
          </div>
        </div>
        <div style={{ position: 'absolute', right: pad.outer, bottom: 22, fontFamily: font.pixel, fontSize: 7.5, color: lt.oxblood }}>
          CONTINUES ON 10 →
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------- */

export function ContentsPage() {
  return (
    <div
      style={{
        width: 620,
        height: 808,
        background: lt.paper,
        padding: '40px 40px 36px',
        color: lt.ink,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <RunningHead left='Long Take N°14' right='Autumn 2023' />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 30 }}>
        <div style={{ fontFamily: font.serif, fontSize: 84, lineHeight: 0.85, letterSpacing: '-0.02em' }}>Duration</div>
        <div style={{ fontFamily: font.pixel, fontSize: 9, textAlign: 'right', lineHeight: 1.5, color: lt.inkSoft }}>
          CONTENTS
          <br />
          96 PAGES
        </div>
      </div>
      <div style={{ height: 1, background: lt.ink, marginTop: 18 }} />
      <div style={{ marginTop: 4 }}>
        {contents.map((item) => (
          <div
            key={item.page}
            style={{
              display: 'grid',
              gridTemplateColumns: '38px 1fr 120px',
              gap: 14,
              alignItems: 'start',
              padding: '11px 0 10px',
              borderBottom: `1px solid ${lt.rule}`,
              minHeight: 64
            }}
          >
            <span style={{ fontFamily: font.pixel, fontSize: 11, color: lt.oxblood, paddingTop: 4 }}>{item.page}</span>
            <div>
              <div style={{ fontFamily: font.serif, fontSize: 25, lineHeight: 1.02 }}>{item.title}</div>
              <div style={{ ...credits, fontSize: 9, marginTop: 5, color: lt.inkSoft }}>{item.who}</div>
            </div>
            {item.film ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 3 }}>
                <Still scene={item.film.scene} ratio={item.film.ratio} t={item.film.t} width={item.film.ratio > 2 ? 120 : item.film.ratio > 1.5 ? 100 : 74} grain={false} />
              </div>
            ) : (
              <span />
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ ...credits, fontSize: 8, lineHeight: 1.6, color: lt.inkSoft, maxWidth: 330 }}>
          Editor Hanne Claes — Pictures Yusuf Demir — Art direction Noor Haddad — Printed by Drukkerij Van Aert, Ghent, on 100 g uncoated paper
        </div>
        <Masthead width={150} height={30} />
      </div>
    </div>
  );
}
