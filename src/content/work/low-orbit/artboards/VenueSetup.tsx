import type { CSSProperties } from 'react';
import { palette } from '../orbit';
import { OrbitCanvas } from '../OrbitCanvas';
import { condensed, Pixel, pixel, sans, TabletFrame } from './shared';

// Daylight mode: setup happens at load-in, under work lights.
const day = {
  paper: '#F1ECE3',
  card: '#FBF8F2',
  ink: '#16141A',
  muted: '#6E6970',
  line: '#DDD6CB'
};

function Step({ n, title, state }: { n: string; title: string; state: 'done' | 'active' | 'next' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 10,
        background: state === 'active' ? day.ink : 'transparent',
        color: state === 'active' ? day.paper : state === 'done' ? day.ink : day.muted
      }}
    >
      <span
        style={{
          ...pixel,
          width: 22,
          height: 22,
          borderRadius: 11,
          display: 'grid',
          placeItems: 'center',
          background: state === 'done' ? palette.infrared : 'transparent',
          color: state === 'done' ? day.card : 'inherit',
          boxShadow: state === 'done' ? 'none' : `inset 0 0 0 1px currentColor`
        }}
      >
        {state === 'done' ? '✓' : n}
      </span>
      <span style={{ ...sans, fontSize: 15, fontWeight: 600 }}>{title}</span>
    </div>
  );
}

function Field({ label, value, unit, note }: { label: string; value: string; unit: string; note?: string }) {
  return (
    <div style={{ borderBottom: `1px solid ${day.line}`, padding: '14px 0' }}>
      <Pixel color={day.muted}>{label}</Pixel>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
        <span style={{ ...sans, fontSize: 34, fontWeight: 500, letterSpacing: '-0.03em', color: day.ink }}>
          {value}
        </span>
        <span style={{ ...sans, fontSize: 16, color: day.muted }}>{unit}</span>
      </div>
      {note && (
        <div style={{ marginTop: 2 }}>
          <Pixel color={day.muted}>{note}</Pixel>
        </div>
      )}
    </div>
  );
}

function Recomposed({
  ratio,
  label,
  scene,
  width,
  active
}: {
  ratio: number;
  label: string;
  scene: 'perigee' | 'eclipse' | 'apogee' | 'roche';
  width: number;
  active?: boolean;
}) {
  const height = Math.round(width / ratio);
  const mask: CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: Math.round(height * 0.12),
    background:
      'repeating-linear-gradient(135deg, rgba(255,45,85,.35) 0 2px, transparent 2px 7px)',
    borderTop: `1px dashed ${palette.infrared}`
  };
  return (
    <div>
      <div
        style={{
          position: 'relative',
          width,
          height,
          borderRadius: 6,
          overflow: 'hidden',
          boxShadow: active ? `0 0 0 2px ${palette.infrared}` : `0 0 0 1px ${day.line}`
        }}
      >
        <OrbitCanvas width={width} height={height} scene={scene} time={7.4} gravity={0.25} density={0.5} />
        <div style={mask} />
        <div
          style={{
            position: 'absolute',
            inset: 8,
            border: '1px dashed rgba(237,230,218,0.35)',
            borderRadius: 3
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, gap: 8 }}>
        <Pixel color={day.ink}>{label}</Pixel>
        {width >= 200 && <Pixel color={day.muted}>{ratio.toFixed(2)} : 1</Pixel>}
      </div>
    </div>
  );
}

function CabinetMap() {
  const cols = 12;
  const rows = 8;
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <Pixel color={day.ink}>Wall layout · 12 × 8 cabinets · 800 × 500 mm</Pixel>
        <Pixel color={palette.infrared}>1 flagged: G7 dim</Pixel>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 3,
          width: 520
        }}
      >
        {Array.from({ length: cols * rows }, (_, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const masked = row === rows - 1;
          const flagged = row === 6 && col === 6;
          return (
            <span
              key={i}
              style={{
                height: 19,
                borderRadius: 2,
                background: flagged ? palette.infrared : masked ? '#D9D1C4' : day.ink,
                opacity: flagged ? 1 : masked ? 1 : 0.86 - (col % 2) * 0.06
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
        <Pixel color={day.muted}>Row H behind the desk</Pixel>
        <Pixel color={day.muted}>Processor input 1 · 60 Hz</Pixel>
      </div>
    </div>
  );
}

function SetupUI() {
  return (
    <div
      style={{
        width: 1366,
        height: 1024,
        background: day.paper,
        color: day.ink,
        display: 'grid',
        gridTemplateRows: '74px 1fr',
        fontFamily: 'var(--fg-font-sans)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          borderBottom: `1px solid ${day.line}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ ...condensed, fontSize: 26 }}>Venue setup</span>
          <Pixel color={day.muted}>Night 8 · Fabryka 9, Warsaw · load-in 14:20</Pixel>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Pixel color={day.muted}>Elapsed</Pixel>
          <span style={{ ...sans, fontSize: 24, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>02:41</span>
          <div style={{ width: 120, height: 4, background: day.line, borderRadius: 2 }}>
            <div style={{ width: '89%', height: 4, background: palette.infrared, borderRadius: 2 }} />
          </div>
          <Pixel color={day.muted}>of ~3:00</Pixel>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 380px 1fr', minHeight: 0 }}>
        <div style={{ padding: '26px 18px', borderRight: `1px solid ${day.line}` }}>
          <div style={{ display: 'grid', gap: 4 }}>
            <Step n='1' title='Screen size' state='done' />
            <Step n='2' title='Pixel pitch' state='done' />
            <Step n='3' title='Recompose scenes' state='active' />
            <Step n='4' title='Line check' state='next' />
          </div>
          <div
            style={{
              marginTop: 32,
              padding: 16,
              borderRadius: 12,
              background: day.card,
              boxShadow: `inset 0 0 0 1px ${day.line}`
            }}
          >
            <Pixel color={day.muted}>Saved venues</Pixel>
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              {[
                ['Hala Stocznia', '2.67 : 1'],
                ['Werk 4', '16 : 9'],
                ['Hal C', '3.20 : 1'],
                ['Kanaalhal', '2.00 : 1']
              ].map(([name, ratio]) => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ ...sans, fontSize: 14 }}>{name}</span>
                  <Pixel color={day.muted}>{ratio}</Pixel>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '22px 30px', borderRight: `1px solid ${day.line}` }}>
          <Field label='Screen width' value='9.60' unit='m' note='12 cabinets across' />
          <Field label='Screen height' value='4.00' unit='m' note='8 cabinets high, flown' />
          <Field label='Pixel pitch' value='3.9' unit='mm' note='From the rental sheet' />
          <div style={{ padding: '18px 0' }}>
            <Pixel color={day.muted}>Output</Pixel>
            <div style={{ ...sans, fontSize: 22, fontWeight: 600, marginTop: 6, letterSpacing: '-0.02em' }}>
              2462 × 1026 px
            </div>
            <div style={{ ...sans, fontSize: 15, color: day.muted, marginTop: 4 }}>
              Aspect 2.40 : 1 · one 60 Hz output
            </div>
          </div>
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: day.card,
              boxShadow: `inset 0 0 0 1px ${day.line}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Pixel>Desk mask</Pixel>
              <Pixel color={palette.infrared}>12% bottom</Pixel>
            </div>
            <p style={{ ...sans, fontSize: 14, lineHeight: 1.45, color: day.muted, margin: '8px 0 0' }}>
              Mira’s desk hides the lower eighth of the wall from the floor. The core
              is lifted so nothing important lands behind it.
            </p>
          </div>
        </div>

        <div style={{ padding: '26px 32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ ...sans, fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>
              Every scene, recomposed for this wall
            </span>
            <Pixel color={day.muted}>8 of 8 checked</Pixel>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '22px 22px',
              marginTop: 22
            }}
          >
            <Recomposed ratio={2.4} label='01 Perigee' scene='perigee' width={316} active />
            <Recomposed ratio={2.4} label='02 Apogee' scene='apogee' width={316} />
            <Recomposed ratio={2.4} label='03 Eclipse' scene='eclipse' width={316} />
            <Recomposed ratio={2.4} label='04 Roche Limit' scene='roche' width={316} />
          </div>
          <div
            style={{
              marginTop: 26,
              padding: '14px 16px',
              borderRadius: 12,
              boxShadow: `inset 0 0 0 1px ${day.line}`,
              display: 'flex',
              gap: 22,
              alignItems: 'center'
            }}
          >
            <Recomposed ratio={2.67} label='Last night, Gdańsk' scene='perigee' width={150} />
            <div style={{ ...sans, fontSize: 28, color: day.muted }}>→</div>
            <Recomposed ratio={2.4} label='Tonight, Warsaw' scene='perigee' width={200} active />
            <p style={{ ...sans, fontSize: 14, lineHeight: 1.45, color: day.muted, margin: 0, flex: 1 }}>
              Rings widen to the new ratio; the core stays at the same height above the desk.
            </p>
          </div>
          <CabinetMap />
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pixel color={day.muted}>Ana P. · tour manager</Pixel>
            <span
              style={{
                ...sans,
                fontSize: 16,
                fontWeight: 600,
                padding: '14px 22px',
                borderRadius: 12,
                background: day.ink,
                color: day.paper
              }}
            >
              Confirm and run line check →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VenueSetup() {
  return (
    <div
      style={{
        width: 1440,
        height: 900,
        background: palette.infrared,
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center'
      }}
    >
      <div style={{ position: 'relative' }}>
        <TabletFrame width={1050} screenWidth={1366} screenHeight={1024}>
          <SetupUI />
        </TabletFrame>
      </div>
    </div>
  );
}
