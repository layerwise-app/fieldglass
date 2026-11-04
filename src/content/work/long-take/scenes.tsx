import { useId, type CSSProperties, type ReactNode } from 'react';

/*
 * Original film stills for Long Take's sample issue, drawn in SVG. Every
 * scene is drawn on an open-matte 1.37 frame and cropped by its box
 * (`preserveAspectRatio="xMidYMid slice"`), the way a 1.85 or 2.39 hard
 * matte crops the negative. Keep the action between y 215 and 785 so it
 * survives a 2.39 crop.
 */

export const W = 1370;
export const H = 1000;

export type Duo = readonly [shadow: string, light: string];

export type SceneProps = {
  /** Where we are in the shot, 0 to 1. Only some scenes move. */
  t?: number;
  grain?: boolean;
  /** Print the still in two inks, like a duotone cover. */
  duo?: Duo;
  /** Accessible description. Omit for decorative use. */
  label?: string;
  style?: CSSProperties;
  className?: string;
};

export type SceneName =
  | 'coast'
  | 'corridor'
  | 'tram'
  | 'field'
  | 'kitchen'
  | 'harbour';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function rgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

export function mix(a: string, b: string, k: number) {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const c = clamp(k);
  const h = (x: number, y: number) =>
    Math.round(x + (y - x) * c)
      .toString(16)
      .padStart(2, '0');
  return `#${h(r1, r2)}${h(g1, g2)}${h(b1, b2)}`;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = s;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function useIds() {
  const base = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (name: string) => `lt${base}${name}`;
}

const tableFor = (duo: Duo, channel: 0 | 1 | 2) =>
  `${(rgb(duo[0])[channel] / 255).toFixed(3)} ${(rgb(duo[1])[channel] / 255).toFixed(3)}`;

function Frame({
  id,
  grain = true,
  duo,
  label,
  style,
  className,
  vignette = 0.5,
  children
}: SceneProps & {
  id: (name: string) => string;
  vignette?: number;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio='xMidYMid slice'
      width='100%'
      height='100%'
      style={{ display: 'block', ...style }}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable='false'
    >
      <defs>
        <radialGradient id={id('vig')} cx='0.5' cy='0.5' r='0.72'>
          <stop offset='0.55' stopColor='#000' stopOpacity='0' />
          <stop offset='1' stopColor='#000' stopOpacity={vignette} />
        </radialGradient>
        {grain ? (
          <filter id={id('grain')} x='0' y='0' width='100%' height='100%'>
            <feTurbulence
              type='fractalNoise'
              baseFrequency='0.8'
              numOctaves={2}
              seed={7}
              stitchTiles='stitch'
            />
            <feColorMatrix type='saturate' values='0' />
          </filter>
        ) : null}
        {duo ? (
          <filter id={id('duo')} colorInterpolationFilters='sRGB'>
            <feColorMatrix
              type='matrix'
              values='0.3 0.59 0.11 0 0 0.3 0.59 0.11 0 0 0.3 0.59 0.11 0 0 0 0 0 1 0'
            />
            <feComponentTransfer>
              <feFuncR type='table' tableValues={tableFor(duo, 0)} />
              <feFuncG type='table' tableValues={tableFor(duo, 1)} />
              <feFuncB type='table' tableValues={tableFor(duo, 2)} />
            </feComponentTransfer>
          </filter>
        ) : null}
      </defs>
      <g filter={duo ? `url(#${id('duo')})` : undefined}>
        {children}
        <rect width={W} height={H} fill={`url(#${id('vig')})`} />
      </g>
      {grain ? (
        <rect
          width={W}
          height={H}
          filter={`url(#${id('grain')})`}
          opacity={0.2}
          style={{ mixBlendMode: 'overlay' }}
        />
      ) : null}
    </svg>
  );
}

/** A soft-edged light: the halation around a bulb on film. */
function Glow({
  id,
  cx,
  cy,
  r,
  color,
  opacity = 1
}: {
  id: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
  opacity?: number;
}) {
  return (
    <>
      <defs>
        <radialGradient id={id}>
          <stop offset='0' stopColor={color} stopOpacity={opacity} />
          <stop offset='0.25' stopColor={color} stopOpacity={opacity * 0.45} />
          <stop offset='1' stopColor={color} stopOpacity='0' />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </>
  );
}

/** A person seen from behind, feet at (x, y), `h` tall. */
function Walker({
  x,
  y,
  h,
  phase = 0,
  fill,
  rim
}: {
  x: number;
  y: number;
  h: number;
  phase?: number;
  fill: string;
  rim?: string;
}) {
  const s = h / 100;
  const swing = Math.sin(phase * Math.PI * 2) * 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d={`M-3.5 -40 L${-5 + swing} -1 L${-1 + swing} 0 L0.5 -36 L2 -36 L${4 - swing} 0 L${8 - swing} -1 L4.5 -40 Z`}
        fill={fill}
      />
      <path
        d='M-9.5 -80 C-12 -70 -13 -52 -14.5 -38 L13 -38 C11.5 -52 11 -70 9 -80 C5 -84 -5 -84 -9.5 -80 Z'
        fill={fill}
      />
      <circle cx='0' cy='-89' r='7' fill={fill} />
      <circle cx='-1' cy='-96.5' r='3.6' fill={fill} />
      {rim ? (
        <path
          d='M9 -80 C11 -70 11.5 -52 13 -38'
          stroke={rim}
          strokeWidth='1.6'
          fill='none'
          opacity='0.8'
        />
      ) : null}
    </g>
  );
}

/* --------------------------------------------------------------------- */
/* Kustweg (Agnès Verhulst, 1991): the coast road at dusk, the final take. */

export function CoastRoad({ t = 0.3, ...props }: SceneProps) {
  const id = useIds();
  const k = clamp(t);
  const hz = 588;
  const vpX = 905;
  const skyTop = mix('#29314c', '#0c1226', k);
  const skyMid = mix('#86677a', '#262c4a', k);
  const skyLow = mix('#f2a679', '#59618a', clamp(k * 1.25));
  const sunY = 512 + k * 170;
  const sunAlpha = clamp(1 - k * 1.9);
  const seaTop = mix('#757187', '#252c48', k);
  const seaLow = mix('#2d3350', '#0e1324', k);
  const roadFar = mix('#93788a', '#363c5e', k);
  const roadNear = mix('#2a252e', '#0c0f19', k);
  const land = mix('#2c2530', '#0a0c15', k);
  const landLit = mix('#5a4247', '#171a2a', k);
  const line = mix('#e9d8c2', '#7f86a8', k);

  const leftB = 150;
  const rightB = 1090;
  const yAt = (f: number) => hz + (H - hz) * f;
  const lx = (f: number) => vpX - 3 + (leftB - vpX) * f;
  const rx = (f: number) => vpX + 3 + (rightB - vpX) * f;
  const cx = (f: number) => (lx(f) + rx(f)) / 2;

  const dashes = Array.from({ length: 14 }, (_, i) => {
    const f0 = ((i + 0.0) / 14) ** 2.2;
    const f1 = ((i + 0.45) / 14) ** 2.2;
    const w0 = 1 + f0 * 9;
    const w1 = 1 + f1 * 9;
    return `M${cx(f0) - w0} ${yAt(f0)} L${cx(f0) + w0} ${yAt(f0)} L${cx(f1) + w1} ${yAt(f1)} L${cx(f1) - w1} ${yAt(f1)} Z`;
  });

  const poles = [0.035, 0.06, 0.095, 0.15, 0.24, 0.38, 0.6, 0.95].map((f) => ({
    x: lx(f) - 34 * f - 6,
    base: yAt(f) - 2,
    top: yAt(f) - 2 - (40 + 470 * f),
    w: 0.8 + 5 * f
  }));

  // The walker keeps to the left verge, walking away from us.
  const wf = 0.44 - k * 0.36;
  const walker = { x: lx(wf) + (rx(wf) - lx(wf)) * 0.1, y: yAt(wf), h: 30 + 300 * wf };

  // A car comes towards us along the right lane between t 0.3 and 0.62.
  const ck = (k - 0.3) / 0.33;
  const car =
    ck > 0 && ck < 1
      ? (() => {
          const f = 0.015 + ck * ck * 0.7;
          const x = cx(f) + (rx(f) - lx(f)) * 0.24;
          const y = yAt(f);
          const gap = (rx(f) - lx(f)) * 0.11;
          return { f, x, y, gap, r: 2 + 48 * f };
        })()
      : null;
  const litWalker = car && car.f > 0.18;
  const beacon = k > 0.62;
  const beamAngle = -160 + (k - 0.62) * 260;

  return (
    <Frame id={id} {...props}>
      <defs>
        <linearGradient id={id('sky')} x1='0' y1='0' x2='0' y2={hz} gradientUnits='userSpaceOnUse'>
          <stop offset='0' stopColor={skyTop} />
          <stop offset='0.62' stopColor={skyMid} />
          <stop offset='1' stopColor={skyLow} />
        </linearGradient>
        <linearGradient id={id('sea')} x1='0' y1={hz} x2='0' y2='780' gradientUnits='userSpaceOnUse'>
          <stop offset='0' stopColor={seaTop} />
          <stop offset='1' stopColor={seaLow} />
        </linearGradient>
        <linearGradient id={id('road')} x1='0' y1={hz} x2='0' y2={H} gradientUnits='userSpaceOnUse'>
          <stop offset='0' stopColor={roadFar} />
          <stop offset='0.35' stopColor={mix(roadFar, roadNear, 0.6)} />
          <stop offset='1' stopColor={roadNear} />
        </linearGradient>
        <linearGradient id={id('cone')} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#fff1cf' stopOpacity='0.55' />
          <stop offset='1' stopColor='#fff1cf' stopOpacity='0' />
        </linearGradient>
        <clipPath id={id('above')}>
          <rect width={W} height={hz} />
        </clipPath>
      </defs>

      <rect width={W} height={hz + 2} fill={`url(#${id('sky')})`} />
      <g clipPath={`url(#${id('above')})`}>
        <Glow id={id('sunglow')} cx={1015} cy={sunY} r={330} color='#ffc08a' opacity={0.75 * sunAlpha} />
        <circle cx={1015} cy={sunY} r={30} fill='#ffe2b8' opacity={sunAlpha} />
      </g>
      <ellipse cx='330' cy='418' rx='300' ry='7' fill={mix('#d99a86', '#343a5c', k)} opacity='0.75' />
      <ellipse cx='560' cy='452' rx='230' ry='4' fill={mix('#e7ad8e', '#3c4366', k)} opacity='0.6' />
      <ellipse cx='1110' cy='470' rx='210' ry='5' fill={mix('#f0b590', '#3f4569', k)} opacity='0.7' />
      <ellipse cx='740' cy='300' rx='380' ry='13' fill={mix('#6f5a72', '#1b2140', k)} opacity='0.55' />

      {/* Sea, with the sun's path on it while it lasts. */}
      <path d={`M${vpX + 12} ${hz} L${W} ${hz} L${W} 800 C1240 760 1120 700 1010 655 C960 630 925 606 ${vpX + 12} ${hz} Z`} fill={`url(#${id('sea')})`} />
      {sunAlpha > 0
        ? Array.from({ length: 9 }, (_, i) => (
            <rect
              key={i}
              x={1015 - (14 + i * 9) / 2 + ((i * 37) % 11) - 5}
              y={hz + 6 + i * 11}
              width={14 + i * 9}
              height={2 + i * 0.4}
              fill='#ffd3a1'
              opacity={sunAlpha * (0.7 - i * 0.06)}
            />
          ))
        : null}

      {/* Headland and lighthouse. */}
      <path d={`M1095 ${hz} C1140 574 1190 566 1232 566 L1262 566 C1300 568 1340 574 ${W} 579 L${W} ${hz} Z`} fill={mix('#3a3141', '#0d1020', k)} />
      <path d='M1239 566 L1243 522 L1257 522 L1261 566 Z' fill={mix('#e3d3c4', '#4d5272', k)} />
      <rect x='1238' y='515' width='24' height='8' fill={mix('#3a3141', '#0d1020', k)} />
      {beacon ? (
        <>
          <path
            d='M1250 518 L-200 470 L-200 560 Z'
            fill='#fff4d6'
            opacity={0.12}
            transform={`rotate(${beamAngle + 160} 1250 518)`}
          />
          <Glow id={id('lamp')} cx={1250} cy={518} r={60} color='#fff2cf' opacity={0.9} />
          <circle cx='1250' cy='518' r='3.5' fill='#fffaf0' />
        </>
      ) : null}

      {/* Dunes to the left of the road. */}
      <path d={`M0 548 C110 532 210 542 320 556 C440 571 560 562 690 576 C780 584 850 586 ${vpX} ${hz} L${lx(1)} ${H} L0 ${H} Z`} fill={land} />
      <path d={`M0 548 C110 532 210 542 320 556 C440 571 560 562 690 576 C780 584 850 586 ${vpX} ${hz}`} stroke={landLit} strokeWidth='3' fill='none' opacity='0.9' />
      {/* Beach strip between road and sea. */}
      <path d={`M${vpX + 6} ${hz} C925 606 960 630 1010 655 C1120 700 1240 760 ${W} 800 L${W} ${H} L${rx(1)} ${H} Z`} fill={mix('#4b3c42', '#12141f', k)} />

      <path d={`M${lx(0)} ${hz} L${rx(0)} ${hz} L${rightB} ${H} L${leftB} ${H} Z`} fill={`url(#${id('road')})`} />
      <path d={`M${lx(0)} ${hz} L${leftB + 30} ${H}`} stroke={line} strokeWidth='3' opacity='0.35' />
      <path d={`M${rx(0)} ${hz} L${rightB - 30} ${H}`} stroke={line} strokeWidth='3' opacity='0.35' />
      {dashes.map((d, i) => (
        <path key={i} d={d} fill={line} opacity={0.55} />
      ))}

      {/* Telegraph poles and their wires. */}
      {poles.map((p, i) => {
        const next = poles[i + 1];
        return (
          <g key={i}>
            <rect x={p.x - p.w / 2} y={p.top} width={p.w} height={p.base - p.top} fill={land} />
            <rect x={p.x - p.w * 4} y={p.top + p.w * 2} width={p.w * 8} height={p.w * 0.9} fill={land} />
            {next ? (
              <path
                d={`M${next.x} ${next.top + next.w * 2.3} Q${(p.x + next.x) / 2} ${(p.top + next.top) / 2 + 6 + 30 * p.w / 6} ${p.x} ${p.top + p.w * 2.3}`}
                stroke={land}
                strokeWidth='1.2'
                fill='none'
                opacity='0.85'
              />
            ) : null}
          </g>
        );
      })}

      {car ? (
        <path
          d={`M${car.x - car.gap} ${car.y} L${car.x + car.gap} ${car.y} L${car.x + car.gap * 5} ${Math.min(H, car.y + 80 + 500 * car.f)} L${car.x - car.gap * 4} ${Math.min(H, car.y + 80 + 500 * car.f)} Z`}
          fill={`url(#${id('cone')})`}
          opacity={0.5 + car.f}
        />
      ) : null}

      <Walker
        x={walker.x}
        y={walker.y}
        h={walker.h}
        phase={k * 9}
        fill={mix('#16121a', '#05060c', k)}
        rim={litWalker ? '#ffe7b8' : undefined}
      />

      {car ? (
        <g>
          <rect
            x={car.x - car.gap * 1.6}
            y={car.y - car.gap * 1.1}
            width={car.gap * 3.2}
            height={car.gap * 1.1}
            rx={car.gap * 0.3}
            fill={roadNear}
          />
          {[-1, 1].map((side) => (
            <g key={side}>
              <Glow id={id(`hl${side}`)} cx={car.x + side * car.gap} cy={car.y - car.gap * 0.45} r={car.r * 6} color='#fff0c8' opacity={0.9} />
              <circle cx={car.x + side * car.gap} cy={car.y - car.gap * 0.45} r={Math.max(1.5, car.r * 0.5)} fill='#fffbef' />
            </g>
          ))}
        </g>
      ) : null}

      {/* Foreground grass: only in the 1.37 frame. */}
      {Array.from({ length: 40 }, (_, i) => {
        const r = rng(i + 4)();
        const x = (i / 40) * 150 + r * 8;
        const h = 40 + r * 90;
        return (
          <path
            key={i}
            d={`M${x} ${H} Q${x + 6} ${H - h * 0.6} ${x + 14 - r * 20} ${H - h}`}
            stroke={mix('#1b161d', '#05060b', k)}
            strokeWidth='3'
            fill='none'
          />
        );
      })}
    </Frame>
  );
}

/* --------------------------------------------------------------------- */
/* Corridor Light (Tamás Rideg, 2004): a lit doorway at the end of a hall. */

export function Corridor(props: SceneProps) {
  const id = useIds();
  const vx = 690;
  const top = 382;
  const bot = 606;
  const left = 598;
  const right = 782;
  const doorL = 660;
  const doorR = 718;
  const doorT = 448;
  const doors = [0.18, 0.4, 0.62];
  const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
  return (
    <Frame id={id} vignette={0.65} {...props}>
      <defs>
        <linearGradient id={id('floor')} x1='0' y1={bot} x2='0' y2={H} gradientUnits='userSpaceOnUse'>
          <stop offset='0' stopColor='#2a332f' />
          <stop offset='1' stopColor='#0d1312' />
        </linearGradient>
        <linearGradient id={id('spill')} x1='0' y1={bot} x2='0' y2={H} gradientUnits='userSpaceOnUse'>
          <stop offset='0' stopColor='#f6cf8a' stopOpacity='0.85' />
          <stop offset='0.55' stopColor='#f6cf8a' stopOpacity='0.25' />
          <stop offset='1' stopColor='#f6cf8a' stopOpacity='0.05' />
        </linearGradient>
        <linearGradient id={id('lw')} x1='0' y1='0' x2={left} y2='0' gradientUnits='userSpaceOnUse'>
          <stop offset='0' stopColor='#0f1918' />
          <stop offset='1' stopColor='#2a3b38' />
        </linearGradient>
        <linearGradient id={id('rw')} x1={W} y1='0' x2={right} y2='0' gradientUnits='userSpaceOnUse'>
          <stop offset='0' stopColor='#132120' />
          <stop offset='1' stopColor='#34463f' />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill='#101817' />
      {/* Ceiling, walls, floor in one-point perspective. */}
      <path d={`M0 0 L${W} 0 L${right} ${top} L${left} ${top} Z`} fill='#0c1413' />
      <path d={`M0 0 L${left} ${top} L${left} ${bot} L0 ${H} Z`} fill={`url(#${id('lw')})`} />
      <path d={`M${W} 0 L${right} ${top} L${right} ${bot} L${W} ${H} Z`} fill={`url(#${id('rw')})`} />
      <path d={`M0 ${H} L${left} ${bot} L${right} ${bot} L${W} ${H} Z`} fill={`url(#${id('floor')})`} />
      <rect x={left} y={top} width={right - left} height={bot - top} fill='#203130' />
      {/* Ceiling lamps, switched off, receding. */}
      {[0.12, 0.3, 0.55, 0.85].map((f, i) => {
        const y = lerp(top, 0, f);
        const w = lerp(16, 150, f);
        return <rect key={i} x={vx - w / 2} y={y - 4 - f * 8} width={w} height={3 + f * 10} rx={2} fill='#3f504c' opacity={0.7} />;
      })}
      {/* Doors along both walls. */}
      {doors.map((f, i) => {
        const x0 = lerp(left, 0, f);
        const x1 = lerp(left, 0, f + 0.11);
        const t0 = lerp(top, 0, f) + lerp(30, 160, f);
        const t1 = lerp(top, 0, f + 0.11) + lerp(30, 160, f + 0.11);
        const b0 = lerp(bot, H, f);
        const b1 = lerp(bot, H, f + 0.11);
        const r0 = lerp(right, W, f);
        const r1 = lerp(right, W, f + 0.11);
        return (
          <g key={i} fill='#0a1110'>
            <path d={`M${x0} ${t0} L${x1} ${t1} L${x1} ${b1} L${x0} ${b0} Z`} opacity='0.8' />
            <path d={`M${r0} ${t0} L${r1} ${t1} L${r1} ${b1} L${r0} ${b0} Z`} opacity='0.7' />
          </g>
        );
      })}
      {/* The lit doorway and its spill. */}
      <path d={`M${doorL} ${bot} L${doorR} ${bot} L${vx + 210} ${H} L${vx - 250} ${H} Z`} fill={`url(#${id('spill')})`} />
      <Glow id={id('door')} cx={(doorL + doorR) / 2} cy={(doorT + bot) / 2} r={230} color='#ffd99a' opacity={0.55} />
      <rect x={doorL} y={doorT} width={doorR - doorL} height={bot - doorT} fill='#ffe3ac' />
      <rect x={doorL + 4} y={doorT + 6} width={doorR - doorL - 8} height={bot - doorT - 6} fill='#fff3d6' />
      {/* Someone waits halfway down, backlit. */}
      <g transform='translate(0 0)'>
        <Walker x={vx - 24} y={792} h={262} fill='#070b0b' rim='#ffd796' />
      </g>
      <path d={`M${vx - 52} 792 L${vx + 6} 792 L${vx + 160} 900 L${vx - 30} 905 Z`} fill='#050808' opacity='0.55' />
    </Frame>
  );
}

/* --------------------------------------------------------------------- */
/* Tram 81 (Lieve Martens, 2016): rain on a tram window at night. */

export function TramRain(props: SceneProps) {
  const id = useIds();
  const r = rng(81);
  const colours = ['#f0a24f', '#d9473b', '#4fb7b0', '#f6d48a', '#e86a4a', '#8fb8e8'];
  const bokeh = Array.from({ length: 46 }, () => ({
    x: r() * W,
    y: 260 + r() * 470,
    r: 14 + r() * 46,
    c: colours[Math.floor(r() * colours.length)]!,
    o: 0.25 + r() * 0.55
  }));
  const drops = Array.from({ length: 170 }, () => ({
    x: 70 + r() * 1230,
    y: 150 + r() * 700,
    r: 2 + r() * r() * 9,
    s: r()
  }));
  const streaks = Array.from({ length: 26 }, () => ({
    x: 90 + r() * 1180,
    y: 150 + r() * 300,
    l: 120 + r() * 420
  }));
  return (
    <Frame id={id} vignette={0.6} {...props}>
      <defs>
        <filter id={id('blur')} x='-20%' y='-20%' width='140%' height='140%'>
          <feGaussianBlur stdDeviation='9' />
        </filter>
        <linearGradient id={id('street')} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#0c1322' />
          <stop offset='0.6' stopColor='#17233a' />
          <stop offset='1' stopColor='#0a0f1a' />
        </linearGradient>
        <clipPath id={id('glass')}>
          <rect x='60' y='140' width='1250' height='720' rx='34' />
        </clipPath>
      </defs>
      <rect width={W} height={H} fill='#07090f' />
      <g clipPath={`url(#${id('glass')})`}>
        <rect x='0' y='0' width={W} height={H} fill={`url(#${id('street')})`} />
        <g filter={`url(#${id('blur')})`}>
          <path d='M0 520 L240 470 L240 330 L420 330 L420 420 L700 390 L700 300 L880 300 L880 410 L1100 430 L1100 350 L1370 350 L1370 620 L0 640 Z' fill='#1d2a44' opacity='0.8' />
          <rect x='0' y='640' width={W} height='240' fill='#101a2c' />
          {bokeh.map((b, i) => (
            <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={b.c} opacity={b.o} />
          ))}
          <rect x='0' y='690' width={W} height='18' fill='#f0a24f' opacity='0.18' />
        </g>
        {/* Her reflection in the glass. */}
        <g opacity='0.2' fill='#9fb8d6'>
          <path d='M930 860 C930 760 960 700 1010 680 C990 660 980 630 990 600 C1000 560 1040 545 1075 560 C1105 575 1112 610 1100 640 C1095 652 1100 664 1092 672 C1150 690 1190 760 1195 860 Z' />
        </g>
        {streaks.map((s, i) => (
          <path
            key={i}
            d={`M${s.x} ${s.y} C${s.x + 5} ${s.y + s.l * 0.3} ${s.x - 6} ${s.y + s.l * 0.6} ${s.x + 2} ${s.y + s.l}`}
            stroke='#b9cbe6'
            strokeWidth='2.2'
            fill='none'
            opacity='0.22'
          />
        ))}
        {drops.map((d, i) => (
          <g key={i}>
            <ellipse cx={d.x} cy={d.y} rx={d.r} ry={d.r * 1.15} fill='#0b1220' opacity={0.45} />
            <ellipse cx={d.x - d.r * 0.25} cy={d.y - d.r * 0.3} rx={d.r * 0.45} ry={d.r * 0.5} fill={d.s > 0.5 ? '#f6c88a' : '#c8d8ee'} opacity={0.65} />
          </g>
        ))}
      </g>
      {/* Window frame and the handrail. */}
      <rect x='60' y='140' width='1250' height='720' rx='34' fill='none' stroke='#151a24' strokeWidth='22' />
      <rect x='60' y='478' width='1250' height='14' fill='#0d1119' />
      <rect x='1006' y='0' width='22' height={H} fill='#2b3344' />
      <rect x='1012' y='0' width='4' height={H} fill='#a9b4c8' opacity='0.55' />
      <rect x='0' y='870' width={W} height='130' fill='#0b0e15' />
    </Frame>
  );
}

/* --------------------------------------------------------------------- */
/* Night Field (Osei Brandt, 1979): headlights cross a field at night. */

export function NightField(props: SceneProps) {
  const id = useIds();
  const r = rng(1979);
  const stars = Array.from({ length: 90 }, () => ({ x: r() * W, y: r() * 470, s: 0.6 + r() * 1.6, o: 0.3 + r() * 0.6 }));
  const hz = 600;
  const trees = Array.from({ length: 70 }, (_, i) => {
    const x = (i / 69) * W;
    return `${x} ${hz - 18 - Math.abs(Math.sin(i * 1.7) * 26 + Math.sin(i * 0.43) * 22)}`;
  });
  return (
    <Frame id={id} vignette={0.55} {...props}>
      <defs>
        <linearGradient id={id('sky')} x1='0' y1='0' x2='0' y2={hz} gradientUnits='userSpaceOnUse'>
          <stop offset='0' stopColor='#070b16' />
          <stop offset='1' stopColor='#1e2a44' />
        </linearGradient>
        <linearGradient id={id('ground')} x1='0' y1={hz} x2='0' y2={H} gradientUnits='userSpaceOnUse'>
          <stop offset='0' stopColor='#141a16' />
          <stop offset='1' stopColor='#06080a' />
        </linearGradient>
        <linearGradient id={id('beam')} x1='250' y1='0' x2='1300' y2='0' gradientUnits='userSpaceOnUse'>
          <stop offset='0' stopColor='#fbf0c4' stopOpacity='0.75' />
          <stop offset='1' stopColor='#fbf0c4' stopOpacity='0' />
        </linearGradient>
        <filter id={id('soft')} x='-10%' y='-50%' width='120%' height='200%'>
          <feGaussianBlur stdDeviation='14' />
        </filter>
      </defs>
      <rect width={W} height={hz} fill={`url(#${id('sky')})`} />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill='#e4e9f5' opacity={s.o} />
      ))}
      <path d={`M0 ${hz} L${trees.join(' L')} L${W} ${hz} Z`} fill='#04060b' />
      <rect y={hz} width={W} height={H - hz} fill={`url(#${id('ground')})`} />
      {/* Furrows in perspective. */}
      {Array.from({ length: 22 }, (_, i) => {
        const f = (i / 22) ** 1.8;
        const y = hz + 6 + (H - hz) * f;
        return <path key={i} d={`M0 ${y} Q685 ${y - 6 - f * 20} ${W} ${y}`} stroke='#232b20' strokeWidth={1 + f * 3} fill='none' opacity='0.8' />;
      })}
      {/* Mist along the ground, lit where the beams cross it. */}
      <rect x='0' y={hz - 30} width={W} height='70' fill='#9aa7bd' opacity='0.12' filter={`url(#${id('soft')})`} />
      <path d='M268 640 L1370 560 L1370 760 L268 668 Z' fill={`url(#${id('beam')})`} filter={`url(#${id('soft')})`} />
      <path d='M268 640 L1370 600 L1370 700 L268 662 Z' fill={`url(#${id('beam')})`} opacity='0.8' />
      {/* The car, and someone standing in its light. */}
      <path d='M150 660 L178 628 L250 622 L282 640 L286 668 L150 672 Z' fill='#030406' />
      <Glow id={id('l1')} cx={276} cy={648} r={70} color='#fff6d8' opacity={1} />
      <Glow id={id('l2')} cx={262} cy={652} r={44} color='#fff6d8' opacity={0.9} />
      <Walker x={905} y={652} h={96} fill='#05070a' rim='#fbf0c4' />
      <path d='M905 652 L990 666 L1000 670 L905 656 Z' fill='#000' opacity='0.4' />
    </Frame>
  );
}

/* --------------------------------------------------------------------- */
/* Rue Haute, le matin (Clara Mbeki, 2011): a kitchen at seven. */

export function Kitchen(props: SceneProps) {
  const id = useIds();
  return (
    <Frame id={id} vignette={0.35} {...props}>
      <defs>
        <linearGradient id={id('wall')} x1='0' y1='0' x2={W} y2='0' gradientUnits='userSpaceOnUse'>
          <stop offset='0' stopColor='#d9c4a0' />
          <stop offset='1' stopColor='#a88f6c' />
        </linearGradient>
        <linearGradient id={id('win')} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#fff8ea' />
          <stop offset='1' stopColor='#f3e2bf' />
        </linearGradient>
        <linearGradient id={id('shaft')} x1='0' y1='0' x2='1' y2='0'>
          <stop offset='0' stopColor='#fff4dc' stopOpacity='0.75' />
          <stop offset='1' stopColor='#fff4dc' stopOpacity='0.15' />
        </linearGradient>
        <filter id={id('steam')}>
          <feGaussianBlur stdDeviation='6' />
        </filter>
      </defs>
      <rect width={W} height={H} fill={`url(#${id('wall')})`} />
      {/* The window, left. */}
      <rect x='110' y='170' width='380' height='470' fill='#7d6548' />
      <rect x='126' y='186' width='348' height='438' fill={`url(#${id('win')})`} />
      <rect x='294' y='186' width='12' height='438' fill='#8f765a' />
      <rect x='126' y='398' width='348' height='12' fill='#8f765a' />
      <rect x='92' y='636' width='416' height='16' fill='#6f583e' />
      {/* Light falling across the room. */}
      <path d='M490 190 L1010 300 L1080 690 L490 640 Z' fill={`url(#${id('shaft')})`} opacity='0.55' />
      <path d='M720 300 L940 335 L970 520 L742 498 Z' fill='#fff5df' opacity='0.5' />
      <path d='M745 318 L760 515' stroke='#c7ad86' strokeWidth='7' opacity='0.5' />
      <path d='M723 400 L955 426' stroke='#c7ad86' strokeWidth='7' opacity='0.5' />
      {/* Shelf and cups. */}
      <rect x='980' y='250' width='300' height='10' fill='#6b5236' />
      {[1000, 1050, 1110, 1170, 1225].map((x, i) => (
        <path key={x} d={`M${x} 250 L${x + 4} ${214 - (i % 2) * 14} L${x + 34} ${214 - (i % 2) * 14} L${x + 38} 250 Z`} fill={i % 2 ? '#e9dcc4' : '#3f6a74'} />
      ))}
      {/* Table. */}
      <path d='M160 700 L1240 700 L1290 742 L110 742 Z' fill='#a26d3c' />
      <rect x='110' y='742' width='1180' height='22' fill='#6e4626' />
      <rect x='170' y='764' width='22' height='236' fill='#5c3a1f' />
      <rect x='1210' y='764' width='22' height='236' fill='#5c3a1f' />
      <rect y='764' width={W} height='236' fill='#3a2a1f' opacity='0.92' />
      <path d='M490 700 L980 700 L1020 742 L460 742 Z' fill='#fff2d4' opacity='0.35' />
      {/* Kettle and steam. */}
      <path d='M560 700 C548 650 568 610 620 604 C672 610 690 650 680 700 Z' fill='#2f2620' />
      <path d='M603 604 C603 590 637 590 637 604' stroke='#2f2620' strokeWidth='8' fill='none' />
      <path d='M680 650 C705 640 718 628 730 610' stroke='#2f2620' strokeWidth='12' strokeLinecap='round' fill='none' />
      <g filter={`url(#${id('steam')})`} opacity='0.75' fill='none' stroke='#fffaf0' strokeWidth='10' strokeLinecap='round'>
        <path d='M735 596 C720 560 760 530 742 490 C728 460 752 430 744 400' />
        <path d='M752 600 C770 570 748 540 770 510' opacity='0.6' />
      </g>
      <path d='M820 700 L826 668 L866 668 L872 700 Z' fill='#e7dbc4' />
      {/* She sits with her coffee, facing the window. */}
      {/* She sits in profile, facing the window, coffee in front of her. */}
      <g fill='#33251c'>
        <path d='M1012 700 C1004 628 1022 574 1066 556 C1080 551 1108 551 1122 556 C1164 574 1182 632 1176 700 Z' />
        <path d='M1072 560 L1076 526 L1104 526 L1110 560 Z' />
        <path d='M1062 470 C1062 446 1080 430 1102 430 C1126 430 1140 448 1140 472 C1140 494 1130 512 1112 520 C1100 526 1086 526 1078 520 L1070 514 C1062 512 1058 506 1060 500 L1054 494 L1060 486 C1058 480 1060 476 1062 470 Z' />
        <circle cx='1144' cy='454' r='17' />
        <path d='M1046 612 C1018 640 990 662 968 676 L978 690 C1006 676 1034 656 1058 632 Z' />
      </g>
      <path d='M1063 466 C1059 476 1058 482 1060 486 L1054 494 L1060 500 C1059 506 1063 511 1070 514' stroke='#f4dcb2' strokeWidth='3' fill='none' opacity='0.85' />
      <path d='M944 690 L948 662 L982 662 L986 690 Z' fill='#e9dcc4' />
      <path d='M982 668 C994 668 994 682 983 684' stroke='#e9dcc4' strokeWidth='4' fill='none' />
    </Frame>
  );
}

/* --------------------------------------------------------------------- */
/* Last Ferry to Vlieland (Joost Harmsen, 1997): the pier in fog. */

export function Harbour(props: SceneProps) {
  const id = useIds();
  const posts = Array.from({ length: 12 }, (_, i) => {
    const f = (i / 11) ** 1.7;
    return { x: 520 + (40 - 520) * f, y: 590 + (980 - 590) * f, h: 14 + 220 * f, w: 3 + 26 * f };
  });
  return (
    <Frame id={id} vignette={0.4} {...props}>
      <defs>
        <linearGradient id={id('fog')} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#76827d' />
          <stop offset='0.55' stopColor='#aab3ab' />
          <stop offset='1' stopColor='#5f6b66' />
        </linearGradient>
        <filter id={id('haze')}>
          <feGaussianBlur stdDeviation='5' />
        </filter>
        <filter id={id('haze2')}>
          <feGaussianBlur stdDeviation='18' />
        </filter>
      </defs>
      <rect width={W} height={H} fill={`url(#${id('fog')})`} />
      <rect y='590' width={W} height='410' fill='#4d5955' />
      <rect y='588' width={W} height='60' fill='#b8c0b7' opacity='0.45' filter={`url(#${id('haze2')})`} />
      {/* The ferry, half gone in the fog. */}
      <g filter={`url(#${id('haze')})`} opacity='0.72'>
        <path d='M820 590 L1240 590 L1210 618 L850 618 Z' fill='#35403d' />
        <rect x='900' y='540' width='240' height='50' fill='#3e4946' />
        <rect x='960' y='505' width='120' height='36' fill='#46514d' />
        <rect x='1040' y='470' width='18' height='38' fill='#46514d' />
        {[915, 945, 975, 1005, 1035, 1065, 1095].map((x) => (
          <rect key={x} x={x} y='556' width='16' height='10' fill='#f3c27a' />
        ))}
      </g>
      <Glow id={id('mast')} cx={1049} cy={470} r={70} color='#ffd79a' opacity={0.7} />
      <circle cx='1049' cy='470' r='4' fill='#fff2d6' />
      {/* Reflection of the cabin lights. */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={950 + i * 6} y={630 + i * 16} width={150 - i * 24} height='3' fill='#f3c27a' opacity={0.4 - i * 0.07} />
      ))}
      {/* The pier. */}
      <path d='M505 590 L540 590 L210 1000 L0 1000 L0 960 Z' fill='#2b3331' />
      {posts.map((p, i) => (
        <rect key={i} x={p.x - p.w / 2} y={p.y - p.h} width={p.w} height={p.h} fill='#1c2321' />
      ))}
      <Walker x={470} y={652} h={70} fill='#141a18' />
      <path d='M462 590 C470 572 492 566 504 580' stroke='#141a18' strokeWidth='3' fill='none' />
    </Frame>
  );
}

export const scenes: Record<SceneName, (props: SceneProps) => ReactNode> = {
  coast: CoastRoad,
  corridor: Corridor,
  tram: TramRain,
  field: NightField,
  kitchen: Kitchen,
  harbour: Harbour
};

/** A still at its native ratio, cropped from the open-matte frame. */
export function Still({
  scene,
  ratio,
  width,
  t,
  grain = true,
  duo,
  label,
  style
}: {
  scene: SceneName;
  ratio: number;
  width: number | string;
  t?: number;
  grain?: boolean;
  duo?: Duo;
  label?: string;
  style?: CSSProperties;
}) {
  const Scene = scenes[scene];
  return (
    <div
      style={{
        width,
        aspectRatio: `${ratio}`,
        overflow: 'hidden',
        background: '#111',
        ...style
      }}
    >
      <Scene t={t} grain={grain} duo={duo} label={label} />
    </div>
  );
}
