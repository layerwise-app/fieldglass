import { useEffect, useRef, type CSSProperties } from 'react';
import {
  POSTER_H,
  POSTER_W,
  buildField,
  drawPoster,
  type PosterSpec
} from './system';

export const fontsReady = () =>
  typeof document === 'undefined'
    ? Promise.resolve()
    : Promise.all([
        document.fonts.load("700 100px 'Instrument Sans'"),
        document.fonts.load("600 40px 'Instrument Sans'"),
        document.fonts.load("500 30px 'Instrument Sans'")
      ]).then(() => undefined);

/**
 * A canvas drawn by `draw` in device pixels, redrawn when `deps` change and
 * once the fonts have loaded. `density` is pixels per CSS pixel.
 */
export function ArtCanvas({
  width,
  height,
  draw,
  deps,
  density = 2,
  style,
  label
}: {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  deps: string;
  density?: number;
  style?: CSSProperties;
  label?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      const ctx = canvas.getContext('2d');
      if (ctx) drawRef.current(ctx, canvas.width, canvas.height);
    };
    run();
    fontsReady().then(run);
    return () => {
      cancelled = true;
    };
    // The draw function lives in a ref; these inputs decide when to redraw.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [deps, width, height, density]);

  return (
    <canvas
      ref={ref}
      width={Math.round(width * density)}
      height={Math.round(height * density)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width, height, display: 'block', ...style }}
    />
  );
}

/** A Veld poster at `width` CSS pixels. */
export function Poster({
  spec,
  width,
  density = 2,
  style,
  label
}: {
  spec: PosterSpec;
  width: number;
  density?: number;
  style?: CSSProperties;
  label?: string;
}) {
  return (
    <ArtCanvas
      width={width}
      height={(width * POSTER_H) / POSTER_W}
      density={density}
      deps={JSON.stringify(spec)}
      style={style}
      label={label}
      draw={(ctx, w, h) => drawPoster(ctx, w, h, spec, buildField(spec))}
    />
  );
}
