import { mulberry32, palette } from '../orbit';
import { OrbitCanvas } from '../OrbitCanvas';
import { Pixel } from './shared';

const W = 1440;
const H = 900;
const WALL = { x: 220, y: 92, w: 1000, h: 375 };

type Person = {
  x: number;
  y: number;
  s: number;
  fill: string;
  rim: string;
  arm: number; // 0 none, 1 right arm up, 2 phone up
};

function crowd(): Person[] {
  const rand = mulberry32(2024);
  // Back to front: smaller, hazier and more rim-lit near the stage.
  const rows = 11;
  const people: Person[] = [];
  for (let row = 0; row < rows; row++) {
    const t = row / (rows - 1);
    const s = 0.42 + t * t * 1.25;
    const y = 628 + t * 262 + (t * t) * 10;
    const shade = Math.round(30 - t * 27);
    const fill = `rgb(${shade + 2},${shade - 2},${shade + 4})`;
    const rimAlpha = 0.42 - t * 0.3;
    const rim = `rgba(255,${Math.round(60 + t * 90)},${Math.round(90 + t * 70)},${rimAlpha.toFixed(2)})`;
    const step = 40 * s;
    for (let x = -40 + rand() * step; x < W + 50; x += step * (0.55 + rand() * 0.9)) {
      const r = rand();
      people.push({
        x,
        y: y + (rand() - 0.5) * 22 * s,
        s: s * (0.82 + rand() * 0.34),
        fill,
        rim,
        arm: r > 0.975 ? 2 : r > 0.93 ? 1 : 0
      });
    }
  }
  return people.sort((a, b) => a.y - b.y);
}

function body(p: Person) {
  const { x, y, s } = p;
  const shoulders = `M${x - 30 * s} ${y + 90 * s} L${x - 30 * s} ${y + 10 * s} Q${x - 30 * s} ${y - 6 * s} ${x - 15 * s} ${y - 9 * s} L${x + 15 * s} ${y - 9 * s} Q${x + 30 * s} ${y - 6 * s} ${x + 30 * s} ${y + 10 * s} L${x + 30 * s} ${y + 90 * s} Z`;
  const neck = `M${x - 6 * s} ${y - 8 * s} L${x - 6 * s} ${y - 18 * s} L${x + 6 * s} ${y - 18 * s} L${x + 6 * s} ${y - 8 * s} Z`;
  const arm =
    p.arm > 0
      ? `M${x + 18 * s} ${y - 2 * s} L${x + 30 * s} ${y - 62 * s} L${x + 38 * s} ${y - 60 * s} L${x + 29 * s} ${y + 2 * s} Z`
      : '';
  return { shoulders, neck, arm };
}

export function Cover() {
  const people = crowd();
  const lamps = [300, 470, 640, 800, 970, 1140];
  return (
    <div
      style={{
        width: W,
        height: H,
        position: 'relative',
        overflow: 'hidden',
        background: '#050507'
      }}
    >
      {/* Spill light from the wall into the room. */}
      <svg
        width={W}
        height={H}
        style={{ position: 'absolute', inset: 0 }}
        aria-hidden
      >
        <defs>
          <radialGradient id='spill' cx='0.5' cy='0.34' r='0.62'>
            <stop offset='0' stopColor='#3a0d18' stopOpacity='1' />
            <stop offset='0.55' stopColor='#14070b' stopOpacity='1' />
            <stop offset='1' stopColor='#050507' stopOpacity='1' />
          </radialGradient>
          <linearGradient id='beamRed' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0' stopColor='#ff2d55' stopOpacity='0.5' />
            <stop offset='0.45' stopColor='#ff2d55' stopOpacity='0.12' />
            <stop offset='1' stopColor='#ff2d55' stopOpacity='0' />
          </linearGradient>
          <linearGradient id='beamBone' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0' stopColor='#ede6da' stopOpacity='0.32' />
            <stop offset='0.45' stopColor='#ede6da' stopOpacity='0.06' />
            <stop offset='1' stopColor='#ede6da' stopOpacity='0' />
          </linearGradient>
          <filter id='haze' x='-20%' y='-5%' width='140%' height='110%'>
            <feGaussianBlur stdDeviation='9' />
          </filter>
          <linearGradient id='crowdHaze' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0' stopColor='#3a0d18' stopOpacity='0.75' />
            <stop offset='0.35' stopColor='#3a0d18' stopOpacity='0.25' />
            <stop offset='1' stopColor='#3a0d18' stopOpacity='0' />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill='url(#spill)' />
        {/* Side walls of the hall, a little lighter where they meet the stage. */}
        <path d={`M0 0 L150 70 L150 600 L0 660 Z`} fill='#0b090d' />
        <path d={`M${W} 0 L${W - 150} 70 L${W - 150} 600 L${W} 660 Z`} fill='#0b090d' />
      </svg>

      {/* The LED wall. */}
      <div
        style={{
          position: 'absolute',
          left: WALL.x,
          top: WALL.y,
          width: WALL.w,
          height: WALL.h,
          boxShadow: '0 0 120px 20px rgba(255,45,85,0.16)'
        }}
      >
        <OrbitCanvas
          width={WALL.w}
          height={WALL.h}
          scene='eclipse'
          time={11.4}
          gravity={0.22}
          size={840}
          stems={{ kick: 0.92, bass: 0.78, pads: 0.7, vocal: 0.6 }}
        />
        {/* LED pitch and cabinet seams. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0,0,0,.38) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.38) 1px, transparent 1px)',
            backgroundSize: '3px 3px'
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0,0,0,.55) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.55) 1px, transparent 1px)',
            backgroundSize: '125px 125px'
          }}
        />
      </div>

      {/* Reflection of the wall on the gloss stage floor. */}
      <div
        style={{
          position: 'absolute',
          left: WALL.x,
          top: WALL.y + WALL.h + 4,
          width: WALL.w,
          height: 118,
          overflow: 'hidden',
          opacity: 0.22,
          filter: 'blur(5px)',
          maskImage: 'linear-gradient(#000, transparent)'
        }}
      >
        <div style={{ transform: 'scaleY(-1)', transformOrigin: '50% 0', marginTop: WALL.h }}>
          <OrbitCanvas
            width={WALL.w}
            height={WALL.h}
            scene='eclipse'
            time={11.4}
            gravity={0.22}
            stems={{ kick: 0.92, bass: 0.78, pads: 0.7, vocal: 0.6 }}
            size={840}
            density={0.4}
          />
        </div>
      </div>

      <svg
        width={W}
        height={H}
        style={{ position: 'absolute', inset: 0, mixBlendMode: 'screen' }}
        aria-hidden
      >
        <g filter='url(#haze)'>
          {lamps.map((lx, i) => {
            const spread = 70 + (i % 3) * 22;
            const lean = (i - 2.5) * 120;
            return (
              <path
                key={lx}
                d={`M${lx - 4} 66 L${lx + 4} 66 L${lx + lean + spread} ${H} L${lx + lean - spread} ${H} Z`}
                fill={i % 2 ? 'url(#beamBone)' : 'url(#beamRed)'}
                opacity={0.7}
              />
            );
          })}
        </g>
      </svg>

      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        {/* Truss and lamp heads. */}
        <rect x={160} y={52} width={1120} height={8} fill='#1d1a20' />
        <rect x={160} y={52} width={1120} height={1} fill='#3a333d' />
        {lamps.map((lx, i) => (
          <g key={lx}>
            <rect x={lx - 9} y={58} width={18} height={10} rx={2} fill='#232026' />
            <rect
              x={lx - 6}
              y={66}
              width={12}
              height={2}
              fill={i % 2 ? '#ede6da' : '#ff2d55'}
            />
          </g>
        ))}

        {/* Stage deck and front edge. */}
        <path d={`M120 584 L1320 584 L1340 600 L100 600 Z`} fill='#0d0b0f' />
        <rect x={100} y={600} width={1240} height={3} fill='#2a1218' />

        {/* Mira at the desk, lit from the wall behind. */}
        <g>
          <ellipse cx={720} cy={496} rx={15} ry={17} fill='#ff2d55' opacity={0.5} />
          <ellipse cx={720} cy={497} rx={14} ry={16} fill='#060507' />
          <path
            d='M686 584 L688 528 Q690 514 706 512 L734 512 Q750 514 752 528 L754 584 Z'
            fill='#ff2d55'
            opacity={0.45}
          />
          <path
            d='M687 584 L689 529 Q691 516 706 514 L734 514 Q749 516 751 529 L753 584 Z'
            fill='#060507'
          />
          <rect x={640} y={540} width={160} height={6} fill='#1a1719' />
          <path d='M650 546 L790 546 L780 584 L660 584 Z' fill='#0a090b' />
          <rect x={696} y={530} width={48} height={10} fill='#ede6da' opacity={0.7} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={664 + i * 7}
              y={542}
              width={3}
              height={2}
              fill={i === 2 ? '#ff2d55' : '#ede6da'}
              opacity={0.8}
            />
          ))}
          <rect x={758} y={542} width={20} height={2} fill='#ff2d55' opacity={0.7} />
        </g>
        {/* Floor wedges and side racks. */}
        {[430, 1010].map((x) => (
          <path key={x} d={`M${x} 584 L${x + 8} 566 L${x + 62} 566 L${x + 70} 584 Z`} fill='#141116' />
        ))}
        {[176, 1212].map((x) => (
          <g key={x}>
            <rect x={x} y={500} width={52} height={84} fill='#0f0d11' />
            <rect x={x + 6} y={510} width={40} height={2} fill='#3a1a22' />
            <rect x={x + 6} y={522} width={40} height={2} fill='#3a1a22' />
            <rect x={x + 40} y={534} width={4} height={2} fill='#ff2d55' opacity={0.8} />
          </g>
        ))}

        {/* The crowd, back rows first, rim-lit by the wall. */}
        <rect x={0} y={600} width={W} height={300} fill='#050507' opacity={0} />
        {people.map((p, i) => {
          const b = body(p);
          return (
            <g key={i}>
              <g transform={`translate(0 ${-1.8 * p.s})`} fill={p.rim}>
                <path d={b.shoulders} />
                <circle cx={p.x} cy={p.y - 30 * p.s} r={13 * p.s} />
                {b.arm && <path d={b.arm} />}
              </g>
              <g fill={p.fill}>
                <path d={b.shoulders} />
                <path d={b.neck} />
                <circle cx={p.x} cy={p.y - 30 * p.s} r={13 * p.s} />
                {b.arm && <path d={b.arm} />}
              </g>
              {p.arm === 2 && (
                <rect
                  x={p.x + 28 * p.s}
                  y={p.y - 80 * p.s}
                  width={9 * p.s}
                  height={15 * p.s}
                  rx={1.5 * p.s}
                  fill='#e8d9d4'
                  opacity={0.55}
                />
              )}
            </g>
          );
        })}
        <rect x={0} y={612} width={W} height={150} fill='url(#crowdHaze)' style={{ mixBlendMode: 'screen' }} />
      </svg>

      <div
        style={{
          position: 'absolute',
          left: 40,
          right: 40,
          bottom: 28,
          display: 'flex',
          justifyContent: 'space-between',
          color: palette.bone
        }}
      >
        <Pixel>Low Orbit tour · Night 7 of 34 · Hala Stocznia, Gdańsk</Pixel>
        <Pixel color={palette.ash}>Scene 03 Eclipse · LED 12.0 × 4.5 m · 3.9 mm</Pixel>
      </div>
    </div>
  );
}
