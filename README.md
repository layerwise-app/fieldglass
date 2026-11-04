# Fieldglass

A portfolio for one designer or a small studio, where a live particle field is
the interface's material. On load, up to ~100,000 GPU particles gather from a
burst into a radial form around the owner's initials. Scrolling pulls the field
back into the blurred background of a glass dashboard. Opening a project morphs
the field into that project's own shape, and the footer word dissolves into
particles around the pointer.

The sample owner is Noor Haddad, a fictional designer and creative coder in
Amsterdam. Every person, client and project in the sample work is fictional.

Built with TanStack Start, React, Tailwind CSS and WebGL2, and deployed to
Cloudflare Workers with Layerwise. Contact messages are stored in D1.

## Where things live

| What | Where |
| --- | --- |
| Name, role, bio, links, email, tools, fonts, colours | `src/portfolio.config.ts` |
| Case studies, one file each | `src/content/work/<slug>.ts` |
| A case study's images, demo and screens | `src/content/work/<slug>/` |
| Services, experience, clients, writing (About page) | `src/content/about.ts` |
| The Index list of smaller work | `src/content/archive.ts` |
| CV download | `public/noor-haddad-cv.pdf` (path set by `cv` in the config) |
| Search titles, share image, sitemap pages | `src/lib/site.ts` |

## Add a project

1. **Add its images.** Put your source images anywhere and run:

   ```bash
   pnpm add-images my-project ~/Desktop/cover.png ~/Desktop/home.png ~/Desktop/detail.jpg
   ```

   This creates `src/content/work/my-project/` with 800, 1600 and 2880 px WebP
   versions, each image's size and a tiny blurred placeholder, plus an
   `images.ts` you import from. Images are named after their files
   (`home.png` → `images.home`). Name one image `cover`: it's used on cards and
   also becomes the 1200 × 630 link-preview image. Use `--name` to rename a
   single file, for example `pnpm add-images my-project shot.png --name cover`.

2. **Write the case study.** Create `src/content/work/my-project.ts`:

   ```ts
   import { defineProject } from '~/content/types';
   import { images } from './my-project/images';

   export default defineProject({
     slug: 'my-project', // must match the file and folder name
     title: 'My Project',
     tagline: 'One line about what it is',
     client: 'Client name, City',
     year: 2026,
     role: 'Design, front-end',
     team: ['Your name — design', 'Someone else — engineering'],
     discipline: 'Product design',
     shape: 'lattice', // the field's shape for this project, see below
     order: 7, // lower numbers come first
     summary: 'One or two sentences for cards, search and link previews.',
     cover: { image: images.cover, alt: 'What the cover shows' },
     problem: ['The brief and the constraint.'],
     decisions: [
       { title: 'First decision', body: 'Why you made it.' },
       { title: 'Second decision', body: 'Why you made it.' },
       { title: 'Third decision', body: 'Why you made it.' }
     ],
     outcome: ['What happened, with numbers if you have them.'],
     blocks: [
       { type: 'image', figure: { image: images.home, alt: 'The home screen' } },
       { type: 'text', heading: 'A detail', body: ['A paragraph.'] },
       { type: 'image', figure: { image: images.detail, alt: 'A detail' }, caption: 'Optional caption' }
     ]
   });
   ```

   Every field is checked by TypeScript; `src/content/types.ts` documents each
   one. Copy one of the sample files if you'd rather start from a full example.

3. **That's it.** The project appears on Home, on Work (grid and index) and in
   `/sitemap.xml`, and it gets its own page at `/work/my-project`.

**Shapes:** `contour`, `waveform`, `lattice`, `orbit`, `ribbon` or `volume`.
(`iris` is the home page's form.) The shapes are drawn in
`src/lib/field/shapes.ts`.

**Blocks**, in any order and number:

| Block | Example |
| --- | --- |
| Full image | `{ type: 'image', figure: { image, alt }, caption? }` |
| Image pair | `{ type: 'pair', figures: [{ image, alt }, { image, alt }], caption? }` |
| Video | `{ type: 'video', src: clip, poster: images.poster, label: 'What happens in it', caption? }` with `import clip from './my-project/clip.mp4'` |
| Text | `{ type: 'text', heading?, body: ['Paragraph', 'Paragraph'] }` |
| Quote | `{ type: 'quote', quote, name, role }` |
| Before and after | `{ type: 'compare', before: { image, alt }, after: { image, alt }, labels?: ['Before', 'After'] }` (use images of the same size) |
| Metrics | `{ type: 'metrics', items: [{ value: '87%', label: 'finished the exercise' }] }` |
| Live demo | `{ type: 'demo', title, still: { image, alt }, load: () => import('./my-project/demo'), mobileAspect? }` |

A live demo is a React component in `src/content/work/<slug>/demo.tsx` (a
default export that fills its box). The page shows `still` in its place until
it loads, at the same size.

## Replace the sample work

1. Delete each sample's file and folder, for example
   `src/content/work/veld-kunsthal.ts` and `src/content/work/veld-kunsthal/`.
   The six samples are `veld-kunsthal`, `low-orbit`, `uniforms`, `undertone`,
   `atlas-room` and `long-take`.
2. Add your own projects as above.
3. Edit `src/content/archive.ts` (the Index) and `src/content/about.ts`, and
   replace `public/noor-haddad-cv.pdf` with your CV (update `cv` in the config
   if you rename it).

## Swap a live demo for an image or video

Replace the `demo` block in the project's file with an image or video block,
then delete `demo.tsx` if nothing else uses it:

```ts
// before
{ type: 'demo', title: 'Try it', still: { image: images.demo, alt: '…' }, load: () => import('./my-project/demo') }

// an image instead
{ type: 'image', figure: { image: images.demo, alt: '…' }, caption: 'Try it' }

// a video instead (add `import clip from './my-project/clip.mp4'` at the top)
{ type: 'video', src: clip, poster: images.demo, label: 'The tool in use', caption: 'Try it' }
```

Keep videos short, silent and under a few MB (H.264 MP4). They autoplay muted
only while on screen and never with reduced motion.

## Images

- `pnpm add-images <slug|folder> <files…>` accepts PNG, JPG, WebP, AVIF and
  TIFF. GIFs are copied untouched. SVGs are rejected; export them as PNG.
- Sources narrower than 2880 px aren't upscaled; the script says so.
- `pnpm add-images <slug> --remove <name>` deletes an image's files.
- Never edit `images.ts` or `images.json` by hand; run the script again.
- The sample screens are React components in each project's `screens.tsx`.
  With the dev server running, `pnpm render-screens <slug> [name…]` captures
  them again at 2880 px (needs Google Chrome, or set
  `PLAYWRIGHT_CHANNEL=chromium`). Your own projects don't need this.

## Change the fonts and colours

**Colours** are in `colors` in `src/portfolio.config.ts`: `paper` (background),
`ink` (text), `muted` (secondary text, keep it at 4.5:1 contrast on `paper`),
`graphite` (particles) and `accent` (the one highlight colour; the sample
orange is 3.2:1 on paper, enough for focus rings and large type but not small
text).

**Fonts** are in `fonts` in the same file. `sans` sets almost everything,
`pixel` sets the small labels, and `serif` is only used inside the Long Take
sample. To change one:

1. Put the `.woff2` files and the font's licence in `public/fonts/`.
2. Update the family name, fallback and `files` (weight, style, and
   `stretch` for variable fonts with a width axis). Mark the files used above
   the fold with `preload: true`.

The particle initials and the footer word are drawn in the `sans` font, so
they follow automatically. Set `initials` and `footerWord` in the config.

### Fonts in this template

All are self-hosted and licensed under the SIL Open Font License 1.1; the
licence texts are in `public/fonts/`.

- **Instrument Sans** by Instrument (variable weight and width)
- **Instrument Serif** by Instrument
- **Departure Mono** by Helena Zhang

## Logo and icons

The Fieldglass logo is `public/logo.svg`. To use your own, replace that file
with a square SVG and run `pnpm icons`; it rebuilds `public/logo.png`
(1024 px), the favicons, the Apple touch icon and the Android icons listed in
`public/site.webmanifest`.

## Contact form

Messages are validated on the server and saved to the `contact_messages`
table. A hidden honeypot field catches bots, and each sender (a hash of their
address and browser) can send three messages per ten minutes. Set
`ownerEmail` in the config to also receive each message by email through
Layerwise Email, with replies going to the sender. While testing locally, that
email appears under Email → Local in Layerwise instead of being sent.

## Motion and fallbacks

- The particle count adapts to the device (about 100k, 60k, 30k or 16k) and
  steps down if frames run slow. The live count is shown on the home page.
- With `prefers-reduced-motion`, the field shows its finished state, the
  morph and the icon hop are skipped, and videos don't autoplay.
- Without WebGL2, a rendered still of the same scene is shown
  (`public/field/<shape>.webp`).
- On phones, scrolling is normal and nothing depends on hover.

## Commands

```bash
pnpm dev                 # Layerwise runs this for you
pnpm check-types
pnpm lint
pnpm test
pnpm build
pnpm add-images <slug> <files…>
pnpm render-screens <slug>
pnpm icons
pnpm db:generate --name <migration_name>
pnpm db:migrate
```

Migrations in `drizzle/` are applied to the local database by `db:migrate`
and to the production database when the site is published.
