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
};

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

let scene: FieldScene = { shape: 'iris', depth: 0, x: 0, y: 0 };
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
   * Brings `shape` forward and sharp, centred, and resolves once it has
   * visibly formed. Resolves right away without live particles.
   */
  morph(shape: ShapeName): Promise<void> {
    scene = { ...scene, shape, depth: 0, x: 0, y: 0 };
    return morphHandler ? morphHandler(shape) : Promise.resolve();
  },
  /** The engine registers how it waits for a morph. */
  onMorph(handler: typeof morphHandler) {
    morphHandler = handler;
  }
};
