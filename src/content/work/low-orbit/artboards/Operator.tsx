import type { CSSProperties, ReactNode } from 'react';
import { mulberry32, palette, scenes } from '../orbit';
import { OrbitCanvas } from '../OrbitCanvas';
import { setlist } from '../data';
import { condensed, Meter, pixel, Pixel, sans } from './shared';

const line = '#1d1c22';
const panel = '#0d0d11';

function PanelHead({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div
      style={{
        height: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        borderBottom: `1px solid ${line}`
      }}
    >
      <Pixel color={palette.ash}>{title}</Pixel>
      {right}
    </div>
  );
}

function Spark({ seed, hot }: { seed: number; hot?: boolean }) {
  const rand = mulberry32(seed);
  const pts = Array.from({ length: 32 }, (_, i) => {
    const v = 0.25 + rand() * 0.5 + (i % 4 === 0 ? 0.25 : 0);
    return `${i * 7},${22 - v * 20}`;
  }).join(' ');
  return (
    <svg width={224} height={24} aria-hidden>
      <polyline
        points={pts}
        fill='none'
        stroke={hot ? palette.infrared : palette.ash}
        strokeWidth={1.2}
      />
    </svg>
  );
}

const stems = [
  { name: 'Kick', input: 'In 1–2 · −9 dB', drives: 'Core', level: 0.84, sens: 72, seed: 3 },
  { name: 'Bass', input: 'In 3–4 · −12 dB', drives: 'Rings', level: 0.66, sens: 64, seed: 5 },
  { name: 'Pads', input: 'In 5–6 · −18 dB', drives: 'Dust', level: 0.48, sens: 80, seed: 8 },
  { name: 'Vox', input: 'In 7–8 · −14 dB', drives: 'Satellite', level: 0.58, sens: 70, seed: 13 }
];

const sections = [
  { name: 'Intro', bars: 8, scene: 'Apogee' },
  { name: 'Build', bars: 8, scene: 'Perigee' },
  { name: 'Drop', bars: 16, scene: 'Perigee' },
  { name: 'Break', bars: 8, scene: 'Eclipse' },
  { name: 'Drop 2', bars: 16, scene: 'Roche Limit' },
  { name: 'Outro', bars: 6, scene: 'Apogee' }
];

function TrackMap() {
  const total = sections.reduce((sum, s) => sum + s.bars, 0);
  const bar = 21;
  let start = 0;
  return (
    <div style={{ padding: '4px 22px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <Pixel color={palette.ash}>Track map · Low Orbit</Pixel>
        <Pixel>Bar {bar} of {total}</Pixel>
      </div>
      <div style={{ position: 'relative', display: 'flex', gap: 3 }}>
        {sections.map((section) => {
          const from = start;
          start += section.bars;
          const current = bar > from && bar <= start;
          const past = bar > start;
          return (
            <div key={section.name} style={{ flex: section.bars, minWidth: 0 }}>
              <div
                style={{
                  height: 30,
                  borderRadius: 4,
                  background: current ? 'rgba(255,45,85,0.18)' : past ? '#1a191f' : '#131217',
                  boxShadow: current ? `inset 0 0 0 1px ${palette.infrared}` : `inset 0 0 0 1px ${line}`,
                  padding: '0 8px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span style={{ ...pixel, color: past ? palette.ash : palette.bone, whiteSpace: 'nowrap' }}>
                  {section.name}
                </span>
              </div>
              <div style={{ marginTop: 5 }}>
                <Pixel color={current ? palette.infrared : palette.ash}>{section.scene}</Pixel>
              </div>
            </div>
          );
        })}
        <span
          style={{
            position: 'absolute',
            left: `${(bar / total) * 100}%`,
            top: -4,
            width: 2,
            height: 38,
            background: palette.bone
          }}
        />
      </div>
    </div>
  );
}

export function OperatorUI() {
  const text: CSSProperties = { ...sans, color: palette.bone };
  return (
    <div
      style={{
        width: 1440,
        height: 900,
        background: '#08080b',
        color: palette.bone,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--fg-font-sans)'
      }}
    >
      {/* Top bar */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: `1px solid ${line}`,
          background: panel
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ ...condensed, fontSize: 24 }}>Low Orbit</span>
          <Pixel color={palette.ash}>Show 3.2</Pixel>
        </div>
        <Pixel>Night 7 / 34 · Hala Stocznia, Gdańsk · On 21:30</Pixel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <Pixel color={palette.ash}>MIDI clock · locked</Pixel>
          <span style={{ ...text, fontSize: 20, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            122.0 <span style={{ ...pixel, color: palette.ash }}>BPM</span>
          </span>
          <span style={{ ...text, fontSize: 20, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
            21:47:12
          </span>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '300px 1fr 330px',
          minHeight: 0
        }}
      >
        {/* Stems */}
        <div style={{ borderRight: `1px solid ${line}`, background: panel }}>
          <PanelHead title='Stems · 4 in' right={<Pixel color={palette.ash}>48 kHz</Pixel>} />
          {stems.map((stem, i) => (
            <div
              key={stem.name}
              style={{
                padding: '14px 16px 12px',
                borderBottom: `1px solid ${line}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ ...text, fontSize: 16, fontWeight: 600 }}>{stem.name}</span>
                <Pixel color={palette.ash}>{stem.input}</Pixel>
              </div>
              <div style={{ margin: '10px 0 8px' }}>
                <Meter value={stem.level} segments={28} height={7} />
              </div>
              <Spark seed={stem.seed} hot={i === 0} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <Pixel>Drives → {stem.drives}</Pixel>
                <Pixel color={palette.ash}>Sens {stem.sens}</Pixel>
              </div>
            </div>
          ))}
          <div style={{ padding: '14px 16px', display: 'grid', gap: 7 }}>
            {[
              ['Interface', '8 in · 128 buffer'],
              ['Latency', '4.2 ms'],
              ['Dropouts tonight', '0']
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Pixel color={palette.ash}>{k}</Pixel>
                <Pixel>{v}</Pixel>
              </div>
            ))}
          </div>
        </div>

        {/* Program and next */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <PanelHead
            title='Program'
            right={
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Pixel color={palette.ash}>3077 × 1154 · 60 Hz</Pixel>
                <span
                  style={{
                    ...pixel,
                    background: palette.infrared,
                    color: palette.stage,
                    padding: '1px 6px'
                  }}
                >
                  On air
                </span>
              </span>
            }
          />
          <div style={{ padding: '18px 22px 0' }}>
            <div style={{ position: 'relative', boxShadow: `0 0 0 1px ${line}` }}>
              <OrbitCanvas
                width={766}
                height={287}
                scene='perigee'
                time={8.3}
                gravity={0.35}
                size={560}
                stems={{ kick: 0.84, bass: 0.66, pads: 0.48, vocal: 0.58 }}
              />
              <div style={{ position: 'absolute', left: 12, top: 10 }}>
                <Pixel>01 Perigee</Pixel>
              </div>
              <div style={{ position: 'absolute', right: 12, bottom: 10 }}>
                <Pixel color={palette.ash}>Gravity 35</Pixel>
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '330px 1fr',
              gap: 22,
              padding: '18px 22px',
              alignItems: 'start'
            }}
          >
            <div>
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Pixel color={palette.ash}>Next</Pixel>
                <Pixel>Auto at bar 33 · 0:42</Pixel>
              </div>
              <div style={{ boxShadow: `0 0 0 1px ${line}`, opacity: 0.85 }}>
                <OrbitCanvas
                  width={330}
                  height={124}
                  scene='eclipse'
                  time={3.1}
                  gravity={0.2}
                  size={250}
                  density={0.6}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gap: 10, paddingTop: 24 }}>
              {[
                ['Transition', 'Cross-orbit, 4 bars'],
                ['Follow', 'Vox phrase start'],
                ['Recompose', '2.67 : 1, desk mask 12%'],
                ['Strobe limit', '3 Hz · venue rule']
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: `1px solid ${line}`,
                    paddingBottom: 9
                  }}
                >
                  <Pixel color={palette.ash}>{k}</Pixel>
                  <span style={{ ...text, fontSize: 14 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <TrackMap />
        </div>

        {/* Setlist */}
        <div style={{ borderLeft: `1px solid ${line}`, background: panel }}>
          <PanelHead title='Setlist · 8 tracks' right={<Pixel color={palette.ash}>52:52</Pixel>} />
          {setlist.map((track) => {
            const current = track.n === '02';
            const done = track.n === '01';
            return (
              <div
                key={track.n}
                style={{
                  padding: '11px 16px 11px 14px',
                  borderBottom: `1px solid ${line}`,
                  borderLeft: `2px solid ${current ? palette.infrared : 'transparent'}`,
                  background: current ? 'rgba(255,45,85,0.07)' : 'transparent',
                  opacity: done ? 0.45 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ ...text, fontSize: 15, fontWeight: current ? 600 : 500 }}>
                    <span style={{ ...pixel, color: palette.ash, marginRight: 10 }}>{track.n}</span>
                    {track.title}
                  </span>
                  <Pixel color={palette.ash}>{track.bpm}</Pixel>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, paddingLeft: 27 }}>
                  <Pixel color={current ? palette.infrared : palette.ash}>{track.scene}</Pixel>
                  <Pixel color={palette.ash}>{current ? '4:12 / 7:48' : track.length}</Pixel>
                </div>
                {current && (
                  <div style={{ marginTop: 8, marginLeft: 27, height: 2, background: line }}>
                    <div style={{ width: '54%', height: 2, background: palette.infrared }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom: gravity, fail-safe, scene pads */}
      <div
        style={{
          height: 176,
          display: 'grid',
          gridTemplateColumns: '1fr 300px 420px',
          borderTop: `1px solid ${line}`,
          background: panel
        }}
      >
        <div style={{ padding: '18px 22px', borderRight: `1px solid ${line}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Pixel>Gravity</Pixel>
            <Pixel color={palette.ash}>Stage fader · CC 12 · Mira</Pixel>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
            <span style={{ ...condensed, fontSize: 56 }}>35</span>
            <Pixel color={palette.ash}>% · pulls every orbit inward</Pixel>
          </div>
          <div style={{ position: 'relative', height: 30, marginTop: 10 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 14, height: 2, background: '#2a2930' }} />
            <div style={{ position: 'absolute', left: 0, width: '35%', top: 14, height: 2, background: palette.infrared }} />
            {Array.from({ length: 11 }, (_, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  left: `${i * 10}%`,
                  top: i % 5 === 0 ? 4 : 8,
                  width: 1,
                  height: i % 5 === 0 ? 22 : 14,
                  background: '#3a3940'
                }}
              />
            ))}
            <span
              style={{
                position: 'absolute',
                left: 'calc(35% - 8px)',
                top: 0,
                width: 16,
                height: 30,
                borderRadius: 3,
                background: palette.bone,
                boxShadow: `0 0 0 3px #08080b, 0 0 0 4px ${palette.infrared}`
              }}
            />
          </div>
        </div>
        <div style={{ padding: '18px 22px', borderRight: `1px solid ${line}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Pixel>Fail-safe</Pixel>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: palette.bone }} />
              <Pixel>Armed</Pixel>
            </span>
          </div>
          <p style={{ ...text, fontSize: 14, lineHeight: 1.45, margin: '12px 0 10px', color: palette.bone }}>
            If audio drops, hold 122 BPM for 16 bars, then ease into Apogee.
          </p>
          <Pixel color={palette.ash}>Last dropout: night 4, Leipzig · 3.1 s · covered</Pixel>
        </div>
        <div style={{ padding: '18px 22px' }}>
          <div style={{ marginBottom: 10 }}>
            <Pixel color={palette.ash}>Scenes</Pixel>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {scenes.map((scene) => {
              const current = scene.id === 'perigee';
              const next = scene.id === 'eclipse';
              return (
                <div
                  key={scene.id}
                  style={{
                    height: 50,
                    padding: '6px 8px',
                    borderRadius: 6,
                    background: current ? palette.infrared : '#16161b',
                    color: current ? palette.stage : palette.bone,
                    boxShadow: next ? `inset 0 0 0 1px ${palette.infrared}` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ ...pixel, opacity: 0.8 }}>{scene.number}</span>
                  <span style={{ ...sans, fontSize: 12, fontWeight: 600, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                    {scene.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/** A laptop drawn in code, seen straight on. */
export function Laptop({ width, children }: { width: number; children: ReactNode }) {
  const screenW = 1440;
  const screenH = 900;
  const bezel = 18;
  const scale = width / (screenW + bezel * 2);
  const lidH = (screenH + bezel * 2) * scale;
  return (
    <div style={{ width, position: 'relative' }}>
      <div style={{ width, height: lidH, position: 'relative' }}>
        <div
          style={{
            width: screenW + bezel * 2,
            height: screenH + bezel * 2,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
            padding: bezel,
            borderRadius: '26px 26px 6px 6px',
            background: '#0c0c0e',
            boxShadow: 'inset 0 0 0 2px #26252a'
          }}
        >
          <div style={{ width: screenW, height: screenH, overflow: 'hidden', borderRadius: 6 }}>
            {children}
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          marginLeft: -width * 0.06,
          width: width * 1.12,
          height: 18,
          borderRadius: '2px 2px 14px 14px',
          background: 'linear-gradient(#3b3a40, #1d1c21 60%, #111013)'
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: 140,
            height: 6,
            marginLeft: -70,
            borderRadius: '0 0 8px 8px',
            background: '#16151a'
          }}
        />
      </div>
    </div>
  );
}

export function Operator() {
  return (
    <div
      style={{
        width: 1440,
        height: 900,
        background: '#141216',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 62
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 120,
          width: 1100,
          height: 600,
          marginLeft: -550,
          borderRadius: '50%',
          background: 'rgba(255,45,85,0.10)',
          filter: 'blur(90px)'
        }}
      />
      <Laptop width={1160}>
        <OperatorUI />
      </Laptop>
    </div>
  );
}
