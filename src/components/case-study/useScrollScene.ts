import { useEffect } from 'react';
import type { ShapeName } from '~/content/types';
import { field } from '~/lib/field/store';

/**
 * Shows `shape` in the field: close and sharp at the top of the page, pulled
 * back into a blurred background over the first `distance` of the viewport.
 * On wide screens the form sits to the right of the title.
 */
export function useScrollScene(shape: ShapeName, distance = 0.8) {
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1024px)');
    let frame = 0;

    const update = () => {
      frame = 0;
      const progress = window.scrollY / (window.innerHeight * distance);
      field.setScene({
        shape,
        depth: Math.min(1, Math.max(0, progress)),
        x: wide.matches ? 0.25 : 0,
        y: wide.matches ? 0 : 0.15
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    wide.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      wide.removeEventListener('change', schedule);
    };
  }, [shape, distance]);
}

/** A still background scene for pages without their own shape. */
export function useBackgroundScene(shape: ShapeName = 'iris') {
  useEffect(() => {
    field.setScene({ shape, depth: 1, x: 0, y: 0 });
  }, [shape]);
}
