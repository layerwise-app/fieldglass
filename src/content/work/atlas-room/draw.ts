import {
  buildFaces,
  drawOrder,
  floorShadows,
  furnitureShadows,
  lightPatches,
  makeCamera,
  projectPolygon,
  projectSegment,
  rooms,
  sunAt,
  toCamera,
  wallTops,
  type Camera,
  type Face,
  type Season,
  type V2,
  type V3
} from './model';

const MATERIAL: Record<string, [number[], number[]]> = {
  timber: [[180, 138, 94], [221, 187, 147]],
  fabric: [[142, 147, 132], [181, 185, 170]],
  white: [[217, 211, 200], [244, 241, 235]],
  stone: [[169, 164, 155], [207, 202, 193]],
  linen: [[216, 210, 198], [243, 239, 231]],
  sage: [[127, 138, 123], [174, 182, 166]]
};
const WALL: [number[], number[]] = [[207, 199, 186], [243, 240, 234]];

const rgb = (a: number[], b: number[], t: number) =>
  `rgb(${a.map((v, i) => Math.round(v + (b[i]! - v) * t)).join(',')})`;

function lightness(face: Face, walk: boolean) {
  const [nx, ny, nz] = face.normal;
  if (ny > 0.5) return 1;
  if (walk) {
    if (face.kind === 'wall' && Math.abs(nz) > 0.5 && face.pts[0]![2] < 0.01) return 0.58;
    return Math.min(1, 0.72 + 0.28 * Math.max(0, -nz) + 0.1 * Math.abs(nx));
  }
  return Math.min(1, 0.7 + 0.3 * Math.max(0, -nz * 0.6 + nx * 0.8));
}

function fillFor(face: Face, walk: boolean) {
  const t = lightness(face, walk);
  if (face.kind === 'wall') return rgb(WALL[0], WALL[1], t);
  if (face.kind === 'ceiling') return '#ECE8E1';
  const [lo, hi] = MATERIAL[face.material ?? 'timber']!;
  return rgb(lo, hi, t);
}

function strokeLines(ctx: CanvasRenderingContext2D, cam: Camera, face: Face, walk: boolean) {
  if (!face.lines?.length) return;
  const glass = face.kind === 'glass';
  ctx.strokeStyle = glass ? (walk ? 'rgba(52,48,42,0.6)' : 'rgba(29,27,24,0.4)') : 'rgba(29,27,24,0.28)';
  ctx.lineWidth = glass ? (walk ? 2.5 : 0.7) : walk ? 1.2 : 0.6;
  ctx.beginPath();
  for (const [a, b] of face.lines) {
    const seg = projectSegment(cam, a, b);
    if (!seg) continue;
    ctx.moveTo(seg[0][0], seg[0][1]);
    ctx.lineTo(seg[1][0], seg[1][1]);
  }
  ctx.stroke();
}

function trace(ctx: CanvasRenderingContext2D, pts: V2[]) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
}

export type Note = { id: number; surface: V3; label: string };

export type DrawInput = {
  pos: V3;
  forward: V3;
  fov: number;
  walk: boolean;
  season: Season;
  clock: number;
  notes: Note[];
  highlight?: number | null;
  pixelFont: string;
  /** Moves the view centre left, to make room for a side panel. */
  shiftX?: number;
  labels?: boolean;
};

let offscreen: HTMLCanvasElement | null = null;
const facesWalk = buildFaces({ ceiling: true });
const facesModel = buildFaces({ ceiling: false });
const tops = wallTops();

/** Draws Apartment 2.04 into a canvas. Width and height are CSS pixels. */
export function drawScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  input: DrawInput
): Camera {
  const { walk } = input;
  const cam = makeCamera(input.pos, input.forward, width, height, input.fov);
  cam.cx -= input.shiftX ?? 0;
  const sun = sunAt(input.season, input.clock);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = walk ? '#F2EEE7' : '#D9D4CB';
  ctx.fillRect(0, 0, width, height);

  const floorPoly = (poly: V2[]) =>
    projectPolygon(cam, poly.map(([x, z]) => [x, 0.003, z] as V3)).screen;

  // Model base.
  if (!walk) {
    const top = projectPolygon(cam, [
      [-1.2, 0, -1.2],
      [13.2, 0, -1.2],
      [13.2, 0, 8.4],
      [-1.2, 0, 8.4]
    ]).screen;
    const sides: V3[][] = [
      [[-1.2, -0.4, -1.2], [13.2, -0.4, -1.2], [13.2, 0, -1.2], [-1.2, 0, -1.2]],
      [[13.2, -0.4, -1.2], [13.2, -0.4, 8.4], [13.2, 0, 8.4], [13.2, 0, -1.2]],
      [[13.2, -0.4, 8.4], [-1.2, -0.4, 8.4], [-1.2, 0, 8.4], [13.2, 0, 8.4]],
      [[-1.2, -0.4, 8.4], [-1.2, -0.4, -1.2], [-1.2, 0, -1.2], [-1.2, 0, 8.4]]
    ];
    ctx.save();
    ctx.shadowColor = 'rgba(29,27,24,0.22)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 24;
    trace(ctx, top);
    ctx.fillStyle = '#F7F5F1';
    ctx.fill();
    ctx.restore();
    sides
      .map((pts) => projectPolygon(cam, pts))
      .sort((a, b) => b.depth - a.depth)
      .forEach((s, i) => {
        if (!s.screen.length) return;
        trace(ctx, s.screen);
        ctx.fillStyle = i % 2 ? '#DAD5CC' : '#E6E2DA';
        ctx.fill();
        ctx.strokeStyle = 'rgba(29,27,24,0.25)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });
    trace(ctx, top);
    ctx.fillStyle = '#F7F5F1';
    ctx.fill();
    ctx.strokeStyle = 'rgba(29,27,24,0.25)';
    ctx.stroke();
  }

  const ordered = drawOrder(cam, walk ? facesWalk : facesModel);
  const floors = ordered.filter((f) => f.kind === 'floor');
  for (const f of floors) {
    const pts = projectPolygon(cam, f.pts).screen;
    if (!pts.length) continue;
    trace(ctx, pts);
    ctx.fillStyle = f.room === 'living' ? '#DDBB93' : f.room === 'hall' ? '#D6CCBE' : '#E4CDAE';
    ctx.fill();
  }

  // Floor boards.
  ctx.strokeStyle = 'rgba(120,84,48,0.16)';
  ctx.lineWidth = walk ? 1 : 0.6;
  ctx.beginPath();
  for (const room of rooms) {
    const [x0, z0, x1, z1] = room.rect;
    const step = room.id === 'hall' ? 0.3 : 0.2;
    for (let x = x0 + step; x < x1 - 0.01; x += step) {
      const seg = projectSegment(cam, [x, 0.001, z0], [x, 0.001, z1]);
      if (!seg) continue;
      ctx.moveTo(seg[0][0], seg[0][1]);
      ctx.lineTo(seg[1][0], seg[1][1]);
    }
  }
  ctx.stroke();

  if (sun.up) {
    if (!walk) {
      ctx.fillStyle = 'rgba(70,54,36,0.18)';
      ctx.beginPath();
      for (const poly of floorShadows(sun.toSun)) {
        const pts = floorPoly(poly);
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
      }
      ctx.fill('nonzero');
    }
    // Sunlight through the panes, minus furniture shadows, on its own layer.
    offscreen ??= document.createElement('canvas');
    if (offscreen.width !== Math.round(width * dpr) || offscreen.height !== Math.round(height * dpr)) {
      offscreen.width = Math.round(width * dpr);
      offscreen.height = Math.round(height * dpr);
    }
    const o = offscreen.getContext('2d')!;
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.clearRect(0, 0, offscreen.width, offscreen.height);
    o.setTransform(dpr, 0, 0, dpr, 0, 0);
    o.filter = walk ? 'blur(2px)' : 'blur(0.6px)';
    o.fillStyle = walk ? 'rgba(255,244,214,1)' : 'rgba(255,250,236,1)';
    o.beginPath();
    for (const poly of lightPatches(sun.toSun)) {
      floorPoly(poly).forEach(([x, y], i) => (i ? o.lineTo(x, y) : o.moveTo(x, y)));
      o.closePath();
    }
    o.fill('nonzero');
    o.globalCompositeOperation = 'destination-out';
    o.beginPath();
    for (const poly of furnitureShadows(sun.toSun)) {
      floorPoly(poly).forEach(([x, y], i) => (i ? o.lineTo(x, y) : o.moveTo(x, y)));
      o.closePath();
    }
    o.fill('nonzero');
    o.globalCompositeOperation = 'source-over';
    o.filter = 'none';
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = walk ? 0.95 : 0.55;
    ctx.drawImage(offscreen, 0, 0);
    ctx.restore();
  }

  const horizon = toCamera(cam, [
    cam.pos[0] + cam.forward[0] * 400,
    cam.pos[1],
    cam.pos[2] + cam.forward[2] * 400
  ]);
  const horizonY = cam.cy - (horizon[1] * cam.focal) / horizon[2];

  for (const f of ordered) {
    if (f.kind === 'floor') continue;
    const pts = projectPolygon(cam, f.pts).screen;
    if (!pts.length) continue;
    if (f.kind === 'glass') {
      trace(ctx, pts);
      if (walk) {
        ctx.save();
        ctx.clip();
        const g = ctx.createLinearGradient(0, horizonY - height * 0.4, 0, horizonY);
        g.addColorStop(0, '#C6D6DC');
        g.addColorStop(1, '#EEF0EC');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
        const s = width / 1440;
        (
          [
            [-40, 380, 150],
            [330, 260, 210],
            [600, 420, 128],
            [1030, 300, 186],
            [1340, 360, 140]
          ] as const
        ).forEach(([x, w, h], i) => {
          ctx.fillStyle = i % 2 ? '#BAB5AB' : '#C7C2B7';
          ctx.fillRect(x * s, horizonY - h * s, w * s, h * s + 8);
          for (let c = 0; c < Math.floor(w / 34); c++) {
            for (let r = 0; r < Math.floor(h / 30); r++) {
              ctx.fillStyle = (c * 7 + r * 3 + i) % 5 === 0 ? '#ECE2CB' : '#AAA499';
              ctx.fillRect((x + 12 + c * 34) * s, horizonY - (h - 14 - r * 30) * s, 16 * s, 12 * s);
            }
          }
        });
        ctx.fillStyle = '#A3B5B2';
        ctx.fillRect(0, horizonY + 6 * s, width, height);
        for (const x of [120, 520, 980, 1300]) {
          ctx.fillStyle = '#6F6A5F';
          ctx.fillRect((x - 3) * s, horizonY - 60 * s, 6 * s, 70 * s);
          ctx.fillStyle = '#7F8B6D';
          ctx.beginPath();
          ctx.ellipse(x * s, horizonY - 82 * s, 46 * s, 40 * s, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
        trace(ctx, pts);
        ctx.strokeStyle = 'rgba(29,27,24,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(198,216,222,0.6)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(29,27,24,0.42)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      strokeLines(ctx, cam, f, walk);
      continue;
    }
    trace(ctx, pts);
    ctx.fillStyle = fillFor(f, walk);
    ctx.fill();
    ctx.strokeStyle = walk ? 'rgba(29,27,24,0.12)' : 'rgba(29,27,24,0.4)';
    ctx.lineWidth = walk ? 1 : 0.8;
    ctx.lineJoin = 'round';
    ctx.stroke();
    strokeLines(ctx, cam, f, walk);
  }

  if (!walk) {
    ctx.strokeStyle = '#1D1B18';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const [a, b] of tops) {
      const seg = projectSegment(cam, a, b);
      if (!seg) continue;
      ctx.moveTo(seg[0][0], seg[0][1]);
      ctx.lineTo(seg[1][0], seg[1][1]);
    }
    ctx.stroke();

    ctx.font = `11px ${input.pixelFont}`;
    ctx.textAlign = 'center';
    for (const room of input.labels === false ? [] : rooms) {
      const [x0, z0, x1, z1] = room.rect;
      const c = toCamera(cam, [(x0 + x1) / 2, 3.1, (z0 + z1) / 2]);
      if (c[2] < 0.1) continue;
      const x = cam.cx + (c[0] * cam.focal) / c[2];
      const y = cam.cy - (c[1] * cam.focal) / c[2];
      ctx.fillStyle = '#1D1B18';
      ctx.fillText(room.name.toUpperCase(), x, y);
    }

    // The sun, far out along its direction from the model's centre.
    if (sun.up) {
      const p = toCamera(cam, [
        6 + sun.toSun[0] * 18,
        sun.toSun[1] * 18,
        3.6 + sun.toSun[2] * 18
      ]);
      if (p[2] > 0.1) {
        const x = cam.cx + (p[0] * cam.focal) / p[2];
        const y = cam.cy - (p[1] * cam.focal) / p[2];
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(243,181,74,0.25)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#F3B54A';
        ctx.fill();
      }
    }
  }

  // Note pins.
  input.notes.forEach((note, i) => {
    const c = toCamera(cam, note.surface);
    if (c[2] < 0.1) return;
    const x = cam.cx + (c[0] * cam.focal) / c[2];
    const y = cam.cy - (c[1] * cam.focal) / c[2];
    const r = walk ? 15 : 11;
    const active = input.highlight === note.id;
    ctx.save();
    if (active) {
      ctx.beginPath();
      ctx.arc(x, y - r - 6, r + 9, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(13,106,98,0.18)';
      ctx.fill();
    }
    ctx.strokeStyle = '#0D6A62';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0D6A62';
    ctx.fill();
    ctx.shadowColor = 'rgba(8,70,63,0.35)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.arc(x, y - r - 6, r, 0, Math.PI * 2);
    ctx.fillStyle = '#0D6A62';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = `${walk ? 13 : 11}px ${input.pixelFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), x, y - r - 6 + 1);
    ctx.restore();
  });
  ctx.textBaseline = 'alphabetic';
  return cam;
}
