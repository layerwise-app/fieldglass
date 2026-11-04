import type { ShapeName } from '~/content/types';

/**
 * The particle field is one fixed canvas behind every page. Pages describe
 * what it should show with `field.setScene()`; the engine eases toward it
 * every frame, so it's fine to call this from scroll handlers.
 */
export type FieldScene = {
  shape: ShapeName;
  /**
   * 0: the form is close and sharp (home hero, a project that just opened).
   * 1: pulled back and blurred into the background behind glass.
   */
  depth: number;
  /**
   * Where the form's centre sits, as a fraction of the viewport from its
   * centre (-0.5 to 0.5). Positive `x` moves it right, positive `y` moves it up.
   */
  x: number;
  y: number;
  /**
   * 0: the field as it is (home). 1: a faint, sharp dot texture for pages
   * with text over it. It replaces the blur, so the field never reads as a
   * smudge behind copy, and keeps body text at 4.5:1 or better.
   */
  veil: number;
  /**
   * The form's size: 1 is the default (radius ~0.38 of the viewport's
   * shorter side). Case studies set it to fit the form in their hero.
   */
  scale: number;
};

/** The form's radius in CSS px at `scale: 1`, for a field of this size. */
export function formRadius(width: number, height: number) {
  return 0.38 * Math.min(width, height);
}

/**
 * How far a form reaches on screen from its centre, as a multiple of its
 * radius, whatever its rotation: shapes are normalised to a sphere of ~1.1
 * (ignoring faint dust), and perspective enlarges the nearest points by up to
 * 4%. Fitting this circle in a box keeps the form inside.
 */
export const FORM_REACH = 1.15;

export type FieldMode =
  /** Not started yet (SSR, or before the first frame). */
  | 'pending'
  /** Live WebGL particles. */
  | 'live'
  /** prefers-reduced-motion: WebGL draws the finished state, no animation. */
  | 'static'
  /** No WebGL: a rendered still of the scene is shown instead. */
  | 'still';

export type FieldInfo = { mode: FieldMode; count: number };

type Listener = () => void;

let scene: FieldScene = { shape: 'iris', depth: 0, x: 0, y: 0, veil: 0, scale: 1 };
let info: FieldInfo = { mode: 'pending', count: 0 };
let morphHandler: ((shape: ShapeName) => Promise<void>) | null = null;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((listener) => listener());

export const field = {
  getScene: () => scene,
  setScene(next: Partial<FieldScene>) {
    scene = { ...scene, ...next };
  },
  getInfo: () => info,
  /** Called by the engine when its mode or particle count changes. */
  setInfo(next: Partial<FieldInfo>) {
    info = { ...info, ...next };
    emit();
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /**
   * Brings `shape` forward and sharp, and resolves once it has visibly
   * formed. Resolves right away without live particles. Callers don't need
   * to wait: the next page can take over the scene while the morph runs.
   */
  morph(shape: ShapeName): Promise<void> {
    scene = { ...scene, shape, depth: 0, veil: 0 };
    return morphHandler ? morphHandler(shape) : Promise.resolve();
  },
  /** The engine registers how it waits for a morph. */
  onMorph(handler: typeof morphHandler) {
    morphHandler = handler;
  }
};
