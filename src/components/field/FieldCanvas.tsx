import { useEffect, useRef, useState } from 'react';
import type { ShapeName } from '~/content/types';
import { FieldEngine, pickTier } from '~/lib/field/engine';
import { sampleGlyphs } from '~/lib/field/shapes';
import { field } from '~/lib/field/store';
import { portfolio } from '~/portfolio.config';

declare global {
  interface Window {
    __fieldEngine?: FieldEngine;
  }
}

/**
 * The fixed, full-viewport particle field behind every page. Reads its scene
 * from `field` in `~/lib/field/store`. Without WebGL it shows a rendered still
 * of the same scene from `public/field/<shape>.webp`.
 */
export function FieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stillRef = useRef<HTMLImageElement>(null);
  const [still, setStill] = useState<ShapeName | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const forceStill = new URLSearchParams(window.location.search).has(
      'field-still'
    );
    const engine = forceStill
      ? null
      : FieldEngine.create(canvas, {
          ink: portfolio.colors.graphite,
          accent: portfolio.colors.accent,
          reducedMotion,
          tier: pickTier(),
          glyphs: () =>
            sampleGlyphs(portfolio.initials, portfolio.fonts.sans.family),
          onMode: (mode, count) => field.setInfo({ mode, count })
        });

    if (!engine) {
      field.setInfo({ mode: 'still', count: 0 });
      setStill(field.getScene().shape);
      return;
    }

    const resize = () =>
      engine.resize(
        canvas.clientWidth,
        canvas.clientHeight,
        window.devicePixelRatio || 1
      );
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      engine.pointerMove(
        event.clientX,
        event.clientY,
        canvas.clientWidth,
        canvas.clientHeight
      );
    };
    const onLeave = () => engine.pointerLeave();
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);

    // If the GPU gives up later (a context that can't be restored), fall back.
    const unsubscribe = field.subscribe(() => {
      if (field.getInfo().mode === 'still') setStill(field.getScene().shape);
    });
    engine.start();
    if (import.meta.env.DEV) window.__fieldEngine = engine;

    return () => {
      unsubscribe();
      observer.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
      engine.destroy();
      field.setInfo({ mode: 'pending' });
    };
  }, []);

  // The still follows the scene: shape, depth (scale + blur) and offset.
  useEffect(() => {
    if (!still) return;
    let raf = 0;
    let shape = still;
    let depth = field.getScene().depth;
    let x = 0;
    let y = 0;
    let last = '';
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const scene = field.getScene();
      depth += (scene.depth - depth) * 0.12;
      x += (scene.x - x) * 0.12;
      y += (scene.y - y) * 0.12;
      if (scene.shape !== shape) {
        shape = scene.shape;
        setStill(shape);
      }
      const img = stillRef.current;
      if (!img) return;
      const key = `${depth.toFixed(3)}|${x.toFixed(3)}|${y.toFixed(3)}`;
      if (key === last) return;
      last = key;
      // Matches the live field: pulled back, then diffused into a cloud.
      const scale = 1 + 0.12 * depth;
      img.style.transform = `translate(-50%, -50%) translate(${x * 100}vw, ${-y * 100}lvh) scale(${scale})`;
      img.style.filter = depth > 0.02 ? `blur(${(depth * 26).toFixed(1)}px)` : 'none';
      img.style.opacity = String(1 - 0.2 * depth);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [still]);

  return (
    <div
      aria-hidden
      className='pointer-events-none fixed inset-x-0 top-0 z-0 h-lvh overflow-hidden'
    >
      <canvas
        ref={canvasRef}
        className='absolute inset-0 block h-full w-full'
        style={{ display: still ? 'none' : undefined }}
      />
      {still && (
        <img
          ref={stillRef}
          src={`/field/${still}.webp`}
          alt=''
          decoding='async'
          className='absolute left-1/2 top-1/2 max-w-none'
          style={{
            height: 'min(100vw, 100lvh)',
            width: 'calc(min(100vw, 100lvh) * 1.6)',
            transform: 'translate(-50%, -50%)',
            maskImage:
              'radial-gradient(closest-side, #000 70%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(closest-side, #000 70%, transparent 100%)'
          }}
        />
      )}
    </div>
  );
}
