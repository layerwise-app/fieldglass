/**
 * Everything about the owner of this portfolio lives here: who they are, how
 * to reach them, and the fonts and colours the whole site is drawn with.
 * Case studies live in `src/content/work/`; About-page lists live in
 * `src/content/about.ts`.
 */

export type FontFile = {
  /** A file in `public/fonts/`, like `/fonts/my-font.woff2`. */
  src: string;
  /** A single weight (`'400'`) or a variable range (`'400 700'`). */
  weight: string;
  style?: 'normal' | 'italic';
  /** Width range for variable fonts with a `wdth` axis, like `'75% 100%'`. */
  stretch?: string;
  unicodeRange?: string;
  /** Preload the file in `<head>`. Only for fonts used above the fold. */
  preload?: boolean;
};

export type FontFamily = {
  family: string;
  /** Used while the font loads and if it fails. */
  fallback: string;
  files: FontFile[];
};

export type SocialLink = { label: string; href: string };

export type Tool = {
  name: string;
  /** One of the drawn icons in `src/components/site/ToolIcon.tsx`. */
  icon:
    | 'pen'
    | 'nodes'
    | 'shader'
    | 'cube'
    | 'wave'
    | 'type'
    | 'grid'
    | 'terminal';
};

const LATIN =
  'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LATIN_EXT =
  'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';

export const portfolio = {
  name: 'Noor Haddad',
  /** Two letters drawn in the centre of the particle field on the home page. */
  initials: 'NH',
  /** The word spelled in the footer. Short words (3–6 letters) read best. */
  footerWord: 'NOOR',
  role: 'Designer & creative coder',
  location: 'Amsterdam, NL',
  /** Shown as a small label next to the location. */
  coordinates: '52.37° N  4.90° E',
  timeZone: 'Europe/Amsterdam',
  availability: 'Booking projects from February 2027',

  /** One or two sentences for the home dashboard. */
  intro:
    'I design identities, instruments and interfaces that are made of code and finished by hand.',
  /** Longer bio for the About page, one string per paragraph. */
  bio: [
    'I’m Noor, an independent designer and creative coder in Amsterdam. Most of my work sits where a visual system has to behave: identities that redraw themselves, tools that turn data into sound, interfaces you stand inside rather than look at.',
    'I studied graphic design in Beirut and interaction design in Eindhoven, then spent six years in studios building brand systems and real-time graphics for cultural clients. Since 2022 I work on my own, usually as the person who both designs the thing and writes the first version of it.',
    'I like small teams, clear constraints and projects where the code is part of the idea rather than the way it gets shipped.'
  ],

  /**
   * Where contact-form messages are emailed. Leave empty to only save them in
   * the database; they are always saved either way.
   */
  ownerEmail: '',

  /** Replace each `href` with your own profile URL. */
  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'Are.na', href: 'https://www.are.na/' },
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' }
  ] satisfies SocialLink[],

  /** The row of icons in the home dashboard's top bar. */
  tools: [
    { name: 'Figma', icon: 'pen' },
    { name: 'TouchDesigner', icon: 'nodes' },
    { name: 'GLSL', icon: 'shader' },
    { name: 'Blender', icon: 'cube' },
    { name: 'Ableton Live', icon: 'wave' },
    { name: 'Glyphs', icon: 'type' },
    { name: 'p5.js', icon: 'grid' },
    { name: 'TypeScript', icon: 'terminal' }
  ] satisfies Tool[],

  /** A PDF in `public/`. */
  cv: { href: '/noor-haddad-cv.pdf', label: 'CV, PDF, 2026' },

  /**
   * Leave `src` empty to use the drawn stipple portrait. To use a photo, add
   * it with `pnpm add-images about <file>` and import it in
   * `src/components/site/Portrait.tsx`.
   */
  portrait: {
    alt: 'Stipple portrait of Noor Haddad in profile, hair tied back, round glasses'
  },

  /**
   * Site colours. `paper` is the background, `ink` the text, `muted` the
   * secondary text (keep it at 4.5:1 contrast on `paper`), `graphite` the
   * particles, and `accent` the single highlight colour.
   */
  colors: {
    paper: '#F2F2EE',
    ink: '#131418',
    muted: '#585B62',
    graphite: '#26282D',
    accent: '#F24E10',
    /** Text drawn on top of `accent`. */
    onAccent: '#131418'
  },

  /**
   * `sans` sets almost everything, `pixel` sets small labels, and `serif` is
   * only used inside one sample case study. Font files live in
   * `public/fonts/`; their licences sit next to them.
   */
  fonts: {
    sans: {
      family: 'Instrument Sans',
      fallback: 'ui-sans-serif, system-ui, sans-serif',
      files: [
        {
          src: '/fonts/instrument-sans-latin.woff2',
          weight: '400 700',
          stretch: '75% 100%',
          unicodeRange: LATIN,
          preload: true
        },
        {
          src: '/fonts/instrument-sans-latin-ext.woff2',
          weight: '400 700',
          stretch: '75% 100%',
          unicodeRange: LATIN_EXT
        },
        {
          src: '/fonts/instrument-sans-latin-italic.woff2',
          weight: '400 700',
          stretch: '75% 100%',
          style: 'italic',
          unicodeRange: LATIN
        }
      ]
    },
    pixel: {
      family: 'Departure Mono',
      fallback: 'ui-monospace, SFMono-Regular, Menlo, monospace',
      files: [
        { src: '/fonts/departure-mono.woff2', weight: '400', preload: true }
      ]
    },
    serif: {
      family: 'Instrument Serif',
      fallback: 'ui-serif, Georgia, serif',
      files: [
        { src: '/fonts/instrument-serif-latin.woff2', weight: '400' },
        {
          src: '/fonts/instrument-serif-latin-italic.woff2',
          weight: '400',
          style: 'italic'
        }
      ]
    }
  } satisfies Record<'sans' | 'pixel' | 'serif', FontFamily>
} as const;

export type Portfolio = typeof portfolio;
