import type { CSSProperties, ReactNode } from 'react';
import { ArtCanvas, Poster } from './Poster';
import { PlanIcon } from './PlanIcon';
import {
  PAPER,
  buildField,
  drawContours,
  drawDots,
  inField,
  inkPair,
  plans,
  season,
  type Show
} from './system';

export const V = {
  paper: PAPER,
  ink: '#1D211E',
  muted: '#5B605B',
  rule: 'rgba(29,33,30,0.14)',
  stage: '#E6E2D8',
  ground: '#E4DFD4'
};

const SANS = 'var(--fg-font-sans)';

export const capsLabel: CSSProperties = {
  fontFamily: SANS,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: V.muted
};

/** The show's field in any rectangle, both inks, without type. */
export function FieldBanner({
  show,
  width,
  height,
  density = 2,
  align
}: {
  show: Show;
  width: number;
  height: number;
  density?: number;
  align?: { x?: number; y?: number };
}) {
  const inks = inkPair(show.inkId);
  return (
    <ArtCanvas
      width={width}
      height={height}
      density={density}
      deps={`${show.slug}-${width}-${height}`}
      draw={(ctx, w, h) => {
        const drawing = buildField(show);
        ctx.fillStyle = PAPER;
        ctx.fillRect(0, 0, w, h);
        inField(
          ctx,
          { x: 0, y: 0, w, h },
          () => {
            ctx.save();
            ctx.translate(1.6, -1.1);
            drawDots(ctx, drawing, inks.b.hex);
            ctx.restore();
            ctx.globalCompositeOperation = 'multiply';
            drawContours(ctx, drawing, inks.a.hex, 1);
            ctx.globalCompositeOperation = 'source-over';
          },
          align
        );
      }}
    />
  );
}

function Wordmark({ size, color = V.ink }: { size: number; color?: string }) {
  return (
    <span
      style={{
        fontFamily: SANS,
        fontWeight: 700,
        fontStretch: '75%',
        fontSize: size,
        letterSpacing: '-0.01em',
        lineHeight: 1,
        color
      }}
    >
      VELD
    </span>
  );
}

// ---------------------------------------------------------------------------
// Generator, as the comms team sees it.

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={capsLabel}>{label}</span>
      <div
        style={{
          height: 36,
          padding: '0 11px',
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${V.rule}`,
          background: '#fff',
          fontSize: 14,
          fontWeight: 500,
          borderRadius: 2
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StaticSlider({
  label,
  value,
  display
}: {
  label: string;
  value: number;
  display: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={capsLabel}>{label}</span>
        <span style={{ ...capsLabel, color: V.ink }}>{display}</span>
      </div>
      <div style={{ position: 'relative', height: 16 }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 7,
            height: 2,
            background: V.rule
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${value * 100}%`,
            top: 7,
            height: 2,
            background: V.ink
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `calc(${value * 100}% - 8px)`,
            top: 0,
            width: 16,
            height: 16,
            borderRadius: 8,
            background: V.ink
          }}
        />
      </div>
    </div>
  );
}

function Section({
  index,
  title,
  note,
  children
}: {
  index: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        padding: '20px 24px',
        borderBottom: `1px solid ${V.rule}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ ...capsLabel, color: V.ink }}>{index}</span>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
        {note && (
          <span style={{ marginLeft: 'auto', fontSize: 12, color: V.muted }}>
            {note}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Check({ on }: { on: boolean }) {
  return (
    <span
      style={{
        width: 16,
        height: 16,
        borderRadius: 2,
        border: `1.5px solid ${V.ink}`,
        background: on ? V.ink : 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      {on && (
        <svg width={10} height={8} viewBox='0 0 10 8' aria-hidden>
          <path
            d='M1 4.2 3.8 7 9 1'
            fill='none'
            stroke={PAPER}
            strokeWidth={1.8}
          />
        </svg>
      )}
    </span>
  );
}

function Lock() {
  return (
    <svg width={12} height={14} viewBox='0 0 12 14' aria-hidden>
      <rect x={1} y={6} width={10} height={7.5} fill={V.ink} rx={1} />
      <path
        d='M3.2 6V4.2a2.8 2.8 0 0 1 5.6 0V6'
        fill='none'
        stroke={V.ink}
        strokeWidth={1.5}
      />
    </svg>
  );
}

export function GeneratorScreen() {
  const show = season[2]!;
  const inks = inkPair(show.inkId);
  return (
    <div
      style={{
        width: 1440,
        height: 900,
        background: V.paper,
        color: V.ink,
        fontFamily: SANS,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <header
        style={{
          height: 58,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          borderBottom: `1px solid ${V.rule}`,
          gap: 16
        }}
      >
        <Wordmark size={24} />
        <span style={{ fontSize: 15, color: V.muted, fontWeight: 500 }}>
          Generator
        </span>
        <span
          style={{
            marginLeft: 48,
            fontSize: 14,
            fontWeight: 500,
            color: V.muted
          }}
        >
          Season 2025 <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: V.ink }}>
            {show.number} · {show.title}
          </span>
        </span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 13,
            color: V.muted
          }}
        >
          Saved 14:32
        </span>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            background: inks.a.hex,
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          IB
        </span>
        <span
          style={{
            height: 34,
            padding: '0 16px',
            background: V.ink,
            color: V.paper,
            fontSize: 13.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          Export 5 files
        </span>
      </header>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <aside
          style={{
            width: 340,
            borderRight: `1px solid ${V.rule}`,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Section index='01' title='Exhibition'>
            <Field label='Title' value={show.title} />
            <Field label='Artists' value={show.artists} />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 92px',
                gap: 10
              }}
            >
              <Field label='Dates' value={show.dates} />
              <Field label='No.' value={show.number} />
            </div>
          </Section>
          <Section index='02' title='Floor plan' note='Drawing rev. C · 22.04'>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8
              }}
            >
              {plans.map((p) => {
                const on = p.id === show.planId;
                return (
                  <div
                    key={p.id}
                    style={{
                      height: 76,
                      border: `1px solid ${on ? V.ink : V.rule}`,
                      background: on ? '#fff' : 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      color: on ? V.ink : V.muted,
                      borderRadius: 2
                    }}
                  >
                    <PlanIcon planId={p.id} size={34} weight={1.6} />
                    <span style={{ fontSize: 11.5, fontWeight: 500 }}>
                      {p.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </Section>
          <Section index='03' title='Field'>
            <StaticSlider label='Density' value={0.5} display='20 lines' />
            <StaticSlider label='Drift' value={0.5} display='50' />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={capsLabel}>Seed</span>
                <span style={{ fontSize: 15, fontWeight: 500 }}>0077</span>
              </div>
              <span
                style={{
                  height: 32,
                  padding: '0 14px',
                  border: `1px solid ${V.ink}`,
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 2
                }}
              >
                New seed
              </span>
            </div>
          </Section>
          <Section index='04' title='Inks' note='Set by season'>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {[inks.a, inks.b].map((ink) => (
                <div
                  key={ink.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flex: 1
                  }}
                >
                  <span
                    style={{ width: 22, height: 22, background: ink.hex }}
                  />
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>
                    {ink.name}
                  </span>
                </div>
              ))}
              <Lock />
            </div>
          </Section>
        </aside>

        <main
          style={{
            flex: 1,
            background: V.stage,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            style={{
              height: 56,
              display: 'flex',
              alignItems: 'center',
              padding: '0 20px',
              gap: 16
            }}
          >
            <div
              style={{
                display: 'flex',
                border: `1px solid ${V.rule}`,
                background: V.paper,
                borderRadius: 2
              }}
            >
              {['Print', 'Master 1', 'Master 2'].map((label, i) => (
                <span
                  key={label}
                  style={{
                    height: 30,
                    padding: '0 14px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 12.5,
                    fontWeight: 600,
                    background: i === 0 ? V.ink : 'transparent',
                    color: i === 0 ? V.paper : V.ink
                  }}
                >
                  {label}
                </span>
              ))}
            </div>
            <span style={{ ...capsLabel, marginLeft: 'auto' }}>
              A2 · 420 × 594 mm
            </span>
            <span style={capsLabel}>Zoom 46%</span>
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: 6
            }}
          >
            <Poster
              spec={show}
              width={510}
              density={3}
              style={{
                boxShadow:
                  '0 1px 2px rgba(29,33,30,.12), 0 24px 48px -24px rgba(29,33,30,.4)'
              }}
            />
          </div>
        </main>

        <aside
          style={{
            width: 300,
            borderLeft: `1px solid ${V.rule}`,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Section index='05' title='Formats'>
            {[
              ['A2 poster', 'riso, 2 masters', true],
              ['A4 flyer', 'riso, 2 masters', true],
              ['Bus shelter', '1185 × 1750 mm', true],
              ['Instagram', '1080 × 1350 px', true],
              ['Website banner', '2400 × 900 px', true],
              ['Newsletter header', '1200 × 400 px', false]
            ].map(([name, size, on]) => (
              <div
                key={String(name)}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <Check on={Boolean(on)} />
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>{name}</span>
                <span
                  style={{ marginLeft: 'auto', fontSize: 12, color: V.muted }}
                >
                  {size}
                </span>
              </div>
            ))}
          </Section>
          <Section index='06' title='Locked'>
            {[
              'Typeface and sizes',
              'Grid and margins',
              'Wordmark',
              'Ink pairs per season'
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13.5,
                  color: V.muted
                }}
              >
                <Lock />
                {item}
              </div>
            ))}
          </Section>
          <div
            style={{
              margin: 20,
              padding: 16,
              background: '#fff',
              border: `1px solid ${V.rule}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              borderRadius: 2
            }}
          >
            <span style={capsLabel}>Print run</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              Drukkerij Kaap
            </span>
            <span style={{ fontSize: 12.5, color: V.muted, lineHeight: 1.45 }}>
              300 × A2 on Munken Pure 120 g.
              <br />
              Masters ready to send. Back Thursday.
            </span>
            <span
              style={{
                marginTop: 8,
                height: 34,
                background: V.ink,
                color: V.paper,
                fontSize: 13,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2
              }}
            >
              Send masters to Kaap
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// veldkunsthal.nl

export function WebsiteScreen() {
  const now = season[2]!;
  const next = [season[3]!, season[4]!, season[5]!];
  const ink = inkPair(now.inkId).a.hex;
  return (
    <div
      style={{
        width: 1440,
        height: 900,
        background: V.paper,
        color: V.ink,
        fontFamily: SANS,
        position: 'relative'
      }}
    >
      <nav
        style={{
          height: 76,
          display: 'flex',
          alignItems: 'center',
          padding: '0 56px',
          gap: 36
        }}
      >
        <Wordmark size={34} />
        <div
          style={{
            display: 'flex',
            gap: 30,
            marginLeft: 64,
            fontSize: 15.5,
            fontWeight: 500
          }}
        >
          <span style={{ borderBottom: `2px solid ${V.ink}`, paddingBottom: 3 }}>
            Exhibitions
          </span>
          <span>Programme</span>
          <span>Visit</span>
          <span>Learn</span>
          <span>About</span>
        </div>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: 14,
            fontWeight: 500,
            color: V.muted
          }}
        >
          NL / <span style={{ color: V.ink }}>EN</span>
        </span>
        <span
          style={{
            height: 40,
            padding: '0 20px',
            background: V.ink,
            color: V.paper,
            fontSize: 14.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 20
          }}
        >
          Tickets · €12
        </span>
      </nav>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '520px 1fr',
          gap: 48,
          padding: '28px 56px 0'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', paddingTop: 12 }}>
          <span style={{ ...capsLabel, color: ink }}>Now on · until 22 June</span>
          <h1
            style={{
              margin: '18px 0 0',
              fontWeight: 600,
              fontStretch: '75%',
              fontSize: 92,
              lineHeight: 0.92,
              letterSpacing: '-0.015em',
              color: ink
            }}
          >
            Field Notes
            <br />
            for a Flood
          </h1>
          <span style={{ marginTop: 18, fontSize: 21, fontWeight: 500 }}>
            Ravi Menon & Saar Jonker
          </span>
          <p
            style={{
              marginTop: 18,
              fontSize: 16.5,
              lineHeight: 1.5,
              color: V.muted,
              maxWidth: 460
            }}
          >
            Two artists map the Utrecht floodplain as it was before the dykes,
            in sound, soil samples and forty metres of drawing laid out
            through the long gallery.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
            <span
              style={{
                height: 44,
                padding: '0 22px',
                background: V.ink,
                color: V.paper,
                fontSize: 15,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 22
              }}
            >
              Plan your visit
            </span>
            <span
              style={{
                height: 44,
                padding: '0 22px',
                border: `1.5px solid ${V.ink}`,
                fontSize: 15,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 22
              }}
            >
              Exhibition guide
            </span>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <FieldBanner show={now} width={816} height={440} density={2.4} />
          <span
            style={{
              position: 'absolute',
              left: 16,
              bottom: 14,
              ...capsLabel,
              color: ink,
              background: V.paper,
              padding: '3px 7px'
            }}
          >
            Field: long gallery, seed 0077
          </span>
        </div>
      </section>

      <section style={{ padding: '56px 56px 0' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            borderTop: `1.5px solid ${V.ink}`,
            paddingTop: 14
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 600 }}>Coming up</span>
          <span style={{ fontSize: 14.5, fontWeight: 500 }}>
            All of 2025 →
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            marginTop: 20
          }}
        >
          {next.map((show) => (
            <div key={show.slug} style={{ display: 'flex', gap: 16 }}>
              <FieldBanner
                show={show}
                width={150}
                height={150}
                density={2.4}
                align={{ y: 0.55 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={capsLabel}>{show.number}</span>
                <span
                  style={{
                    fontWeight: 600,
                    fontStretch: '75%',
                    fontSize: 30,
                    lineHeight: 1,
                    color: inkPair(show.inkId).a.hex,
                    marginTop: 4
                  }}
                >
                  {show.title}
                </span>
                <span style={{ fontSize: 14.5, fontWeight: 500, marginTop: 4 }}>
                  {show.artists.split(', ').slice(0, 2).join(', ')}
                  {show.artists.split(', ').length > 2 ? ' and others' : ''}
                </span>
                <span style={{ fontSize: 13.5, color: V.muted }}>
                  {show.dates}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

