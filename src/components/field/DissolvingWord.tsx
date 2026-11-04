import { useEffect, useRef, useState } from 'react';
import {
  WORD_STRETCH,
  WORD_VIEW_WIDTH,
  WORD_WEIGHT,
  WordEngine,
  wordLayout
} from '~/lib/field/word';
import { cn } from '~/lib/utils';
import { portfolio } from '~/portfolio.config';

/**
 * A huge word that dissolves into particles around the pointer. The server
 * renders it as SVG text sized to its container, so it reads without
 * JavaScript and never shifts; on the client a canvas of dots takes over.
 */
export function DissolvingWord({
  word,
  className
}: {
  word: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  const layout = wordLayout(word);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const engine = WordEngine.create(
      canvas,
      portfolio.colors.ink,
      portfolio.colors.accent
    );
    if (!engine) return;
    let cancelled = false;
    const family = portfolio.fonts.sans.family;

    const sample = () => {
      if (cancelled) return;
      engine.layout(word, wrap.clientWidth, family);
      if (engine.particles > 0) setLive(true);
    };
    let resizeTimer = 0;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(sample, 120);
    });
    document.fonts
      .load(`${WORD_WEIGHT} 100px "${family}"`)
      .catch(() => undefined)
      .then(() => {
        sample();
        observer.observe(wrap);
      });

    const visibility = new IntersectionObserver(([entry]) =>
      engine.setVisible(Boolean(entry?.isIntersecting))
    );
    visibility.observe(wrap);

    const local = (clientX: number, clientY: number) => {
      const rect = wrap.getBoundingClientRect();
      engine.pointerAt(clientX - rect.left, clientY - rect.top);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') local(event.clientX, event.clientY);
    };
    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) local(touch.clientX, touch.clientY);
    };
    const onOut = () => engine.pointerOut();
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    window.addEventListener('touchend', onOut, { passive: true });
    document.documentElement.addEventListener('pointerleave', onOut);

    return () => {
      cancelled = true;
      window.clearTimeout(resizeTimer);
      observer.disconnect();
      visibility.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onOut);
      document.documentElement.removeEventListener('pointerleave', onOut);
      engine.destroy();
    };
  }, [word]);

  return (
    <div ref={wrapRef} aria-hidden className={cn('relative select-none', className)}>
      <svg
        viewBox={`0 0 ${WORD_VIEW_WIDTH} ${layout.height}`}
        className='block h-auto w-full overflow-visible'
        style={{ color: live ? 'transparent' : portfolio.colors.ink }}
      >
        <text
          x={0}
          y={layout.baseline}
          textLength={WORD_VIEW_WIDTH}
          lengthAdjust='spacingAndGlyphs'
          fill='currentColor'
          style={{
            fontFamily: 'var(--fg-font-sans)',
            fontSize: layout.fontSize,
            fontWeight: WORD_WEIGHT,
            fontStretch: WORD_STRETCH
          }}
        >
          {word}
        </text>
      </svg>
      <canvas
        ref={canvasRef}
        className='pointer-events-none absolute left-0 top-0 h-full w-full'
        style={{ visibility: live ? 'visible' : 'hidden' }}
      />
    </div>
  );
}
