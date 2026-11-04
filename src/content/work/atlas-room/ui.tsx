import type { CSSProperties, ReactNode } from 'react';
import { formatClock, solarNoon, sunAt, type Season } from './model';

/** Atlas Room's own palette: concrete, pale timber, translucent panels, teal pins. */
export const C = {
  concrete: '#E6E1D8',
  concreteDeep: '#D3CBBE',
  plaster: '#F2EEE7',
  timber: '#DDBB93',
  timberLight: '#E9D2B4',
  timberDeep: '#B98E62',
  ground: '#ECE8E0',
  ink: '#1D1B18',
  inkSoft: '#47423B',
  muted: '#6C665C',
  line: 'rgba(29,27,24,0.16)',
  teal: '#0D6A62',
  tealDeep: '#08463F',
  tealSoft: '#D5E8E4',
  sun: '#F3B54A',
  light: '#FFF3D9',
  sky: '#DCE5E7',
  panel: 'rgba(251,250,247,0.76)',
  panelSolid: '#FBFAF7'
};

export const sans = 'var(--fg-font-sans)';
export const pixel = 'var(--fg-font-pixel)';

export const labelStyle: CSSProperties = {
  fontFamily: pixel,
  fontSize: 11,
  lineHeight: '16px',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: C.muted
};

/** A floating translucent panel, the basic unit of the Atlas Room interface. */
export function Panel({
  children,
  style,
  radius = 26,
  padding = 20
}: {
  children: ReactNode;
  style?: CSSProperties;
  radius?: number;
  padding?: number;
}) {
  return (
    <div
      style={{
        background: C.panel,
        backdropFilter: 'blur(22px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(22px) saturate(1.4)',
        borderRadius: radius,
        padding,
        boxShadow:
          'inset 0 0 0 1px rgba(255,255,255,0.75), 0 1px 2px rgba(29,27,24,0.06), 0 24px 48px -24px rgba(29,27,24,0.28)',
        color: C.ink,
        fontFamily: sans,
        ...style
      }}
    >
      {children}
    </div>
  );
}

export function Mark({ size = 22, color = C.ink }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox='0 0 22 22' aria-hidden>
      <rect x='1.5' y='1.5' width='19' height='19' rx='3' fill='none' stroke={color} strokeWidth='1.6' />
      <path d='M1.5 13.5h7v7' fill='none' stroke={color} strokeWidth='1.6' />
      <circle cx='14.5' cy='8' r='2.6' fill={C.teal} />
    </svg>
  );
}

export function Wordmark({ size = 15, color = C.ink }: { size?: number; color?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, color }}>
      <Mark size={size + 6} color={color} />
      <span
        style={{
          fontFamily: sans,
          fontSize: size,
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontStretch: '88%'
        }}
      >
        Atlas Room
      </span>
    </span>
  );
}

export function Chip({
  children,
  tone = 'plain',
  style
}: {
  children: ReactNode;
  tone?: 'plain' | 'teal' | 'dark';
  style?: CSSProperties;
}) {
  const tones = {
    plain: { background: 'rgba(29,27,24,0.06)', color: C.inkSoft },
    teal: { background: C.tealSoft, color: C.tealDeep },
    dark: { background: C.ink, color: '#F6F3EE' }
  }[tone];
  return (
    <span
      style={{
        ...tones,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 24,
        padding: '0 10px',
        borderRadius: 12,
        fontFamily: pixel,
        fontSize: 11,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {children}
    </span>
  );
}

/** A numbered teal pin. */
export function Pin({ n, size = 30, ring = false }: { n: number | string; size?: number; ring?: boolean }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: size,
        background: C.teal,
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: pixel,
        fontSize: size > 26 ? 13 : 11,
        boxShadow: ring
          ? `0 0 0 6px rgba(13,106,98,0.18), 0 0 0 1.5px #fff, 0 6px 14px rgba(8,70,63,0.35)`
          : '0 0 0 1.5px #fff, 0 6px 14px rgba(8,70,63,0.3)'
      }}
    >
      {n}
    </span>
  );
}

/**
 * The time-of-day dial: an arc from 06:00 to 21:00 with the sun's altitude
 * drawn as a curve, and a handle at `clock`.
 */
export function SunDial({
  season,
  clock,
  size = 280,
  showCurve = true
}: {
  season: Season;
  clock: number;
  size?: number;
  showCurve?: boolean;
}) {
  const start = 6;
  const end = 21;
  const w = size;
  const h = size * 0.62;
  const cx = w / 2;
  const cy = h - 16;
  const r = w / 2 - 34;
  const angleAt = (t: number) => Math.PI + ((t - start) / (end - start)) * Math.PI;
  const pointAt = (t: number, rr = r): [number, number] => [
    cx + Math.cos(angleAt(t)) * rr,
    cy + Math.sin(angleAt(t)) * rr
  ];
  // Altitude curve: radius grows with altitude above the arc's inner ring.
  const curve: string[] = [];
  for (let t = start; t <= end + 0.001; t += 0.25) {
    const sun = sunAt(season, t);
    const rr = r * 0.64 + (Math.max(0, sun.altitude) / 64) * r * 0.28;
    const [x, y] = pointAt(t, rr);
    curve.push(`${curve.length ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const sun = sunAt(season, clock);
  const [hx, hy] = pointAt(clock);
  const ticks = [6, 9, 12, 15, 18, 21];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden style={{ display: 'block' }}>
      <path
        d={`M${pointAt(start)[0]} ${pointAt(start)[1]} A ${r} ${r} 0 0 1 ${pointAt(end)[0]} ${pointAt(end)[1]}`}
        fill='none'
        stroke='rgba(29,27,24,0.14)'
        strokeWidth='10'
        strokeLinecap='round'
      />
      <path
        d={`M${pointAt(start)[0]} ${pointAt(start)[1]} A ${r} ${r} 0 0 1 ${hx} ${hy}`}
        fill='none'
        stroke={C.sun}
        strokeWidth='10'
        strokeLinecap='round'
      />
      {showCurve && (
        <path d={curve.join(' ')} fill='none' stroke={C.inkSoft} strokeWidth='1.2' strokeDasharray='2 4' />
      )}
      {ticks.map((t) => {
        const [x1, y1] = pointAt(t, r + 8);
        const [x2, y2] = pointAt(t, r + 13);
        const [tx, ty] = pointAt(t, r + 25);
        return (
          <g key={t}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.muted} strokeWidth='1.2' />
            <text
              x={tx}
              y={ty + 4}
              textAnchor='middle'
              style={{ fontFamily: pixel, fontSize: 11, fill: C.muted }}
            >
              {String(t).padStart(2, '0')}
            </text>
          </g>
        );
      })}
      <line
        x1={pointAt(solarNoon[season], r + 8)[0]}
        y1={pointAt(solarNoon[season], r + 8)[1]}
        x2={pointAt(solarNoon[season], r - 8)[0]}
        y2={pointAt(solarNoon[season], r - 8)[1]}
        stroke={C.ink}
        strokeWidth='1.4'
      />
      <circle cx={hx} cy={hy} r='13' fill='#fff' stroke={C.ink} strokeWidth='1.4' />
      <circle cx={hx} cy={hy} r='6' fill={sun.up ? C.sun : C.muted} />
      <text
        x={cx}
        y={cy - 8}
        textAnchor='middle'
        style={{ fontFamily: sans, fontSize: size * 0.15, fontWeight: 500, letterSpacing: '-0.02em', fill: C.ink }}
      >
        {formatClock(clock)}
      </text>
    </svg>
  );
}
