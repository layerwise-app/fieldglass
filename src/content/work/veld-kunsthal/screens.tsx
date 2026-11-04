import { Fragment, type ReactNode } from 'react';
import { BrowserFrame } from '~/components/frames';
import type { ScreenSet } from '~/content/screens';
import VeldGenerator from './demo';
import { oldSeason } from './OldPosters';
import { ArtCanvas, Poster } from './Poster';
import {
  FIELD_H,
  FIELD_W,
  PAPER,
  buildField,
  drawContours,
  drawDots,
  drawWalls,
  inField,
  inkPair,
  plan,
  season,
  type Show
} from './system';
import { GeneratorScreen, V, WebsiteScreen, capsLabel } from './ui';

const SANS = 'var(--fg-font-sans)';
const shadow =
  '0 1px 2px rgba(20,22,20,.18), 0 30px 60px -30px rgba(20,22,20,.55)';

function Board({
  height = 900,
  background,
  children
}: {
  height?: number;
  background: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        width: 1440,
        height,
        background,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: SANS,
        color: V.ink
      }}
    >
      {children}
    </div>
  );
}

const byNumber = (n: number) => season[n - 1]!;
const POSTER_BOX = Math.round(300 * 1.414);

// ---------------------------------------------------------------------------

function Cover() {
  return (
    <Board background='#25332C'>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40
        }}
      >
        <Poster
          spec={byNumber(1)}
          width={318}
          density={3}
          style={{ boxShadow: shadow, marginTop: 56 }}
        />
        <Poster
          spec={byNumber(3)}
          width={372}
          density={3}
          style={{ boxShadow: shadow }}
        />
        <Poster
          spec={byNumber(6)}
          width={318}
          density={3}
          style={{ boxShadow: shadow, marginTop: 56 }}
        />
      </div>
    </Board>
  );
}

function Hoarding() {
  const w = 232;
  const h = w * 1.414;
  const rows = [
    [1, 2, 3, 4, 5, 6],
    [4, 5, 6, 1, 2, 3],
    [2, 3, 4, 5, 6, 1]
  ];
  // Small, fixed offsets so the pasting looks done by hand.
  const jitter = [0.3, -0.25, 0.15, -0.35, 0.2, -0.1, 0.35, -0.2];
  return (
    <Board background='#24231F'>
      {rows.map((row, r) =>
        row.map((n, c) => {
          const k = r * 6 + c;
          return (
            <Poster
              key={`${r}-${c}`}
              spec={byNumber(n)}
              width={w}
              density={2.2}
              style={{
                position: 'absolute',
                left: 4 + c * (w + 8) + jitter[k % 8]! * 4,
                top: -64 + r * (h + 10) + jitter[(k + 3) % 8]! * 5,
                transform: `rotate(${jitter[(k + 5) % 8]! * 0.9}deg)`,
                boxShadow: '0 2px 5px rgba(0,0,0,.45)'
              }}
            />
          );
        })
      )}
    </Board>
  );
}

// ---------------------------------------------------------------------------
// From plan to poster.

function ProcessPanel({
  show,
  step
}: {
  show: Show;
  step: 'plan' | 'ridge' | 'contour';
}) {
  const width = 300;
  const height = Math.round((width * FIELD_H) / FIELD_W);
  const inks = inkPair(show.inkId);
  return (
    <ArtCanvas
      width={width}
      height={height}
      density={3}
      deps={`${show.slug}-${step}`}
      style={{ boxShadow: '0 0 0 1px rgba(29,33,30,.14)' }}
      draw={(ctx, w, h) => {
        const drawing = buildField(show);
        ctx.fillStyle = step === 'plan' ? '#FBFAF6' : PAPER;
        ctx.fillRect(0, 0, w, h);
        inField(ctx, { x: 0, y: 0, w, h }, (unit) => {
          if (step === 'plan') {
            ctx.strokeStyle = 'rgba(50,85,164,0.16)';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            for (let x = 0; x <= FIELD_W; x += 40) {
              ctx.moveTo(x, 0);
              ctx.lineTo(x, FIELD_H);
            }
            for (let y = 0; y <= FIELD_H; y += 40) {
              ctx.moveTo(0, y);
              ctx.lineTo(FIELD_W, y);
            }
            ctx.stroke();
            drawWalls(ctx, show.planId, V.ink, 12);
            ctx.fillStyle = V.ink;
            ctx.font = `500 32px ${SANS}`;
            ctx.textAlign = 'center';
            ctx.fillText('Entrance', 500, FIELD_H * 0.88 + 56);
            ctx.textAlign = 'left';
          }
          if (step === 'ridge') {
            drawDots(ctx, drawing, inks.b.hex);
            ctx.globalAlpha = 0.5;
            drawWalls(ctx, show.planId, V.ink, 4);
            ctx.globalAlpha = 1;
          }
          if (step === 'contour') {
            drawContours(ctx, drawing, inks.a.hex, 1 / unit);
          }
        });
      }}
    />
  );
}

function Arrow() {
  return (
    <svg width={34} height={14} viewBox='0 0 34 14' aria-hidden>
      <path
        d='M0 7h31M25 1l6 6-6 6'
        fill='none'
        stroke={V.ink}
        strokeWidth={1.6}
      />
    </svg>
  );
}

function Process() {
  const show = byNumber(3);
  const steps = [
    ['01', 'Plan', 'The installation drawing for the show. Temporary walls are redrawn every time.'],
    ['02', 'Ridge', 'Every point gets a height from its distance to the nearest wall. Walls become ridges.'],
    ['03', 'Contour', 'Isolines through that height, bent by drift and a seed. Every fifth line is heavier.'],
    ['04', 'Print', 'Lines and type on master 1, the height as halftone on master 2. Two inks, always.']
  ];
  return (
    <Board background={PAPER}>
      <div
        style={{
          position: 'absolute',
          left: 56,
          top: 52,
          right: 56,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between'
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontStretch: '75%',
            fontSize: 54,
            lineHeight: 1,
            letterSpacing: '-0.01em'
          }}
        >
          From floor plan to poster
        </span>
        <span style={{ ...capsLabel, fontSize: 12 }}>
          {show.number} · {show.title} · {plan(show.planId).name}
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 56,
          right: 56,
          top: 206,
          display: 'grid',
          gridTemplateColumns: '300px 1fr 300px 1fr 300px 1fr 300px',
          gridTemplateRows: `${POSTER_BOX}px auto`,
          alignItems: 'center',
          columnGap: 0
        }}
      >
        {steps.map(([n, title, text], i) => (
          <Fragment key={n}>
            <div style={{ gridColumn: i * 2 + 1, gridRow: 1 }}>
              {i < 3 ? (
                <ProcessPanel
                  show={show}
                  step={(['plan', 'ridge', 'contour'] as const)[i]!}
                />
              ) : (
                <Poster
                  spec={show}
                  width={300}
                  density={3}
                  style={{ boxShadow: '0 0 0 1px rgba(29,33,30,.14)' }}
                />
              )}
            </div>
            {i < 3 && (
              <div
                style={{
                  gridColumn: i * 2 + 2,
                  gridRow: 1,
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Arrow />
              </div>
            )}
            <div
              style={{
                gridColumn: i * 2 + 1,
                gridRow: 2,
                alignSelf: 'start',
                paddingTop: 28
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
                <span style={{ ...capsLabel, color: V.ink }}>{n}</span>
                <span style={{ fontSize: 22, fontWeight: 600 }}>{title}</span>
              </div>
              <p
                style={{
                  margin: '8px 0 0 30px',
                  fontSize: 14.5,
                  lineHeight: 1.45,
                  color: V.muted,
                  maxWidth: 260
                }}
              >
                {text}
              </p>
            </div>
          </Fragment>
        ))}
      </div>
    </Board>
  );
}

// ---------------------------------------------------------------------------
// Before and after: the same six campaign slots.

function SeasonWall({ after }: { after: boolean }) {
  const w = 268;
  return (
    <Board background={V.ground}>
      <div
        style={{
          position: 'absolute',
          left: 72,
          top: 64,
          width: 330,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontStretch: '75%',
            fontSize: 148,
            lineHeight: 0.85,
            letterSpacing: '-0.02em'
          }}
        >
          {after ? '2025' : '2024'}
        </span>
        <p
          style={{
            margin: '28px 0 0',
            fontSize: 21,
            lineHeight: 1.35,
            fontWeight: 500
          }}
        >
          {after
            ? 'Six campaigns from one system, each made in-house in two days.'
            : 'Six campaigns by six guest designers. The logo was the only constant, and it moved.'}
        </p>
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            flexDirection: 'column',
            borderTop: `1px solid ${V.rule}`
          }}
        >
          {(after
            ? season.map((s) => [s.title, `${plan(s.planId).name} · ${inkPair(s.inkId).name.toLowerCase()} inks`])
            : oldSeason.map((s) => [s.title, s.designer])
          ).map(([title, by]) => (
            <div
              key={title}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                padding: '9px 0',
                borderBottom: `1px solid ${V.rule}`,
                fontSize: 13.5
              }}
            >
              <span style={{ fontWeight: 600 }}>{title}</span>
              <span style={{ color: V.muted, textAlign: 'right' }}>{by}</span>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 492,
          top: 54,
          display: 'grid',
          gridTemplateColumns: `repeat(3, ${w}px)`,
          gap: 28
        }}
      >
        {after
          ? season.map((show) => (
              <Poster
                key={show.slug}
                spec={show}
                width={w}
                density={2.6}
                style={{
                  boxShadow:
                    '0 1px 2px rgba(20,20,18,.16), 0 16px 32px -18px rgba(20,20,18,.4)'
                }}
              />
            ))
          : oldSeason.map(({ title, Poster: Old }) => <Old key={title} width={w} />)}
      </div>
    </Board>
  );
}

// ---------------------------------------------------------------------------
// The two masters and the print.

function Layers() {
  const show = byNumber(3);
  const inks = inkPair(show.inkId);
  const w = 560;
  const sheet = (layer: 'a' | 'b' | 'both', title: string, note: string) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Poster
        spec={{ ...show, layer }}
        width={w}
        density={2.6}
        style={{ boxShadow: shadow }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 17, fontWeight: 600 }}>{title}</span>
        <span style={{ fontSize: 15, color: V.muted }}>{note}</span>
      </div>
    </div>
  );
  const row = (k: string, v: string) => (
    <div
      key={k}
      style={{
        display: 'grid',
        gridTemplateColumns: '150px 1fr',
        padding: '13px 0',
        borderBottom: '1px dashed rgba(29,33,30,.28)',
        fontSize: 16
      }}
    >
      <span style={{ color: V.muted }}>{k}</span>
      <span>{v}</span>
    </div>
  );
  return (
    <Board height={1800} background='#DCD6CA'>
      <div
        style={{
          position: 'absolute',
          left: 140,
          top: 72,
          display: 'grid',
          gridTemplateColumns: `${w}px ${w}px`,
          gap: '56px 40px'
        }}
      >
        {sheet('a', 'Master 1', inks.a.name)}
        {sheet('b', 'Master 2', inks.b.name)}
        {sheet('both', 'Print', '300 copies')}
        <div
          style={{
            height: w * 1.414,
            background: '#FBFAF6',
            boxShadow: shadow,
            padding: 44,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'var(--fg-font-pixel)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 22 }}>DRUKKERIJ KAAP</span>
              <span style={{ fontSize: 13, color: V.muted }}>
                Riso · Utrecht Lombok
              </span>
            </div>
            <svg width={44} height={44} viewBox='0 0 44 44' aria-hidden>
              <circle cx={22} cy={22} r={13} fill='none' stroke={V.ink} strokeWidth={1.4} />
              <path d='M22 0v44M0 22h44' stroke={V.ink} strokeWidth={1.4} />
            </svg>
          </div>
          <div style={{ marginTop: 40, fontSize: 30 }}>JOB 25-118</div>
          <div style={{ marginTop: 28, borderTop: `1.5px solid ${V.ink}` }}>
            {row('Client', 'Veld Kunsthal')}
            {row('Job', `${show.number} ${show.title}`)}
            {row('Format', 'A2, 420 × 594 mm')}
            {row('Stock', 'Munken Pure 120 g/m²')}
            {row('Master 1', inks.a.name)}
            {row('Master 2', inks.b.name)}
            {row('Run', '300')}
            {row('Proof', 'Approved 28.04 · IB')}
            {row('Ready', 'Thu 01.05.2025')}
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', gap: 0 }}>
            <span style={{ flex: 1, height: 64, background: inks.a.hex }} />
            <span style={{ flex: 1, height: 64, background: inks.b.hex }} />
          </div>
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 13,
              color: V.muted
            }}
          >
            <span>DRUM 1 · {inks.a.name.toUpperCase()}</span>
            <span>DRUM 2 · {inks.b.name.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </Board>
  );
}

// ---------------------------------------------------------------------------
// A bus shelter on the Veldkade at night.

function Shelter() {
  const show = byNumber(6);
  const posterW = 452;
  const posterH = posterW * 1.414;
  const groundY = 1390;
  const panel = {
    x: 772,
    y: groundY - 70 - (posterH + 36),
    w: posterW + 36,
    h: posterH + 36
  };
  return (
    <Board height={1800} background='#0E131B'>
      <svg
        width={1440}
        height={1800}
        style={{ position: 'absolute', inset: 0 }}
        aria-hidden
      >
        {/* Canal houses across the street. */}
        {[
          [0, 140, 210],
          [210, 70, 190],
          [400, 160, 230],
          [630, 100, 170],
          [800, 40, 220],
          [1020, 130, 200],
          [1220, 80, 220]
        ].map(([x, top, w], i) => (
          <g key={i}>
            <path
              d={`M${x} ${top! + 60} L${x! + w! / 2} ${top} L${x! + w!} ${top! + 60} V${groundY - 260} H${x} Z`}
              fill={i % 2 ? '#141B25' : '#121821'}
            />
            {[0, 1, 2].map((row) =>
              [0, 1].map((col) => {
                const lit = (i * 3 + row * 2 + col) % 5 === 1;
                return (
                  <rect
                    key={`${row}-${col}`}
                    x={x! + w! * 0.24 + col * w! * 0.34}
                    y={top! + 116 + row * 150}
                    width={w! * 0.18}
                    height={78}
                    fill={lit ? '#F0C46C' : '#19212D'}
                    opacity={lit ? 0.72 : 1}
                  />
                );
              })
            )}
          </g>
        ))}
        {/* Street and pavement. */}
        <rect x={0} y={groundY - 260} width={1440} height={260} fill='#0B0F15' />
        <rect x={0} y={groundY} width={1440} height={410} fill='#151B24' />
        <rect x={0} y={groundY} width={1440} height={6} fill='#262E3A' />
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={i}
            x1={i * 130 - 20}
            y1={groundY + 6}
            x2={i * 160 - 260}
            y2={1800}
            stroke='#1C232E'
            strokeWidth={2}
          />
        ))}
        {/* Shelter: roof, posts, back glass. */}
        <rect x={150} y={360} width={1140} height={34} fill='#2B3340' />
        <rect x={150} y={394} width={1140} height={4} fill='#4A5565' />
        <rect x={166} y={398} width={10} height={groundY - 398} fill='#2B3340' />
        <rect x={1264} y={398} width={10} height={groundY - 398} fill='#2B3340' />
        <rect
          x={176}
          y={420}
          width={566}
          height={groundY - 460}
          fill='#9FB4C8'
          opacity={0.07}
        />
        <rect x={176} y={420} width={566} height={2} fill='#6E7F92' opacity={0.5} />
        {/* Housing and feet of the advertising panel. */}
        <rect
          x={panel.x - 14}
          y={panel.y - 14}
          width={panel.w + 28}
          height={panel.h + 28}
          fill='#2B3340'
        />
        <rect x={panel.x + 20} y={panel.y + panel.h + 14} width={14} height={groundY - panel.y - panel.h - 14} fill='#2B3340' />
        <rect x={panel.x + panel.w - 34} y={panel.y + panel.h + 14} width={14} height={groundY - panel.y - panel.h - 14} fill='#2B3340' />
        {/* Bench. */}
        <rect x={250} y={1150} width={440} height={16} fill='#3A4351' />
        <rect x={250} y={1166} width={440} height={4} fill='#232A35' />
        <rect x={286} y={1170} width={10} height={groundY - 1170} fill='#2B3340' />
        <rect x={644} y={1170} width={10} height={groundY - 1170} fill='#2B3340' />
        {/* Stop sign on the roof. */}
        <rect x={190} y={300} width={260} height={56} rx={4} fill='#20406E' />
        <text
          x={214}
          y={337}
          fill='#F2F4F7'
          style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26 }}
        >
          Veldkade
        </text>
        <text
          x={426}
          y={336}
          textAnchor='end'
          fill='#9DB6D8'
          style={{ fontFamily: SANS, fontWeight: 600, fontSize: 18 }}
        >
          2 · 12
        </text>
        {/* Departures board. */}
        <rect x={196} y={470} width={232} height={170} rx={3} fill='#06090D' />
        {[
          ['2', 'Centraal', '4'],
          ['12', 'Uithof', '9'],
          ['2', 'Centraal', '19']
        ].map(([line, to, min], k) => (
          <g key={k} style={{ fontFamily: 'var(--fg-font-pixel)' }}>
            <text x={214} y={510 + k * 40} fill='#F7B731' fontSize={17}>
              {line}
            </text>
            <text x={252} y={510 + k * 40} fill='#F7B731' fontSize={17}>
              {to}
            </text>
            <text x={410} y={510 + k * 40} fill='#F7B731' fontSize={17} textAnchor='end'>
              {min}′
            </text>
          </g>
        ))}
        {/* Light spill from the advertising panel. */}
        <ellipse
          cx={panel.x + panel.w / 2}
          cy={groundY + 18}
          rx={300}
          ry={22}
          fill='#BFE6F2'
          opacity={0.05}
        />
      </svg>

      {/* The backlit panel with the poster. */}
      <div
        style={{
          position: 'absolute',
          left: panel.x,
          top: panel.y,
          width: panel.w,
          height: panel.h,
          background: '#F7FBFF',
          padding: 18,
          boxShadow:
            '0 0 90px 20px rgba(190,228,245,.2), 0 0 260px 60px rgba(190,228,245,.07)'
        }}
      >
        <Poster spec={show} width={posterW} density={2.6} />
      </div>
      {/* Its reflection in the wet pavement. */}
      <div
        style={{
          position: 'absolute',
          left: panel.x,
          top: groundY + 8,
          width: panel.w,
          height: 300,
          overflow: 'hidden',
          opacity: 0.22,
          filter: 'blur(6px)',
          maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 85%)'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: panel.h,
            left: 0,
            width: panel.w,
            height: panel.h,
            background: '#F7FBFF',
            padding: 18,
            transform: 'scaleY(-1)',
            transformOrigin: '50% 0'
          }}
        >
          <Poster spec={show} width={posterW} density={1} />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 72,
          bottom: 64,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          color: '#8D99AA',
          fontSize: 16
        }}
      >
        <span style={{ color: '#E8ECF1', fontWeight: 600 }}>
          Veldkade stop, 22:40
        </span>
        <span>Bus shelter format, 1185 × 1750 mm, from the same file</span>
      </div>
    </Board>
  );
}

// ---------------------------------------------------------------------------

function InBrowser({ url, children }: { url: string; children: ReactNode }) {
  return (
    <Board background={V.ground}>
      <BrowserFrame
        url={url}
        width={1260}
        style={{ position: 'absolute', left: 90, top: 34 }}
      >
        {children}
      </BrowserFrame>
    </Board>
  );
}

export const screens: ScreenSet = {
  cover: { width: 1440, height: 900, render: () => <Cover /> },
  posters: { width: 1440, height: 900, render: () => <Hoarding /> },
  generator: {
    width: 1440,
    height: 900,
    render: () => (
      <InBrowser url='studio.veldkunsthal.nl/generator'>
        <GeneratorScreen />
      </InBrowser>
    )
  },
  process: { width: 1440, height: 900, render: () => <Process /> },
  website: {
    width: 1440,
    height: 900,
    render: () => (
      <InBrowser url='veldkunsthal.nl'>
        <WebsiteScreen />
      </InBrowser>
    )
  },
  before: { width: 1440, height: 900, render: () => <SeasonWall after={false} /> },
  after: { width: 1440, height: 900, render: () => <SeasonWall after /> },
  layers: { width: 1440, height: 1800, render: () => <Layers /> },
  shelter: { width: 1440, height: 1800, render: () => <Shelter /> },
  demo: {
    width: 1440,
    height: 900,
    render: () => (
      <div style={{ width: 1440, height: 900 }}>
        <VeldGenerator />
      </div>
    )
  }
};
