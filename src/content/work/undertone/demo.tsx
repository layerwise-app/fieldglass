import { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from '~/lib/hooks';
import {
  MINUTES,
  anomalies,
  clock,
  formatFlow,
  formatLevel,
  formatSalinity,
  getSeries,
  palette,
  stamp,
  stations
} from './data';
import { Sonifier, voiceAt } from './sound';
import { HourLabels, LaneWave, Wordmark } from './ui';

type Speed = 60 | 600;

/**
 * The Undertone listening view for one night: press play to hear three
 * stations as soft drones; anything that leaves normal turns off-key.
 */
export default function UndertoneDemo({
  initialMinute = 876
}: {
  initialMinute?: number;
}) {
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root);
  const [minute, setMinute] = useState(initialMinute);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(60);
  const [muted, setMuted] = useState([false, false, false]);
  const [audioFailed, setAudioFailed] = useState(false);

  const minuteRef = useRef(initialMinute);
  const mutedRef = useRef(muted);
  const speedRef = useRef<Speed>(speed);
  const heads = useRef<(HTMLDivElement | null)[]>([]);
  const engine = useRef<Sonifier | null>(null);

  mutedRef.current = muted;
  speedRef.current = speed;

  const placeHeads = (m: number) => {
    const pct = `${(m / (MINUTES - 1)) * 100}%`;
    heads.current.forEach((head) => {
      if (head) head.style.left = pct;
    });
  };

  // Advance the playhead while playing and on screen.
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    let shown = Math.floor(minuteRef.current);
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      let m = minuteRef.current + (dt * speedRef.current) / 60;
      if (m >= MINUTES - 1) {
        m = MINUTES - 1;
        setPlaying(false);
      }
      minuteRef.current = m;
      placeHeads(m);
      engine.current?.update(m, mutedRef.current);
      if (Math.floor(m) !== shown) {
        shown = Math.floor(m);
        setMinute(shown);
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
    // The loop reads speed, mute and position from refs; only playing restarts it.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [playing]);

  // Stop when the demo scrolls away or the tab is hidden.
  useEffect(() => {
    if (!inView) setPlaying(false);
  }, [inView]);
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  useEffect(() => {
    if (!playing) void engine.current?.stop();
  }, [playing]);

  useEffect(
    () => () => {
      engine.current?.close();
      engine.current = null;
    },
    []
  );

  async function togglePlay() {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (minuteRef.current >= MINUTES - 2) {
      minuteRef.current = 0;
      setMinute(0);
      placeHeads(0);
    }
    try {
      engine.current ??= new Sonifier();
      engine.current.update(minuteRef.current, mutedRef.current);
      await engine.current.start();
    } catch {
      setAudioFailed(true);
    }
    setPlaying(true);
  }

  function seek(m: number) {
    const clamped = Math.max(0, Math.min(MINUTES - 1, m));
    minuteRef.current = clamped;
    setMinute(Math.floor(clamped));
    placeHeads(clamped);
    if (playing) engine.current?.update(clamped, mutedRef.current);
  }

  function toggleMute(index: number) {
    setMuted((current) => current.map((v, i) => (i === index ? !v : v)));
  }

  const active = anomalies.filter((a) => minute >= a.start && minute <= a.end);
  // The most recent one leads; the readouts highlight it.
  const current = active[active.length - 1];
  const series = getSeries();
  const nextAnomaly =
    anomalies.find((a) => a.start > minute + 1) ?? anomalies[0]!;

  const status = active.length
    ? `${clock(minute)} · ${active
        .map((a) => `${stations[a.lane]!.name}: ${a.title.toLowerCase()}`)
        .join('; ')}. Heard as ${active.length > 1 ? 'off-key drones' : 'an off-key drone'}, louder than the room tone.`
    : `${clock(minute)} · All three stations in tune. Room tone only.`;

  const tickMarks = useMemo(
    () =>
      anomalies.map((a) => ({
        id: a.id,
        left: `${(a.start / (MINUTES - 1)) * 100}%`,
        width: `${((a.end - a.start) / (MINUTES - 1)) * 100}%`
      })),
    []
  );

  const headLeft = `${(minute / (MINUTES - 1)) * 100}%`;

  return (
    <div
      ref={root}
      className='@container relative h-full w-full overflow-hidden'
      style={{
        background: palette.night,
        color: palette.text,
        fontFamily: 'var(--fg-font-sans)'
      }}
    >
      <div className='flex h-full flex-col'>
        {/* Top bar */}
        <div
          className='flex items-center gap-3 px-3 py-2.5 @2xl:gap-5 @2xl:px-6 @2xl:py-4'
          style={{ borderBottom: `1px solid ${palette.line}` }}
        >
          <div className='hidden @2xl:block'>
            <Wordmark size={16} />
          </div>
          <button
            type='button'
            onClick={togglePlay}
            className='inline-flex h-9 items-center gap-2 rounded-full pr-4 pl-3 text-[14px] font-semibold @2xl:hidden'
            style={{ background: palette.teal, color: palette.night }}
          >
            <PlayGlyph playing={playing} />
            {playing ? 'Pause' : 'Play'}
          </button>
          <span
            className='hidden @2xl:inline'
            style={{
              fontFamily: 'var(--fg-font-pixel)',
              fontSize: 11,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              color: palette.muted
            }}
          >
            Night of 14–15 Mar 2024 · Lage Delta · 3 of 31 stations
          </span>
          <div className='ml-auto flex items-center gap-3 @2xl:gap-5'>
            <div className='text-right' aria-hidden>
              <div
                style={{
                  fontFamily: 'var(--fg-font-pixel)',
                  fontSize: 22,
                  lineHeight: '22px',
                  color: current ? palette.amber : palette.text,
                  fontVariantNumeric: 'tabular-nums'
                }}
              >
                {clock(minute)}
              </div>
            </div>
            <div
              role='group'
              aria-label='Playback speed'
              className='flex rounded-full p-0.5'
              style={{ background: palette.raised }}
            >
              {([60, 600] as const).map((s) => (
                <button
                  key={s}
                  type='button'
                  aria-pressed={speed === s}
                  onClick={() => setSpeed(s)}
                  className='h-8 rounded-full px-3'
                  style={{
                    fontFamily: 'var(--fg-font-pixel)',
                    fontSize: 11,
                    background: speed === s ? palette.text : 'transparent',
                    color: speed === s ? palette.night : palette.muted
                  }}
                >
                  {s}×
                </button>
              ))}
            </div>
            <button
              type='button'
              onClick={togglePlay}
              className='hidden h-10 items-center gap-2 rounded-full pr-5 pl-4 text-[15px] font-semibold @2xl:inline-flex'
              style={{ background: palette.teal, color: palette.night }}
            >
              <PlayGlyph playing={playing} />
              {playing ? 'Pause' : 'Play the night'}
            </button>
          </div>
        </div>

        {/* Lanes */}
        <div className='flex min-h-0 flex-1 flex-col'>
          {stations.map((station, index) => {
            const s = series[index]!;
            const i = Math.round(minute);
            const v = voiceAt(index, minute);
            const off = v.cents > 4;
            return (
              <div
                key={station.id}
                className='grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-x-6 px-3 pt-2 pb-1.5 @2xl:grid-cols-[220px_1fr] @2xl:grid-rows-1 @2xl:px-6 @2xl:py-3'
                style={{ borderBottom: `1px solid ${palette.line}` }}
              >
                <div className='flex min-w-0 flex-col @max-2xl:flex-row @max-2xl:flex-wrap @max-2xl:items-center @max-2xl:gap-x-2'>
                  <div className='flex items-baseline gap-2 whitespace-nowrap @2xl:flex-col @2xl:gap-0.5'>
                    <span
                      style={{
                        fontFamily: 'var(--fg-font-pixel)',
                        fontSize: 11,
                        lineHeight: '14px',
                        color: palette.faint,
                        textTransform: 'uppercase'
                      }}
                    >
                      {station.code}
                      <span className='hidden @2xl:inline'> · {station.kind}</span>
                    </span>
                    <span className='text-[14px] leading-tight font-semibold @2xl:text-[17px]'>
                      {station.name}
                    </span>
                  </div>
                  <dl
                    className='mt-0 grid grid-cols-3 gap-x-3 @max-2xl:order-3 @max-2xl:w-full @2xl:mt-3 @2xl:grid-cols-1 @2xl:gap-y-0.5'
                    style={{
                      fontFamily: 'var(--fg-font-pixel)',
                      fontSize: 11,
                      lineHeight: '15px'
                    }}
                  >
                    <Reading
                      label='Level'
                      value={formatLevel(s.level[i]!)}
                      hot={current?.lane === index && current.signal === 'level'}
                    />
                    <Reading
                      label='Cl'
                      value={formatSalinity(s.salinity[i]!)}
                      hot={current?.lane === index && current.signal === 'salinity'}
                    />
                    <Reading
                      label='Flow'
                      value={formatFlow(s.flow[i]!)}
                      hot={current?.lane === index && current.signal === 'flow'}
                    />
                  </dl>
                  <div
                    className='hidden @2xl:mt-auto @2xl:block'
                    style={{
                      fontFamily: 'var(--fg-font-pixel)',
                      fontSize: 11,
                      lineHeight: '15px',
                      color: off ? palette.amber : palette.teal
                    }}
                  >
                    {station.note} drone · {off ? `+${Math.round(v.cents)} ct off-key` : 'in tune'}
                    <br />
                    <span style={{ color: palette.muted }}>
                      {(v.cutoff / 1000).toFixed(1)} kHz · {v.ticks.toFixed(1)} ticks/s
                    </span>
                  </div>
                  <button
                    type='button'
                    aria-pressed={muted[index]}
                    aria-label={`Mute ${station.name}`}
                    onClick={() => toggleMute(index)}
                    className='ml-auto h-7 rounded-full px-2.5 @2xl:hidden'
                    style={{
                      fontFamily: 'var(--fg-font-pixel)',
                      fontSize: 11,
                      border: `1px solid ${palette.line}`,
                      color: muted[index] ? palette.amber : palette.muted
                    }}
                  >
                    {muted[index] ? 'Muted' : 'Mute'}
                  </button>
                </div>
                <div className='relative min-h-0 @max-2xl:mt-1.5'>
                  <LaneWave index={index} muted={muted[index]} />
                  <div
                    ref={(el) => {
                      heads.current[index] = el;
                    }}
                    aria-hidden
                    className='pointer-events-none absolute top-0 bottom-0 w-px'
                    style={{ left: headLeft, background: palette.text }}
                  />
                  <button
                    type='button'
                    aria-pressed={muted[index]}
                    aria-label={`Mute ${station.name}`}
                    onClick={() => toggleMute(index)}
                    className='absolute top-0 right-0 hidden h-7 rounded-full px-2.5 @2xl:block'
                    style={{
                      fontFamily: 'var(--fg-font-pixel)',
                      fontSize: 11,
                      background: palette.night,
                      border: `1px solid ${palette.line}`,
                      color: muted[index] ? palette.amber : palette.muted
                    }}
                  >
                    {muted[index] ? 'Muted' : 'Mute'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className='grid gap-x-6 px-3 pt-2 pb-3 @2xl:grid-cols-[220px_1fr] @2xl:px-6 @2xl:pt-3 @2xl:pb-4'>
          <p
            aria-live='polite'
            className='hidden text-[13px] leading-[18px] @2xl:block'
            style={{ color: current ? palette.amber : palette.muted }}
          >
            {status}
          </p>
          <div>
            <div className='hidden @md:block'>
              <HourLabels />
            </div>
            <div className='@md:hidden'>
              <HourLabels every={360} />
            </div>
            <div className='relative mt-1'>
              <div aria-hidden className='pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2'>
                {tickMarks.map((t) => (
                  <span
                    key={t.id}
                    className='absolute top-0 h-full rounded-full'
                    style={{ left: t.left, width: t.width, background: palette.amber, opacity: 0.7 }}
                  />
                ))}
              </div>
              <input
                type='range'
                min={0}
                max={MINUTES - 1}
                step={1}
                value={minute}
                onChange={(e) => seek(Number(e.target.value))}
                aria-label='Time of night'
                aria-valuetext={stamp(minute)}
                className='relative block h-6 w-full cursor-pointer'
                style={{ accentColor: palette.teal }}
              />
            </div>
            <div className='mt-2 flex flex-wrap gap-1.5 @2xl:gap-2'>
              {anomalies.map((a) => {
                const on = active.some((x) => x.id === a.id);
                return (
                  <button
                    key={a.id}
                    type='button'
                    onClick={() => seek(a.start - 2)}
                    aria-label={`Jump to ${clock(a.start)}: ${a.title} at ${stations[a.lane]!.name}`}
                    aria-current={on ? 'true' : undefined}
                    className='inline-flex h-7 items-center gap-2 rounded-full px-2.5 text-[12px] @2xl:h-8 @2xl:px-3 @2xl:text-[13px]'
                    style={{
                      border: `1px solid ${on ? palette.amber : palette.line}`,
                      background: on ? palette.amberDeep : 'transparent',
                      color: on ? palette.text : palette.muted
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--fg-font-pixel)',
                        fontSize: 11,
                        color: palette.amber
                      }}
                    >
                      {clock(a.start)}
                    </span>
                    <span>
                      <span className='hidden @2xl:inline'>{stations[a.lane]!.name} · </span>
                      {a.title}
                    </span>
                  </button>
                );
              })}
              <button
                type='button'
                onClick={() => seek(nextAnomaly.start - 2)}
                className='ml-auto hidden h-8 items-center rounded-full px-3 text-[13px] @2xl:inline-flex'
                style={{ color: palette.muted }}
              >
                Next anomaly →
              </button>
            </div>
          </div>
        </div>
        {audioFailed && (
          <p className='sr-only' role='status'>
            Sound isn’t available in this browser; the waveform shows what you would hear.
          </p>
        )}
        <p className='sr-only @2xl:hidden' aria-live='polite'>
          {status}
        </p>
      </div>
    </div>
  );
}

function Reading({ label, value, hot }: { label: string; value: string; hot: boolean }) {
  return (
    <div className='flex gap-2 whitespace-nowrap'>
      <dt style={{ color: palette.faint }}>{label}</dt>
      <dd style={{ color: hot ? palette.amber : palette.text }}>{value}</dd>
    </div>
  );
}

function PlayGlyph({ playing }: { playing: boolean }) {
  return (
    <svg width='12' height='12' viewBox='0 0 12 12' aria-hidden>
      {playing ? (
        <path d='M2 1h3v10H2zM7 1h3v10H7z' fill='currentColor' />
      ) : (
        <path d='M2.5 1.2 11 6l-8.5 4.8z' fill='currentColor' />
      )}
    </svg>
  );
}
