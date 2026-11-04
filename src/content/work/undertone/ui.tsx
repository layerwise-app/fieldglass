import { useMemo } from 'react';
import {
  MINUTES,
  anomalies,
  clock,
  getSeries,
  linePath,
  palette,
  stations,
  wavePath
} from './data';

/** Undertone's mark: a water line with the sound underneath it. */
export function Mark({ size = 18, color = palette.teal }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' aria-hidden>
      <path d='M2 7.5h20' stroke={color} strokeWidth='2' strokeLinecap='round' />
      <path
        d='M2 14c2.5 0 2.5-3 5-3s2.5 3 5 3 2.5-3 5-3 2.5 3 5 3'
        fill='none'
        stroke={color}
        strokeWidth='2'
        strokeLinecap='round'
        opacity='0.7'
      />
      <path
        d='M5 19.5c2.3 0 2.3-1.8 4.6-1.8s2.3 1.8 4.6 1.8 2.3-1.8 4.8-1.8'
        fill='none'
        stroke={color}
        strokeWidth='2'
        strokeLinecap='round'
        opacity='0.38'
      />
    </svg>
  );
}

export function Wordmark({
  size = 17,
  color = palette.text
}: {
  size?: number;
  color?: string;
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.45,
        fontFamily: 'var(--fg-font-sans)',
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '-0.02em',
        color
      }}
    >
      <Mark size={size * 1.2} />
      undertone
    </span>
  );
}

/**
 * One station's sound, drawn as the waveform the operator hears: a quiet
 * band of room tone that swells (amber) where the signal leaves normal.
 * Drawn in a 1440 × 100 viewBox and stretched to fit.
 */
export function LaneWave({
  index,
  from = 0,
  to = MINUTES,
  showLevel = true,
  gain = 1,
  grid = true,
  muted = false
}: {
  index: number;
  from?: number;
  to?: number;
  showLevel?: boolean;
  gain?: number;
  grid?: boolean;
  muted?: boolean;
}) {
  const series = getSeries()[index]!;
  const W = 1440;
  const H = 100;
  const paths = useMemo(() => {
    const span = to - from;
    const toX = (m: number) => ((m - from) / span) * W;
    const wave = wavePath(series.amplitude, W, H, from, to, gain);
    const marks = anomalies
      .filter((a) => a.lane === index && a.end > from && a.start < to)
      .map((a) => {
        const s = Math.max(a.start, from);
        const e = Math.min(a.end, to);
        const sub = series.amplitude.subarray(s, e);
        return {
          id: a.id,
          x: toX(s),
          w: toX(e) - toX(s),
          d: wavePath(sub, toX(e) - toX(s), H, 0, sub.length, gain)
        };
      });
    let min = Infinity;
    let max = -Infinity;
    for (let i = from; i < to; i++) {
      min = Math.min(min, series.level[i]!);
      max = Math.max(max, series.level[i]!);
    }
    const pad = (max - min) * 0.45;
    const level = linePath(series.level, W, H * 0.5, min - pad, max + pad, from, to, 3);
    const hours: number[] = [];
    for (let m = Math.ceil(from / 180) * 180; m < to; m += 180) hours.push(toX(m));
    return { wave, marks, level, hours };
  }, [series, from, to, index, gain]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio='none'
      width='100%'
      height='100%'
      aria-hidden
      style={{ display: 'block', opacity: muted ? 0.32 : 1 }}
    >
      {grid &&
        paths.hours.map((x) => (
          <line
            key={x}
            x1={x}
            x2={x}
            y1={0}
            y2={H}
            stroke={palette.line}
            strokeWidth='1'
            vectorEffect='non-scaling-stroke'
          />
        ))}
      {paths.marks.map((m) => (
        <rect
          key={`r${m.id}`}
          x={m.x}
          y={0}
          width={m.w}
          height={H}
          fill={palette.amber}
          opacity='0.08'
        />
      ))}
      <path d={paths.wave} fill={palette.teal} opacity='0.82' />
      {paths.marks.map((m) => (
        <path
          key={m.id}
          d={m.d}
          transform={`translate(${m.x} 0)`}
          fill={palette.amber}
        />
      ))}
      {showLevel && (
        <path
          d={paths.level}
          transform={`translate(0 ${H * 0.04})`}
          fill='none'
          stroke={palette.text}
          strokeOpacity='0.55'
          strokeWidth='1.2'
          strokeDasharray='2 3'
          vectorEffect='non-scaling-stroke'
        />
      )}
    </svg>
  );
}

export function HourLabels({
  from = 0,
  to = MINUTES,
  every = 180,
  color = palette.faint
}: {
  from?: number;
  to?: number;
  every?: number;
  color?: string;
}) {
  const marks: number[] = [];
  for (let m = Math.ceil((from + 1) / every) * every; m < to; m += every) marks.push(m);
  return (
    <div style={{ position: 'relative', height: 14 }} aria-hidden>
      {marks.map((m) => (
        <span
          key={m}
          style={{
            position: 'absolute',
            left: `${((m - from) / (to - from)) * 100}%`,
            transform: 'translateX(-50%)',
            fontFamily: 'var(--fg-font-pixel)',
            fontSize: 11,
            lineHeight: '14px',
            color
          }}
        >
          {clock(m)}
        </span>
      ))}
    </div>
  );
}

export { stations };
