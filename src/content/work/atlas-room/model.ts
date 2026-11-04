/**
 * Apartment 2.04, Kade Noord: the sample model shown in Atlas Room's screens
 * and demo. Metres. x runs along the south façade, y is up, z runs from the
 * façade (z = 0) to the corridor side (z = 7.2).
 */

export type V3 = [number, number, number];
export type V2 = [number, number];

export const PLAN = { width: 12, depth: 7.2, height: 2.7 };
export const FACADE_AZIMUTH = 214; // degrees from north: the façade faces SW
export const LATITUDE = 51.92; // Rotterdam

export type FaceKind =
  | 'ground'
  | 'floor'
  | 'ceiling'
  | 'wall'
  | 'glass'
  | 'furniture'
  | 'furnitureTop';

export type Face = {
  pts: V3[];
  kind: FaceKind;
  /** Outward normal, used for flat shading. */
  normal: V3;
  room?: string;
  material?: Material;
  /** For wall pieces: the index of the wall in `walls`. */
  wall?: number;
  /** Detail lines drawn with the face: window frames, cupboard doors. */
  lines?: [V3, V3][];
};

export type Room = {
  id: string;
  name: string;
  /** Floor rectangle: x0, z0, x1, z1. */
  rect: [number, number, number, number];
  area: number;
};

export const rooms: Room[] = [
  { id: 'living', name: 'Living & kitchen', rect: [0, 0, 6.6, 7.2], area: 47.5 },
  { id: 'bed1', name: 'Bedroom 1', rect: [6.6, 0, 12, 3.6], area: 19.4 },
  { id: 'hall', name: 'Hall', rect: [6.6, 3.6, 8.4, 7.2], area: 6.5 },
  { id: 'bed2', name: 'Bedroom 2', rect: [8.4, 3.6, 12, 7.2], area: 13 }
];

type Opening = {
  /** Distance along the wall from `a`. */
  from: number;
  to: number;
  sill: number;
  head: number;
  kind: 'window' | 'door' | 'opening';
};

type Wall = { a: V2; b: V2; openings: Opening[]; exterior?: boolean };

const H = PLAN.height;

export const walls: Wall[] = [
  // South façade with the big living-room window and the bedroom window.
  {
    a: [0, 0],
    b: [12, 0],
    exterior: true,
    openings: [
      { from: 1.2, to: 5.6, sill: 0.45, head: 2.45, kind: 'window' },
      { from: 8.4, to: 11, sill: 0.85, head: 2.45, kind: 'window' }
    ]
  },
  // East wall with the window of bedroom 2.
  {
    a: [12, 0],
    b: [12, 7.2],
    exterior: true,
    openings: [{ from: 4.4, to: 6.4, sill: 0.85, head: 2.45, kind: 'window' }]
  },
  // North wall, corridor side, with the front door in the hall.
  {
    a: [12, 7.2],
    b: [0, 7.2],
    exterior: true,
    openings: [{ from: 4.0, to: 5.0, sill: 0, head: 2.1, kind: 'door' }]
  },
  // West party wall.
  { a: [0, 7.2], b: [0, 0], exterior: true, openings: [] },
  // Living | bedroom 1.
  { a: [6.6, 0], b: [6.6, 3.6], openings: [] },
  // Living | hall, with a wide opening.
  {
    a: [6.6, 3.6],
    b: [6.6, 7.2],
    openings: [{ from: 0.2, to: 3.0, sill: 0, head: 2.3, kind: 'opening' }]
  },
  // Bedroom 1 | hall and bedroom 2.
  {
    a: [6.6, 3.6],
    b: [12, 3.6],
    openings: [{ from: 0.45, to: 1.35, sill: 0, head: 2.1, kind: 'door' }]
  },
  // Hall | bedroom 2.
  {
    a: [8.4, 3.6],
    b: [8.4, 7.2],
    openings: [{ from: 0.7, to: 1.6, sill: 0, head: 2.1, kind: 'door' }]
  }
];

export type Material = 'timber' | 'fabric' | 'white' | 'stone' | 'linen' | 'sage';

export type Box = {
  id: string;
  name: string;
  min: V3;
  max: V3;
  room: string;
  material: Material;
  /** The top is covered by another part (a worktop on cupboards). */
  hideTop?: boolean;
};

const part = (
  id: string,
  name: string,
  room: string,
  material: Material,
  min: V3,
  max: V3,
  hideTop = false
): Box => ({ id, name, room, material, min, max, hideTop });

function legs(id: string, room: string, x0: number, z0: number, x1: number, z1: number, h: number): Box[] {
  const t = 0.05;
  return [
    part(id, 'Leg', room, 'timber', [x0, 0, z0], [x0 + t, h, z0 + t]),
    part(id, 'Leg', room, 'timber', [x1 - t, 0, z0], [x1, h, z0 + t]),
    part(id, 'Leg', room, 'timber', [x0, 0, z1 - t], [x0 + t, h, z1]),
    part(id, 'Leg', room, 'timber', [x1 - t, 0, z1 - t], [x1, h, z1])
  ];
}

/** Furniture as simple parts, so it reads as furniture rather than boxes. */
export const furniture: Box[] = [
  part('seat', 'Window seat', 'living', 'timber', [1.2, 0, 0], [5.6, 0.36, 0.52], true),
  part('seat', 'Window seat cushion', 'living', 'linen', [1.26, 0.36, 0.04], [5.54, 0.46, 0.5]),
  part('counter', 'Kitchen cupboards', 'living', 'sage', [0.4, 0.1, 6.62], [4.2, 0.86, 7.2], true),
  part('counter', 'Plinth', 'living', 'stone', [0.4, 0, 6.68], [4.2, 0.1, 7.2], true),
  part('counter', 'Worktop', 'living', 'stone', [0.4, 0.86, 6.56], [4.2, 0.9, 7.2]),
  part('counter', 'Wall cupboards', 'living', 'sage', [0.4, 1.5, 6.86], [4.2, 2.3, 7.2]),
  part('island', 'Kitchen island', 'living', 'timber', [1.72, 0, 4.7], [3.68, 0.88, 5.4], true),
  part('island', 'Island top', 'living', 'stone', [1.6, 0.88, 4.56], [3.8, 0.92, 5.56]),
  part('sofa', 'Sofa', 'living', 'fabric', [0.5, 0.1, 1.6], [2.9, 0.42, 2.5]),
  part('sofa', 'Sofa back', 'living', 'fabric', [0.5, 0.42, 2.28], [2.9, 0.8, 2.5]),
  part('sofa', 'Sofa arm', 'living', 'fabric', [0.5, 0.42, 1.6], [0.68, 0.62, 2.28]),
  part('sofa', 'Sofa arm', 'living', 'fabric', [2.72, 0.42, 1.6], [2.9, 0.62, 2.28]),
  part('table', 'Dining table', 'living', 'timber', [4.2, 0.7, 2.2], [5.8, 0.75, 3.2]),
  ...legs('table', 'living', 4.28, 2.28, 5.72, 3.12, 0.7),
  part('bed', 'Bed', 'bed1', 'timber', [9.8, 0, 0.9], [11.76, 0.3, 2.5]),
  part('bed', 'Mattress', 'bed1', 'linen', [9.86, 0.3, 0.96], [11.7, 0.52, 2.44]),
  part('bed', 'Headboard', 'bed1', 'timber', [11.7, 0, 0.9], [11.8, 1.0, 2.5]),
  part('desk', 'Desk', 'bed2', 'timber', [11.2, 0.72, 4.6], [11.85, 0.76, 6.2]),
  ...legs('desk', 'bed2', 11.24, 4.64, 11.81, 6.16, 0.72),
  part('wardrobe', 'Wardrobe', 'bed2', 'white', [8.5, 0, 6.6], [10.3, 2.3, 7.18]),
  part('pendant', 'Pendant cord', 'living', 'stone', [4.996, 1.62, 2.696], [5.004, 2.7, 2.704]),
  part('pendant', 'Pendant', 'living', 'white', [4.76, 1.585, 2.46], [5.24, 1.62, 2.94])
];

/** Places where a note can be pinned, with the point the pin sits on. */
export const surfaces = [
  { id: 'seat', name: 'Window seat', point: [3.4, 0.46, 0.27] as V3 },
  { id: 'window', name: 'Living-room window', point: [4.6, 1.7, 0] as V3 },
  { id: 'island', name: 'Kitchen island', point: [2.7, 0.92, 5.05] as V3 },
  { id: 'ceiling', name: 'Living-room ceiling', point: [3.6, 2.7, 3.4] as V3 },
  { id: 'door', name: 'Front door', point: [7.5, 1.05, 7.2] as V3 },
  { id: 'bed1', name: 'Bedroom 1 window', point: [9.7, 1.6, 0] as V3 }
] as const;

export type SurfaceId = (typeof surfaces)[number]['id'];

// ---------------------------------------------------------------- geometry

function wallPieces(wall: Wall) {
  const [ax, az] = wall.a;
  const [bx, bz] = wall.b;
  const len = Math.hypot(bx - ax, bz - az);
  const ux = (bx - ax) / len;
  const uz = (bz - az) / len;
  const at = (d: number, y: number): V3 => [ax + ux * d, y, az + uz * d];
  // Normal points to the left of a → b. Exterior walls are drawn so that it
  // points into the apartment; it's only used for shading.
  const normal: V3 = [-uz, 0, ux];
  const quad = (d0: number, d1: number, y0: number, y1: number): V3[] => [
    at(d0, y0),
    at(d1, y0),
    at(d1, y1),
    at(d0, y1)
  ];

  const solid: V3[][] = [];
  const glass: V3[][] = [];
  const glassLines: [V3, V3][][] = [];
  const sorted = [...wall.openings].sort((p, q) => p.from - q.from);
  let cursor = 0;
  for (const o of sorted) {
    if (o.from > cursor) solid.push(quad(cursor, o.from, 0, H));
    if (o.head < H) solid.push(quad(o.from, o.to, o.head, H));
    if (o.sill > 0) solid.push(quad(o.from, o.to, 0, o.sill));
    if (o.kind === 'window') {
      glass.push(quad(o.from, o.to, o.sill, o.head));
      const width = o.to - o.from;
      const panes = Math.max(1, Math.round(width / 1.5));
      const lines: [V3, V3][] = [];
      for (let i = 1; i < panes; i++) {
        const d = o.from + (width * i) / panes;
        lines.push([at(d, o.sill), at(d, o.head)]);
      }
      lines.push([at(o.from, o.head - 0.42), at(o.to, o.head - 0.42)]);
      glassLines.push(lines);
    }
    cursor = o.to;
  }
  if (cursor < len) solid.push(quad(cursor, len, 0, H));
  return { solid, glass, glassLines, normal, at, len };
}

export function boxFaces(box: Box): Face[] {
  const [x0, y0, z0] = box.min;
  const [x1, y1, z1] = box.max;
  const faces: Face[] = [
    { pts: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], kind: 'furnitureTop', normal: [0, 1, 0] },
    { pts: [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], kind: 'furniture', normal: [0, 0, -1] },
    { pts: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], kind: 'furniture', normal: [0, 0, 1] },
    { pts: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], kind: 'furniture', normal: [-1, 0, 0] },
    { pts: [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], kind: 'furniture', normal: [1, 0, 0] }
  ];
  if (box.material === 'sage') {
    const lines: [V3, V3][] = [];
    const doors = Math.round((x1 - x0) / 0.6);
    for (let i = 1; i < doors; i++) {
      const x = x0 + ((x1 - x0) * i) / doors;
      lines.push([[x, y0 + 0.02, z0 - 0.001], [x, y1 - 0.02, z0 - 0.001]]);
    }
    faces[1] = { ...faces[1]!, lines };
  }
  return faces
    .filter((f) => !(box.hideTop && f.kind === 'furnitureTop'))
    .map((f) => ({ ...f, room: box.room, material: box.material }));
}

/** Every face of the apartment. `ceiling` adds the ceilings for the 1:1 view. */
export function buildFaces({ ceiling = false } = {}): Face[] {
  const faces: Face[] = [];
  for (const room of rooms) {
    const [x0, z0, x1, z1] = room.rect;
    faces.push({
      pts: [[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]],
      kind: 'floor',
      normal: [0, 1, 0],
      room: room.id
    });
    if (ceiling) {
      faces.push({
        pts: [[x0, H, z0], [x1, H, z0], [x1, H, z1], [x0, H, z1]],
        kind: 'ceiling',
        normal: [0, -1, 0],
        room: room.id
      });
    }
  }
  walls.forEach((wall, index) => {
    const { solid, glass, glassLines, normal } = wallPieces(wall);
    for (const pts of solid) faces.push({ pts, kind: 'wall', normal, wall: index });
    glass.forEach((pts, i) =>
      faces.push({ pts, kind: 'glass', normal, wall: index, lines: glassLines[i] })
    );
  });
  for (const box of furniture) faces.push(...boxFaces(box));
  return faces;
}

/** The top edges of every wall, for the heavy cut line in the 1:50 view. */
export function wallTops(): [V3, V3][] {
  const lines: [V3, V3][] = [];
  for (const wall of walls) {
    lines.push([
      [wall.a[0], H, wall.a[1]],
      [wall.b[0], H, wall.b[1]]
    ]);
  }
  return lines;
}

/** Vertical solid wall pieces with their bottom and top heights, for shadows. */
export function shadowCasters(): { a: V3; b: V3; y0: number; y1: number }[] {
  const casters: { a: V3; b: V3; y0: number; y1: number }[] = [];
  for (const wall of walls) {
    const { solid } = wallPieces(wall);
    for (const q of solid) {
      casters.push({ a: q[0], b: q[1], y0: q[0][1], y1: q[3][1] });
    }
  }
  return casters;
}

export function windowsOf(roomId?: string): { pts: V3[]; room: string }[] {
  const out: { pts: V3[]; room: string }[] = [];
  for (const wall of walls) {
    if (!wall.exterior) continue;
    const { glass } = wallPieces(wall);
    for (const pts of glass) {
      const mid: V3 = [
        (pts[0][0] + pts[1][0]) / 2,
        0,
        (pts[0][2] + pts[1][2]) / 2
      ];
      const room = rooms.find((r) => {
        const [x0, z0, x1, z1] = r.rect;
        return mid[0] >= x0 - 0.01 && mid[0] <= x1 + 0.01 && mid[2] >= z0 - 0.01 && mid[2] <= z1 + 0.01;
      });
      if (room && (!roomId || room.id === roomId)) out.push({ pts, room: room.id });
    }
  }
  return out;
}

export function roomAt(x: number, z: number): Room | undefined {
  return rooms.find((r) => x > r.rect[0] && x < r.rect[2] && z > r.rect[1] && z < r.rect[3]);
}

/** The rooms on each side of a wall: [left of a→b (normal side), right]. */
function wallSides(wall: Wall): [string | null, string | null] {
  const [ax, az] = wall.a;
  const [bx, bz] = wall.b;
  const len = Math.hypot(bx - ax, bz - az);
  const ux = (bx - ax) / len;
  const uz = (bz - az) / len;
  const mx = (ax + bx) / 2;
  const mz = (az + bz) / 2;
  const n: V2 = [-uz, ux];
  const left = roomAt(mx + n[0] * 0.1, mz + n[1] * 0.1)?.id ?? null;
  const right = roomAt(mx - n[0] * 0.1, mz - n[1] * 0.1)?.id ?? null;
  return [left, right];
}

/**
 * Faces in the order to paint them: floors first, then room by room from far
 * to near: the walls behind the room's furniture, the furniture, and the walls
 * in front of it. Good enough for a convex-room plan, without a depth buffer.
 */
export function drawOrder(cam: Camera, faces: Face[]): Face[] {
  const camX = cam.pos[0];
  const camZ = cam.pos[2];
  const out: Face[] = faces.filter((f) => f.kind === 'floor' || f.kind === 'ground');
  out.push(...faces.filter((f) => f.kind === 'ceiling'));
  const wallFaces = faces.filter((f) => f.kind === 'wall' || f.kind === 'glass');
  const items = faces.filter((f) => f.kind === 'furniture' || f.kind === 'furnitureTop');
  const drawn = new Set<number>();
  const order = [...rooms].sort((a, b) => {
    const da = Math.hypot((a.rect[0] + a.rect[2]) / 2 - camX, (a.rect[1] + a.rect[3]) / 2 - camZ);
    const db = Math.hypot((b.rect[0] + b.rect[2]) / 2 - camX, (b.rect[1] + b.rect[3]) / 2 - camZ);
    const inside = (r: Room) => camX > r.rect[0] && camX < r.rect[2] && camZ > r.rect[1] && camZ < r.rect[3];
    if (inside(a)) return 1;
    if (inside(b)) return -1;
    return db - da;
  });
  const sideOfCamera = (w: Wall) => {
    const [ax, az] = w.a;
    const [bx, bz] = w.b;
    const len = Math.hypot(bx - ax, bz - az);
    const nx = -(bz - az) / len;
    const nz = (bx - ax) / len;
    return (camX - ax) * nx + (camZ - az) * nz >= 0 ? 0 : 1;
  };
  const pushWalls = (index: number) => {
    if (drawn.has(index)) return;
    drawn.add(index);
    const pieces = wallFaces
      .filter((f) => f.wall === index)
      .sort((a, b) => faceDepth(cam, b.pts) - faceDepth(cam, a.pts));
    out.push(...pieces);
  };
  for (const room of order) {
    const back: number[] = [];
    const front: number[] = [];
    walls.forEach((w, i) => {
      const sides = wallSides(w);
      if (!sides.includes(room.id)) return;
      const camSide = sideOfCamera(w);
      if (sides[camSide] === room.id) back.push(i);
      else front.push(i);
    });
    back.forEach(pushWalls);
    out.push(
      ...items
        .filter((f) => f.room === room.id)
        .filter((f) => {
          const c = centroid(f.pts);
          const toCam: V3 = [cam.pos[0] - c[0], cam.pos[1] - c[1], cam.pos[2] - c[2]];
          return toCam[0] * f.normal[0] + toCam[1] * f.normal[1] + toCam[2] * f.normal[2] > 0;
        })
        .sort((a, b) => faceDepth(cam, b.pts) - faceDepth(cam, a.pts))
    );
    front.forEach(pushWalls);
  }
  walls.forEach((_, i) => pushWalls(i));
  return out;
}

export function centroid(pts: V3[]): V3 {
  const c: V3 = [0, 0, 0];
  for (const p of pts) {
    c[0] += p[0] / pts.length;
    c[1] += p[1] / pts.length;
    c[2] += p[2] / pts.length;
  }
  return c;
}

// --------------------------------------------------------------------- sun

const DEG = Math.PI / 180;

export type Season = 'june' | 'december';

/** Clock time of solar noon in Rotterdam (4.48° E): CEST in June, CET in December. */
export const solarNoon: Record<Season, number> = { june: 13.7, december: 12.68 };

export function sunAt(season: Season, clock: number) {
  const lat = LATITUDE * DEG;
  const decl = (season === 'june' ? 23.44 : -23.44) * DEG;
  const hourAngle = (clock - solarNoon[season]) * 15 * DEG;
  const sinAlt =
    Math.sin(lat) * Math.sin(decl) +
    Math.cos(lat) * Math.cos(decl) * Math.cos(hourAngle);
  const altitude = Math.asin(sinAlt);
  const cosAz =
    (Math.sin(decl) - sinAlt * Math.sin(lat)) /
    (Math.cos(altitude) * Math.cos(lat));
  let azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz)));
  if (hourAngle > 0) azimuth = 2 * Math.PI - azimuth;
  const rel = azimuth - FACADE_AZIMUTH * DEG;
  // Unit vector pointing towards the sun, in model space.
  const toSun: V3 = [
    Math.cos(altitude) * Math.sin(rel),
    Math.sin(altitude),
    -Math.cos(altitude) * Math.cos(rel)
  ];
  return {
    altitude: altitude / DEG,
    azimuth: azimuth / DEG,
    toSun,
    up: altitude > 0.5 * DEG
  };
}

export function compass(azimuth: number) {
  const names = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return names[Math.round(((azimuth % 360) + 360) % 360 / 45) % 8];
}

export function formatClock(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const hh = m === 60 ? h + 1 : h;
  const mm = m === 60 ? 0 : m;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

/** Where a point at height y lands on the floor along the sunlight. */
export function toGround(p: V3, toSun: V3): V3 {
  const t = p[1] / toSun[1];
  return [p[0] - toSun[0] * t, 0, p[2] - toSun[2] * t];
}

// ------------------------------------------------------------------ camera

export type Camera = {
  pos: V3;
  forward: V3;
  right: V3;
  up: V3;
  focal: number;
  cx: number;
  cy: number;
};

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export function forwardFrom(yaw: number, pitch: number): V3 {
  return [
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    -Math.cos(yaw) * Math.cos(pitch)
  ];
}

/**
 * A pinhole camera. `fov` is the horizontal field of view in degrees.
 */
export function makeCamera(
  pos: V3,
  forward: V3,
  width: number,
  height: number,
  fov: number
): Camera {
  const f = norm(forward);
  const right = norm(cross(f, [0, 1, 0]));
  const up = cross(right, f);
  const focal = width / 2 / Math.tan((fov * DEG) / 2);
  return { pos, forward: f, right, up, focal, cx: width / 2, cy: height / 2 };
}

/** An eye-level camera at a point, looking with yaw / pitch (radians). */
export function walkCamera(
  pos: V3,
  yaw: number,
  pitch: number,
  width: number,
  height: number,
  fov = 78
) {
  return makeCamera(pos, forwardFrom(yaw, pitch), width, height, fov);
}

/** A camera orbiting a target, for the 1:50 dollhouse. */
export function orbitCamera(
  target: V3,
  yaw: number,
  pitch: number,
  distance: number,
  width: number,
  height: number,
  fov = 32
) {
  const f = forwardFrom(yaw, -pitch);
  const pos: V3 = [
    target[0] - f[0] * distance,
    target[1] - f[1] * distance,
    target[2] - f[2] * distance
  ];
  return makeCamera(pos, f, width, height, fov);
}

export const NEAR = 0.05;

/** Camera space: x right, y up, z depth in front of the camera. */
export function toCamera(cam: Camera, p: V3): V3 {
  const d = sub(p, cam.pos);
  return [dot(d, cam.right), dot(d, cam.up), dot(d, cam.forward)];
}

export function toScreen(cam: Camera, c: V3): V2 {
  return [cam.cx + (c[0] * cam.focal) / c[2], cam.cy - (c[1] * cam.focal) / c[2]];
}

export function project(cam: Camera, p: V3): V2 | null {
  const c = toCamera(cam, p);
  if (c[2] < NEAR) return null;
  return toScreen(cam, c);
}

/** Clips a convex polygon (camera space) against the near plane. */
export function clipNear(poly: V3[]): V3[] {
  const out: V3[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    const ain = a[2] >= NEAR;
    const bin = b[2] >= NEAR;
    if (ain) out.push(a);
    if (ain !== bin) {
      const t = (NEAR - a[2]) / (b[2] - a[2]);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]);
    }
  }
  return out;
}

/** Projects a 3D polygon to screen points, clipped. Empty when behind. */
export function projectPolygon(cam: Camera, pts: V3[]): { screen: V2[]; depth: number } {
  const clipped = clipNear(pts.map((p) => toCamera(cam, p)));
  if (clipped.length < 3) return { screen: [], depth: Infinity };
  let depth = 0;
  for (const c of clipped) depth += c[2];
  return {
    screen: clipped.map((c) => toScreen(cam, c)),
    depth: depth / clipped.length
  };
}

export function projectSegment(cam: Camera, a: V3, b: V3): [V2, V2] | null {
  let ca = toCamera(cam, a);
  let cb = toCamera(cam, b);
  if (ca[2] < NEAR && cb[2] < NEAR) return null;
  if (ca[2] < NEAR || cb[2] < NEAR) {
    const t = (NEAR - ca[2]) / (cb[2] - ca[2]);
    const m: V3 = [ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, NEAR];
    if (ca[2] < NEAR) ca = m;
    else cb = m;
  }
  return [toScreen(cam, ca), toScreen(cam, cb)];
}

/** Painter's depth for a face: its farthest point, so big floors sort back. */
export function faceDepth(cam: Camera, pts: V3[]) {
  let sum = 0;
  for (const p of pts) sum += toCamera(cam, p)[2];
  return sum / pts.length;
}

// ------------------------------------------------------------- polygons 2D

/** Clips a polygon (x, z) against an axis-aligned rectangle. */
export function clipRect(poly: V2[], [x0, z0, x1, z1]: [number, number, number, number]): V2[] {
  const edges: [(p: V2) => boolean, (a: V2, b: V2) => V2][] = [
    [(p) => p[0] >= x0, (a, b) => lerpAt(a, b, (x0 - a[0]) / (b[0] - a[0]))],
    [(p) => p[0] <= x1, (a, b) => lerpAt(a, b, (x1 - a[0]) / (b[0] - a[0]))],
    [(p) => p[1] >= z0, (a, b) => lerpAt(a, b, (z0 - a[1]) / (b[1] - a[1]))],
    [(p) => p[1] <= z1, (a, b) => lerpAt(a, b, (z1 - a[1]) / (b[1] - a[1]))]
  ];
  let out = poly;
  for (const [inside, cut] of edges) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const a = input[i]!;
      const b = input[(i + 1) % input.length]!;
      if (inside(a)) out.push(a);
      if (inside(a) !== inside(b)) out.push(cut(a, b));
    }
    if (out.length === 0) break;
  }
  return out;
}

function lerpAt(a: V2, b: V2, t: number): V2 {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Convex hull (monotone chain). */
export function hull(points: V2[]): V2[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;
  const crossZ = (o: V2, a: V2, b: V2) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: V2[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && crossZ(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: V2[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]!;
    while (upper.length >= 2 && crossZ(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

/** Floor shadows (x, z polygons) cast by furniture. */
export function furnitureShadows(toSun: V3): V2[][] {
  if (toSun[1] <= 0.01) return [];
  return furniture.map((box) => {
    const pts: V2[] = [];
    for (const x of [box.min[0], box.max[0]])
      for (const y of [box.min[1], box.max[1]])
        for (const z of [box.min[2], box.max[2]]) {
          const g = toGround([x, y, z], toSun);
          pts.push([g[0], g[2]]);
        }
    return hull(pts);
  });
}

/** Floor shadows (x, z polygons) cast by walls and furniture. */
export function floorShadows(toSun: V3): V2[][] {
  if (toSun[1] <= 0.01) return [];
  const shadows: V2[][] = [];
  for (const c of shadowCasters()) {
    const pa0 = toGround([c.a[0], c.y0, c.a[2]], toSun);
    const pb0 = toGround([c.b[0], c.y0, c.b[2]], toSun);
    const pb1 = toGround([c.b[0], c.y1, c.b[2]], toSun);
    const pa1 = toGround([c.a[0], c.y1, c.a[2]], toSun);
    shadows.push([
      [pa0[0], pa0[2]],
      [pb0[0], pb0[2]],
      [pb1[0], pb1[2]],
      [pa1[0], pa1[2]]
    ]);
  }
  shadows.push(...furnitureShadows(toSun));
  return shadows;
}

/** Sunlight patches on the floor through each pane, clipped to the room. */
export function lightPatches(toSun: V3): V2[][] {
  if (toSun[1] <= 0.01) return [];
  const patches: V2[][] = [];
  for (const wall of walls) {
    if (!wall.exterior) continue;
    const { at } = wallPieces(wall);
    for (const o of wall.openings) {
      if (o.kind !== 'window') continue;
      const p0 = at(o.from, 0);
      const facing = p0[2] === 0 ? toSun[2] < 0 : p0[0] === 12 ? toSun[0] > 0 : false;
      if (!facing) continue;
      const width = o.to - o.from;
      const panes = Math.max(1, Math.round(width / 1.5));
      const mullion = 0.035;
      const transom = o.head - 0.42;
      for (let i = 0; i < panes; i++) {
        const d0 = o.from + (width * i) / panes + (i ? mullion : 0);
        const d1 = o.from + (width * (i + 1)) / panes - (i < panes - 1 ? mullion : 0);
        for (const [y0, y1] of [
          [o.sill, transom - mullion],
          [transom + mullion, o.head]
        ] as const) {
          const quad = [at(d0, y0), at(d1, y0), at(d1, y1), at(d0, y1)];
          const mid = at((d0 + d1) / 2, 0);
          const room = rooms.find(
            (r) => mid[0] >= r.rect[0] - 0.01 && mid[0] <= r.rect[2] + 0.01 && mid[2] >= r.rect[1] - 0.01 && mid[2] <= r.rect[3] + 0.01
          );
          if (!room) continue;
          const poly = quad.map((p) => {
            const g = toGround(p, toSun);
            return [g[0], g[2]] as V2;
          });
          const clipped = clipRect(poly, room.rect);
          if (clipped.length >= 3) patches.push(clipped);
        }
      }
    }
  }
  return patches;
}

/** Flat shading for a face, given a light direction. 0 (dark) to 1 (lit). */
export function shade(normal: V3, light: V3 = [0.45, 0.75, -0.48]) {
  const l = norm(light);
  const d = Math.abs(dot(normal, l));
  return 0.55 + 0.45 * d;
}
