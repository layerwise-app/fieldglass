import type { ReactNode } from 'react';

/**
 * A sample case study's screens are React components. `pnpm render-screens
 * <slug>` captures each one at 2× (2880 px wide for a 1440 px artboard) and
 * passes the captures through `scripts/add-images`.
 *
 * Your own projects don't need this: add finished images with
 * `pnpm add-images <slug> <files>` instead.
 */
export type Screen = {
  /** Artboard size in CSS pixels. Use 1440 wide for 2880 px output. */
  width: number;
  height: number;
  render: () => ReactNode;
};

export type ScreenSet = Record<string, Screen>;
