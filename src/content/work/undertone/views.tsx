import type { CSSProperties, ReactNode } from 'react';
import {
  MINUTES,
  anomalies,
  clock,
  denseWave,
  formatFlow,
  formatLevel,
  formatSalinity,
  getSeries,
  network,
  networkTone,
  palette as c,
  stations,
  wavePath
} from './data';
import { voiceAt } from './sound';
import { HourLabels, LaneWave, Mark, Wordmark } from './ui';

const px = (size: number, color: string = c.muted): CSSProperties => ({
  fontFamily: 'var(--fg-font-pixel)',
  fontSize: size,
  lineHeight: `${Math.round(size * 1.35)}px`,
  letterSpacing: '0.02em',
  color
});
const caps = (size = 11, color: string = c.muted): CSSProperties => ({
  ...px(size, color),
  textTransform: 'uppercase'
});
const sans = (
  size: number,
  weight = 400,
  color: string = c.text,
  extra: CSSProperties = {}
): CSSProperties => ({
  fontFamily: 'var(--fg-font-sans)',
  fontSize: size,
  fontWeight: weight,
  color,
  letterSpacing: size >= 28 ? '-0.025em' : size >= 18 ? '-0.012em' : 0,
  lineHeight: 1.25,
  ...extra
});

/** The moment every operator screen shows: 03:18 on Friday 15 March. */
const NOW = 918;

function AppBar({ active, right }: { active: string; right?: ReactNode }) {
  const tabs = ['Listen', 'Replay', 'Sound map', 'Log'];
  return (
    <div
      style={{
        height: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 36,
        padding: '0 28px',
        borderBottom: `1px solid ${c.line}`,
        background: c.night
      }}
    >
      <Wordmark size={17} />
      <div style={{ display: 'flex', gap: 4 }}>
        {tabs.map((tab) => (
          <span
            key={tab}
            style={{
              ...sans(14, 500, tab === active ? c.text : c.muted),
              padding: '7px 14px',
              borderRadius: 999,
              background: tab === active ? c.raised : 'transparent'
            }}
          >
            {tab}
          </span>
        ))}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 28 }}>
        {right}
        <span style={caps(11)}>Night shift · R. Verbeek, P. Smit</span>
        <RoomMeter />
        <span style={px(22, c.text)}>{clock(NOW)}:42</span>
      </div>
    </div>
  );
}

function RoomMeter({ level = 0.38 }: { level?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <span style={caps(11)}>Room</span>
      <span style={{ display: 'inline-flex', gap: 2, alignItems: 'flex-end', height: 14 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <span
            key={i}
            style={{
              width: 3,
              height: 4 + i * 0.8,
              borderRadius: 1,
              background: i / 12 < level ? (i > 8 ? c.amber : c.teal) : c.line
            }}
          />
        ))}
      </span>
      <span style={px(11, c.text)}>−31 LUFS</span>
    </span>
  );
}

function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: size,
        background: color,
        flex: 'none'
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Listening view                                                      */
/* ------------------------------------------------------------------ */

export function ListeningScreen() {
  const series = getSeries();
  const from = NOW - 360;
  const to = NOW + 1;
  return (
    <div style={{ width: 1440, height: 900, background: c.night, display: 'flex', flexDirection: 'column' }}>
      <AppBar active='Listen' />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Station list */}
        <aside style={{ width: 268, borderRight: `1px solid ${c.line}`, padding: '20px 0', overflow: 'hidden' }}>
          <div style={{ padding: '0 24px 14px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={caps(11, c.text)}>Stations</span>
            <span style={caps(11)}>31 · 3 in focus</span>
          </div>
          {['Zuidpolder', 'Molenkreek', 'Oosterdiep'].map((district) => (
            <div key={district} style={{ marginTop: 8 }}>
              <div style={{ ...caps(11, c.faint), padding: '8px 24px 6px' }}>{district}</div>
              {network
                .filter((s) => s.district === district)
                .slice(0, 6)
                .map((s, i) => {
                  const focusIndex = stations.findIndex((f) => f.code === s.code);
                  const off = focusIndex === 1;
                  return (
                    <div
                      key={s.code}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '6px 24px',
                        background: focusIndex >= 0 ? c.panel : 'transparent',
                        borderLeft: `2px solid ${focusIndex >= 0 ? (off ? c.amber : c.teal) : 'transparent'}`
                      }}
                    >
                      <span style={px(11, c.faint)}>{s.code}</span>
                      <span style={sans(14, focusIndex >= 0 ? 600 : 400, focusIndex >= 0 ? c.text : c.muted)}>
                        {s.name}
                      </span>
                      <span style={{ marginLeft: 'auto', width: 46, height: 14 }}>
                        <MiniTone index={i + district.length} hot={off} />
                      </span>
                    </div>
                  );
                })}
            </div>
          ))}
        </aside>

        {/* Lanes */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, padding: '22px 32px 14px' }}>
            <span style={sans(22, 600)}>In focus</span>
            <span style={caps(11)}>Last 6 hours · live</span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 22 }}>
              <Legend color={c.teal} label='Room tone' />
              <Legend color={c.amber} label='Off-key' />
              <Legend dashed label='Level contour' />
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 32px' }}>
            {stations.map((station, index) => {
              const v = voiceAt(index, NOW);
              const off = v.cents > 4;
              const s = series[index]!;
              return (
                <div
                  key={station.id}
                  style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gridTemplateRows: 'auto 1fr',
                    borderTop: `1px solid ${c.line}`,
                    padding: '14px 0 12px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                    <span style={px(11, c.faint)}>{station.code}</span>
                    <span style={sans(17, 600)}>{station.name}</span>
                    <span style={sans(13, 400, c.muted)}>{station.kind}</span>
                    <span style={{ marginLeft: 'auto', display: 'flex', gap: 22 }}>
                      <span style={px(11, c.muted)}>
                        Level <span style={{ color: c.text }}>{formatLevel(s.level[NOW]!)}</span>
                      </span>
                      <span style={px(11, c.muted)}>
                        Cl <span style={{ color: off ? c.amber : c.text }}>{formatSalinity(s.salinity[NOW]!)}</span>
                      </span>
                      <span style={px(11, c.muted)}>
                        Flow <span style={{ color: c.text }}>{formatFlow(s.flow[NOW]!)}</span>
                      </span>
                    </span>
                  </div>
                  <div style={{ position: 'relative', marginTop: 8, marginRight: 64 }}>
                    <LaneWave index={index} from={from} to={to} gain={1.1} />
                    <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 1, background: c.text }} />
                    <span style={{ ...caps(11, c.text), position: 'absolute', right: -50, top: -2 }}>Now</span>
                  </div>
                  {off && (
                    <div
                      aria-hidden
                      style={{
                        position: 'absolute',
                        left: 'calc(18% + 320px)',
                        right: 134,
                        top: 118,
                        borderTop: `1.5px dashed ${c.amber}`,
                        opacity: 0.8
                      }}
                    />
                  )}
                  {off && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '18%',
                        top: 50,
                        width: 320,
                        padding: '14px 16px',
                        borderRadius: 12,
                        background: '#1A2230',
                        boxShadow: `inset 0 0 0 1px ${c.amber}, 0 20px 40px -12px rgba(0,0,0,.6)`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Dot color={c.amber} />
                        <span style={caps(11, c.amber)}>Off-key since 02:47 · 31 min</span>
                      </div>
                      <p style={{ ...sans(15, 500), marginTop: 8 }}>
                        Chloride 1,360 mg/l and rising. Brighter, louder and a minor ninth above the D3 drone.
                      </p>
                      <p style={{ ...sans(13, 400, c.muted), marginTop: 6 }}>
                        SCADA alarm fires at 1,500 mg/l. Not reached yet.
                      </p>
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <Pill solid>Listen solo</Pill>
                        <Pill>Log it</Pill>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ padding: '6px 96px 18px 32px' }}>
            <HourLabels from={from} to={to} every={60} />
          </div>
        </main>

        {/* Now hearing */}
        <aside style={{ width: 300, borderLeft: `1px solid ${c.line}`, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <span style={caps(11, c.text)}>Now hearing</span>
          {stations.map((station, index) => {
            const v = voiceAt(index, NOW);
            const off = v.cents > 4;
            return (
              <div key={station.id} style={{ padding: '14px 0', borderTop: `1px solid ${c.line}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={sans(15, 600)}>{station.name}</span>
                  <span style={px(11, off ? c.amber : c.teal)}>
                    {station.note} {off ? `+${Math.round(v.cents)} ct` : 'in tune'}
                  </span>
                </div>
                <TuneDial cents={v.cents} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                  <span style={px(11)}>Bright {(v.cutoff / 1000).toFixed(1)} kHz</span>
                  <span style={px(11)}>{v.ticks.toFixed(1)} ticks/s</span>
                </div>
              </div>
            );
          })}
          <div style={{ borderTop: `1px solid ${c.line}`, paddingTop: 16 }}>
            <span style={caps(11)}>Tonight</span>
            {[
              ['02:51', 'Molenkreek off-key', 'Flagged by P. Smit', true],
              ['22:24', 'Oosterdiep surge', 'Heard, logged by R. Verbeek', false],
              ['19:40', 'Shift start', 'Room tone checked, −31 LUFS', false]
            ].map(([t, title, by, hot]) => (
              <div key={t as string} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', marginTop: 12 }}>
                <span style={px(11, hot ? c.amber : c.faint)}>{t as string}</span>
                <span>
                  <span style={{ ...sans(14, 500), display: 'block' }}>{title as string}</span>
                  <span style={sans(12, 400, c.muted)}>{by as string}</span>
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', padding: '16px', borderRadius: 12, background: c.panel }}>
            <span style={caps(11)}>Mix</span>
            <div style={{ position: 'relative', height: 40, marginTop: 12 }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 19, height: 1, background: c.line }} />
              {stations.map((s, i) => (
                <span
                  key={s.id}
                  style={{
                    position: 'absolute',
                    top: 9,
                    left: `${((s.pan + 1) / 2) * 100}%`,
                    transform: 'translateX(-50%)',
                    ...px(11, i === 1 ? c.night : c.text),
                    background: i === 1 ? c.amber : c.raised,
                    padding: '2px 6px',
                    borderRadius: 6
                  }}
                >
                  {s.code}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', ...px(11, c.faint) }}>
              <span>L</span>
              <span>C</span>
              <span>R</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Legend({ color, label, dashed }: { color?: string; label: string; dashed?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, ...caps(11) }}>
      {dashed ? (
        <span style={{ width: 16, borderTop: `1.5px dashed ${c.muted}` }} />
      ) : (
        <Dot color={color!} />
      )}
      {label}
    </span>
  );
}

function Pill({ children, solid }: { children: ReactNode; solid?: boolean }) {
  return (
    <span
      style={{
        ...sans(13, 600, solid ? c.night : c.text),
        padding: '7px 14px',
        borderRadius: 999,
        background: solid ? c.amber : 'transparent',
        boxShadow: solid ? 'none' : `inset 0 0 0 1px ${c.line}`
      }}
    >
      {children}
    </span>
  );
}

function TuneDial({ cents }: { cents: number }) {
  const pos = Math.max(-1, Math.min(1, cents / 80));
  return (
    <div style={{ position: 'relative', height: 22, marginTop: 12 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 10, height: 2, background: c.line, borderRadius: 2 }} />
      {Array.from({ length: 17 }, (_, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${(i / 16) * 100}%`,
            top: i % 4 === 0 ? 4 : 7,
            width: 1,
            height: i % 4 === 0 ? 14 : 8,
            background: i === 8 ? c.text : c.faint
          }}
        />
      ))}
      <span
        style={{
          position: 'absolute',
          left: `${50 + pos * 50}%`,
          top: 4,
          width: 4,
          height: 14,
          marginLeft: -2,
          borderRadius: 2,
          background: Math.abs(cents) > 4 ? c.amber : c.teal
        }}
      />
    </div>
  );
}

function MiniTone({ index, hot }: { index: number; hot?: boolean }) {
  const tone = networkTone(index);
  const d = wavePath(tone, 46, 14, NOW - 120, NOW, hot ? 1 : 1.4);
  const hotD = hot ? wavePath(getSeries()[1]!.amplitude, 46, 14, NOW - 120, NOW, 1) : null;
  return (
    <svg width='46' height='14' viewBox='0 0 46 14' aria-hidden>
      <path d={hotD ?? d} fill={hot ? c.amber : c.tealDeep} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Sound map                                                           */
/* ------------------------------------------------------------------ */

const sensors = [
  { name: 'Water level', unit: 'm NAP', range: '−0.40 → −0.05', maps: [0, 4] },
  { name: 'Chloride', unit: 'mg/l', range: '150 → 1,600', maps: [1, 4] },
  { name: 'Flow', unit: 'm³/s', range: '0 → 4.0', maps: [2] },
  { name: 'Gate opening', unit: '%', range: '0 → 100', maps: [3] },
  { name: 'Water temperature', unit: '°C', range: '2 → 24', maps: [] },
  { name: 'Turbidity', unit: 'NTU', range: '0 → 80', maps: [] }
];
const params = ['Drone pitch', 'Brightness', 'Tick density', 'Stereo width', 'Off-key partial'];

export function MappingScreen() {
  return (
    <div style={{ width: 1440, height: 900, background: c.night, display: 'flex', flexDirection: 'column' }}>
      <AppBar active='Sound map' />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <main style={{ flex: 1, padding: '30px 36px', display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div>
            <span style={caps(11)}>MK-11 · Inlet sluice · Molenkreek district</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 8 }}>
              <h2 style={sans(34, 600)}>Molenkreek sound map</h2>
              <span style={sans(14, 400, c.muted)}>Edited by J. Amrani · 6 Feb 2024 · v14</span>
            </div>
          </div>

          <div style={{ borderRadius: 14, background: c.panel, boxShadow: `inset 0 0 0 1px ${c.line}` }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '230px repeat(5, 1fr)',
                padding: '14px 22px',
                borderBottom: `1px solid ${c.line}`
              }}
            >
              <span style={caps(11)}>Sensor</span>
              {params.map((p) => (
                <span key={p} style={{ ...caps(11), textAlign: 'center' }}>
                  {p}
                </span>
              ))}
            </div>
            {sensors.map((sensor, row) => (
              <div
                key={sensor.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '230px repeat(5, 1fr)',
                  alignItems: 'center',
                  padding: '0 22px',
                  height: 62,
                  borderBottom: row < sensors.length - 1 ? `1px solid ${c.line}` : 'none',
                  background: row === 1 ? c.raised : 'transparent'
                }}
              >
                <div>
                  <div style={sans(15, 600, sensor.maps.length ? c.text : c.muted)}>{sensor.name}</div>
                  <div style={px(11, c.faint)}>
                    {sensor.range} {sensor.unit}
                  </div>
                </div>
                {params.map((p, col) => {
                  const on = sensor.maps.includes(col);
                  const selected = row === 1 && col === 1;
                  return (
                    <div key={p} style={{ display: 'flex', justifyContent: 'center' }}>
                      {on ? (
                        <span
                          style={{
                            width: selected ? 40 : 30,
                            height: selected ? 40 : 30,
                            borderRadius: 999,
                            display: 'grid',
                            placeItems: 'center',
                            background: selected ? c.teal : 'transparent',
                            boxShadow: selected ? `0 0 0 6px rgba(71,211,197,.15)` : `inset 0 0 0 1.5px ${col === 4 ? c.amber : c.teal}`
                          }}
                        >
                          <Dot color={selected ? c.night : col === 4 ? c.amber : c.teal} size={selected ? 10 : 8} />
                        </span>
                      ) : (
                        <span style={{ width: 6, height: 6, borderRadius: 6, background: c.line }} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              ['Quiet by default', 'Room tone sits at −31 LUFS, under the air handling. Only deviation adds level.', '−31 LUFS'],
              ['Ceiling', 'Nothing in the mix can go above −18 LUFS, whatever the river does.', '−18 LUFS'],
              ['Off-key rule', 'Leaving the forecast band adds a minor ninth. Back in band, it fades in 40 s.', '♭9 · 40 s']
            ].map(([title, body, value]) => (
              <div key={title} style={{ padding: '18px 20px', borderRadius: 14, boxShadow: `inset 0 0 0 1px ${c.line}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={sans(15, 600)}>{title}</span>
                  <span style={px(11, c.teal)}>{value}</span>
                </div>
                <p style={{ ...sans(13, 400, c.muted, { lineHeight: 1.45 }), marginTop: 8 }}>{body}</p>
              </div>
            ))}
          </div>

          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '16px 20px 12px', borderRadius: 14, background: c.panel }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={caps(11, c.text)}>Preview · 14–15 Mar through this map</span>
              <span style={caps(11)}>Peak −22 LUFS at 03:18 · room −31</span>
            </div>
            <div style={{ flex: 1, minHeight: 0, marginTop: 10 }}>
              <LaneWave index={1} gain={1} />
            </div>
            <HourLabels />
          </div>
        </main>

        <aside style={{ width: 460, borderLeft: `1px solid ${c.line}`, padding: '30px 30px', display: 'flex', flexDirection: 'column' }}>
          <span style={caps(11)}>Selected mapping</span>
          <h3 style={{ ...sans(24, 600), marginTop: 8 }}>
            Chloride <span style={{ color: c.muted }}>→</span> Brightness
          </h3>
          <p style={{ ...sans(14, 400, c.muted, { lineHeight: 1.5 }), marginTop: 8 }}>
            A low-pass filter opens as salt comes in. Fresh water sounds dull and round; an intrusion sounds like the drone stepping into a tiled room.
          </p>
          <CurveChart />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 22 }}>
            {[
              ['Input', '150 → 1,600 mg/l'],
              ['Output', '0.5 → 4.2 kHz'],
              ['Curve', 'Logarithmic, 0.85'],
              ['Smoothing', '90 s']
            ].map(([k, v]) => (
              <div key={k} style={{ padding: '12px 14px', borderRadius: 10, background: c.panel }}>
                <div style={caps(11, c.faint)}>{k}</div>
                <div style={{ ...px(13, c.text), marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
          <span style={{ ...caps(11), marginTop: 26 }}>Audition with a real night</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            {[
              ['Normal night', '8 Feb', 0, false],
              ['Intrusion', '15 Mar', 1, true],
              ['Storm surge', '2 Feb', 2, false]
            ].map(([label, date, lane, active]) => (
              <div
                key={label as string}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: active ? c.raised : 'transparent',
                  boxShadow: `inset 0 0 0 1px ${active ? c.teal : c.line}`
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 30,
                    display: 'grid',
                    placeItems: 'center',
                    background: active ? c.teal : c.raised,
                    color: active ? c.night : c.text
                  }}
                >
                  <svg width='10' height='10' viewBox='0 0 12 12' aria-hidden>
                    <path d='M2.5 1.2 11 6l-8.5 4.8z' fill='currentColor' />
                  </svg>
                </span>
                <span style={sans(14, 600)}>{label as string}</span>
                <span style={px(11)}>{date as string}</span>
                <span style={{ marginLeft: 'auto', width: 120, height: 22 }}>
                  <LaneWave
                    index={lane as number}
                    grid={false}
                    showLevel={false}
                    from={[0, 780, 520][lane as number]}
                    to={[320, 1100, 840][lane as number]}
                  />
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function CurveChart() {
  const W = 364;
  const H = 210;
  const xMin = 150;
  const xMax = 1600;
  const x = (v: number) => ((v - xMin) / (xMax - xMin)) * W;
  const y = (hz: number) => H - ((hz - 500) / (4200 - 500)) * H;
  const points: string[] = [];
  for (let v = xMin; v <= xMax; v += 25) {
    const hz = Math.min(4200, 520 * Math.pow(v / 210, 0.85));
    points.push(`${x(v).toFixed(1)},${y(hz).toFixed(1)}`);
  }
  return (
    <div style={{ marginTop: 22, padding: '18px 18px 12px', borderRadius: 14, background: c.panel }}>
      <svg width={W} height={H + 22} viewBox={`0 0 ${W} ${H + 22}`} aria-hidden style={{ overflow: 'visible' }}>
        <rect x={x(150)} y={0} width={x(260) - x(150)} height={H} fill={c.teal} opacity='0.1' />
        <text x={x(150) + 6} y={14} style={{ ...px(11, c.teal), fill: c.teal }}>
          Normal band
        </text>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={0} x2={W} y1={H * f} y2={H * f} stroke={c.line} />
        ))}
        <line x1={x(1500)} x2={x(1500)} y1={0} y2={H} stroke='#E5534B' strokeDasharray='3 4' />
        <text x={x(1500) - 6} y={14} textAnchor='end' style={{ ...px(11), fill: '#E5534B' }}>
          SCADA alarm
        </text>
        <path d={`M${points.join('L')}`} fill='none' stroke={c.teal} strokeWidth='2.5' />
        <circle cx={x(1380)} cy={y(Math.min(4200, 520 * Math.pow(1380 / 210, 0.85)))} r='6' fill={c.amber} />
        <text x={x(1380) - 14} y={y(Math.min(4200, 520 * Math.pow(1380 / 210, 0.85))) - 12} textAnchor='end' style={{ ...px(11), fill: c.amber }}>
          15 Mar peak · 1,380
        </text>
        <line x1={0} x2={W} y1={H} y2={H} stroke={c.faint} />
        {[150, 500, 1000, 1500].map((v) => (
          <text key={v} x={x(v)} y={H + 18} textAnchor={v === 150 ? 'start' : 'middle'} style={{ ...px(11), fill: c.faint }}>
            {v.toLocaleString('en-GB')}
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Replay                                                              */
/* ------------------------------------------------------------------ */

const BREAK_FROM = 880;
const BREAK_TO = 916;

export function ReplayScreen() {
  const rows = network.map((s, i) => {
    const focus = stations.findIndex((f) => f.code === s.code);
    return { ...s, tone: focus >= 0 ? getSeries()[focus]!.amplitude : networkTone(i), focus };
  });
  const W = 820;
  const rowH = 14;
  const bx = (m: number) => (m / MINUTES) * W;
  return (
    <div style={{ width: 1440, height: 900, background: c.night, display: 'flex', flexDirection: 'column' }}>
      <AppBar active='Replay' />
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 440px', minHeight: 0 }}>
        <main style={{ padding: '34px 40px', display: 'flex', flexDirection: 'column' }}>
          <span style={caps(11, c.teal)}>Your break · 02:40 – 03:16 · 36 minutes</span>
          <h2 style={{ ...sans(44, 600), marginTop: 10 }}>While you were away</h2>
          <p style={{ ...sans(17, 400, c.muted, { lineHeight: 1.45 }), marginTop: 10, maxWidth: 640 }}>
            The whole network played back at 600×. Your 36 minutes take 3.6 seconds; the full night takes 2 minutes 24.
          </p>

          <div style={{ marginTop: 30, padding: '20px 22px 16px', borderRadius: 16, background: c.panel, boxShadow: `inset 0 0 0 1px ${c.line}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={caps(11, c.text)}>31 stations · 12:00 Thu → 12:00 Fri</span>
              <span style={caps(11)}>Each row is what that station sounded like</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '58px 1fr', columnGap: 12 }}>
              <div>
                {rows.map((r) => (
                  <div key={r.code} style={{ height: rowH, ...px(10, r.focus >= 0 ? c.text : c.faint), lineHeight: `${rowH}px` }}>
                    {r.code}
                  </div>
                ))}
              </div>
              <div style={{ position: 'relative' }}>
                <svg width={W} height={rows.length * rowH} viewBox={`0 0 ${W} ${rows.length * rowH}`} aria-hidden>
                  {rows.map((r, i) => {
                    const amp = r.tone;
                    return (
                      <g key={r.code} transform={`translate(0 ${i * rowH})`}>
                        <path d={wavePath(amp, W, rowH, 0, MINUTES, 1.2)} fill={r.focus >= 0 ? c.teal : c.tealDeep} />
                        {anomalies
                          .filter((a) => stations[a.lane]!.code === r.code)
                          .map((a) => (
                            <path
                              key={a.id}
                              transform={`translate(${bx(a.start)} 0)`}
                              d={wavePath(amp.subarray(a.start, a.end), bx(a.end) - bx(a.start), rowH, 0, a.end - a.start, 1.2)}
                              fill={c.amber}
                            />
                          ))}
                      </g>
                    );
                  })}
                  <rect x={bx(BREAK_FROM)} y={0} width={bx(BREAK_TO) - bx(BREAK_FROM)} height={rows.length * rowH} fill={c.text} opacity='0.1' />
                  <line x1={bx(BREAK_FROM)} x2={bx(BREAK_FROM)} y1={0} y2={rows.length * rowH} stroke={c.text} strokeOpacity='0.6' />
                  <line x1={bx(BREAK_TO)} x2={bx(BREAK_TO)} y1={0} y2={rows.length * rowH} stroke={c.text} strokeOpacity='0.6' />
                </svg>
                <div style={{ marginTop: 8 }}>
                  <HourLabels every={180} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 18 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                height: 48,
                padding: '0 24px 0 20px',
                borderRadius: 999,
                background: c.teal,
                ...sans(16, 600, c.night)
              }}
            >
              <svg width='12' height='12' viewBox='0 0 12 12' aria-hidden>
                <path d='M2.5 1.2 11 6l-8.5 4.8z' fill='currentColor' />
              </svg>
              Replay my break
            </span>
            <span style={{ display: 'flex', padding: 3, borderRadius: 999, background: c.raised }}>
              {['60×', '600×'].map((s) => (
                <span
                  key={s}
                  style={{
                    ...px(11, s === '600×' ? c.night : c.muted),
                    padding: '8px 14px',
                    borderRadius: 999,
                    background: s === '600×' ? c.text : 'transparent'
                  }}
                >
                  {s}
                </span>
              ))}
            </span>
            <span style={px(13, c.muted)}>3.6 s · 31 stations · headphones recommended</span>
          </div>
        </main>

        <aside style={{ borderLeft: `1px solid ${c.line}`, padding: '34px 30px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={caps(11)}>3 things happened · 1 needs you</span>
          {[
            {
              time: '02:47',
              station: 'MK-11 Molenkreek',
              title: 'Salinity rising, still off-key',
              body: 'Chloride went from 210 to 1,360 mg/l. You’ll hear the D3 drone brighten, then a minor ninth come in.',
              hot: true
            },
            {
              time: '02:58',
              station: 'OD-07 Oosterdiep',
              title: 'Tide 6 cm over forecast, settled',
              body: 'A short wobble in pitch and back in tune by 03:09. No action.',
              hot: false
            },
            {
              time: '03:05',
              station: 'ZP-03 Zuidpolder',
              title: 'Pump 1 cycled as scheduled',
              body: 'Ticks thin out for 40 s while the pump restarts. Normal.',
              hot: false
            }
          ].map((e) => (
            <div
              key={e.time}
              style={{
                padding: '18px 20px',
                borderRadius: 14,
                background: e.hot ? '#1A2230' : c.panel,
                boxShadow: `inset 0 0 0 1px ${e.hot ? c.amber : c.line}`
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                <span style={px(13, e.hot ? c.amber : c.teal)}>{e.time}</span>
                <span style={caps(11)}>{e.station}</span>
              </div>
              <div style={{ ...sans(17, 600), marginTop: 8 }}>{e.title}</div>
              <p style={{ ...sans(14, 400, c.muted, { lineHeight: 1.45 }), marginTop: 6 }}>{e.body}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <Pill solid={e.hot}>Listen · 4 s</Pill>
                <Pill>{e.hot ? 'Open in Listen' : 'Mark heard'}</Pill>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The existing SCADA wall, with and without Undertone docked          */
/* ------------------------------------------------------------------ */

const scada = {
  bg: '#1E2124',
  tile: '#272B2F',
  edge: '#33383D',
  text: '#C9CED3',
  dim: '#7D858C',
  line: '#79C77F',
  alarm: '#E5534B'
};

function tileValue(kind: string, i: number) {
  const r = ((i * 2654435761) >>> 0) / 4294967296;
  switch (kind) {
    case 'Level':
      return (-0.6 + r * 0.55).toFixed(2);
    case 'Cl':
      return String(Math.round(170 + r * 90));
    case 'Flow':
      return (0.8 + r * 8).toFixed(1);
    case 'Gate':
      return `${Math.round(r * 60)}%`;
    default:
      return (6.5 + r * 2.4).toFixed(1);
  }
}

export function ScadaScreen({ withUndertone }: { withUndertone: boolean }) {
  const cols = 14;
  const rowsN = 10;
  const tileW = 96;
  const tileH = 54;
  const tiles = Array.from({ length: cols * rowsN }, (_, i) => {
    const st = network[i % network.length]!;
    const kind = ['Level', 'Cl', 'Flow', 'Gate', 'Temp'][Math.floor(i / network.length) % 5]!;
    return { id: `${st.code}-${kind}`, code: st.code, kind, i };
  });
  const hotIndex = tiles.findIndex((t) => t.code === 'MK-11' && t.kind === 'Cl');
  const salt = getSeries()[1]!.salinity;
  return (
    <div style={{ width: 1440, height: 900, background: scada.bg, fontFamily: 'Arial, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 34, display: 'flex', alignItems: 'center', gap: 24, padding: '0 16px', background: '#2E3338', borderBottom: `1px solid ${scada.edge}` }}>
        <span style={{ color: scada.text, fontSize: 13, fontWeight: 700 }}>LDW-SCADA 7.2</span>
        <span style={{ color: scada.dim, fontSize: 12 }}>Overview · Measuring points (140)</span>
        <span style={{ color: scada.dim, fontSize: 12 }}>Trend window 60 min</span>
        <span style={{ marginLeft: 'auto', color: scada.text, fontSize: 12 }}>15-03-2024 03:18:42</span>
      </div>
      <div style={{ padding: 14, display: 'grid', gridTemplateColumns: `repeat(${cols}, ${tileW}px)`, gap: 6, justifyContent: 'center' }}>
        {tiles.map((t) => {
          const hot = t.i === hotIndex;
          const tone = networkTone(t.i + 40);
          let d = '';
          if (hot) {
            const pts: string[] = [];
            for (let k = 0; k <= 60; k++) {
              const v = salt[NOW - 60 + k]!;
              const yv = tileH - 22 - ((v - 0) / 1800) * (tileH - 26);
              pts.push(`${((k / 60) * (tileW - 12)).toFixed(1)},${yv.toFixed(1)}`);
            }
            d = `M${pts.join('L')}`;
          } else {
            const pts: string[] = [];
            for (let k = 0; k <= 30; k++) {
              const v = tone[NOW - 60 + k * 2]! * 40;
              pts.push(`${((k / 30) * (tileW - 12)).toFixed(1)},${(tileH - 30 - v * 0.6).toFixed(1)}`);
            }
            d = `M${pts.join('L')}`;
          }
          return (
            <div
              key={t.id}
              style={{
                width: tileW,
                height: tileH,
                background: scada.tile,
                border: `1px solid ${hot && withUndertone ? c.amber : scada.edge}`,
                boxShadow: hot && withUndertone ? `0 0 0 2px ${c.amber}` : 'none',
                padding: '4px 6px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: scada.dim }}>
                <span>
                  {t.code} {t.kind}
                </span>
                <span style={{ color: scada.text }}>{hot ? '1360' : tileValue(t.kind, t.i)}</span>
              </div>
              <svg width={tileW - 12} height={tileH - 18} viewBox={`0 0 ${tileW - 12} ${tileH - 18}`} style={{ position: 'absolute', left: 6, top: 16 }} aria-hidden>
                <line x1='0' x2={tileW} y1='5' y2='5' stroke={scada.alarm} strokeWidth='0.8' strokeDasharray='2 2' />
                <path d={d} transform='translate(0 -4)' fill='none' stroke={scada.line} strokeWidth='1' />
              </svg>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1, margin: '2px 14px 14px', minHeight: 0 }}>
        {withUndertone ? (
          <div
            style={{
              height: '100%',
              borderRadius: 14,
              background: c.night,
              boxShadow: `0 0 0 1px ${c.line}, 0 -20px 50px -10px rgba(0,0,0,.6)`,
              display: 'grid',
              gridTemplateColumns: '300px 1fr',
              overflow: 'hidden',
              fontFamily: 'var(--fg-font-sans)'
            }}
          >
            <div style={{ padding: '18px 22px', borderRight: `1px solid ${c.line}` }}>
              <Wordmark size={15} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18 }}>
                <Dot color={c.amber} />
                <span style={caps(11, c.amber)}>Off-key since 02:47</span>
              </div>
              <div style={{ ...sans(19, 600), marginTop: 8 }}>Molenkreek sounds wrong</div>
              <p style={{ ...sans(13, 400, c.muted, { lineHeight: 1.45 }), marginTop: 6 }}>
                Chloride 1,360 mg/l, rising. SCADA alarm at 1,500 not reached.
              </p>
            </div>
            <div style={{ padding: '16px 22px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {stations.map((s, i) => (
                <div key={s.id} style={{ flex: 1, display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: 14 }}>
                  <span style={px(11, i === 1 ? c.amber : c.muted)}>
                    {s.code} {s.name}
                  </span>
                  <div style={{ height: '100%', position: 'relative' }}>
                    <LaneWave index={i} from={NOW - 240} to={NOW + 1} showLevel={false} gain={1.1} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ height: '100%', background: '#25292D', border: `1px solid ${scada.edge}`, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '160px 120px 1fr 120px 120px', padding: '6px 12px', fontSize: 11, color: scada.dim, borderBottom: `1px solid ${scada.edge}`, background: '#2E3338' }}>
              <span>Time</span>
              <span>Point</span>
              <span>Message</span>
              <span>Priority</span>
              <span>State</span>
            </div>
            {[
              ['15-03 01:52:10', 'ZP-07 Gate', 'Gate position deviation 3 %', 'Low', 'Cleared'],
              ['15-03 00:14:33', 'OD-07 Level', 'Level high (forecast +0.20 m)', 'Medium', 'Cleared'],
              ['14-03 22:41:02', 'OD-07 Level', 'Level high (forecast +0.20 m)', 'Medium', 'Acknowledged']
            ].map((row) => (
              <div key={row[0]} style={{ display: 'grid', gridTemplateColumns: '160px 120px 1fr 120px 120px', padding: '6px 12px', fontSize: 12, color: scada.dim, borderBottom: `1px solid ${scada.edge}` }}>
                {row.map((cell, k) => (
                  <span key={k}>{cell}</span>
                ))}
              </div>
            ))}
            <div style={{ margin: 'auto', color: scada.dim, fontSize: 13 }}>No active alarms</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* On-call phone                                                       */
/* ------------------------------------------------------------------ */

function StatusBar({ color = c.text }: { color?: string }) {
  return (
    <div style={{ height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 34px 0 40px', ...sans(15, 600, color) }}>
      <span>3:19</span>
      <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width='18' height='11' viewBox='0 0 18 11' aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 5} y={8 - i * 2.6} width='3' height={3 + i * 2.6} rx='1' fill={color} />
          ))}
        </svg>
        <svg width='25' height='12' viewBox='0 0 25 12' aria-hidden>
          <rect x='0.5' y='0.5' width='21' height='11' rx='3' fill='none' stroke={color} opacity='0.5' />
          <rect x='2' y='2' width='15' height='8' rx='2' fill={color} />
          <rect x='22.5' y='4' width='1.5' height='4' rx='0.7' fill={color} opacity='0.5' />
        </svg>
      </span>
    </div>
  );
}

export function OnCallAlert() {
  const s = getSeries()[1]!;
  return (
    <div style={{ width: 390, height: 844, background: c.night, color: c.text, display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ padding: '16px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Wordmark size={15} />
        <span style={caps(11)}>On call · J. de Wit</span>
      </div>
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Dot color={c.amber} />
          <span style={caps(11, c.amber)}>MK-11 · off-key 31 min</span>
        </div>
        <h3 style={{ ...sans(31, 600, c.text, { lineHeight: 1.08 }), marginTop: 12 }}>
          Molenkreek has sounded wrong since 02:47
        </h3>
        <p style={{ ...sans(16, 400, c.muted, { lineHeight: 1.45 }), marginTop: 12 }}>
          P. Smit in the control room flagged it for you. The SCADA alarm hasn’t fired.
        </p>
      </div>
      <div style={{ margin: '20px 24px 0', padding: '16px 18px 14px', borderRadius: 20, background: c.panel, boxShadow: `inset 0 0 0 1px ${c.line}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={caps(11)}>Last 10 minutes</span>
          <span style={px(11, c.text)}>03:08 – 03:18</span>
        </div>
        <svg width='304' height='70' viewBox='0 0 304 70' aria-hidden style={{ display: 'block', marginTop: 12 }}>
          <path d={wavePath(denseWave(1, NOW - 10, NOW, 220), 304, 70, 0, 220, 1)} fill={c.amber} />
        </svg>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 14, gap: 8 }}>
          {[
            ['Cl', formatSalinity(s.salinity[NOW]!), true],
            ['Level', formatLevel(s.level[NOW]!), false],
            ['Flow', formatFlow(s.flow[NOW]!), false]
          ].map(([k, v, hot]) => (
            <div key={k as string}>
              <div style={caps(11, c.faint)}>{k as string}</div>
              <div style={{ ...px(13, hot ? c.amber : c.text), marginTop: 2 }}>{v as string}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ margin: '18px 24px 0' }}>
        <span style={caps(11)}>Who knows</span>
        {[
          ['P. Smit', 'Control room · listening now', c.amber],
          ['F. Oudshoorn', 'Hydrology · notified 03:17', c.teal]
        ].map(([name, role, dot]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: 34, background: c.raised, display: 'grid', placeItems: 'center', ...px(11, c.text) }}>
              {name.split(' ').map((p) => p[0]).join('')}
            </span>
            <span style={{ flex: 1 }}>
              <span style={{ ...sans(15, 600), display: 'block' }}>{name}</span>
              <span style={sans(13, 400, c.muted)}>{role}</span>
            </span>
            <Dot color={dot} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 'auto', padding: '20px 24px 34px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ height: 54, borderRadius: 999, background: c.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, ...sans(17, 600, c.night) }}>
          <svg width='12' height='12' viewBox='0 0 12 12' aria-hidden>
            <path d='M2.5 1.2 11 6l-8.5 4.8z' fill='currentColor' />
          </svg>
          Listen to the last 10 minutes
        </span>
        <span style={{ height: 54, borderRadius: 999, boxShadow: `inset 0 0 0 1px ${c.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...sans(17, 600) }}>
          Call the control room
        </span>
      </div>
    </div>
  );
}

export function OnCallPlayer() {
  return (
    <div style={{ width: 390, height: 844, background: c.panel, color: c.text, display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ padding: '16px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 34, height: 34, borderRadius: 34, display: 'grid', placeItems: 'center', background: c.raised }}>
          <svg width='14' height='14' viewBox='0 0 14 14' aria-hidden>
            <path d='M9 2 4 7l5 5' fill='none' stroke={c.text} strokeWidth='1.8' strokeLinecap='round' />
          </svg>
        </span>
        <span style={sans(16, 600)}>Molenkreek · MK-11</span>
      </div>
      <div style={{ padding: '30px 24px 0' }}>
        <span style={caps(11)}>Playing · real time</span>
        <div style={{ ...px(44, c.text), lineHeight: '52px', marginTop: 6 }}>03:13:26</div>
      </div>
      <div style={{ margin: '22px 24px 0', height: 220, position: 'relative' }}>
        <svg width='342' height='220' viewBox='0 0 342 220' aria-hidden style={{ display: 'block' }}>
          <path d={wavePath(denseWave(1, NOW - 10, NOW, 300), 342, 220, 0, 300, 1)} fill={c.amber} opacity='0.35' />
          <path d={wavePath(denseWave(1, NOW - 10, NOW - 4.5, 165), 188, 220, 0, 165, 1)} fill={c.amber} />
        </svg>
        <div style={{ position: 'absolute', left: 188, top: -8, bottom: -8, width: 2, background: c.text, borderRadius: 2 }} />
      </div>
      <div style={{ padding: '10px 24px 0', display: 'flex', justifyContent: 'space-between', ...px(11, c.faint) }}>
        <span>03:08</span>
        <span>03:13</span>
        <span>03:18</span>
      </div>
      <div style={{ margin: '22px 24px 0', padding: 16, borderRadius: 16, background: c.night }}>
        <span style={caps(11)}>What you’re hearing</span>
        <p style={{ ...sans(15, 400, c.text, { lineHeight: 1.45 }), marginTop: 8 }}>
          D3 drone, 70 cents sharp, filter open to 2.5 kHz. The off-key partial is at full level: chloride is six times normal.
        </p>
      </div>
      <div style={{ marginTop: 'auto', padding: '0 24px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30 }}>
          <span style={px(13, c.muted)}>−30 s</span>
          <span style={{ width: 76, height: 76, borderRadius: 76, display: 'grid', placeItems: 'center', background: c.teal, color: c.night }}>
            <svg width='22' height='22' viewBox='0 0 12 12' aria-hidden>
              <path d='M2 1h3v10H2zM7 1h3v10H7z' fill='currentColor' />
            </svg>
          </span>
          <span style={px(13, c.muted)}>10× speed</span>
        </div>
        <span style={{ marginTop: 26, height: 52, borderRadius: 999, boxShadow: `inset 0 0 0 1px ${c.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...sans(16, 600) }}>
          I’m on my way · hand back
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pilot report                                                        */
/* ------------------------------------------------------------------ */

export const pilotTests: {
  id: string;
  kind: string;
  station: string;
  heard: number | null;
  note?: string;
}[] = [
  { id: 'T01', kind: 'Salinity', station: 'MK-11', heard: -6 },
  { id: 'T02', kind: 'Level', station: 'OD-07', heard: -3 },
  { id: 'T03', kind: 'Flow', station: 'ZP-03', heard: -5 },
  { id: 'T04', kind: 'Salinity', station: 'MK-09', heard: -9 },
  { id: 'T05', kind: 'Level', station: 'ZP-01', heard: -2 },
  { id: 'T06', kind: 'Flow', station: 'MK-11', heard: null, note: 'Masked by gate maintenance noise' },
  { id: 'T07', kind: 'Salinity', station: 'OD-02', heard: -4 },
  { id: 'T08', kind: 'Level', station: 'OD-07', heard: -11 },
  { id: 'T09', kind: 'Flow', station: 'ZP-05', heard: -4 },
  { id: 'T10', kind: 'Salinity', station: 'MK-11', heard: null, note: 'Operator on a radio call' },
  { id: 'T11', kind: 'Level', station: 'ZP-03', heard: -1 }
];

export function PilotReport() {
  const ink = c.ink;
  const mute = '#55606B';
  const W = 760;
  const min = -14;
  const max = 4;
  const x = (v: number) => ((v - min) / (max - min)) * W;
  return (
    <div style={{ width: 1440, height: 1800, background: '#DCD8CD', display: 'grid', placeItems: 'center' }}>
      <div
        style={{
          width: 1080,
          height: 1520,
          background: c.paper,
          padding: '80px 90px',
          boxShadow: '0 40px 80px -40px rgba(12,24,35,.45), 0 2px 6px rgba(12,24,35,.08)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, ...sans(17, 600, ink) }}>
            <Mark size={20} color={c.tealDeep} />
            undertone
          </span>
          <span style={caps(11, mute)}>Pilot report · Waterschap Lage Delta · 3 / 7</span>
        </div>
        <div style={{ height: 1, background: '#CFCabe', marginTop: 28 }} />
        <span style={{ ...caps(11, c.tealDeep), marginTop: 56 }}>Ten weeks · 8 Jan – 15 Mar 2024 · 11 injected anomalies</span>
        <h2 style={{ ...sans(76, 600, ink, { lineHeight: 0.98, letterSpacing: '-0.04em' }), marginTop: 18 }}>
          {'Heard before the alarm in 9\u00a0of\u00a011 tests'}
        </h2>
        <p style={{ ...sans(20, 400, mute, { lineHeight: 1.45 }), marginTop: 24, maxWidth: 760 }}>
          Dr. Femke Oudshoorn’s team injected anomalies into live data without telling the night shift. We logged when an operator first flagged each one and compared it with the SCADA threshold alarm.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', marginTop: 56, borderTop: `1px solid ${ink}` }}>
          {[
            ['9 / 11', 'flagged by ear first'],
            ['4 min', 'median lead over the alarm'],
            ['0', 'noise complaints in 70 nights']
          ].map(([v, l]) => (
            <div key={l} style={{ paddingTop: 20 }}>
              <div style={sans(52, 600, ink, { letterSpacing: '-0.035em', lineHeight: 1 })}>{v}</div>
              <div style={{ ...sans(16, 400, mute), marginTop: 10 }}>{l}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 64 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={sans(20, 600, ink)}>Minutes between the operator’s flag and the threshold alarm</span>
            <span style={caps(11, mute)}>Earlier ←</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', marginTop: 26 }}>
            <div>
              {pilotTests.map((t) => (
                <div key={t.id} style={{ height: 44, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={px(11, ink)}>{t.id}</span>
                  <span style={px(11, mute)}>
                    {t.station} {t.kind}
                  </span>
                </div>
              ))}
            </div>
            <svg width={W + 40} height={pilotTests.length * 44 + 40} viewBox={`-20 0 ${W + 40} ${pilotTests.length * 44 + 40}`} aria-hidden style={{ marginLeft: -20 }}>
              {Array.from({ length: (max - min) / 2 + 1 }, (_, k) => min + k * 2).map((v) => (
                <g key={v}>
                  <line x1={x(v)} x2={x(v)} y1={0} y2={pilotTests.length * 44} stroke={v === 0 ? ink : '#CFCABE'} strokeWidth={v === 0 ? 1.5 : 1} />
                  <text x={x(v)} y={pilotTests.length * 44 + 22} textAnchor='middle' style={{ ...px(11, mute), fill: mute }}>
                    {v > 0 ? `+${v}` : v === 0 ? '0' : `−${-v}`}
                  </text>
                </g>
              ))}
              <text x={x(0) + 8} y={pilotTests.length * 44 + 22} style={{ ...px(11, ink), fill: ink }} textAnchor='start' dx='12'>
                alarm
              </text>
              <line x1={x(-4)} x2={x(-4)} y1={-6} y2={pilotTests.length * 44} stroke={c.tealDeep} strokeWidth='1.5' strokeDasharray='4 4' />
              {pilotTests.map((t, i) => {
                const cy = i * 44 + 22;
                if (t.heard === null) {
                  return (
                    <g key={t.id}>
                      <path d={`M${x(0) - 6} ${cy - 6}l12 12M${x(0) + 6} ${cy - 6}l-12 12`} stroke='#B2472F' strokeWidth='2' />
                      <text
                        x={x(0) - 18}
                        y={cy + 4}
                        textAnchor='end'
                        stroke={c.paper}
                        strokeWidth='8'
                        paintOrder='stroke'
                        style={{ ...px(11, '#B2472F'), fill: '#B2472F' }}
                      >
                        Not heard · {t.note}
                      </text>
                    </g>
                  );
                }
                return (
                  <g key={t.id}>
                    <line x1={x(t.heard)} x2={x(0)} y1={cy} y2={cy} stroke={c.tealDeep} strokeWidth='2' opacity='0.35' />
                    <circle cx={x(t.heard)} cy={cy} r='8' fill={c.tealDeep} />
                  </g>
                );
              })}
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 26, marginTop: 6, marginLeft: 140 }}>
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', ...caps(11, mute) }}>
              <Dot color={c.tealDeep} size={10} /> Flagged by ear
            </span>
            <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', ...caps(11, mute) }}>
              <span style={{ width: 16, borderTop: `1.5px dashed ${c.tealDeep}` }} /> Median, −4 min
            </span>
          </div>
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', ...caps(11, mute) }}>
          <span>Prepared by N. Haddad and F. Oudshoorn</span>
          <span>March 2024</span>
        </div>
      </div>
    </div>
  );
}
