import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import {
  drawOrbit,
  getScene,
  simulatedStems,
  type SceneId,
  type Stems
} from './orbit';

/** A still frame of the visual, drawn once at the screen's pixel ratio. */
export function OrbitCanvas({
  width,
  height,
  scene = 'perigee',
  time = 6.2,
  gravity = 0.2,
  stems,
  density = 1,
  background = true,
  offsetX,
  offsetY,
  size,
  style
}: {
  width: number;
  height: number;
  scene?: SceneId;
  time?: number;
  gravity?: number;
  stems?: Stems;
  density?: number;
  background?: boolean;
  offsetX?: number;
  offsetY?: number;
  size?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawOrbit(ctx, canvas.width, canvas.height, dpr, {
      time,
      stems: stems ?? simulatedStems(time),
      gravity,
      scene: getScene(scene),
      density,
      background,
      offsetX,
      offsetY,
      size: size ? size * dpr : undefined
    });
  }, [width, height, scene, time, gravity, stems, density, background, offsetX, offsetY, size]);
  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ width, height, display: 'block', ...style }}
    />
  );
}
