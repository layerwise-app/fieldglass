import type { CSSProperties, ReactNode } from 'react';
import { BrowserFrame } from '~/components/frames';
import type { ScreenSet } from '~/content/screens';
import Demo from './demo';
import { at, ModelSvg, type View } from './ModelSvg';
import { compass, formatClock, sunAt, surfaces, type Season, type V2, type V3 } from './model';
import { PlanSvg } from './plan';
import { C, Chip, labelStyle, Mark, Panel, Pin, pixel, sans, SunDial, Wordmark } from './ui';

// ------------------------------------------------------------------ pieces

function Icon({ name, size = 22, color = C.ink }: { name: 'note' | 'sun' | 'measure' | 'model' | 'check' | 'mic'; size?: number; color?: string }) {
  const p = { fill: 'none', stroke: color, strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' aria-hidden>
      {name === 'note' && (
        <>
          <path {...p} d='M12 21s6-5.6 6-11a6 6 0 1 0-12 0c0 5.4 6 11 6 11Z' />
          <circle cx='12' cy='10' r='2.2' fill={color} />
        </>
      )}
      {name === 'mic' && (
        <>
          <rect {...p} x='9' y='3' width='6' height='11' rx='3' />
          <path {...p} d='M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21' />
        </>
      )}
      {name === 'sun' && (
        <>
          <circle {...p} cx='12' cy='12' r='4' />
          <path {...p} d='M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6' />
        </>
      )}
      {name === 'measure' && (
        <>
          <path {...p} d='M3.5 16.5 16.5 3.5l4 4-13 13Z' />
          <path {...p} d='m7 13 1.6 1.6M9.8 10.2l2.4 2.4M12.6 7.4l1.6 1.6' />
        </>
      )}
      {name === 'model' && (
        <>
          <path {...p} d='M12 3 3.5 7.5v9L12 21l8.5-4.5v-9Z' />
          <path {...p} d='M3.5 7.5 12 12l8.5-4.5M12 12v9' />
        </>
      )}
      {name === 'check' && <path {...p} d='m5 12.5 4.2 4.2L19 7' />}
    </svg>
  );
}

function Dock({ active, style }: { active: 'note' | 'sun' | 'measure' | 'model'; style?: CSSProperties }) {
  const items = [
    ['note', 'Note'],
    ['sun', 'Sun'],
    ['measure', 'Measure'],
    ['model', '1:50']
  ] as const;
  return (
    <Panel radius={30} padding={8} style={{ display: 'flex', gap: 4, ...style }}>
      {items.map(([name, text]) => (
        <div
          key={name}
          style={{
            width: 84,
            height: 64,
            borderRadius: 22,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            background: active === name ? C.ink : 'transparent',
            color: active === name ? '#F6F3EE' : C.ink
          }}
        >
          <Icon name={name} color={active === name ? '#F6F3EE' : C.ink} />
          <span style={{ fontFamily: sans, fontSize: 13, fontWeight: 500 }}>{text}</span>
        </div>
      ))}
    </Panel>
  );
}

function StatusBar({ room, scale = '1:1', style }: { room: string; scale?: string; style?: CSSProperties }) {
  return (
    <Panel radius={22} padding={0} style={{ display: 'flex', alignItems: 'center', gap: 16, height: 48, padding: '0 8px 0 18px', ...style }}>
      <Wordmark size={13} />
      <span style={{ width: 1, height: 20, background: C.line }} />
      <span style={{ fontSize: 15, fontWeight: 500 }}>Kade Noord · Apartment 2.04</span>
      <span style={{ fontSize: 15, color: C.muted }}>{room}</span>
      <Chip tone='teal' style={{ height: 32, borderRadius: 16, padding: '0 12px', fontSize: 12 }}>
        {scale}
      </Chip>
    </Panel>
  );
}

/** A pin standing on a surface, with its stem. */
function SpacePin({ p, n, ring }: { p: V2 | null; n: number; ring?: boolean }) {
  if (!p) return null;
  return (
    <foreignObject x={p[0] - 30} y={p[1] - 72} width='60' height='76'>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 60 }}>
        <Pin n={n} size={36} ring={ring} />
        <span style={{ width: 2, height: 26, background: C.teal }} />
        <span style={{ width: 8, height: 8, borderRadius: 8, background: C.teal, marginTop: -4, boxShadow: '0 0 0 3px rgba(255,255,255,0.8)' }} />
      </div>
    </foreignObject>
  );
}

function Dimension({ a, b, text, side = 'left' }: { a: V2 | null; b: V2 | null; text: string; side?: 'left' | 'right' }) {
  if (!a || !b) return null;
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={C.ink} strokeWidth='1.4' />
      <line x1={a[0] - 7} y1={a[1]} x2={a[0] + 7} y2={a[1]} stroke={C.ink} strokeWidth='1.4' />
      <line x1={b[0] - 7} y1={b[1]} x2={b[0] + 7} y2={b[1]} stroke={C.ink} strokeWidth='1.4' />
      <foreignObject x={side === 'left' ? mx + 10 : mx - 98} y={my - 14} width='88' height='28'>
        <div
          style={{
            display: 'inline-flex',
            height: 28,
            alignItems: 'center',
            padding: '0 10px',
            borderRadius: 14,
            background: 'rgba(251,250,247,0.9)',
            boxShadow: '0 4px 12px -4px rgba(29,27,24,0.25)',
            fontFamily: pixel,
            fontSize: 13,
            color: C.ink,
            whiteSpace: 'nowrap'
          }}
        >
          {text}
        </div>
      </foreignObject>
    </g>
  );
}

function sunLine(season: Season, clock: number) {
  const sun = sunAt(season, clock);
  return sun.up ? `Sun ${Math.round(sun.altitude)}° · ${compass(sun.azimuth)} ${Math.round(sun.azimuth)}°` : 'Sun below the horizon';
}

function Ground({ children, color = C.concrete, style }: { children: ReactNode; color?: string; style?: CSSProperties }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: color, fontFamily: sans, color: C.ink, overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

const fill: CSSProperties = { position: 'absolute', inset: 0 };

// ----------------------------------------------------------------- screens

const coverView: View = { kind: 'walk', pos: [5.2, 1.62, 6.45], yaw: -0.27, pitch: -0.1, fov: 80 };

function Cover() {
  const season: Season = 'december';
  const clock = 13.4;
  return (
    <Ground>
      <div style={fill}>
        <ModelSvg
          width={1440}
          height={900}
          view={coverView}
          season={season}
          clock={clock}
          overlay={(cam) => (
            <>
              <Dimension a={at(cam, [0, 0, 0.02])} b={at(cam, [0, 2.7, 0.02])} text='2.70 m' />
              <SpacePin p={at(cam, surfaces[0].point)} n={7} ring />
            </>
          )}
        />
      </div>
      <StatusBar room='Living & kitchen' style={{ position: 'absolute', top: 92, left: '50%', transform: 'translateX(-50%)' }} />
      <Panel style={{ position: 'absolute', left: 742, top: 352, width: 344 }} padding={22}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={labelStyle}>Note 07 · Window seat</span>
          <span style={{ ...labelStyle, color: C.teal }}>0:06</span>
        </div>
        <p style={{ margin: '12px 0 0', fontSize: 21, lineHeight: 1.3, letterSpacing: '-0.01em', fontWeight: 450 }}>
          “It’s 46 cm now. For my mother, 42 would be easier to get up from.”
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
          <span style={{ width: 28, height: 28, borderRadius: 14, background: '#C9B7A2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>MV</span>
          <span style={{ fontSize: 14, color: C.inkSoft }}>Marieke Vos, client</span>
          <Chip tone='teal' style={{ marginLeft: 'auto' }}>
            <Icon name='check' size={14} color={C.tealDeep} /> HS-214
          </Chip>
        </div>
      </Panel>
      <Panel style={{ position: 'absolute', right: 96, bottom: 152, width: 300 }} padding={18}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={labelStyle}>21 December</span>
          <span style={labelStyle}>51.92° N</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
          <SunDial season={season} clock={clock} size={240} />
        </div>
        <div style={{ ...labelStyle, textAlign: 'center', color: C.inkSoft, marginTop: 4 }}>{sunLine(season, clock)}</div>
      </Panel>
      <Dock active='note' style={{ position: 'absolute', bottom: 84, left: '50%', transform: 'translateX(-50%)' }} />
    </Ground>
  );
}

function Dollhouse() {
  const you: V3 = [4.5, 0.05, 4.1];
  const yaw = -0.22;
  return (
    <Ground color='#D7D2C8'>
      <div style={fill}>
        <ModelSvg
          width={1440}
          height={900}
          view={{ kind: 'orbit', target: [6.6, -0.6, 3.6], yaw: 0.6, pitch: 0.74, distance: 33 }}
          season='june'
          clock={15.5}
          labels
          plinth
          background='#D7D2C8'
          overlay={(cam) => {
            const p = at(cam, you);
            const cone = [
              you,
              [you[0] + Math.sin(yaw - 0.45) * 2.6, 0.05, you[2] - Math.cos(yaw - 0.45) * 2.6],
              [you[0] + Math.sin(yaw + 0.45) * 2.6, 0.05, you[2] - Math.cos(yaw + 0.45) * 2.6]
            ].map((q) => at(cam, q as V3));
            if (!p || cone.some((c) => !c)) return null;
            return (
              <g>
                <defs>
                  <radialGradient id='ar-cone' cx={p[0]} cy={p[1]} r='160' gradientUnits='userSpaceOnUse'>
                    <stop offset='0' stopColor='rgba(13,106,98,0.42)' />
                    <stop offset='1' stopColor='rgba(13,106,98,0)' />
                  </radialGradient>
                </defs>
                <path d={`M${cone.map((c) => c!.join(' ')).join('L')}Z`} fill='url(#ar-cone)' />
                <ellipse cx={p[0]} cy={p[1]} rx='30' ry='17' fill='rgba(13,106,98,0.16)' />
                <ellipse cx={p[0]} cy={p[1]} rx='17' ry='10' fill='rgba(13,106,98,0.28)' />
                <circle cx={p[0]} cy={p[1] - 1} r='7' fill={C.teal} stroke='#fff' strokeWidth='2' />
                <foreignObject x={p[0] - 140} y={p[1] - 64} width='126' height='40'>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Chip tone='dark' style={{ height: 30, borderRadius: 15, fontSize: 12 }}>
                      You · 1.62 m
                    </Chip>
                  </div>
                </foreignObject>
              </g>
            );
          }}
        />
      </div>
      <Panel style={{ position: 'absolute', left: 64, top: 64, width: 252 }} padding={10}>
        <div style={{ ...labelStyle, padding: '8px 10px 10px' }}>Levels</div>
        {[
          ['4', 'Penthouses', false],
          ['3', 'Apartments 3.01–3.06', false],
          ['2', 'Apartments 2.01–2.06', true],
          ['1', 'Apartments 1.01–1.06', false],
          ['0', 'Entrance, bikes, studio', false]
        ].map(([n, text, on]) => (
          <div
            key={n as string}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              height: 46,
              padding: '0 10px',
              borderRadius: 16,
              background: on ? C.ink : 'transparent',
              color: on ? '#F6F3EE' : C.ink
            }}
          >
            <span style={{ fontFamily: pixel, fontSize: 13, width: 14 }}>{n}</span>
            <span style={{ fontSize: 15, fontWeight: on ? 500 : 400 }}>{text}</span>
          </div>
        ))}
      </Panel>
      <Panel style={{ position: 'absolute', right: 64, top: 64, width: 240 }} padding={20}>
        <span style={labelStyle}>Model scale</span>
        <div style={{ fontSize: 64, fontWeight: 500, letterSpacing: '-0.04em', lineHeight: 1, marginTop: 8 }}>1:50</div>
        <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.4, color: C.inkSoft }}>Pinch to scale. Look at a room to see its name and area.</p>
      </Panel>
      <Panel radius={30} padding={8} style={{ position: 'absolute', bottom: 56, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 22 }}>
        <span style={{ fontSize: 15, color: C.inkSoft }}>Apartment 2.04 · 86.4 m² · 4 rooms</span>
        <span style={{ height: 48, padding: '0 20px', borderRadius: 24, background: C.teal, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 500 }}>
          <Mark size={18} color='#fff' /> Return to 1:1 at the marker
        </span>
      </Panel>
    </Ground>
  );
}

function Onboarding() {
  return (
    <Ground>
      <div style={fill}>
        <ModelSvg
          width={1440}
          height={1800}
          view={{ kind: 'walk', pos: [7.55, 1.62, 7.1], yaw: -0.7, pitch: -0.14, fov: 66 }}
          season='december'
          clock={13.4}
          background='#E3DED5'
        />
      </div>
      <div style={{ position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <StatusBar room='Front door' />
      </div>
      <Panel style={{ position: 'absolute', left: 150, right: 150, top: 1056 }} padding={44} radius={36}>
        <span style={labelStyle}>Session 09 · Tuesday 12 March, 14:02</span>
        <h3 style={{ margin: '18px 0 0', fontSize: 58, lineHeight: 1.02, letterSpacing: '-0.035em', fontWeight: 500 }}>
          You’re standing at the front door of Apartment 2.04.
        </h3>
        <p style={{ margin: '20px 0 0', fontSize: 22, lineHeight: 1.4, color: C.inkSoft, maxWidth: 820 }}>
          Everything around you is at real size. Take your time: there’s nothing to press yet.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 34 }}>
          {[
            ['1', 'Look around', 'Turn your head. The door is 2.10 m high.'],
            ['2', 'Walk', 'Look at the floor where you want to be and pinch.'],
            ['3', 'Leave a note', 'Look at the thing and say “note”.']
          ].map(([n, title, body]) => (
            <div key={n} style={{ borderRadius: 22, background: 'rgba(29,27,24,0.05)', padding: '20px 22px 22px' }}>
              <span style={{ ...labelStyle, color: C.teal }}>Step {n}</span>
              <div style={{ fontSize: 22, fontWeight: 500, marginTop: 8, letterSpacing: '-0.01em' }}>{title}</div>
              <div style={{ fontSize: 16, lineHeight: 1.4, color: C.inkSoft, marginTop: 6 }}>{body}</div>
            </div>
          ))}
        </div>
      </Panel>
      <div style={{ position: 'absolute', left: 150, right: 150, bottom: 96 }}>
        <div style={{ position: 'relative', height: 2, background: 'rgba(29,27,24,0.2)' }}>
          <div style={{ position: 'absolute', left: 0, width: '40%', height: 2, background: C.teal }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 14 }}>
          {[
            ['0:00', 'Headset on'],
            ['0:09', 'Model loaded'],
            ['0:12', 'At the front door'],
            ['0:31', 'First note']
          ].map(([t, text], i) => (
            <div key={t} style={{ textAlign: i === 3 ? 'right' : i === 0 ? 'left' : 'center' }}>
              <div style={{ fontFamily: pixel, fontSize: 13, color: i < 3 ? C.teal : C.muted }}>{t}</div>
              <div style={{ fontSize: 16, color: i < 3 ? C.ink : C.muted, marginTop: 2 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </Ground>
  );
}

function Annotate() {
  const worktop: V3 = [2.2, 0.9, 6.75];
  const bars = [6, 10, 18, 26, 14, 30, 38, 22, 34, 44, 28, 18, 36, 40, 24, 12, 20, 30, 16, 8, 14, 24, 10, 6];
  return (
    <Ground>
      <div style={fill}>
        <ModelSvg
          width={1440}
          height={1800}
          view={{ kind: 'walk', pos: [3.0, 1.62, 3.3], yaw: -2.91, pitch: -0.2, fov: 66 }}
          season='june'
          clock={11}
          overlay={(cam) => {
            const p = at(cam, worktop);
            if (!p) return null;
            return (
              <g>
                <circle cx={p[0]} cy={p[1]} r='64' fill='none' stroke='rgba(255,255,255,0.95)' strokeWidth='3' />
                <circle cx={p[0]} cy={p[1]} r='64' fill='none' stroke={C.teal} strokeWidth='3' strokeDasharray='300 103' transform={`rotate(-90 ${p[0]} ${p[1]})`} />
                <circle cx={p[0]} cy={p[1]} r='6' fill={C.teal} stroke='#fff' strokeWidth='2' />
                <Dimension a={at(cam, [0.9, 0, 6.54])} b={at(cam, [0.9, 0.9, 6.54])} text='0.90 m' side='right' />
              </g>
            );
          }}
        />
      </div>
      <div style={{ position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <StatusBar room='Kitchen' />
      </div>
      <Panel style={{ position: 'absolute', left: 150, right: 150, bottom: 150 }} padding={40} radius={36}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 44, height: 44, borderRadius: 22, background: C.teal, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name='mic' color='#fff' />
          </span>
          <span style={{ ...labelStyle, fontSize: 13, color: C.teal }}>Listening · 0:07</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 44, marginLeft: 'auto' }}>
            {bars.map((h, i) => (
              <span key={i} style={{ width: 5, height: h, borderRadius: 3, background: i < 17 ? C.teal : 'rgba(13,106,98,0.25)' }} />
            ))}
          </div>
        </div>
        <p style={{ margin: '28px 0 0', fontSize: 44, lineHeight: 1.16, letterSpacing: '-0.025em', fontWeight: 450 }}>
          The worktop feels low next to the island.{' '}
          <span style={{ color: C.muted }}>Can we try ninety-five instead of</span>
          <span style={{ display: 'inline-block', width: 3, height: 40, background: C.teal, marginLeft: 6, verticalAlign: '-6px' }} />
        </p>
        <div style={{ height: 1, background: C.line, margin: '32px 0 24px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <span style={labelStyle}>Pinned where you looked</span>
            <div style={{ fontSize: 20, fontWeight: 500, marginTop: 6 }}>Kitchen worktop, north wall</div>
            <div style={{ fontSize: 16, color: C.inkSoft, marginTop: 2 }}>Height 0.90 m · within 2 cm</div>
          </div>
          <div>
            <span style={labelStyle}>Issue list</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 500, marginTop: 6 }}>
              <Icon name='check' color={C.teal} /> Synced as HS-231
            </div>
            <div style={{ fontSize: 16, color: C.inkSoft, marginTop: 2 }}>Assigned to Sanne de Bruijn</div>
          </div>
        </div>
      </Panel>
    </Ground>
  );
}

function Sundial() {
  const hours = [8, 10, 12, 14, 16, 18];
  const thumb: View = { kind: 'walk', pos: [4.2, 1.62, 6.4], yaw: -0.12, pitch: -0.2, fov: 56 };
  return (
    <Ground color='#E9E4DB'>
      <Panel style={{ position: 'absolute', left: 64, top: 64, bottom: 64, width: 470 }} padding={36} radius={34}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={labelStyle}>Time of day</span>
          <span style={labelStyle}>Living room</span>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 16, background: 'rgba(29,27,24,0.06)', marginTop: 22 }}>
          {['21 June', '21 December'].map((d, i) => (
            <span key={d} style={{ flex: 1, height: 42, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 500, background: i === 1 ? '#fff' : 'transparent', color: i === 1 ? C.ink : C.muted, boxShadow: i === 1 ? '0 1px 3px rgba(29,27,24,0.14)' : undefined }}>
              {d}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 34 }}>
          <SunDial season='december' clock={13.4} size={398} />
        </div>
        <div style={{ textAlign: 'center', fontFamily: pixel, fontSize: 13, color: C.inkSoft, marginTop: 6 }}>{sunLine('december', 13.4)}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px', marginTop: 40 }}>
          {[
            ['Sunrise', '08:47'],
            ['Sunset', '16:30'],
            ['Solar noon', '12:41'],
            ['Sun on the seat', '10:50–15:10'],
            ['Latitude', '51.92° N'],
            ['Façade faces', '214° SW']
          ].map(([k, v]) => (
            <div key={k}>
              <span style={labelStyle}>{k}</span>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </Panel>
      <div style={{ position: 'absolute', left: 574, right: 64, top: 64 }}>
        <span style={labelStyle}>Light study · living room, eye height 1.62 m</span>
        <h3 style={{ margin: '12px 0 0', fontSize: 40, lineHeight: 1.05, letterSpacing: '-0.03em', fontWeight: 500, maxWidth: 640 }}>
          In December the low sun reaches the kitchen island. In June it never gets past the seat.
        </h3>
      </div>
      {(['june', 'december'] as const).map((season, row) => (
        <div key={season} style={{ position: 'absolute', left: 574, right: 64, top: 268 + row * 302 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ ...labelStyle, color: C.ink }}>{season === 'june' ? '21 June' : '21 December'}</span>
            <span style={labelStyle}>{season === 'june' ? 'Sunrise 05:20 · sunset 22:06' : 'Sunrise 08:47 · sunset 16:30'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
            {hours.map((h) => {
              const sun = sunAt(season, h);
              return (
                <div key={h}>
                  <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', boxShadow: '0 0 0 1px rgba(29,27,24,0.08)' }}>
                    <ModelSvg width={126} height={170} view={thumb} season={season} clock={h} planks={false} outside />
                    {!sun.up && <div style={{ position: 'absolute', inset: 0, background: 'rgba(48,58,72,0.38)' }} />}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
                    <span style={{ fontFamily: pixel, fontSize: 12, color: C.ink }}>{formatClock(h)}</span>
                    <span style={{ fontFamily: pixel, fontSize: 12, color: C.muted }}>{sun.up ? `${Math.round(sun.altitude)}°` : '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </Ground>
  );
}

const reviewNotes = [
  { n: 1, room: 'Living', where: 'Window seat', text: 'Drop the seat from 46 to 42 cm.', who: 'Marieke V.', status: 'Changed', point: surfaces[0].point },
  { n: 2, room: 'Living', where: 'Kitchen island', text: 'Room for two stools on the window side?', who: 'Joost V.', status: 'Accepted', point: surfaces[2].point },
  { n: 3, room: 'Kitchen', where: 'Worktop, north wall', text: 'Try 95 cm instead of 90.', who: 'Joost V.', status: 'Open', point: [2.2, 0.9, 6.75] as V3 },
  { n: 4, room: 'Living', where: 'Ceiling over table', text: 'Feels low with the pendant. Raise it 10 cm.', who: 'Marieke V.', status: 'Changed', point: [5.0, 2.7, 2.7] as V3 },
  { n: 5, room: 'Hall', where: 'Front door', text: 'Space for a pram inside the door.', who: 'Marieke V.', status: 'Open', point: surfaces[4].point },
  { n: 6, room: 'Bedroom 1', where: 'Window', text: 'Blackout blind, recessed in the head.', who: 'Joost V.', status: 'Accepted', point: surfaces[5].point },
  { n: 7, room: 'Bedroom 2', where: 'Desk wall', text: 'Two more sockets above the desk.', who: 'Joost V.', status: 'Changed', point: [11.5, 0.75, 5.4] as V3 }
];

function ReviewSummary() {
  const statusTone = (s: string) => (s === 'Open' ? 'plain' : 'teal') as 'plain' | 'teal';
  return (
    <Ground color='#E2DDD3'>
      <BrowserFrame width={1264} url='review.atlasroom.app/kade-noord/2-04/review-09' viewportWidth={1440} viewportHeight={860} style={{ position: 'absolute', left: 88, top: 56 }}>
        <div style={{ width: 1440, height: 860, background: '#F7F5F1', fontFamily: sans, color: C.ink, display: 'grid', gridTemplateColumns: '440px 1fr 340px' }}>
          <div style={{ borderRight: `1px solid ${C.line}`, padding: '28px 28px 0', overflow: 'hidden' }}>
            <Wordmark size={13} />
            <div style={{ marginTop: 34 }}>
              <span style={labelStyle}>Review 09 · 12 March 2026</span>
              <h4 style={{ margin: '8px 0 0', fontSize: 30, lineHeight: 1.08, letterSpacing: '-0.025em', fontWeight: 500 }}>Apartment 2.04 with Marieke and Joost Vos</h4>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 18 }}>
              <Chip tone='dark'>All 17</Chip>
              <Chip>Open 5</Chip>
              <Chip>Changed 6</Chip>
              <Chip>Accepted 6</Chip>
            </div>
            <div style={{ marginTop: 18 }}>
              {reviewNotes.slice(0, 6).map((note) => (
                <div key={note.n} style={{ display: 'grid', gridTemplateColumns: '30px 1fr auto', gap: 12, padding: '13px 0', borderTop: `1px solid ${C.line}`, background: note.n === 3 ? 'transparent' : undefined }}>
                  <Pin n={note.n} size={26} />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>
                      {note.where} <span style={{ color: C.muted, fontWeight: 400 }}>· {note.room}</span>
                    </div>
                    <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.35, marginTop: 2 }}>{note.text}</div>
                    <div style={{ ...labelStyle, marginTop: 4 }}>{note.who}</div>
                  </div>
                  <Chip tone={statusTone(note.status)}>{note.status}</Chip>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${C.line}`, padding: '14px 0', fontSize: 15, fontWeight: 500, color: C.teal }}>Show 11 more notes</div>
            </div>
          </div>
          <div style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={labelStyle}>Level 2 · plan, north up</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <Chip>Plan</Chip>
                <Chip tone='dark'>Pins</Chip>
                <Chip>Sun paths</Chip>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlanSvg width={620} pins={reviewNotes.map((n) => ({ n: n.n, point: n.point, tone: n.status === 'Open' ? 'open' : 'done' }))} active={3} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', ...labelStyle }}>
              <span>0 · 1 · 2 · 5 m</span>
              <span>Model R14 · exported 11 Mar 16:40 · loaded in 1 min 12 s</span>
            </div>
          </div>
          <div style={{ borderLeft: `1px solid ${C.line}`, padding: 28, background: '#F1EEE8' }}>
            <span style={labelStyle}>This review</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 16 }}>
              {[
                ['38 min', 'in the room'],
                ['17', 'spatial notes'],
                ['6', 'design changes'],
                ['3', 'rooms visited twice']
              ].map(([v, k]) => (
                <div key={k}>
                  <div style={{ fontSize: 34, fontWeight: 500, letterSpacing: '-0.03em' }}>{v}</div>
                  <div style={{ fontSize: 14, color: C.inkSoft }}>{k}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: C.line, margin: '26px 0 20px' }} />
            <span style={labelStyle}>Synced to the issue list</span>
            {[
              ['HS-214', 'Window seat height', 'Revised in R15'],
              ['HS-219', 'Pendant height, living', 'Revised in R15'],
              ['HS-231', 'Worktop height', 'Waiting for client'],
              ['HS-233', 'Sockets, bedroom 2', 'Revised in R15']
            ].map(([k, t, s]) => (
              <div key={k} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: `1px solid ${C.line}` }}>
                <span style={{ fontFamily: pixel, fontSize: 12, color: C.teal, width: 56, paddingTop: 2 }}>{k}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{t}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>{s}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 22, height: 44, borderRadius: 14, background: C.ink, color: '#F6F3EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 500 }}>
              Export issues as BCF
            </div>
          </div>
        </div>
      </BrowserFrame>
    </Ground>
  );
}

function Flythrough() {
  return (
    <Ground color='#111'>
      <div style={fill}>
        <ModelSvg width={1440} height={900} view={{ kind: 'walk', pos: [6.45, 2.5, 7.05], yaw: -0.62, pitch: -0.3, fov: 104 }} season='june' clock={12.5} />
      </div>
      <div style={{ ...fill, background: 'radial-gradient(60% 50% at 62% 32%, rgba(255,250,236,0.55), rgba(255,250,236,0) 70%)' }} />
      <div style={{ ...fill, background: 'radial-gradient(120% 90% at 50% 45%, rgba(10,10,12,0) 55%, rgba(10,10,12,0.42) 100%)' }} />
      <div style={{ ...fill, background: 'linear-gradient(180deg, rgba(10,10,12,0) 72%, rgba(10,10,12,0.6) 100%)' }} />
      <div style={{ position: 'absolute', left: 40, top: 32, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontFamily: pixel, fontSize: 13, color: '#fff', background: 'rgba(10,10,12,0.55)', padding: '6px 10px', borderRadius: 8 }}>HS_KadeNoord_2-04_flythrough_v7.mp4</span>
      </div>
      <div style={{ position: 'absolute', left: 40, right: 40, bottom: 34, color: '#fff' }}>
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)', position: 'relative' }}>
          <div style={{ width: '33%', height: 4, borderRadius: 2, background: '#fff' }} />
          <div style={{ position: 'absolute', left: '33%', top: -6, width: 16, height: 16, borderRadius: 8, background: '#fff', marginLeft: -8 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontFamily: pixel, fontSize: 13 }}>
          <span>▶ 01:12 / 03:40</span>
          <span>Camera 2.50 m · 104° lens · rendered 6 Feb</span>
        </div>
      </div>
    </Ground>
  );
}

function Walkthrough() {
  return (
    <Ground>
      <div style={fill}>
        <ModelSvg
          width={1440}
          height={900}
          view={{ kind: 'walk', pos: [6.1, 1.62, 6.6], yaw: -0.62, pitch: -0.12, fov: 72 }}
          season='june'
          clock={12.5}
          overlay={(cam) => (
            <>
              <Dimension a={at(cam, [0.03, 0, 0.03])} b={at(cam, [0.03, 2.7, 0.03])} text='2.70 m' />
              <Dimension a={at(cam, [1.2, 0, 0.02])} b={at(cam, [1.2, 0.45, 0.02])} text='0.45 m' />
              <Dimension a={at(cam, [5.62, 0, 0.02])} b={at(cam, [5.62, 2.45, 0.02])} text='2.45 m' side='right' />
            </>
          )}
        />
      </div>
      <StatusBar room='Living & kitchen' style={{ position: 'absolute', top: 40, left: '50%', transform: 'translateX(-50%)' }} />
      <Panel style={{ position: 'absolute', left: 48, bottom: 48, display: 'flex', gap: 28, alignItems: 'center' }} padding={18}>
        {[
          ['Eye height', '1.62 m', 'calibrated'],
          ['Scale', '1:1', 'true size'],
          ['Sun', '12:30', '21 June']
        ].map(([k, v, s]) => (
          <div key={k}>
            <span style={labelStyle}>{k}</span>
            <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em' }}>{v}</div>
            <div style={{ fontSize: 13, color: C.muted }}>{s}</div>
          </div>
        ))}
      </Panel>
    </Ground>
  );
}

export const screens: ScreenSet = {
  cover: { width: 1440, height: 900, render: () => <Cover /> },
  dollhouse: { width: 1440, height: 900, render: () => <Dollhouse /> },
  onboarding: { width: 1440, height: 1800, render: () => <Onboarding /> },
  annotate: { width: 1440, height: 1800, render: () => <Annotate /> },
  sundial: { width: 1440, height: 900, render: () => <Sundial /> },
  'review-summary': { width: 1440, height: 900, render: () => <ReviewSummary /> },
  flythrough: { width: 1440, height: 900, render: () => <Flythrough /> },
  walkthrough: { width: 1440, height: 900, render: () => <Walkthrough /> },
  demo: {
    width: 1440,
    height: 900,
    render: () => (
      <div style={{ width: 1440, height: 900 }}>
        <Demo />
      </div>
    )
  }
};
