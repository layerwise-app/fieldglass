import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { fontsReady } from './Poster';
import { PlanIcon } from './PlanIcon';
import {
  PAPER,
  POSTER_H,
  POSTER_W,
  buildField,
  drawPoster,
  inkPair,
  inkPairs,
  plan,
  type FieldDrawing,
  type PosterSpec
} from './system';

const INK = '#1D211E';
const MUTED = '#5B605B';
const RULE = 'rgba(29,33,30,0.16)';
const STAGE = '#E6E2D8';

export const demoPlans = ['enfilade', 'long-gallery', 'pavilion'] as const;

export const defaultSpec: PosterSpec = {
  planId: 'enfilade',
  seed: 207,
  density: 20,
  drift: 0.4,
  inkId: 'burgundy-aqua',
  title: 'Weather Inside',
  artists: 'Ines Calder',
  dates: '06.12 — 25.01.2026',
  number: 'No. 07',
  layer: 'both'
};

type Layer = NonNullable<PosterSpec['layer']>;

const label: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: MUTED
};

function slug(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'poster'
  );
}

/**
 * The Veld generator: the same tool the comms team uses, with the
 * exhibition's plan, three field controls and the season's inks.
 */
export default function VeldGenerator({
  initial = defaultSpec
}: {
  initial?: PosterSpec;
}) {
  const id = useId();
  const [spec, setSpec] = useState<PosterSpec>(initial);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const cache = useRef<{ key: string; drawing: FieldDrawing } | null>(null);
  const update = (patch: Partial<PosterSpec>) =>
    setSpec((current) => ({ ...current, ...patch }));

  // Fit the poster to the stage.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const rect = stage.getBoundingClientRect();
      const pad = rect.width < 420 ? 16 : 32;
      const maxW = rect.width - pad * 2;
      const maxH = rect.height - pad * 2;
      const h = Math.min(maxH, (maxW * POSTER_H) / POSTER_W);
      const w = (h * POSTER_W) / POSTER_H;
      if (w > 0 && h > 0) setSize({ w: Math.floor(w), h: Math.floor(h) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const fieldKey = `${spec.planId}|${spec.seed}|${spec.drift}|${spec.density}`;

  // Draw a quick pass right away, then a full-resolution pass when idle.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const draw = (cols: number) => {
      if (cancelled) return;
      const key = `${fieldKey}|${cols}`;
      if (cache.current?.key !== key) {
        cache.current = { key, drawing: buildField(spec, cols) };
      }
      const ctx = canvas.getContext('2d');
      if (ctx) drawPoster(ctx, canvas.width, canvas.height, spec, cache.current.drawing);
    };
    const frame = requestAnimationFrame(() => {
      draw(cache.current?.key === `${fieldKey}|150` ? 150 : 96);
      timer = setTimeout(() => draw(150), 160);
    });
    fontsReady().then(() => {
      if (!cancelled) draw(cache.current?.key.endsWith('|150') ? 150 : 96);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
    };
  }, [spec, size, fieldKey]);

  const dpr = typeof window === 'undefined' ? 2 : Math.min(window.devicePixelRatio || 1, 2);
  const inks = inkPair(spec.inkId);
  const planName = plan(spec.planId).name;

  async function download() {
    const canvas = document.createElement('canvas');
    canvas.width = 2480;
    canvas.height = Math.round((2480 * POSTER_H) / POSTER_W);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    await fontsReady();
    drawPoster(ctx, canvas.width, canvas.height, spec, buildField(spec, 220));
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `veld-${slug(spec.title)}-${spec.layer === 'both' ? 'print' : spec.layer === 'a' ? 'master-1' : 'master-2'}.png`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }

  const posterLabel = useMemo(
    () =>
      `Poster preview: ${spec.title || 'Untitled'}, ${planName} plan, ${Math.round(spec.density)} contour lines, drift ${Math.round(spec.drift * 100)}, ${inks.a.name} and ${inks.b.name}${spec.layer === 'a' ? ', master 1 only' : spec.layer === 'b' ? ', master 2 only' : ''}.`,
    [spec, planName, inks]
  );

  return (
    <div
      className='@container'
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: PAPER,
        color: INK,
        fontFamily: 'var(--fg-font-sans)',
        overflow: 'hidden'
      }}
    >
      <style>
        {
          '.veld-choice:has(input:focus-visible){outline:2px solid var(--fg-accent,#F24E10);outline-offset:2px;z-index:1}'
        }
      </style>
      <div className='flex h-full flex-col @3xl:flex-row'>
        {/* Stage */}
        <div
          ref={stageRef}
          className='relative order-1 min-h-0 flex-1 @3xl:order-2'
          style={{ background: STAGE }}
        >
          <div
            className='absolute inset-0 flex items-center justify-center'
            style={{ pointerEvents: 'none' }}
          >
            {size && (
              <canvas
                ref={canvasRef}
                width={Math.round(size.w * dpr)}
                height={Math.round(size.h * dpr)}
                role='img'
                aria-label={posterLabel}
                style={{
                  width: size.w,
                  height: size.h,
                  boxShadow:
                    '0 1px 2px rgba(29,33,30,.12), 0 18px 40px -18px rgba(29,33,30,.35)'
                }}
              />
            )}
          </div>
          <div
            className='absolute top-3 right-3 left-3 hidden items-center justify-between @3xl:flex'
            style={{ ...label, fontSize: 10.5 }}
          >
            <span>A2 · 420 × 594 mm</span>
            <span>
              {spec.number} · {spec.dates}
            </span>
          </div>
        </div>

        {/* Controls */}
        <form
          className='order-2 grid shrink-0 grid-cols-2 content-start gap-x-3 gap-y-2.5 overflow-hidden p-3 @3xl:order-1 @3xl:w-[300px] @3xl:grid-cols-1 @3xl:gap-y-5 @3xl:border-r @3xl:p-6'
          style={{ borderColor: RULE }}
          onSubmit={(event) => event.preventDefault()}
        >
          <div className='col-span-2 hidden items-baseline justify-between @3xl:col-span-1 @3xl:flex'>
            <span
              style={{
                fontWeight: 700,
                fontStretch: '75%',
                fontSize: 26,
                letterSpacing: '-0.01em',
                lineHeight: 1
              }}
            >
              VELD
            </span>
            <span style={label}>Generator</span>
          </div>

          <label className='col-span-2 flex flex-col gap-1 @3xl:col-span-1'>
            <span style={label}>Exhibition title</span>
            <input
              type='text'
              value={spec.title}
              maxLength={42}
              onChange={(event) => update({ title: event.target.value })}
              style={{
                height: 34,
                padding: '0 10px',
                border: `1px solid ${RULE}`,
                background: '#fff',
                fontSize: 14,
                fontWeight: 500,
                color: INK,
                borderRadius: 2
              }}
            />
          </label>

          <fieldset className='col-span-2 m-0 min-w-0 border-0 p-0 @3xl:col-span-1'>
            <legend className='mb-1' style={label}>
              Floor plan
            </legend>
            <div className='grid grid-cols-3 gap-1.5'>
              {demoPlans.map((planId) => {
                const checked = spec.planId === planId;
                return (
                  <label
                    key={planId}
                    className='veld-choice relative flex cursor-pointer flex-col items-center gap-1 py-1.5 @3xl:py-2.5'
                    style={{
                      border: `1px solid ${checked ? INK : RULE}`,
                      background: checked ? '#fff' : 'transparent',
                      borderRadius: 2,
                      color: checked ? INK : MUTED
                    }}
                  >
                    <input
                      type='radio'
                      name={`${id}-plan`}
                      value={planId}
                      checked={checked}
                      onChange={() => update({ planId })}
                      className='absolute inset-0 cursor-pointer opacity-0'
                    />
                    <PlanIcon planId={planId} size={30} weight={1.6} />
                    <span
                      className='hidden @3xl:block'
                      style={{ fontSize: 11.5, fontWeight: 500 }}
                    >
                      {plan(planId).name}
                    </span>
                    <span className='sr-only'>{plan(planId).name}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <Slider
            label='Density'
            value={spec.density}
            min={8}
            max={32}
            display={`${Math.round(spec.density)} lines`}
            onChange={(density) => update({ density })}
          />
          <Slider
            label='Drift'
            value={Math.round(spec.drift * 100)}
            min={0}
            max={100}
            display={`${Math.round(spec.drift * 100)}`}
            onChange={(drift) => update({ drift: drift / 100 })}
          />

          <div className='flex items-end gap-2 @3xl:justify-between'>
            <div className='hidden flex-col gap-1 @3xl:flex'>
              <span style={label}>Seed</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {String(spec.seed).padStart(4, '0')}
              </span>
            </div>
            <button
              type='button'
              onClick={() =>
                update({ seed: 1 + Math.floor(Math.random() * 998) })
              }
              aria-label={`New seed, current seed ${spec.seed}`}
              style={{
                height: 32,
                padding: '0 12px',
                border: `1px solid ${INK}`,
                background: 'transparent',
                fontSize: 12.5,
                fontWeight: 600,
                color: INK,
                borderRadius: 2,
                whiteSpace: 'nowrap'
              }}
            >
              New seed
            </button>
          </div>

          <fieldset className='m-0 min-w-0 border-0 p-0'>
            <legend className='mb-1' style={label}>
              <span className='@3xl:hidden'>Inks</span>
              <span className='hidden @3xl:inline'>Season inks</span>
            </legend>
            <div className='flex gap-1.5 @3xl:flex-col'>
              {inkPairs.map((pair) => {
                const checked = spec.inkId === pair.id;
                return (
                  <label
                    key={pair.id}
                    className='veld-choice relative flex cursor-pointer items-center gap-2 p-1 @3xl:px-2 @3xl:py-1.5'
                    style={{
                      border: `1px solid ${checked ? INK : RULE}`,
                      background: checked ? '#fff' : 'transparent',
                      borderRadius: 2
                    }}
                  >
                    <input
                      type='radio'
                      name={`${id}-ink`}
                      value={pair.id}
                      checked={checked}
                      onChange={() => update({ inkId: pair.id })}
                      className='absolute inset-0 cursor-pointer opacity-0'
                    />
                    <span className='flex' aria-hidden>
                      <span
                        style={{ width: 12, height: 18, background: pair.a.hex }}
                      />
                      <span
                        style={{ width: 12, height: 18, background: pair.b.hex }}
                      />
                    </span>
                    <span
                      className='hidden @3xl:inline'
                      style={{ fontSize: 12, fontWeight: 500 }}
                    >
                      {pair.a.name} + {pair.b.name}
                    </span>
                    <span className='sr-only'>
                      {pair.a.name} and {pair.b.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className='m-0 min-w-0 border-0 p-0'>
            <legend className='sr-only'>Show</legend>
            <div
              className='flex'
              style={{ border: `1px solid ${RULE}`, borderRadius: 2 }}
            >
              {(
                [
                  ['both', 'Print'],
                  ['a', 'M1'],
                  ['b', 'M2']
                ] as [Layer, string][]
              ).map(([value, text]) => {
                const checked = spec.layer === value;
                return (
                  <label
                    key={value}
                    className='veld-choice relative flex h-8 flex-1 cursor-pointer items-center justify-center'
                    style={{
                      background: checked ? INK : 'transparent',
                      color: checked ? PAPER : INK,
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    <input
                      type='radio'
                      name={`${id}-layer`}
                      value={value}
                      checked={checked}
                      onChange={() => update({ layer: value })}
                      className='absolute inset-0 cursor-pointer opacity-0'
                    />
                    <span aria-hidden>{text}</span>
                    <span className='sr-only'>
                      {value === 'both'
                        ? 'Both inks'
                        : value === 'a'
                          ? 'Master 1 only'
                          : 'Master 2 only'}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button
            type='button'
            onClick={download}
            style={{
              height: 32,
              background: INK,
              color: PAPER,
              fontSize: 12.5,
              fontWeight: 600,
              borderRadius: 2,
              border: 0
            }}
          >
            <span className='@3xl:hidden'>PNG</span>
            <span className='hidden @3xl:inline'>Download PNG</span>
          </button>

          <p
            className='hidden @3xl:block'
            style={{ fontSize: 12, lineHeight: 1.45, color: MUTED, margin: 0 }}
          >
            Typeface, grid, margins and the wordmark are locked. The plan,
            three numbers and the season’s inks are yours.
          </p>
        </form>
      </div>
    </div>
  );
}

function Slider({
  label: text,
  value,
  min,
  max,
  display,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className='flex min-w-0 flex-col gap-1'>
      <span className='flex justify-between' style={label}>
        <span>{text}</span>
        <span style={{ color: INK, fontVariantNumeric: 'tabular-nums' }}>
          {display}
        </span>
      </span>
      <input
        type='range'
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ accentColor: INK, width: '100%', height: 18, margin: 0 }}
      />
    </label>
  );
}
