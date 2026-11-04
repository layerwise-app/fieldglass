import { useCallback, useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from '~/lib/hooks';
import { OrbitAudio } from './audio';
import {
  drawOrbit,
  getScene,
  palette,
  simulatedStems,
  type SceneId,
  type StemId,
  type Stems
} from './orbit';

const demoScenes: { id: SceneId; number: string; name: string }[] = [
  { id: 'perigee', number: '01', name: 'Perigee' },
  { id: 'apogee', number: '02', name: 'Apogee' },
  { id: 'eclipse', number: '03', name: 'Eclipse' }
];

const stemRows: { id: StemId; label: string; drives: string }[] = [
  { id: 'kick', label: 'Kick', drives: 'Core' },
  { id: 'bass', label: 'Bass', drives: 'Rings' },
  { id: 'pads', label: 'Pads', drives: 'Dust' },
  { id: 'vocal', label: 'Vox', drives: 'Satellite' }
];

const idle: Stems = { kick: 0.04, bass: 0.1, pads: 0.32, vocal: 0.05 };
/** The frame shown when motion is reduced: mid-chorus, every stem lit. */
const STILL_TIME = 6.2;

const rangeCss = `
.lo-range{-webkit-appearance:none;appearance:none}
.lo-range::-webkit-slider-runnable-track{height:2px;background:rgba(237,230,218,.22)}
.lo-range::-moz-range-track{height:2px;background:rgba(237,230,218,.22)}
.lo-range::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:22px;margin-top:-10px;border-radius:3px;background:#EDE6DA;box-shadow:0 0 0 3px #07070A,0 0 0 4px rgba(255,45,85,.9)}
.lo-range::-moz-range-thumb{width:14px;height:22px;border:0;border-radius:3px;background:#EDE6DA}
`;

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF2D55]';

export default function LowOrbitDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<OrbitAudio | null>(null);
  const meterRefs = useRef<Partial<Record<StemId, HTMLSpanElement | null>>>({});
  const beatRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const inView = useInView(rootRef);
  const reducedMotion = useReducedMotion();

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [gravity, setGravity] = useState(18);
  const [sceneId, setSceneId] = useState<SceneId>('perigee');
  const [hidden, setHidden] = useState(false);

  // Live values the animation loop reads without re-rendering.
  const live = useRef({
    time: 4,
    gravity: 0.18,
    pulse: 0,
    stems: { ...idle } as Stems,
    target: 0.18,
    scene: getScene('perigee'),
    playing: false
  });
  useEffect(() => {
    live.current.target = gravity / 100;
    live.current.playing = playing;
  }, [gravity, playing]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const state = live.current;
    const dpr = canvas.width / Math.max(1, canvas.clientWidth);
    const compact = canvas.clientWidth < 560;
    drawOrbit(ctx, canvas.width, canvas.height, dpr, {
      time: state.time,
      stems: state.stems,
      gravity: Math.max(state.gravity, state.pulse * 0.72),
      scene: state.scene,
      density: compact ? 0.55 : 1,
      offsetY: compact ? -0.06 : -0.03
    });
  }, []);

  const drawStill = useCallback(() => {
    const state = live.current;
    state.time = STILL_TIME;
    state.stems = simulatedStems(STILL_TIME);
    state.gravity = state.target;
    state.pulse = 0;
    draw();
    for (const row of stemRows) {
      const meter = meterRefs.current[row.id];
      if (meter) meter.style.transform = `scaleX(${state.stems[row.id].toFixed(3)})`;
    }
  }, [draw]);

  // Size the canvas to its box.
  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(root.clientWidth * dpr);
      canvas.height = Math.round(root.clientHeight * dpr);
      if (reducedMotion) drawStill();
      else draw();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    return () => observer.disconnect();
  }, [draw, drawStill, reducedMotion]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Stop the music when the demo scrolls away or the tab is hidden.
  useEffect(() => {
    if ((!inView || hidden) && playing) {
      audioRef.current?.stop();
      setPlaying(false);
    }
  }, [inView, hidden, playing]);

  useEffect(() => () => audioRef.current?.dispose(), []);

  useEffect(() => {
    live.current.scene = getScene(sceneId);
    live.current.pulse = reducedMotion ? 0 : 1;
    if (reducedMotion) drawStill();
  }, [sceneId, reducedMotion, drawStill]);

  useEffect(() => {
    live.current.target = gravity / 100;
    if (reducedMotion) drawStill();
  }, [gravity, reducedMotion, drawStill]);

  // The animation loop: only while visible and motion is allowed.
  useEffect(() => {
    if (reducedMotion || !inView || hidden) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const state = live.current;
      const audio = audioRef.current;
      const levels = state.playing && audio ? audio.levels() : idle;
      if (state.playing && audio) {
        state.time = 4 + audio.position;
      } else {
        state.time += dt * 0.35;
      }
      const ease = 1 - Math.exp(-dt * 14);
      for (const id of Object.keys(levels) as StemId[]) {
        state.stems[id] += (levels[id] - state.stems[id]) * ease;
      }
      state.gravity += (state.target - state.gravity) * (1 - Math.exp(-dt * 6));
      state.pulse *= Math.exp(-dt * 5);
      draw();

      for (const row of stemRows) {
        const meter = meterRefs.current[row.id];
        if (meter) meter.style.transform = `scaleX(${state.stems[row.id].toFixed(3)})`;
      }
      const beat = state.playing ? Math.floor(((state.time - 4) * 120) / 60) % 4 : -1;
      beatRefs.current.forEach((dot, i) => {
        if (dot) dot.style.opacity = i === beat ? '1' : '0.25';
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reducedMotion, inView, hidden, draw]);

  async function togglePlay() {
    if (playing) {
      audioRef.current?.stop();
      setPlaying(false);
      return;
    }
    if (!audioRef.current) {
      audioRef.current = new OrbitAudio();
      audioRef.current.setMuted(muted);
    }
    await audioRef.current.start();
    setPlaying(true);
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    audioRef.current?.setMuted(next);
  }

  const scene = demoScenes.find((s) => s.id === sceneId)!;

  return (
    <div
      ref={rootRef}
      className='@container relative h-full w-full select-none overflow-hidden'
      style={{ background: palette.stage, color: palette.bone }}
    >
      <style>{rangeCss}</style>
      <canvas
        ref={canvasRef}
        aria-hidden
        className='absolute inset-0 h-full w-full'
      />
      <p className='sr-only'>
        Four orbits drawn from four stems: the kick drives the core, the bass
        the rings, the pads the dust and the vocal the satellite. Gravity pulls
        every orbit inward.
      </p>

      <div className='pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 @min-[640px]:p-6'>
        <div>
          <div
            className='text-[22px] leading-none @min-[640px]:text-[30px]'
            style={{ fontWeight: 700, fontStretch: '75%', letterSpacing: '0.01em' }}
          >
            LOW ORBIT
          </div>
          <div
            className='mt-2 hidden text-[11px] uppercase leading-4 @min-[480px]:block'
            style={{ fontFamily: 'var(--fg-font-pixel)', color: palette.ash }}
          >
            Show system 3.2 · Browser demo
          </div>
        </div>
        <div
          className='text-right text-[11px] uppercase leading-4'
          style={{ fontFamily: 'var(--fg-font-pixel)' }}
        >
          <div className='flex items-center justify-end gap-2'>
            <span>120 BPM</span>
            <span className='flex gap-1' aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  ref={(el) => {
                    beatRefs.current[i] = el;
                  }}
                  className='block h-[6px] w-[6px]'
                  style={{ background: palette.infrared, opacity: 0.25 }}
                />
              ))}
            </span>
          </div>
          <div className='mt-1 whitespace-nowrap' style={{ color: palette.ash }}>
            Scene {scene.number} {scene.name}
          </div>
        </div>
      </div>

      <div
        className='pointer-events-none absolute bottom-[104px] left-6 hidden w-[200px] @min-[720px]:block'
        aria-hidden
      >
        {stemRows.map((row) => (
          <div key={row.id} className='mb-3 last:mb-0'>
            <div
              className='mb-[5px] flex justify-between text-[11px] uppercase leading-4'
              style={{ fontFamily: 'var(--fg-font-pixel)' }}
            >
              <span>{row.label}</span>
              <span style={{ color: palette.ash }}>→ {row.drives}</span>
            </div>
            <div className='h-[3px] w-full' style={{ background: palette.smoke }}>
              <span
                ref={(el) => {
                  meterRefs.current[row.id] = el;
                }}
                className='block h-full w-full origin-left'
                style={{ background: palette.infrared, transform: 'scaleX(0.1)' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className='absolute inset-x-0 bottom-0 p-3 @min-[640px]:p-5'>
        <div
          className='flex flex-wrap items-center gap-x-2 gap-y-2 rounded-[14px] p-2.5 @min-[640px]:flex-nowrap @min-[640px]:gap-4 @min-[640px]:p-3 @min-[640px]:px-4'
          style={{
            background: 'rgba(14,14,18,0.78)',
            boxShadow: 'inset 0 0 0 1px rgba(237,230,218,0.09)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <button
            type='button'
            onClick={togglePlay}
            className={`flex h-10 min-w-[84px] items-center justify-center gap-2 rounded-[10px] px-3.5 text-[14px] font-semibold @min-[640px]:min-w-[92px] ${focusRing}`}
            style={{
              background: playing ? palette.infrared : palette.bone,
              color: palette.stage
            }}
          >
            <span aria-hidden className='inline-block w-3'>
              {playing ? (
                <svg viewBox='0 0 12 12' width='12' height='12'>
                  <rect x='1' y='1' width='3.5' height='10' fill='currentColor' />
                  <rect x='7.5' y='1' width='3.5' height='10' fill='currentColor' />
                </svg>
              ) : (
                <svg viewBox='0 0 12 12' width='12' height='12'>
                  <path d='M2 1l9 5-9 5z' fill='currentColor' />
                </svg>
              )}
            </span>
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            type='button'
            onClick={toggleMute}
            aria-pressed={muted}
            className={`flex h-10 items-center gap-1.5 rounded-[10px] px-2.5 text-[11px] uppercase @min-[640px]:px-3 ${focusRing}`}
            style={{
              fontFamily: 'var(--fg-font-pixel)',
              background: muted ? 'rgba(255,45,85,0.16)' : 'transparent',
              boxShadow: muted
                ? 'inset 0 0 0 1px rgba(255,45,85,0.6)'
                : 'inset 0 0 0 1px rgba(237,230,218,0.18)',
              color: muted ? palette.infrared : palette.bone
            }}
          >
            <svg aria-hidden viewBox='0 0 14 12' width='14' height='12'>
              <path d='M1 4h3l4-3v10L4 8H1z' fill='currentColor' />
              {muted ? (
                <path d='M10 3.5l3.5 5M13.5 3.5L10 8.5' stroke='currentColor' strokeWidth='1.4' />
              ) : (
                <path d='M10 3.5q2 2.5 0 5' stroke='currentColor' strokeWidth='1.4' fill='none' />
              )}
            </svg>
            Mute
          </button>

          <div
            role='group'
            aria-label='Scene'
            className='flex gap-1 @min-[640px]:ml-1'
          >
            {demoScenes.map((s) => {
              const active = s.id === sceneId;
              return (
                <button
                  key={s.id}
                  type='button'
                  onClick={() => setSceneId(s.id)}
                  aria-pressed={active}
                  aria-label={`Scene ${s.number}, ${s.name}`}
                  className={`h-10 rounded-[10px] px-2.5 text-[11px] uppercase @min-[640px]:px-3 ${focusRing}`}
                  style={{
                    fontFamily: 'var(--fg-font-pixel)',
                    background: active ? 'rgba(255,45,85,0.16)' : 'transparent',
                    color: active ? palette.infrared : palette.bone,
                    boxShadow: active
                      ? 'inset 0 0 0 1px rgba(255,45,85,0.6)'
                      : 'inset 0 0 0 1px rgba(237,230,218,0.12)'
                  }}
                >
                  {s.number}
                  <span className='hidden @min-[860px]:inline'> {s.name}</span>
                </button>
              );
            })}
          </div>

          <label className='flex min-w-[220px] flex-1 items-center gap-3 px-1 @min-[640px]:ml-auto @min-[640px]:max-w-[360px] @min-[640px]:px-0'>
            <span
              className='text-[11px] uppercase'
              style={{ fontFamily: 'var(--fg-font-pixel)' }}
            >
              Gravity
            </span>
            <input
              type='range'
              min={0}
              max={100}
              value={gravity}
              onChange={(e) => setGravity(Number(e.target.value))}
              aria-valuetext={`${gravity} percent`}
              className={`lo-range h-10 flex-1 cursor-pointer bg-transparent ${focusRing}`}
            />
            <span
              className='w-9 text-right text-[11px] tabular-nums'
              style={{ fontFamily: 'var(--fg-font-pixel)' }}
              aria-hidden
            >
              {gravity}%
            </span>
          </label>
        </div>
      </div>

      <p aria-live='polite' className='sr-only'>
        {playing ? `Playing, scene ${scene.name}` : 'Paused'}
        {muted ? ', muted' : ''}
      </p>

      {!playing && (
        <div
          className='pointer-events-none absolute bottom-[104px] right-6 hidden max-w-[320px] text-right text-[11px] uppercase leading-4 @min-[640px]:block'
          style={{ fontFamily: 'var(--fg-font-pixel)', color: palette.ash }}
          aria-hidden
        >
          Press play. The loop is synthesised in your browser
        </div>
      )}
    </div>
  );
}
