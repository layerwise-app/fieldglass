import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useInView, useReducedMotion } from '~/lib/hooks';
import { drawScene, type Note } from './draw';
import {
  compass,
  forwardFrom,
  formatClock,
  surfaces,
  sunAt,
  type Season,
  type SurfaceId,
  type V3
} from './model';
import { C, pixel, sans } from './ui';

type Mode = 'walk' | 'model';

type PinnedNote = Note & { surfaceId: SurfaceId; text: string; author: string };

const WALK_POS: V3 = [5.6, 1.62, 6.3];
const TARGET: V3 = [6, 0.2, 3.6];


const suggestions: Record<SurfaceId, string> = {
  seat: 'Try 42 cm instead of 46',
  window: 'Could the sill go lower here?',
  island: 'Room for two stools on this side?',
  ceiling: 'Feels low over the table. Is this 2.70?',
  door: 'Wide enough for a pram?',
  bed1: 'Blackout blind on this window'
};

const initialNotes: PinnedNote[] = [
  {
    id: 1,
    surfaceId: 'seat',
    surface: surfaces[0].point,
    label: 'Window seat',
    text: 'Can it drop from 46 to 42 cm? Easier for my mother to stand up from.',
    author: 'Marieke V.'
  },
  {
    id: 2,
    surfaceId: 'island',
    surface: surfaces[2].point,
    label: 'Kitchen island',
    text: 'Room for two stools on the window side?',
    author: 'Joost V.'
  }
];

type View = { yaw: number; pitch: number };

function cameraOf(mode: Mode, view: View, aspect: number) {
  if (mode === 'walk') {
    return { pos: WALK_POS, forward: forwardFrom(view.yaw, view.pitch), fov: aspect >= 1 ? 76 : 64 };
  }
  const f = forwardFrom(view.yaw, -view.pitch);
  const distance = aspect >= 1 ? 38 : 33;
  const pos: V3 = [
    TARGET[0] - f[0] * distance,
    TARGET[1] - f[1] * distance,
    TARGET[2] - f[2] * distance
  ];
  return { pos, forward: f, fov: aspect >= 1 ? 32 : 36 };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Atlas Room in miniature: walk the apartment at 1:1, shrink it to 1:50, move the sun, pin notes. */
export default function AtlasRoomDemo() {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, '100px');
  const reducedMotion = useReducedMotion();

  const [mode, setMode] = useState<Mode>('walk');
  const [season, setSeason] = useState<Season>('december');
  const [clock, setClock] = useState(13.5);
  const [notes, setNotes] = useState<PinnedNote[]>(initialNotes);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [surface, setSurface] = useState<SurfaceId>('ceiling');
  const [draft, setDraft] = useState(suggestions.ceiling);
  const [draftTouched, setDraftTouched] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [status, setStatus] = useState('');

  // Mutable render state, read by the animation loop.
  const state = useRef({
    views: { walk: { yaw: -0.4, pitch: -0.06 }, model: { yaw: 0.62, pitch: 0.72 } } as Record<Mode, View>,
    mode: 'walk' as Mode,
    from: null as null | { pos: V3; forward: V3; fov: number },
    tweenStart: 0,
    yawTarget: null as number | null,
    autoRotate: true,
    dirty: true,
    size: { w: 0, h: 0, dpr: 1 }
  });
  const latest = useRef({ season, clock, notes, highlight, reducedMotion });
  latest.current = { season, clock, notes, highlight, reducedMotion };

  useEffect(() => {
    state.current.dirty = true;
    // Mark the canvas for a redraw whenever any of these change.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [season, clock, notes, highlight]);

  // Canvas size.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      state.current.size = { w: rect.width, h: rect.height, dpr };
      state.current.dirty = true;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Render loop: only draws when something changed or is moving.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !inView) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    let last = performance.now();
    const pixelFont =
      getComputedStyle(document.documentElement).getPropertyValue('--fg-font-pixel').trim() || 'monospace';

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = state.current;
      const { w, h, dpr } = s.size;
      if (!w || !h) return;
      const reduced = latest.current.reducedMotion;

      let moving = false;
      if (s.mode === 'model' && s.autoRotate && !reduced) {
        s.views.model.yaw += dt * 0.08;
        moving = true;
      }
      if (s.yawTarget !== null) {
        const view = s.views[s.mode];
        const diff = Math.atan2(Math.sin(s.yawTarget - view.yaw), Math.cos(s.yawTarget - view.yaw));
        if (reduced || Math.abs(diff) < 0.002) {
          view.yaw = s.yawTarget;
          s.yawTarget = null;
        } else {
          view.yaw += diff * Math.min(1, dt * 6);
        }
        moving = true;
      }
      let cam = cameraOf(s.mode, s.views[s.mode], w / h);
      if (s.from) {
        const t = reduced ? 1 : Math.min(1, (now - s.tweenStart) / 700);
        const k = ease(t);
        cam = {
          pos: lerp3(s.from.pos, cam.pos, k),
          forward: lerp3(s.from.forward, cam.forward, k),
          fov: lerp(s.from.fov, cam.fov, k)
        };
        if (t >= 1) s.from = null;
        moving = true;
      }
      if (!moving && !s.dirty) return;
      s.dirty = false;
      const { season, clock, notes, highlight } = latest.current;
      drawScene(ctx, w, h, dpr, {
        ...cam,
        walk: cam.pos[1] < 2.6,
        season,
        clock,
        notes,
        highlight,
        pixelFont,
        shiftX: w >= 720 ? 158 : 0,
        labels: w >= 520
      });
    };
    const onVisible = () => {
      state.current.dirty = true;
    };
    document.addEventListener('visibilitychange', onVisible);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [inView]);

  function switchMode(next: Mode) {
    if (next === mode) return;
    const s = state.current;
    const { w, h } = s.size;
    s.from = cameraOf(s.mode, s.views[s.mode], w / Math.max(1, h));
    s.tweenStart = performance.now();
    s.mode = next;
    s.dirty = true;
    setMode(next);
    setStatus(next === 'walk' ? 'Walking at 1:1, eye height 1.62 m' : 'Model at 1:50');
  }

  function nudge(dyaw: number, dpitch: number) {
    const s = state.current;
    const view = s.views[s.mode];
    s.autoRotate = false;
    s.yawTarget = null;
    view.yaw += dyaw;
    view.pitch =
      s.mode === 'walk'
        ? Math.max(-0.45, Math.min(0.35, view.pitch + dpitch))
        : Math.max(0.3, Math.min(1.3, view.pitch + dpitch));
    s.dirty = true;
  }

  const drag = useRef<{ x: number; y: number; id: number; mouse: boolean } | null>(null);
  function onPointerDown(e: PointerEvent<HTMLCanvasElement>) {
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId, mouse: e.pointerType === 'mouse' };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: PointerEvent<HTMLCanvasElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    const k = state.current.mode === 'walk' ? 0.0045 : 0.006;
    nudge(-dx * k, d.mouse ? (state.current.mode === 'walk' ? -dy * 0.003 : dy * 0.004) : 0);
  }
  function onPointerUp(e: PointerEvent<HTMLCanvasElement>) {
    if (drag.current?.id === e.pointerId) drag.current = null;
  }
  function onKeyDown(e: KeyboardEvent<HTMLCanvasElement>) {
    const step = 0.09;
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, mode === 'walk' ? 0.05 : -0.06],
      ArrowDown: [0, mode === 'walk' ? -0.05 : 0.06]
    };
    const delta = map[e.key];
    if (!delta) return;
    e.preventDefault();
    nudge(delta[0], delta[1]);
  }

  function faceNote(note: PinnedNote) {
    setHighlight(note.id);
    const s = state.current;
    if (s.mode === 'walk') {
      const dx = note.surface[0] - WALK_POS[0];
      const dz = note.surface[2] - WALK_POS[2];
      s.yawTarget = Math.atan2(dx, -dz);
      s.autoRotate = false;
    }
    s.dirty = true;
    setStatus(`Showing note ${notes.indexOf(note) + 1}: ${note.label}`);
  }

  function pin() {
    const text = draft.trim();
    if (!text) return;
    const target = surfaces.find((s) => s.id === surface)!;
    const note: PinnedNote = {
      id: Date.now(),
      surfaceId: surface,
      surface: target.point,
      label: target.name,
      text,
      author: 'You'
    };
    const next = [...notes, note];
    setNotes(next);
    setDraftTouched(false);
    setDraft(suggestions[surface]);
    faceNote(note);
    if ((rootRef.current?.clientWidth ?? 0) < 720) setSheetOpen(false);
    setStatus(`Note ${next.length} pinned to ${target.name}`);
  }

  function remove(note: PinnedNote) {
    setNotes((list) => list.filter((n) => n.id !== note.id));
    if (highlight === note.id) setHighlight(null);
    setStatus(`Removed the note on ${note.label}`);
  }

  const sun = sunAt(season, clock);
  const sunText = sun.up
    ? `Sun ${Math.round(sun.altitude)}° · ${compass(sun.azimuth)} ${Math.round(sun.azimuth)}°`
    : 'Sun below the horizon';

  const panel = {
    background: C.panel,
    backdropFilter: 'blur(18px) saturate(1.3)',
    WebkitBackdropFilter: 'blur(18px) saturate(1.3)',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.75), 0 18px 36px -22px rgba(29,27,24,0.35)',
    color: C.ink
  } as const;
  const label = 'uppercase tracking-[0.04em] text-[11px] leading-4';

  const notesPanel = (
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
      <form
        className='grid gap-2'
        onSubmit={(e) => {
          e.preventDefault();
          pin();
        }}
      >
        <div className={label} style={{ fontFamily: pixel, color: C.muted }}>
          Pin a note
        </div>
        <label className='sr-only' htmlFor={`${id}-surface`}>
          Surface
        </label>
        <select
          id={`${id}-surface`}
          value={surface}
          onChange={(e) => {
            const next = e.target.value as SurfaceId;
            setSurface(next);
            if (!draftTouched) setDraft(suggestions[next]);
          }}
          className='h-9 w-full rounded-[10px] px-2.5 text-[14px]'
          style={{ background: 'rgba(255,255,255,0.8)', border: `1px solid ${C.line}`, color: C.ink }}
        >
          {surfaces.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <label className='sr-only' htmlFor={`${id}-note`}>
          Note
        </label>
        <div className='flex gap-2'>
          <input
            id={`${id}-note`}
            value={draft}
            maxLength={120}
            onChange={(e) => {
              setDraft(e.target.value);
              setDraftTouched(true);
            }}
            className='h-9 min-w-0 flex-1 rounded-[10px] px-2.5 text-[14px]'
            style={{ background: 'rgba(255,255,255,0.8)', border: `1px solid ${C.line}`, color: C.ink }}
          />
          <button
            type='submit'
            disabled={!draft.trim()}
            className='h-9 shrink-0 rounded-[10px] px-3.5 text-[14px] font-medium disabled:opacity-50'
            style={{ background: C.teal, color: '#fff' }}
          >
            Pin
          </button>
        </div>
      </form>
      <ol className='-mx-1 min-h-0 flex-1 space-y-1 overflow-y-auto px-1' aria-label='Notes in this review'>
        {notes.map((note, i) => (
          <li
            key={note.id}
            className='flex items-start gap-2 rounded-[12px] p-1.5'
            style={{ background: highlight === note.id ? 'rgba(13,106,98,0.1)' : 'transparent' }}
          >
            <button
              type='button'
              onClick={() => faceNote(note)}
              className='flex min-w-0 flex-1 items-start gap-2.5 rounded-[8px] text-left'
              aria-label={`Show note ${i + 1} on ${note.label}`}
            >
              <span
                className='mt-0.5 inline-flex size-[22px] shrink-0 items-center justify-center rounded-full text-[11px]'
                style={{ background: C.teal, color: '#fff', fontFamily: pixel }}
              >
                {i + 1}
              </span>
              <span className='min-w-0'>
                <span className='block text-[13px] font-medium leading-5'>{note.label}</span>
                <span className='block text-[13px] leading-[18px]' style={{ color: C.inkSoft }}>
                  {note.text}
                </span>
                <span className={`${label} mt-0.5 block`} style={{ fontFamily: pixel, color: C.muted }}>
                  {note.author}
                </span>
              </span>
            </button>
            <button
              type='button'
              onClick={() => remove(note)}
              className='inline-flex size-7 shrink-0 items-center justify-center rounded-full text-[16px] leading-none'
              style={{ color: C.muted }}
              aria-label={`Remove note ${i + 1}`}
            >
              ×
            </button>
          </li>
        ))}
        {notes.length === 0 && (
          <li className='p-2 text-[13px]' style={{ color: C.muted }}>
            No notes yet. Pick a surface and pin one.
          </li>
        )}
      </ol>
    </div>
  );

  return (
    <div
      ref={rootRef}
      className='@container relative h-full w-full overflow-hidden select-none'
      style={{ background: '#D9D4CB', fontFamily: sans, color: C.ink }}
    >
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role='application'
        aria-label={`3D model of Apartment 2.04, ${mode === 'walk' ? 'walking at 1:1' : 'model at 1:50'}. Use the arrow keys to look around.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className='absolute inset-0 h-full w-full cursor-grab outline-none focus-visible:outline-2 focus-visible:-outline-offset-4 active:cursor-grabbing'
        style={{ touchAction: 'pan-y', outlineColor: C.teal }}
      />

      <div className='pointer-events-none absolute inset-0 flex flex-col justify-between p-3 @min-[720px]:p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='pointer-events-auto rounded-[16px] p-1' style={panel}>
            <div className='flex' role='group' aria-label='Scale'>
              {(
                [
                  ['walk', '1:1', 'Walk'],
                  ['model', '1:50', 'Model']
                ] as const
              ).map(([value, scale, name]) => (
                <button
                  key={value}
                  type='button'
                  aria-pressed={mode === value}
                  onClick={() => switchMode(value)}
                  className='flex h-9 items-baseline gap-1.5 rounded-[12px] px-3 text-[14px] font-medium'
                  style={
                    mode === value ? { background: C.ink, color: '#F6F3EE' } : { background: 'transparent', color: C.inkSoft }
                  }
                >
                  <span style={{ fontFamily: pixel, fontSize: 12 }}>{scale}</span>
                  <span>{name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className='hidden pointer-events-auto rounded-[14px] px-3 py-2 @min-[720px]:block @min-[720px]:mr-[316px]' style={panel}>
            <div className={label} style={{ fontFamily: pixel, color: C.muted }}>
              Kade Noord · Apartment 2.04
            </div>
            <div className='text-[13px] leading-5' style={{ color: C.inkSoft }}>
              Drag or use the arrow keys to look around
            </div>
          </div>
          <button
            type='button'
            className='pointer-events-auto flex h-11 items-center gap-2 rounded-[14px] px-3 text-[14px] font-medium @min-[720px]:hidden'
            style={panel}
            aria-expanded={sheetOpen}
            aria-controls={`${id}-notes`}
            onClick={() => setSheetOpen((v) => !v)}
          >
            Notes
            <span
              className='inline-flex size-[22px] items-center justify-center rounded-full text-[11px]'
              style={{ background: C.teal, color: '#fff', fontFamily: pixel }}
            >
              {notes.length}
            </span>
          </button>
        </div>

        <div
          className='pointer-events-auto w-full rounded-[18px] p-3 @min-[720px]:w-[372px] @min-[720px]:p-4'
          style={panel}
        >
          <div className='flex items-center justify-between gap-2'>
            <div className='flex rounded-[10px] p-0.5' style={{ background: 'rgba(29,27,24,0.06)' }} role='group' aria-label='Date'>
              {(
                [
                  ['june', '21 June'],
                  ['december', '21 Dec']
                ] as const
              ).map(([value, text]) => (
                <button
                  key={value}
                  type='button'
                  aria-pressed={season === value}
                  onClick={() => setSeason(value)}
                  className='h-7 rounded-[8px] px-2.5 text-[13px] font-medium'
                  style={season === value ? { background: '#fff', color: C.ink, boxShadow: '0 1px 2px rgba(29,27,24,0.12)' } : { color: C.muted }}
                >
                  {text}
                </button>
              ))}
            </div>
            <div className='text-right' aria-live='polite'>
              <span className='text-[20px] font-medium tabular-nums tracking-[-0.02em]'>{formatClock(clock)}</span>
            </div>
          </div>
          <label htmlFor={`${id}-time`} className='sr-only'>
            Time of day
          </label>
          <input
            id={`${id}-time`}
            type='range'
            min={6}
            max={21}
            step={0.25}
            value={clock}
            onChange={(e) => setClock(Number(e.target.value))}
            aria-valuetext={`${formatClock(clock)}, ${sunText}`}
            className='mt-2 w-full'
            style={{ accentColor: C.teal }}
          />
          <div className='flex justify-between text-[11px] leading-4 uppercase tracking-[0.04em]' style={{ fontFamily: pixel, color: C.muted }}>
            <span>06:00</span>
            <span>{sunText}</span>
            <span>21:00</span>
          </div>
        </div>
      </div>

      <div
        id={`${id}-notes`}
        className={`absolute right-3 bottom-[118px] left-3 max-h-[62%] flex-col rounded-[18px] p-3 @min-[720px]:top-4 @min-[720px]:right-4 @min-[720px]:bottom-4 @min-[720px]:left-auto @min-[720px]:flex @min-[720px]:max-h-none @min-[720px]:w-[300px] @min-[720px]:p-4 ${sheetOpen ? 'flex' : 'hidden'}`}
        style={panel}
      >
        {notesPanel}
      </div>

      <div className='sr-only' aria-live='polite'>
        {status}
      </div>
    </div>
  );
}
