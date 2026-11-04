/**
 * The night of 14–15 March 2024 at three Lage Delta stations, one sample per
 * minute from 12:00 to 12:00. Deterministic, so screens render the same way
 * every time. Used by the screens and by the live demo.
 */

export const MINUTES = 1440;
/** Minute 0 is 12:00 on Thursday 14 March 2024. */
const START_HOUR = 12;

export type SignalKind = 'level' | 'salinity' | 'flow';

export type Station = {
  id: string;
  code: string;
  name: string;
  kind: string;
  /** The drone's note and frequency at normal level. */
  note: string;
  baseHz: number;
  pan: number;
};

export const stations: Station[] = [
  {
    id: 'zuidpolder',
    code: 'ZP-03',
    name: 'Zuidpolder',
    kind: 'Pumping station',
    note: 'G2',
    baseHz: 98,
    pan: -0.55
  },
  {
    id: 'molenkreek',
    code: 'MK-11',
    name: 'Molenkreek',
    kind: 'Inlet sluice',
    note: 'D3',
    baseHz: 146.83,
    pan: 0
  },
  {
    id: 'oosterdiep',
    code: 'OD-07',
    name: 'Oosterdiep',
    kind: 'Tide gauge',
    note: 'G3',
    baseHz: 196,
    pan: 0.55
  }
];

export type Anomaly = {
  id: string;
  lane: number;
  signal: SignalKind;
  start: number;
  peak: number;
  end: number;
  title: string;
  detail: string;
  /** Minutes before the SCADA threshold alarm fired. */
  heardEarly: number;
};

export const anomalies: Anomaly[] = [
  {
    id: 'surge',
    lane: 2,
    signal: 'level',
    start: 618,
    peak: 664,
    end: 770,
    title: 'Level surge',
    detail: '+0.22 m above forecast, wind set-up',
    heardEarly: 6
  },
  {
    id: 'salt',
    lane: 1,
    signal: 'salinity',
    start: 887,
    peak: 918,
    end: 1040,
    title: 'Salinity rising',
    detail: 'Chloride 210 → 1,380 mg/l',
    heardEarly: 4
  },
  {
    id: 'pump',
    lane: 0,
    signal: 'flow',
    start: 972,
    peak: 990,
    end: 1110,
    title: 'Pump 2 tripped',
    detail: 'Flow 8.4 → 3.1 m³/s',
    heardEarly: 3
  }
];

export type Series = {
  level: Float32Array;
  salinity: Float32Array;
  flow: Float32Array;
  /** 0 = normal, 1 = as far off normal as this night gets. */
  deviation: Float32Array;
  /** What the operator hears: room tone plus deviation, with audio texture. */
  amplitude: Float32Array;
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A smooth random walk, so signals wander like real sensors. */
function wander(random: () => number, n: number, step: number, pull: number) {
  const out = new Float32Array(n);
  let v = 0;
  let d = 0;
  for (let i = 0; i < n; i++) {
    d = d * 0.92 + (random() - 0.5) * step;
    v = v * (1 - pull) + d;
    out[i] = v;
  }
  return out;
}

/** Smooth 0 → 1 → 0 bump between start, peak and end. */
export function envelope(i: number, start: number, peak: number, end: number) {
  if (i <= start || i >= end) return 0;
  if (i <= peak) {
    const x = (i - start) / (peak - start);
    return x * x * (3 - 2 * x);
  }
  const x = (i - peak) / (end - peak);
  return 1 - x * x * (3 - 2 * x);
}

const TIDE = 745;

function buildStation(index: number): Series {
  const random = mulberry32(1403 + index * 97);
  const level = new Float32Array(MINUTES);
  const salinity = new Float32Array(MINUTES);
  const flow = new Float32Array(MINUTES);
  const deviation = new Float32Array(MINUTES);
  const amplitude = new Float32Array(MINUTES);

  const levelNoise = wander(random, MINUTES, 0.0012, 0.035);
  const saltNoise = wander(random, MINUTES, 3, 0.03);
  const flowNoise = wander(random, MINUTES, 0.05, 0.04);
  const texture = mulberry32(77 + index);

  for (let i = 0; i < MINUTES; i++) {
    const tide = Math.sin(((i + index * 140) / TIDE) * Math.PI * 2);
    let dev = 0;
    if (index === 0) {
      // Zuidpolder: polder level held near −0.41 m NAP; two pumps share 8.4 m³/s.
      const trip = envelope(i, 972, 990, 1046);
      const rise = envelope(i, 975, 1030, 1110);
      level[i] = -0.41 + tide * 0.012 + levelNoise[i]! + rise * 0.13;
      salinity[i] = 188 + saltNoise[i]! * 0.6;
      flow[i] = 8.4 + flowNoise[i]! * 1.2 - trip * 5.3;
      dev = Math.max(trip, rise * 0.7);
    } else if (index === 1) {
      // Molenkreek: inlet chloride normally ~210 mg/l; intrusion after 02:47.
      const salt = envelope(i, 887, 918, 1040);
      level[i] = -0.18 + tide * 0.05 + levelNoise[i]!;
      salinity[i] = 210 + saltNoise[i]! + salt * 1170;
      flow[i] = 2.6 + tide * 0.5 + flowNoise[i]! - salt * 1.4;
      dev = salt;
    } else {
      // Oosterdiep: tidal gauge with a wind set-up surge at 22:18.
      const surge = envelope(i, 618, 664, 770);
      level[i] = 0.05 + tide * 0.62 + levelNoise[i]! * 3 + surge * 0.22;
      salinity[i] = 9400 + saltNoise[i]! * 12 + tide * 600;
      flow[i] = 0.9 + Math.abs(tide) * 0.4 + flowNoise[i]! * 0.4;
      dev = surge;
    }
    deviation[i] = dev;
    const grain = 0.55 + texture() * 0.45;
    amplitude[i] = (0.07 + 0.9 * dev) * grain + 0.02 * Math.sin(i * 0.7);
  }
  return { level, salinity, flow, deviation, amplitude };
}

let cache: Series[] | null = null;
export function getSeries(): Series[] {
  if (!cache) cache = stations.map((_, i) => buildStation(i));
  return cache;
}

/** "02:47" for a minute index. */
export function clock(minute: number) {
  const total = (START_HOUR * 60 + Math.floor(minute)) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** "Fri 15 Mar, 02:47" for a minute index. */
export function stamp(minute: number) {
  const day = START_HOUR * 60 + minute >= 24 * 60 ? 'Fri 15 Mar' : 'Thu 14 Mar';
  return `${day}, ${clock(minute)}`;
}

export function formatLevel(v: number) {
  return `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2)} m`;
}
export function formatSalinity(v: number) {
  return `${Math.round(v).toLocaleString('en-GB')} mg/l`;
}
export function formatFlow(v: number) {
  return `${Math.max(0, v).toFixed(1)} m³/s`;
}

/** Mirrored waveform path in a box `width` × `height`, centred vertically. */
export function wavePath(
  amplitude: Float32Array,
  width: number,
  height: number,
  from = 0,
  to = amplitude.length,
  gain = 1
) {
  const n = to - from;
  const mid = height / 2;
  const top: string[] = [];
  const bottom: string[] = [];
  for (let k = 0; k < n; k++) {
    const x = (k / (n - 1)) * width;
    const a = Math.min(1, amplitude[from + k]! * gain) * (height / 2 - 1);
    top.push(`${x.toFixed(1)},${(mid - a).toFixed(1)}`);
    bottom.push(`${x.toFixed(1)},${(mid + a).toFixed(1)}`);
  }
  return `M${top.join('L')}L${bottom.reverse().join('L')}Z`;
}

/** A line through `values` scaled into the box. */
export function linePath(
  values: Float32Array,
  width: number,
  height: number,
  min: number,
  max: number,
  from = 0,
  to = values.length,
  step = 2
) {
  const n = to - from;
  const parts: string[] = [];
  for (let k = 0; k < n; k += step) {
    const x = (k / (n - 1)) * width;
    const y = height - ((values[from + k]! - min) / (max - min)) * height;
    parts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M${parts.join('L')}`;
}

export const palette = {
  night: '#0A1521',
  panel: '#0F1D2B',
  raised: '#152739',
  line: '#203448',
  text: '#E4ECF0',
  muted: '#8EA2B2',
  faint: '#5B7186',
  teal: '#47D3C5',
  tealDeep: '#1D6F6E',
  amber: '#FFB547',
  amberDeep: '#7A4F12',
  paper: '#F1EFE8',
  ink: '#0C1823'
} as const;

/** The whole network the control room listens to: 31 stations in 3 districts. */
export type NetworkStation = { code: string; name: string; district: string };

const names: [string, string[]][] = [
  [
    'Zuidpolder',
    ['Zuidpolder', 'Hoge Weide', 'Kortland', 'De Vlieter', 'Zandkreek', 'Oudeland', 'Schorrenweg', 'Nieuwe Sluis', 'Kerkpolder', 'Bremdijk']
  ],
  [
    'Molenkreek',
    ['Molenkreek', 'Vossemeer', 'Gaatje', 'Rietgors', 'Kapelle Noord', 'Oude Haven', 'Westkade', 'Speelmansgat', 'Dijkwater', 'Hellegat', 'Zoutweide']
  ],
  [
    'Oosterdiep',
    ['Oosterdiep', 'Havenhoofd', 'Strekdam', 'Plaat van Oost', 'Duinrel', 'Noordkaap', 'Geul', 'Zeedijk', 'Stormvloed', 'Buitengors']
  ]
];
const prefix: Record<string, string> = { Zuidpolder: 'ZP', Molenkreek: 'MK', Oosterdiep: 'OD' };
const focusCodes: Record<string, string> = {
  Zuidpolder: 'ZP-03',
  Molenkreek: 'MK-11',
  Oosterdiep: 'OD-07'
};

export const network: NetworkStation[] = names.flatMap(([district, list]) => {
  const focus = focusCodes[district]!;
  let n = 0;
  return list.map((name, i) => {
    if (i === 0) return { code: focus, name, district };
    let code = '';
    do {
      n += 1;
      code = `${prefix[district]}-${String(n).padStart(2, '0')}`;
    } while (code === focus);
    return { code, name, district };
  });
});

/** Room tone for a station that stays in tune all night (a few small blips). */
export function networkTone(index: number): Float32Array {
  const random = mulberry32(5000 + index * 31);
  const out = new Float32Array(MINUTES);
  const blip = 200 + Math.floor(random() * 1000);
  for (let i = 0; i < MINUTES; i++) {
    const b = envelope(i, blip, blip + 12, blip + 40) * 0.18;
    out[i] = (0.06 + b) * (0.55 + random() * 0.45);
  }
  return out;
}

/**
 * A short stretch of one station at audio-like resolution, for close-up
 * waveforms: the minute envelope, interpolated, with a seeded grain.
 */
export function denseWave(lane: number, from: number, to: number, samples = 480) {
  const amp = getSeries()[lane]!.amplitude;
  const dev = getSeries()[lane]!.deviation;
  const random = mulberry32(900 + lane * 13 + from);
  const out = new Float32Array(samples);
  for (let k = 0; k < samples; k++) {
    const m = from + ((to - from) * k) / (samples - 1);
    const i = Math.min(amp.length - 2, Math.floor(m));
    const f = m - i;
    const d = dev[i]! * (1 - f) + dev[i + 1]! * f;
    const base = 0.07 + 0.88 * d;
    const grain = 0.45 + random() * 0.55;
    out[k] = base * grain * (0.85 + 0.15 * Math.sin(k * 0.9));
  }
  return out;
}
