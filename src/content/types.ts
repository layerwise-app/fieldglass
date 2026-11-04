import type { ComponentType } from 'react';

/**
 * The particle field can draw these shapes. Each case study names one; the
 * field morphs into it when the project opens. `iris` is the home page.
 */
export const shapeNames = [
  'iris',
  'contour',
  'waveform',
  'lattice',
  'orbit',
  'ribbon',
  'volume'
] as const;
export type ShapeName = (typeof shapeNames)[number];

/** An image written by `scripts/add-images` (see each `images.ts`). */
export type ImageAsset = {
  /** The largest file, for `src`. */
  src: string;
  /** Every WebP width, for `srcSet`. Empty for GIFs. */
  srcSet: string;
  width: number;
  height: number;
  /** A tiny blurred WebP as a data URI, shown while the image loads. */
  placeholder: string;
  /** A 1200×630 JPG for link previews. Only images named `cover` have one. */
  og?: string;
};

export type Figure = {
  image: ImageAsset;
  /** Describe what the image shows for people who can't see it. */
  alt: string;
};

export type DemoModule = { default: ComponentType };

export type Block =
  /**
   * A working piece of the project, mounted on the page. Until it loads the
   * `still` is shown in its place, at the same size.
   */
  | {
      type: 'demo';
      title: string;
      caption?: string;
      still: Figure;
      load: () => Promise<DemoModule>;
      /** Width ÷ height of the demo on phones. Defaults to 4 / 5. */
      mobileAspect?: number;
    }
  | { type: 'image'; figure: Figure; caption?: string }
  | { type: 'pair'; figures: [Figure, Figure]; caption?: string }
  | {
      type: 'video';
      /** A file imported from the project folder, like `import clip from './x/clip.mp4'`. */
      src: string;
      poster: ImageAsset;
      /** What happens in the clip, for people who can't see it. */
      label: string;
      caption?: string;
    }
  | { type: 'text'; heading?: string; body: string[] }
  | { type: 'quote'; quote: string; name: string; role: string }
  | {
      type: 'compare';
      before: Figure;
      after: Figure;
      labels?: [before: string, after: string];
      caption?: string;
    }
  | {
      type: 'metrics';
      items: { value: string; label: string }[];
    };

export type Project = {
  slug: string;
  title: string;
  /** One line under the title. */
  tagline: string;
  client: string;
  year: number;
  role: string;
  team: string[];
  /** Short label used on cards and the index, like "Generative identity". */
  discipline: string;
  /** The particle field becomes this shape when the project opens. */
  shape: ShapeName;
  /** Lower numbers come first on Home and Work. */
  order: number;
  /** One or two sentences for cards, search results and link previews. */
  summary: string;
  cover: Figure;
  /** The brief and the constraint, as paragraphs. */
  problem: string[];
  decisions: { title: string; body: string }[];
  /** What happened, as paragraphs. */
  outcome: string[];
  blocks: Block[];
};

/** Keeps a case study file typed without repeating the type annotation. */
export function defineProject(project: Project): Project {
  return project;
}

type Source = readonly [width: number, url: string];

/** Used by the generated `images.ts` files. */
export function image(
  width: number,
  height: number,
  placeholder: string,
  sources: readonly Source[],
  og?: string
): ImageAsset {
  const sorted = [...sources].sort((a, b) => a[0] - b[0]);
  const largest = sorted[sorted.length - 1];
  return {
    src: largest ? largest[1] : '',
    srcSet:
      sorted.length > 1 ? sorted.map(([w, url]) => `${url} ${w}w`).join(', ') : '',
    width,
    height,
    placeholder,
    ...(og ? { og } : {})
  };
}
