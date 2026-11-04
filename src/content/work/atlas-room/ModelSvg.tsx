import { useId, type ReactNode } from 'react';
import {
  buildFaces,
  drawOrder,
  floorShadows,
  furnitureShadows,
  lightPatches,
  orbitCamera,
  projectPolygon,
  projectSegment,
  rooms,
  sunAt,
  toCamera,
  walkCamera,
  wallTops,
  type Camera,
  type Face,
  type Season,
  type V2,
  type V3
} from './model';
import { C } from './ui';

export type View =
  | { kind: 'walk'; pos: V3; yaw: number; pitch: number; fov?: number }
  | {
      kind: 'orbit';
      target: V3;
      yaw: number;
      pitch: number;
      distance: number;
      fov?: number;
    };

export function cameraFor(view: View, width: number, height: number): Camera {
  return view.kind === 'walk'
    ? walkCamera(view.pos, view.yaw, view.pitch, width, height, view.fov ?? 78)
    : orbitCamera(view.target, view.yaw, view.pitch, view.distance, width, height, view.fov ?? 32);
}

export const svgPath = (pts: V2[]) =>
  pts.length
    ? `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L')}Z`
    : '';

const MATERIAL: Record<string, [string, string]> = {
  // [shaded, lit]
  timber: ['#B48A5E', '#DDBB93'],
  fabric: ['#8E9384', '#B5B9AA'],
  white: ['#D9D3C8', '#F4F1EB'],
  stone: ['#A9A49B', '#CFCAC1'],
  linen: ['#D8D2C6', '#F3EFE7'],
  sage: ['#7F8A7B', '#AEB6A6']
};

function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i]! - v) * t)).join(',')})`;
}

/** Fixed studio lighting: tops brightest, faces turned to the window next. */
function lightness(face: Face, walk: boolean) {
  const [nx, ny, nz] = face.normal;
  if (ny > 0.5) return 1;
  if (walk) {
    // Indoors the light comes from the façade (z = 0): faces looking at it
    // are lit, the window wall itself is seen against the light.
    if (face.kind === 'wall' && Math.abs(nz) > 0.5 && face.pts[0]![2] < 0.01) return 0.58;
    return 0.72 + 0.28 * Math.max(0, -nz) + 0.1 * Math.abs(nx);
  }
  return 0.62 + 0.3 * Math.max(0, -nz * 0.6 + nx * 0.8) + 0.08;
}

function faceFill(face: Face, walk: boolean) {
  const t = Math.min(1, lightness(face, walk));
  switch (face.kind) {
    case 'wall':
      return walk ? mix('#CFC7BA', '#F3F0EA', t) : mix('#CEC6B9', '#F4F1EB', t);
    case 'ceiling':
      return '#ECE8E1';
    case 'furniture':
    case 'furnitureTop': {
      const [lo, hi] = MATERIAL[face.material ?? 'timber']!;
      return mix(lo, hi, t);
    }
    default:
      return C.timber;
  }
}

function FaceLines({ cam, face, walk }: { cam: Camera; face: Face; walk: boolean }) {
  if (!face.lines?.length) return null;
  const glass = face.kind === 'glass';
  return (
    <g
      stroke={glass ? (walk ? 'rgba(52,48,42,0.6)' : 'rgba(29,27,24,0.4)') : 'rgba(29,27,24,0.28)'}
      strokeWidth={glass ? (walk ? 3 : 0.7) : walk ? 1.2 : 0.6}
    >
      {face.lines.map(([a, b], i) => {
        const seg = projectSegment(cam, a, b);
        if (!seg) return null;
        return <line key={i} x1={seg[0][0]} y1={seg[0][1]} x2={seg[1][0]} y2={seg[1][1]} />;
      })}
    </g>
  );
}

/**
 * Apartment 2.04 drawn in SVG from the same model the demo uses. `overlay`
 * receives the camera so screens can place pins and labels in space.
 */
export function ModelSvg({
  width,
  height,
  view,
  season = 'june',
  clock = 17.5,
  planks = true,
  labels = false,
  outside = true,
  overlay,
  background,
  plinth = false
}: {
  width: number;
  height: number;
  view: View;
  season?: Season;
  clock?: number;
  planks?: boolean;
  labels?: boolean;
  outside?: boolean;
  overlay?: (cam: Camera) => ReactNode;
  background?: string;
  /** Sit the 1:50 model on a white model base instead of open ground. */
  plinth?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const walk = view.kind === 'walk';
  const cam = cameraFor(view, width, height);
  const sun = sunAt(season, clock);
  const ordered = drawOrder(cam, buildFaces({ ceiling: walk }));

  const floorPoly = (poly: V2[]) =>
    projectPolygon(cam, poly.map(([x, z]) => [x, 0.002, z] as V3)).screen;

  const shadowPath = !walk && sun.up ? floorShadows(sun.toSun).map(floorPoly).map(svgPath).join('') : '';
  const lightPath = sun.up ? lightPatches(sun.toSun).map(floorPoly).map(svgPath).join('') : '';
  const blockPath = sun.up ? furnitureShadows(sun.toSun).map(floorPoly).map(svgPath).join('') : '';

  const boardLines: [V2, V2][] = [];
  if (planks) {
    for (const room of rooms) {
      const [x0, z0, x1, z1] = room.rect;
      const step = room.id === 'hall' ? 0.3 : 0.2;
      for (let x = x0 + step; x < x1 - 0.01; x += step) {
        const seg = projectSegment(cam, [x, 0.001, z0], [x, 0.001, z1]);
        if (seg) boardLines.push(seg);
      }
    }
  }

  const ground = !walk
    ? plinth
      ? projectPolygon(cam, [
          [-1.2, -0.01, -1.2],
          [13.2, -0.01, -1.2],
          [13.2, -0.01, 8.4],
          [-1.2, -0.01, 8.4]
        ]).screen
      : projectPolygon(cam, [
          [-14, -0.01, -12],
          [26, -0.01, -12],
          [26, -0.01, 20],
          [-14, -0.01, 20]
        ]).screen
    : [];
  // The model base: visible side faces of a 0.4 m thick slab.
  const base = plinth && !walk
    ? (
        [
          [[-1.2, -0.4, -1.2], [13.2, -0.4, -1.2], [13.2, 0, -1.2], [-1.2, 0, -1.2]],
          [[13.2, -0.4, -1.2], [13.2, -0.4, 8.4], [13.2, 0, 8.4], [13.2, 0, -1.2]],
          [[13.2, -0.4, 8.4], [-1.2, -0.4, 8.4], [-1.2, 0, 8.4], [13.2, 0, 8.4]],
          [[-1.2, -0.4, 8.4], [-1.2, -0.4, -1.2], [-1.2, 0, -1.2], [-1.2, 0, 8.4]]
        ] as V3[][]
      ).map((pts) => projectPolygon(cam, pts))
    : [];

  const horizon = toCamera(cam, [
    cam.pos[0] + cam.forward[0] * 400,
    cam.pos[1],
    cam.pos[2] + cam.forward[2] * 400
  ]);
  const horizonY = cam.cy - (horizon[1] * cam.focal) / horizon[2];
  const floorsDone = ordered.findIndex((f) => f.kind !== 'floor');

  const floorLayer = (
    <g>
      {ordered
        .filter((f) => f.kind === 'floor')
        .map((f, i) => {
          const fill = f.room === 'living' ? C.timber : f.room === 'hall' ? '#D6CCBE' : '#E4CDAE';
          return <path key={i} d={svgPath(projectPolygon(cam, f.pts).screen)} fill={fill} />;
        })}
      {boardLines.map(([a, b], i) => (
        <line
          key={i}
          x1={a[0]}
          y1={a[1]}
          x2={b[0]}
          y2={b[1]}
          stroke='rgba(120,84,48,0.17)'
          strokeWidth={walk ? 1 : 0.6}
        />
      ))}
      {shadowPath && <path d={shadowPath} fill='rgba(70,54,36,0.18)' />}
      {lightPath && (
        <g mask={blockPath ? `url(#${uid}-block)` : undefined}>
          <path
            d={lightPath}
            fill={walk ? 'rgba(255,244,214,0.95)' : 'rgba(255,248,232,0.5)'}
            filter={`url(#${uid}-soft)`}
          />
        </g>
      )}
    </g>
  );

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', background: background ?? (walk ? C.plaster : C.ground) }}
      aria-hidden
    >
      <defs>
        <filter id={`${uid}-drop`} x='-20%' y='-20%' width='140%' height='140%'>
          <feGaussianBlur stdDeviation='28' />
        </filter>
        <filter id={`${uid}-soft`} x='-20%' y='-20%' width='140%' height='140%'>
          <feGaussianBlur stdDeviation={walk ? 2.5 : 1} />
        </filter>
        <linearGradient id={`${uid}-sky`} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#C6D6DC' />
          <stop offset='1' stopColor='#EEF0EC' />
        </linearGradient>
        {blockPath && (
          <mask id={`${uid}-block`} maskUnits='userSpaceOnUse' x='0' y='0' width={width} height={height}>
            <rect x='0' y='0' width={width} height={height} fill='#fff' />
            <path d={blockPath} fill='#000' filter={`url(#${uid}-soft)`} />
          </mask>
        )}
      </defs>

      {base.length > 0 && (
        <g>
          <path d={svgPath(ground.map(([x, y]) => [x, y + 90] as V2))} fill='rgba(29,27,24,0.18)' filter={`url(#${uid}-drop)`} />
          {base.map((b, i) => (
            <path key={i} d={svgPath(b.screen)} fill={i % 2 ? '#DAD5CC' : '#E6E2DA'} stroke='rgba(29,27,24,0.25)' strokeWidth='0.8' />
          ))}
        </g>
      )}
      {ground.length > 0 && <path d={svgPath(ground)} fill={plinth ? '#F7F5F1' : C.ground} stroke={plinth ? 'rgba(29,27,24,0.25)' : 'none'} strokeWidth='0.8' />}
      {plinth && (
        <clipPath id={`${uid}-plinth`}>
          <path d={svgPath(ground)} />
        </clipPath>
      )}
      <g clipPath={plinth ? `url(#${uid}-plinth)` : undefined}>{floorLayer}</g>

      {ordered.slice(floorsDone).map((f, i) => {
        const pts = projectPolygon(cam, f.pts).screen;
        if (!pts.length) return null;
        if (f.kind === 'glass') {
          if (walk && outside) {
            const clip = `${uid}-g${i}`;
            return (
              <g key={i}>
                <clipPath id={clip}>
                  <path d={svgPath(pts)} />
                </clipPath>
                <g clipPath={`url(#${clip})`}>
                  <rect x='0' y='0' width={width} height={height} fill={`url(#${uid}-sky)`} />
                  <Skyline width={width} horizonY={horizonY} />
                </g>
                <path d={svgPath(pts)} fill='rgba(255,255,255,0.06)' stroke='rgba(29,27,24,0.4)' strokeWidth='3' />
                <FaceLines cam={cam} face={f} walk={walk} />
              </g>
            );
          }
          return (
            <g key={i}>
              <path d={svgPath(pts)} fill='rgba(198,216,222,0.6)' stroke='rgba(29,27,24,0.42)' strokeWidth='0.8' />
              <FaceLines cam={cam} face={f} walk={walk} />
            </g>
          );
        }
        return (
          <g key={i}>
            <path
              d={svgPath(pts)}
              fill={faceFill(f, walk)}
              stroke={walk ? 'rgba(29,27,24,0.12)' : 'rgba(29,27,24,0.4)'}
              strokeWidth={walk ? 1 : 0.8}
              strokeLinejoin='round'
            />
            <FaceLines cam={cam} face={f} walk={walk} />
          </g>
        );
      })}

      {!walk &&
        wallTops().map(([a, b], i) => {
          const seg = projectSegment(cam, a, b);
          if (!seg) return null;
          return (
            <line
              key={i}
              x1={seg[0][0]}
              y1={seg[0][1]}
              x2={seg[1][0]}
              y2={seg[1][1]}
              stroke={C.ink}
              strokeWidth='2.4'
              strokeLinecap='round'
            />
          );
        })}

      {labels &&
        rooms.map((room) => {
          const [x0, z0, x1, z1] = room.rect;
          const p = at(cam, [(x0 + x1) / 2, 3.1, (z0 + z1) / 2]);
          if (!p) return null;
          return (
            <g key={room.id}>
              <text
                x={p[0]}
                y={p[1]}
                textAnchor='middle'
                style={{
                  fontFamily: 'var(--fg-font-pixel)',
                  fontSize: 11,
                  letterSpacing: '0.04em',
                  fill: C.ink,
                  textTransform: 'uppercase'
                }}
              >
                {room.name}
              </text>
              <text
                x={p[0]}
                y={p[1] + 15}
                textAnchor='middle'
                style={{ fontFamily: 'var(--fg-font-pixel)', fontSize: 11, fill: C.muted }}
              >
                {room.area.toFixed(1)} m²
              </text>
            </g>
          );
        })}

      {overlay?.(cam)}
    </svg>
  );
}

/** The block across the canal, seen through the windows. */
function Skyline({ width, horizonY }: { width: number; horizonY: number }) {
  const blocks = [
    { x: -40, w: 380, h: 150 },
    { x: 330, w: 260, h: 210 },
    { x: 600, w: 420, h: 128 },
    { x: 1030, w: 300, h: 186 },
    { x: 1340, w: 360, h: 140 }
  ];
  const scale = width / 1440;
  return (
    <g>
      {blocks.map((b, i) => (
        <g key={i}>
          <rect
            x={b.x * scale}
            y={horizonY - b.h * scale}
            width={b.w * scale}
            height={b.h * scale + 400}
            fill={i % 2 ? '#BAB5AB' : '#C7C2B7'}
          />
          {Array.from({ length: Math.floor(b.w / 34) }).map((_, c) =>
            Array.from({ length: Math.floor(b.h / 30) }).map((__, r) => (
              <rect
                key={`${c}-${r}`}
                x={(b.x + 12 + c * 34) * scale}
                y={horizonY - (b.h - 14 - r * 30) * scale}
                width={16 * scale}
                height={12 * scale}
                fill={(c * 7 + r * 3 + i) % 5 === 0 ? '#ECE2CB' : '#AAA499'}
              />
            ))
          )}
        </g>
      ))}
      <rect x='0' y={horizonY + 6 * scale} width={width} height={400} fill='#A3B5B2' />
      <rect x='0' y={horizonY + 6 * scale} width={width} height={3 * scale} fill='#CBD6D3' />
      {[120, 520, 980, 1300].map((x, i) => (
        <g key={i}>
          <rect x={(x - 3) * scale} y={horizonY - 60 * scale} width={6 * scale} height={70 * scale} fill='#6F6A5F' />
          <ellipse cx={x * scale} cy={horizonY - 82 * scale} rx={46 * scale} ry={40 * scale} fill='#7F8B6D' />
        </g>
      ))}
    </g>
  );
}

/** Screen position of a 3D point, or null if it's behind the camera. */
export function at(cam: Camera, p: V3): V2 | null {
  const c = toCamera(cam, p);
  if (c[2] < 0.05) return null;
  return [cam.cx + (c[0] * cam.focal) / c[2], cam.cy - (c[1] * cam.focal) / c[2]];
}
