/**
 * The Low Orbit visual: four orbit families, one per stem.
 * kick → the core, bass → the inner rings, pads → the dust field,
 * vocal → the satellite and its trail. Gravity pulls every orbit inward.
 *
 * Pure drawing: the same function renders the live demo, the stills and the
 * scene thumbnails, so everything is seeded and depends only on its inputs.
 */

export type StemId = 'kick' | 'bass' | 'pads' | 'vocal';
export type Stems = Record<StemId, number>;

export const palette = {
  stage: '#07070A',
  infrared: '#FF2D55',
  ember: '#B3122E',
  bone: '#EDE6DA',
  ash: '#8C8790',
  smoke: '#2A2830'
} as const;

export type SceneId =
  | 'perigee'
  | 'apogee'
  | 'eclipse'
  | 'roche'
  | 'lagrange'
  | 'escape'
  | 'tidal'
  | 'reentry';

export type SceneDef = {
  id: SceneId;
  number: string;
  name: string;
  /** Where it sits in the set. */
  use: string;
  /** Ellipse ratio of the orbital plane (1 = seen from above). */
  tilt: number;
  /** Rotation of the plane in radians. */
  roll: number;
  rings: number;
  /** Radius of the outermost ring as a share of the shorter side. */
  spread: number;
  dust: number;
  satellites: number;
  eclipse: boolean;
  /** 0 = all bone, 1 = all infrared. */
  heat: number;
  /** Orbital eccentricity of the satellite. */
  ecc: number;
};

export const scenes: SceneDef[] = [
  {
    id: 'perigee',
    number: '01',
    name: 'Perigee',
    use: 'Openers, 4/4 sections',
    tilt: 0.34,
    roll: -0.22,
    rings: 5,
    spread: 0.44,
    dust: 1,
    satellites: 1,
    eclipse: false,
    heat: 0.55,
    ecc: 0.42
  },
  {
    id: 'apogee',
    number: '02',
    name: 'Apogee',
    use: 'Long builds, ambient intros',
    tilt: 0.16,
    roll: 0.06,
    rings: 7,
    spread: 0.5,
    dust: 1.5,
    satellites: 2,
    eclipse: false,
    heat: 0.2,
    ecc: 0.2
  },
  {
    id: 'eclipse',
    number: '03',
    name: 'Eclipse',
    use: 'Breakdowns, the drop after',
    tilt: 0.52,
    roll: 0.38,
    rings: 4,
    spread: 0.4,
    dust: 0.8,
    satellites: 1,
    eclipse: true,
    heat: 0.85,
    ecc: 0.55
  },
  {
    id: 'roche',
    number: '04',
    name: 'Roche Limit',
    use: 'Peak-time, distorted bass',
    tilt: 0.42,
    roll: -0.5,
    rings: 9,
    spread: 0.36,
    dust: 1.8,
    satellites: 0,
    eclipse: false,
    heat: 0.75,
    ecc: 0.3
  },
  {
    id: 'lagrange',
    number: '05',
    name: 'Lagrange',
    use: 'Vocal tracks, sparse verses',
    tilt: 0.28,
    roll: 0.2,
    rings: 3,
    spread: 0.46,
    dust: 0.6,
    satellites: 3,
    eclipse: false,
    heat: 0.35,
    ecc: 0.15
  },
  {
    id: 'escape',
    number: '06',
    name: 'Escape Velocity',
    use: 'Final track, house lights up',
    tilt: 0.22,
    roll: -0.1,
    rings: 6,
    spread: 0.62,
    dust: 1.2,
    satellites: 2,
    eclipse: false,
    heat: 0.45,
    ecc: 0.7
  },
  {
    id: 'tidal',
    number: '07',
    name: 'Tidal Lock',
    use: 'Half-time, slow sections',
    tilt: 0.7,
    roll: 0.9,
    rings: 4,
    spread: 0.42,
    dust: 1,
    satellites: 1,
    eclipse: true,
    heat: 0.3,
    ecc: 0.05
  },
  {
    id: 'reentry',
    number: '08',
    name: 'Re-entry',
    use: 'Encore, strobe-safe',
    tilt: 0.4,
    roll: -0.32,
    rings: 5,
    spread: 0.34,
    dust: 2,
    satellites: 1,
    eclipse: false,
    heat: 1,
    ecc: 0.48
  }
];

export function getScene(id: SceneId): SceneDef {
  return scenes.find((scene) => scene.id === id) ?? scenes[0]!;
}

/** A small seeded PRNG so every still is identical between renders. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Dust = { r: number; a: number; size: number; lift: number; bright: number };
const dustCache = new Map<string, Dust[]>();

function dustField(count: number, rings: number): Dust[] {
  const key = `${count}:${rings}`;
  const cached = dustCache.get(key);
  if (cached) return cached;
  const rand = mulberry32(count * 7919 + rings * 131 + 13);
  const list: Dust[] = [];
  for (let i = 0; i < count; i++) {
    let r: number;
    if (rand() < 0.72) {
      // Bound to a ring: accretion bands just inside and outside each orbit.
      const ring = Math.floor(rand() * rings);
      const k = rings === 1 ? 0 : ring / (rings - 1);
      const gauss = (rand() + rand() + rand() - 1.5) * 0.06;
      r = 0.3 + k * 0.7 + gauss;
    } else {
      // A diffuse halo, denser near the core.
      r = 0.12 + Math.pow(rand(), 0.8) * 1.15;
    }
    list.push({
      r,
      a: rand() * Math.PI * 2,
      size: 0.5 + rand() * rand() * 2.4,
      lift: (rand() - 0.5) * 0.05,
      bright: rand()
    });
  }
  dustCache.set(key, list);
  return list;
}

/** Musical-looking stem levels from the clock alone, for stills and idle. */
export function simulatedStems(t: number, bpm = 120): Stems {
  const beat = (t * bpm) / 60;
  const phase = beat - Math.floor(beat);
  const off = (beat * 2 + 0.5) % 1;
  const bar = Math.floor(beat / 4) % 4;
  const inBar = (beat % 4) / 4;
  return {
    kick: Math.exp(-phase * 5.5),
    bass: 0.25 + 0.6 * Math.exp(-off * 4),
    pads: 0.45 + 0.2 * Math.sin(t * 0.7) + 0.1 * Math.sin(t * 1.9),
    vocal:
      bar === 1 || bar === 3
        ? 0.35 + 0.55 * Math.sin(Math.PI * Math.min(1, inBar * 1.25))
        : 0.08
  };
}

export type OrbitFrame = {
  /** Seconds. Drives every orbit. */
  time: number;
  stems: Stems;
  /** 0 to 1. Pulls orbits inward and speeds them up. */
  gravity: number;
  scene: SceneDef;
  /** Draws the stage-black background first. */
  background?: boolean;
  /** Scales particle counts, e.g. 0.5 for small thumbnails. */
  density?: number;
  /** Shift the system's centre, as a share of width/height. */
  offsetX?: number;
  offsetY?: number;
  /** Override the radius base (default: the shorter side). */
  size?: number;
};

const TAU = Math.PI * 2;

function mixColour(heat: number, alpha: number) {
  // bone (237,230,218) → infrared (255,45,85)
  const r = Math.round(237 + (255 - 237) * heat);
  const g = Math.round(230 + (45 - 230) * heat);
  const b = Math.round(218 + (85 - 218) * heat);
  return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

/**
 * Draws one frame into a 2D context sized `width`×`height` in device pixels.
 * `scale` is the device-pixel ratio, so line widths stay consistent.
 */
export function drawOrbit(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  frame: OrbitFrame
) {
  const { time, stems, scene } = frame;
  const gravity = Math.min(1, Math.max(0, frame.gravity));
  const density = frame.density ?? 1;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  if (frame.background !== false) {
    ctx.fillStyle = palette.stage;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  const cx = width * (0.5 + (frame.offsetX ?? 0));
  const cy = height * (0.5 + (frame.offsetY ?? 0));
  const base = frame.size ?? Math.min(width, height * 1.55);
  const pull = 1 - gravity * 0.58;
  const R = base * scene.spread * pull;
  const speed = 1 + gravity * 1.6;
  const cosR = Math.cos(scene.roll);
  const sinR = Math.sin(scene.roll);
  const tilt = scene.tilt;

  const project = (r: number, a: number, lift = 0) => {
    const x = r * Math.cos(a);
    const y = r * Math.sin(a) * tilt + lift * base;
    return {
      x: cx + x * cosR - y * sinR,
      y: cy + x * sinR + y * cosR,
      // 1 in front of the core, 0 behind it.
      front: (Math.sin(a) + 1) / 2
    };
  };

  ctx.globalCompositeOperation = 'lighter';

  // Pads: the dust field.
  const dustCount = Math.round(2600 * scene.dust * density);
  const dust = dustField(dustCount, scene.rings);
  const padGlow = 0.35 + stems.pads * 0.85;
  for (const d of dust) {
    const r = d.r * R * (1 + Math.sin(d.a * 3 + time * 0.4) * 0.015 * stems.pads);
    const omega = 0.08 / Math.pow(Math.max(0.2, d.r), 1.5);
    const a = d.a + time * omega * speed;
    const p = project(r, a, d.lift);
    const alpha = (0.14 + d.bright * 0.62) * padGlow * (0.3 + p.front * 0.7);
    const s = d.size * scale * (0.85 + stems.pads * 0.7);
    ctx.fillStyle = mixColour(d.bright > 0.93 ? scene.heat : scene.heat * 0.25, alpha);
    ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
  }

  // Bass: rings, thicker and wobblier with the bass, back half dimmed.
  const segments = 180;
  for (let i = 0; i < scene.rings; i++) {
    const k = scene.rings === 1 ? 0 : i / (scene.rings - 1);
    const ringR = R * (0.3 + k * 0.7);
    const heat = Math.min(1, scene.heat * (1.4 - k));
    const wobble = stems.bass * 0.03 * (1 - k * 0.6);
    const lobes = 3 + (i % 3);
    const thickness = (0.9 + stems.bass * (3.2 - k * 2)) * scale;
    for (const half of [0, 1] as const) {
      ctx.beginPath();
      let started = false;
      for (let s = 0; s <= segments; s++) {
        const a = (s / segments) * TAU;
        const isFront = Math.sin(a) >= 0;
        if ((half === 1) !== isFront) {
          started = false;
          continue;
        }
        const rr =
          ringR * (1 + wobble * Math.sin(a * lobes + time * (1.2 + i * 0.3)));
        const p = project(rr, a);
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      const alpha = (0.3 + stems.bass * 0.6) * (half ? 1 : 0.4) * (1 - k * 0.3);
      ctx.strokeStyle = mixColour(heat, alpha * 0.16);
      ctx.lineWidth = thickness * 7;
      ctx.stroke();
      ctx.strokeStyle = mixColour(heat, Math.min(1, alpha));
      ctx.lineWidth = thickness;
      ctx.stroke();
    }

    // Beads running along the ring.
    const beads = 3 + i * 2;
    const omega = (0.22 / Math.pow(0.3 + k * 0.7, 1.5)) * speed;
    for (let b = 0; b < beads; b++) {
      const a = (b / beads) * TAU + time * omega + i * 1.7;
      const p = project(ringR, a);
      const size = (1.2 + stems.bass * 2.2) * scale * (0.6 + p.front * 0.6);
      ctx.fillStyle = mixColour(heat, 0.45 + p.front * 0.5);
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, TAU);
      ctx.fill();
    }
  }

  // Kick: the core.
  const coreR = R * (0.1 + stems.kick * 0.1);
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3.6);
  glow.addColorStop(0, mixColour(Math.max(0.5, scene.heat), 0.75 + stems.kick * 0.25));
  glow.addColorStop(0.22, mixColour(Math.max(0.5, scene.heat), 0.28 + stems.kick * 0.3));
  glow.addColorStop(1, mixColour(scene.heat, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR * 3.6, 0, TAU);
  ctx.fill();
  // A thin horizontal flare through the core on each kick.
  const flareW = R * (0.6 + stems.kick * 1.4);
  const flare = ctx.createLinearGradient(cx - flareW, cy, cx + flareW, cy);
  flare.addColorStop(0, mixColour(0.7, 0));
  flare.addColorStop(0.5, mixColour(0.4, 0.25 + stems.kick * 0.45));
  flare.addColorStop(1, mixColour(0.7, 0));
  ctx.fillStyle = flare;
  ctx.fillRect(cx - flareW, cy - 0.8 * scale, flareW * 2, 1.6 * scale);

  ctx.globalCompositeOperation = 'source-over';
  if (scene.eclipse) {
    const discR = R * 0.2;
    ctx.fillStyle = palette.stage;
    ctx.beginPath();
    ctx.arc(cx, cy, discR, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = mixColour(Math.max(0.6, scene.heat), 0.5 + stems.kick * 0.5);
    ctx.lineWidth = (1 + stems.kick * 2.5) * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, discR, 0, TAU);
    ctx.stroke();
  } else {
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = mixColour(0, 0.9);
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1.5 * scale, coreR * 0.2), 0, TAU);
    ctx.fill();
  }

  // Vocal: satellites on eccentric orbits, with trails.
  for (let s = 0; s < scene.satellites; s++) {
    const semi = R * (0.62 + s * 0.17);
    const ecc = scene.ecc;
    const phase = s * 2.1;
    const omega = (0.5 - s * 0.08) * speed;
    const trail = 46;
    const at = (tt: number) => {
      const M = tt * omega + phase;
      // A cheap eccentric orbit: faster near the inner end.
      const E = M + ecc * Math.sin(M);
      const r = semi * (1 - ecc * Math.cos(E)) * (1 + stems.vocal * 0.05);
      return project(r, E + s);
    };
    ctx.lineCap = 'round';
    let prev = at(time - trail * 0.02);
    for (let j = trail - 1; j >= 0; j--) {
      const p = at(time - j * 0.02);
      const life = 1 - j / trail;
      ctx.strokeStyle = mixColour(0.15, life * life * (0.25 + stems.vocal * 0.6));
      ctx.lineWidth = (0.6 + life * (1 + stems.vocal * 2.5)) * scale;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      prev = p;
    }
    const head = at(time);
    const headR = (2 + stems.vocal * 4) * scale;
    const halo = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, headR * 5);
    halo.addColorStop(0, mixColour(0, 0.5 + stems.vocal * 0.4));
    halo.addColorStop(1, mixColour(0, 0));
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(head.x, head.y, headR * 5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = palette.bone;
    ctx.beginPath();
    ctx.arc(head.x, head.y, headR * 0.6, 0, TAU);
    ctx.fill();
  }

  ctx.restore();
}
