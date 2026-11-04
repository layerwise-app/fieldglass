import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useInView, useReducedMotion } from '~/lib/hooks';
import { ratios, take } from './copy';
import { lt } from './palette';
import { CoastRoad } from './scenes';

/*
 * The take viewer from longtake.be: six stills from one shot, a mask that
 * shows how each release cropped it, and a timecode scrubber.
 */

const NATIVE = take.native;
const frames = take.frames;
const STEP_MS = 2200;

export function TakeViewer({
  initialFrame = 0,
  initialRatio = NATIVE
}: {
  initialFrame?: number;
  initialRatio?: number;
}) {
  const [index, setIndex] = useState(initialFrame);
  const [ratio, setRatio] = useState<number>(initialRatio);
  const [playing, setPlaying] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root);
  const reducedMotion = useReducedMotion();
  const group = useId();

  const frame = frames[index]!;
  const ratioInfo = ratios.find((r) => r.value === ratio) ?? ratios[0];
  // How much of the 1.37 frame each matte bar covers, top and bottom.
  const matte = (1 - NATIVE / ratio) / 2;
  const ease = reducedMotion ? 'none' : 'transform 520ms cubic-bezier(0.16, 1, 0.3, 1)';

  const step = useCallback((delta: number) => {
    setIndex((i) => Math.min(frames.length - 1, Math.max(0, i + delta)));
  }, []);

  useEffect(() => {
    if (!playing || !inView) return;
    const tick = () => {
      if (document.hidden) return;
      setIndex((i) => (i + 1) % frames.length);
    };
    const timer = window.setInterval(tick, STEP_MS);
    return () => window.clearInterval(timer);
  }, [playing, inView]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target instanceof HTMLInputElement) return; // radios and the range handle their own arrows
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setIndex(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setIndex(frames.length - 1);
    }
  }

  const focus =
    'focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EFE8DA]';
  const button = `inline-flex h-9 min-w-9 items-center justify-center rounded-[3px] border border-[#4a423d] px-2.5 text-[#EFE8DA] transition-colors hover:border-[#EFE8DA] aria-disabled:cursor-default aria-disabled:opacity-35 aria-disabled:hover:border-[#4a423d] ${focus}`;

  return (
    <div
      ref={root}
      onKeyDown={onKeyDown}
      className='@container absolute inset-0 flex flex-col gap-3 overflow-hidden p-3 @2xl:gap-4 @2xl:p-6'
      style={{ background: lt.screen, color: lt.paper, fontFamily: 'var(--fg-font-sans)' }}
    >
      {/* Credit and aspect ratio. */}
      <div className='flex flex-col gap-2.5 @xl:flex-row @xl:items-center @xl:justify-between'>
        <div className='flex min-w-0 items-baseline gap-3'>
          <span className='shrink-0 text-[11px] tracking-[0.06em]' style={{ fontFamily: 'var(--fg-font-pixel)' }}>
            TAKE 01
          </span>
          <span
            className='truncate text-[12px] uppercase @2xl:text-[14px]'
            style={{ fontStretch: '75%', fontWeight: 600, letterSpacing: '0.04em' }}
          >
            {take.film} — {take.director}, {take.year} — final shot, {take.length}
          </span>
        </div>
        <fieldset className='flex shrink-0'>
          <legend className='sr-only'>Aspect ratio</legend>
          <div className='grid w-full grid-cols-3 rounded-[4px] border border-[#4a423d] p-0.5 @xl:w-auto'>
            {ratios.map((r) => {
              const checked = r.value === ratio;
              return (
                <label
                  key={r.value}
                  className={`relative cursor-pointer rounded-[2px] px-3 py-1.5 text-center has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-[#EFE8DA] ${checked ? 'bg-[#EFE8DA] text-[#1A1714]' : 'text-[#c9bfb0] hover:text-[#EFE8DA]'}`}
                >
                  <input
                    type='radio'
                    name={group}
                    value={r.value}
                    checked={checked}
                    onChange={() => setRatio(r.value)}
                    className='sr-only'
                  />
                  <span className='block text-[12px] leading-none' style={{ fontFamily: 'var(--fg-font-pixel)' }}>
                    {r.value.toFixed(2)}
                  </span>
                  <span
                    className='mt-1 hidden text-[10px] uppercase leading-none @lg:block'
                    style={{ fontStretch: '75%', fontWeight: 600, letterSpacing: '0.05em' }}
                  >
                    {r.name}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className='flex min-h-0 flex-1 flex-col gap-3 @3xl:flex-row @3xl:gap-6'>
        {/* The frame. */}
        <div
          className={`relative min-h-0 flex-1 ${focus} rounded-[2px]`}
          style={{ containerType: 'size' }}
          tabIndex={0}
          role='group'
          aria-roledescription='take viewer'
          aria-label={`Frame ${index + 1} of ${frames.length}, ${frame.rel} into the take, masked to ${ratio.toFixed(2)} to 1. Use the left and right arrow keys to step through the take.`}
        >
          <div
            className='absolute inset-0 m-auto overflow-hidden'
            style={{
              width: `min(100cqw, calc(100cqh * ${NATIVE}))`,
              height: `min(100cqh, calc(100cqw / ${NATIVE}))`
            }}
          >
            {frames.map((f, i) => (
              <div
                key={f.tc}
                className='absolute inset-0'
                style={{
                  opacity: i === index ? 1 : 0,
                  transition: reducedMotion ? 'none' : 'opacity 600ms ease'
                }}
                aria-hidden
              >
                <CoastRoad t={f.t} />
              </div>
            ))}
            <div
              className='absolute inset-x-0 top-[-2px] h-[calc(50%+2px)] origin-top'
              style={{ background: lt.screen, transform: `scaleY(${matte * 2})`, transition: ease }}
            />
            <div
              className='absolute inset-x-0 bottom-[-2px] h-[calc(50%+2px)] origin-bottom'
              style={{ background: lt.screen, transform: `scaleY(${matte * 2})`, transition: ease }}
            />
            <div className='pointer-events-none absolute inset-0' style={{ transform: `translateY(${matte * 100}%)`, transition: ease }}>
              <span className='absolute left-0 top-0 h-3.5 w-3.5 border-l border-t border-[#EFE8DA]/70' />
              <span className='absolute right-0 top-0 h-3.5 w-3.5 border-r border-t border-[#EFE8DA]/70' />
            </div>
            <div className='pointer-events-none absolute inset-0' style={{ transform: `translateY(${-matte * 100}%)`, transition: ease }}>
              <span className='absolute bottom-0 left-0 h-3.5 w-3.5 border-b border-l border-[#EFE8DA]/70' />
              <span className='absolute bottom-0 right-0 h-3.5 w-3.5 border-b border-r border-[#EFE8DA]/70' />
              <span
                className='absolute bottom-2 right-3 text-[10px] text-[#EFE8DA]/85'
                style={{ fontFamily: 'var(--fg-font-pixel)' }}
              >
                {ratio.toFixed(2)}:1
              </span>
            </div>
          </div>
        </div>

        {/* What we're looking at. */}
        <div className='flex shrink-0 flex-col gap-1.5 @3xl:w-[290px] @3xl:gap-3 @3xl:pt-1' aria-live='polite'>
          <div className='flex items-baseline gap-3'>
            <span className='text-[13px] text-[#e7b0a6] @3xl:text-[22px]' style={{ fontFamily: 'var(--fg-font-pixel)' }}>
              +{frame.rel}
            </span>
            <span className='text-[11px] text-[#a39a8b] @3xl:text-[12px]' style={{ fontFamily: 'var(--fg-font-pixel)' }}>
              TC {frame.tc}
            </span>
          </div>
          <p className='line-clamp-2 text-[15px] leading-[1.3] @3xl:line-clamp-none @3xl:text-[22px] @3xl:leading-[1.25]' style={{ fontFamily: 'var(--fg-font-serif)' }}>
            {frame.caption}
          </p>
          <div className='mt-auto hidden border-t border-[#3a3330] pt-3 @3xl:block'>
            <div
              className='text-[11px] uppercase text-[#a39a8b]'
              style={{ fontStretch: '75%', fontWeight: 600, letterSpacing: '0.05em' }}
            >
              {ratioInfo.value.toFixed(2)}:1 — {ratioInfo.name}
            </div>
            <p className='mt-1.5 text-[15px] leading-[1.35] text-[#d8cfc1]' style={{ fontFamily: 'var(--fg-font-serif)', fontStyle: 'italic' }}>
              {ratioInfo.note}
            </p>
          </div>
        </div>
      </div>

      {/* Scrubber, transport and filmstrip. */}
      <div className='flex shrink-0 flex-col gap-3'>
        <div className='flex items-center gap-2 @2xl:gap-3'>
          <button type='button' className={button} onClick={() => step(-1)} aria-disabled={index === 0} aria-label='Previous frame'>
            <svg width='14' height='14' viewBox='0 0 14 14' aria-hidden>
              <path d='M9 2 L4 7 L9 12' stroke='currentColor' strokeWidth='1.6' fill='none' />
            </svg>
          </button>
          <button
            type='button'
            className={`${button} gap-2`}
            onClick={() => setPlaying((p) => !p)}
            aria-pressed={playing}
            aria-label={playing ? 'Pause the take' : 'Play the take'}
          >
            {playing ? (
              <svg width='12' height='12' viewBox='0 0 12 12' aria-hidden>
                <rect x='2' y='1.5' width='2.6' height='9' fill='currentColor' />
                <rect x='7.4' y='1.5' width='2.6' height='9' fill='currentColor' />
              </svg>
            ) : (
              <svg width='12' height='12' viewBox='0 0 12 12' aria-hidden>
                <path d='M3 1.5 L10.5 6 L3 10.5 Z' fill='currentColor' />
              </svg>
            )}
            <span className='hidden text-[11px] @md:inline' style={{ fontFamily: 'var(--fg-font-pixel)' }}>
              {playing ? 'PAUSE' : 'PLAY'}
            </span>
          </button>
          <button type='button' className={button} onClick={() => step(1)} aria-disabled={index === frames.length - 1} aria-label='Next frame'>
            <svg width='14' height='14' viewBox='0 0 14 14' aria-hidden>
              <path d='M5 2 L10 7 L5 12' stroke='currentColor' strokeWidth='1.6' fill='none' />
            </svg>
          </button>
          <label className='flex min-w-0 flex-1 items-center gap-3'>
            <span className='sr-only'>Timecode</span>
            <input
              type='range'
              min={0}
              max={frames.length - 1}
              step={1}
              value={index}
              onChange={(e) => setIndex(Number(e.target.value))}
              aria-valuetext={`Frame ${index + 1} of ${frames.length}, ${frame.rel} into the take`}
              className={`h-9 w-full min-w-0 cursor-pointer accent-[#EFE8DA] ${focus}`}
            />
          </label>
          <span className='hidden shrink-0 text-[11px] text-[#a39a8b] @md:inline' style={{ fontFamily: 'var(--fg-font-pixel)' }}>
            {String(index + 1).padStart(2, '0')} / {String(frames.length).padStart(2, '0')}
          </span>
        </div>
        <div className='hidden grid-cols-6 gap-2 @4xl:grid'>
          {frames.map((f, i) => (
            <button
              key={f.tc}
              type='button'
              onClick={() => setIndex(i)}
              aria-label={`Frame ${i + 1}, ${f.rel} into the take`}
              aria-current={i === index ? 'true' : undefined}
              className={`group text-left ${focus} rounded-[2px]`}
            >
              <span
                className={`block overflow-hidden rounded-[2px] transition-opacity ${i === index ? 'opacity-100 ring-1 ring-[#EFE8DA]' : 'opacity-50 group-hover:opacity-80'}`}
                style={{ aspectRatio: '1.85' }}
              >
                <CoastRoad t={f.t} grain={false} />
              </span>
              <span
                className={`mt-1.5 block text-[10px] ${i === index ? 'text-[#EFE8DA]' : 'text-[#a39a8b]'}`}
                style={{ fontFamily: 'var(--fg-font-pixel)' }}
              >
                +{f.rel}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LongTakeDemo() {
  return <TakeViewer />;
}
