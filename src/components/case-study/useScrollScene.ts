import { useEffect, type RefObject } from 'react';
import type { ShapeName } from '~/content/types';
import { field, FORM_REACH, formRadius } from '~/lib/field/store';

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * Where the field sits behind pages of text: centred on the top-right
 * corner, under the header, so only its outer rays reach across the page as
 * a faint, sharp texture and its dense centre stays out of the text.
 */
export const BACKGROUND = { depth: 1, veil: 1, x: 0.5, y: 0.5, scale: 1.5 };

/** The field's box in CSS px (it is taller than the viewport on phones). */
function fieldSize() {
  const box = document.querySelector<HTMLElement>('[data-field]');
  return {
    width: box?.clientWidth || window.innerWidth,
    height: box?.clientHeight || window.innerHeight
  };
}

type Box = { left: number; top: number; width: number; height: number };

/** The scene offset and size that fit the form inside `box` (CSS px). */
function fitScene(box: Box) {
  const size = fieldSize();
  const radius = Math.min(box.width, box.height) / 2 / FORM_REACH;
  return {
    scale: radius / formRadius(size.width, size.height),
    x: (box.left + box.width / 2) / size.width - 0.5,
    y: 0.5 - (box.top + box.height / 2) / size.height
  };
}

/**
 * Roughly where a case study's stage will be, before the page renders,
 * worked out from the hero's layout (`Hero` in CaseStudy.tsx). Project links
 * move the field there while the old page fades out, so the form doesn't
 * cross the title as it fades in; the real box takes over on render.
 */
export function stageGuess() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw >= 1024) {
    const inner = Math.min(vw, 1440) - 80;
    const column = (inner - 11 * 24) / 12;
    const top = 112 + 16 + 32;
    const bottom = Math.max(vh * 0.88, top + 420) - 48 - 32;
    return fitScene({
      left: (vw - inner) / 2 + 7 * (column + 24),
      top,
      width: 5 * column + 4 * 24,
      height: bottom - top
    });
  }
  const pad = vw >= 768 ? 24 : 16;
  return fitScene({
    left: pad,
    top: (vw >= 768 ? 112 : 96) + 32,
    width: vw - 2 * pad,
    height: Math.min(440, Math.max(240, vh * 0.4))
  });
}

/**
 * Shows `shape` in the field, fitted inside `stage`: an empty box in the
 * case study's hero, so the form never runs into the title, summary or
 * details. It follows the box as the page scrolls, then pulls back over the
 * first `distance` of the viewport into the BACKGROUND texture.
 */
export function useScrollScene(
  shape: ShapeName,
  stage: RefObject<HTMLElement | null>,
  distance = 0.8
) {
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const progress = clamp01(
        window.scrollY / (window.innerHeight * distance)
      );
      let fit = { x: 0, y: 0, scale: 1 };
      const box = stage.current?.getBoundingClientRect();
      if (box && box.width > 0 && box.height > 0) fit = fitScene(box);
      const { x, y, scale } = fit;
      const settle = smoothstep(0.35, 1, progress);
      field.setScene({
        shape,
        depth: progress,
        veil: settle,
        x: lerp(x, BACKGROUND.x, settle),
        y: lerp(y, BACKGROUND.y, settle),
        scale: lerp(scale, BACKGROUND.scale, settle)
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    const observer = new ResizeObserver(schedule);
    if (stage.current) observer.observe(stage.current);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [shape, stage, distance]);
}

/** The scene for pages of text: About, Contact, Work and the 404. */
export function useBackgroundScene(shape: ShapeName = 'iris') {
  useEffect(() => {
    field.setScene({ shape, ...BACKGROUND });
  }, [shape]);
}
