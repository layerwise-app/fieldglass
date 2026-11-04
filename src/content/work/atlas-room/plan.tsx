import { furniture, rooms, walls, type V3 } from './model';
import { C, pixel } from './ui';

/** A top-down architectural plan of Apartment 2.04, with numbered pins. */
export function PlanSvg({
  width,
  pins = [],
  labels = true,
  active
}: {
  width: number;
  pins?: { n: number; point: V3; tone?: 'open' | 'done' }[];
  labels?: boolean;
  active?: number;
}) {
  const pad = 0.6;
  const s = width / (12 + pad * 2);
  const height = (7.2 + pad * 2) * s;
  // North (the corridor side) at the top: z grows upwards on paper.
  const X = (x: number) => (x + pad) * s;
  const Y = (z: number) => (7.2 + pad - z) * s;
  const thick = 0.18 * s;

  const wallSegments: { x1: number; y1: number; x2: number; y2: number; ext: boolean }[] = [];
  const windows: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const doors: { hx: number; hy: number; r: number; a0: number; a1: number }[] = [];
  for (const wall of walls) {
    const [ax, az] = wall.a;
    const [bx, bz] = wall.b;
    const len = Math.hypot(bx - ax, bz - az);
    const ux = (bx - ax) / len;
    const uz = (bz - az) / len;
    const at = (d: number) => [ax + ux * d, az + uz * d] as const;
    let cursor = 0;
    for (const o of [...wall.openings].sort((p, q) => p.from - q.from)) {
      const [x1, z1] = at(cursor);
      const [x2, z2] = at(o.from);
      wallSegments.push({ x1: X(x1), y1: Y(z1), x2: X(x2), y2: Y(z2), ext: !!wall.exterior });
      const [ox1, oz1] = at(o.from);
      const [ox2, oz2] = at(o.to);
      if (o.kind === 'window') windows.push({ x1: X(ox1), y1: Y(oz1), x2: X(ox2), y2: Y(oz2) });
      if (o.kind === 'door') {
        const angle = Math.atan2(-(oz2 - oz1), ox2 - ox1);
        doors.push({ hx: X(ox1), hy: Y(oz1), r: (o.to - o.from) * s, a0: angle, a1: angle + Math.PI / 2 });
      }
      cursor = o.to;
    }
    const [x1, z1] = at(cursor);
    wallSegments.push({ x1: X(x1), y1: Y(z1), x2: X(bx), y2: Y(bz), ext: !!wall.exterior });
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }} aria-hidden>
      {rooms.map((r) => (
        <rect
          key={r.id}
          x={X(r.rect[0])}
          y={Y(r.rect[3])}
          width={(r.rect[2] - r.rect[0]) * s}
          height={(r.rect[3] - r.rect[1]) * s}
          fill={r.id === 'hall' ? '#EFEAE2' : '#F6F1E8'}
        />
      ))}
      {furniture
        .filter((f) => f.name !== 'Leg' && f.name !== 'Pendant cord' && f.min[1] < 1.4)
        .map((f, i) => (
          <rect
            key={i}
            x={X(f.min[0])}
            y={Y(f.max[2])}
            width={(f.max[0] - f.min[0]) * s}
            height={(f.max[2] - f.min[2]) * s}
            fill='none'
            stroke='rgba(29,27,24,0.38)'
            strokeWidth='1'
            rx='1.5'
          />
        ))}
      {doors.map((d, i) => (
        <path
          key={i}
          d={`M${d.hx} ${d.hy} L${d.hx + Math.cos(d.a0) * d.r} ${d.hy - Math.sin(d.a0) * d.r} A ${d.r} ${d.r} 0 0 0 ${d.hx + Math.cos(d.a1) * d.r} ${d.hy - Math.sin(d.a1) * d.r} Z`}
          fill='rgba(29,27,24,0.04)'
          stroke='rgba(29,27,24,0.4)'
          strokeWidth='0.8'
          transform={`rotate(180 ${d.hx} ${d.hy})`}
        />
      ))}
      {wallSegments.map((w, i) => (
        <line
          key={i}
          x1={w.x1}
          y1={w.y1}
          x2={w.x2}
          y2={w.y2}
          stroke={C.ink}
          strokeWidth={w.ext ? thick * 1.4 : thick * 0.8}
          strokeLinecap='square'
        />
      ))}
      {windows.map((w, i) => (
        <g key={i}>
          <line x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke='#fff' strokeWidth={thick * 1.4} />
          <line x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2} stroke={C.ink} strokeWidth='1' />
        </g>
      ))}
      {labels &&
        rooms.map((r) => (
          <g key={r.id}>
            <text
              x={X((r.rect[0] + r.rect[2]) / 2)}
              y={Y((r.rect[1] + r.rect[3]) / 2) - 2}
              textAnchor='middle'
              style={{ fontFamily: pixel, fontSize: 11, letterSpacing: '0.04em', fill: C.inkSoft, textTransform: 'uppercase' }}
            >
              {r.id === 'living' ? 'Living' : r.name}
            </text>
            <text
              x={X((r.rect[0] + r.rect[2]) / 2)}
              y={Y((r.rect[1] + r.rect[3]) / 2) + 13}
              textAnchor='middle'
              style={{ fontFamily: pixel, fontSize: 11, fill: C.muted }}
            >
              {r.area.toFixed(1)} m²
            </text>
          </g>
        ))}
      {pins.map((p) => {
        const cx = X(p.point[0]);
        const cy = Y(p.point[2]);
        const done = p.tone === 'done';
        return (
          <g key={p.n}>
            {active === p.n && <circle cx={cx} cy={cy} r='20' fill='rgba(13,106,98,0.16)' />}
            <circle cx={cx} cy={cy} r='11' fill={done ? '#fff' : C.teal} stroke={done ? C.teal : '#fff'} strokeWidth='1.6' />
            <text
              x={cx}
              y={cy + 4}
              textAnchor='middle'
              style={{ fontFamily: pixel, fontSize: 11, fill: done ? C.teal : '#fff' }}
            >
              {p.n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
