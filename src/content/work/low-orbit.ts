import { defineProject } from '~/content/types';
import clip from './low-orbit/clip.mp4';
import { images } from './low-orbit/images';

export default defineProject({
  slug: 'low-orbit',
  title: 'Low Orbit',
  tagline:
    'A tour visualiser driven by stems, built to survive 34 different stages',
  client: 'Mira Sol / Halfmoon Records',
  year: 2024,
  role: 'Real-time visuals, show system design',
  team: [
    'Noor Haddad — visuals & code',
    'Mira Sol — artist',
    'Daan Koster — lighting design',
    'Ana Petrović — tour management'
  ],
  discipline: 'Music visualiser',
  shape: 'orbit',
  order: 2,
  summary:
    'A real-time visual system for Mira Sol’s 34-date tour. Four stems drive four orbits, one fader on stage pulls them together, and the show sets itself up for a new LED wall in about three minutes.',
  cover: {
    image: images.cover,
    alt: 'A concert stage at night: a wide LED wall shows a red orbital system around a black disc above Mira Sol at her desk, with a rim-lit crowd in the foreground.'
  },
  problem: [
    'Mira Sol’s Low Orbit tour was 34 nights in nine weeks: clubs for 200 people, converted factory halls and, at the end, a 4,000-capacity festival stage. There was no budget for a VJ on the road, and the last tour’s pre-rendered video drifted out of sync whenever Mira stretched a track live, which she does most nights.',
    'The constraints were blunt. One laptop in the tour van. LED walls of every size and pixel pitch, rented locally and seen for the first time on the day. A setup window of 20 minutes or less, run by the tour manager rather than a visuals technician.'
  ],
  decisions: [
    {
      title: 'Drive it from stems, not the master',
      body: 'Mira’s set already leaves her interface as four stems, so the visual listens to each one on its own: the kick drives the core, the bass the inner rings, the pads the dust, the vocal the satellite. When she extends a breakdown by 32 bars nothing drifts, because there is no timeline to drift from. The music is the timeline.'
    },
    {
      title: 'Recompose for the wall, every night',
      body: 'Ana types in the wall’s width, height and pixel pitch from the rental sheet. The system works out the output resolution and recomposes all eight scenes for that aspect ratio: rings widen for a 3.2 : 1 hall, and the core lifts so it never sits behind Mira’s desk. Saved venues come back in one tap.'
    },
    {
      title: 'One control on stage',
      body: 'I took every parameter off the stage except one: a gravity fader on Mira’s controller. Pulling it draws every orbit towards the core and speeds it up, which is what a breakdown already feels like. She learned it in one soundcheck and used it every night.'
    },
    {
      title: 'Assume the cable will fail',
      body: 'If the audio drops, the visual keeps orbiting at the last tempo for 16 bars, then eases into a calm scene, so a loose cable reads as a moment of stillness instead of a frozen screen. It covered a 3.1-second dropout in Leipzig that nobody in the room noticed.'
    }
  ],
  outcome: [
    'Low Orbit ran 34 shows, from a 200-capacity room in Utrecht to a festival main stage, with no missed cues and no visuals operator. A new wall took a median of 2 minutes 58 seconds to set up; returning venues took under one.',
    'For album week, Halfmoon Records released the same renderer as a fan web version: pick a track, play with gravity, save a 15-second clip of your orbit. It was played 180,000 times in seven days, almost all of them on phones.'
  ],
  blocks: [
    {
      type: 'demo',
      title: 'Play the stems',
      caption:
        'The tour renderer, driven by a loop synthesised in your browser. Switch scenes, then pull gravity in for the breakdown.',
      still: {
        image: images.demo,
        alt: 'The Low Orbit demo: a tilted orbital system in red and bone on black, with stem meters on the left and play, mute, scene and gravity controls along the bottom.'
      },
      load: () => import('./low-orbit/demo'),
      mobileAspect: 3 / 4
    },
    {
      type: 'text',
      heading: 'What the visual listens to',
      body: [
        'Each stem is measured on its own analyser before it reaches the speakers, so the visual hears the kick even when the room is thick with bass. Levels rise instantly and fall slowly, which keeps the motion from jittering on every transient.',
        'Nothing is keyframed. A scene is only geometry: how far the orbital plane tilts, how many rings it has, how much dust, whether a black disc eclipses the core. The stems do the rest, so a scene I designed for one track still works when Mira plays something new.'
      ]
    },
    {
      type: 'image',
      figure: {
        image: images.operator,
        alt: 'Show-control interface on a laptop: four stem meters, a program monitor showing the Perigee scene, a track map, a setlist with the current track highlighted, a gravity fader at 35 and eight scene pads.'
      },
      caption:
        'The show laptop. Stems on the left, the program output and the next scene in the middle, tonight’s set on the right. Mira’s fader and the fail-safe run along the bottom.'
    },
    {
      type: 'image',
      figure: {
        image: images['venue-setup'],
        alt: 'Venue setup on a tablet: a 9.6 by 4 metre wall at 3.9 mm pitch, an output of 2462 by 1026 pixels, four scenes recomposed for a 2.4 : 1 wall and a cabinet map with one dim cabinet flagged.'
      },
      caption:
        'Load-in mode is light on purpose, because it’s used under work lights in the afternoon. Night 8 in Warsaw took 2 minutes 41 seconds.'
    },
    {
      type: 'video',
      src: clip,
      poster: images['clip-poster'],
      label:
        'Ten seconds of the visual following the loop: the Perigee scene, a cut to Eclipse, then gravity pulled in for a breakdown and released.',
      caption:
        'Captured from the browser demo: Perigee, a cut to Eclipse, then the gravity fader pulled to 80 and let go.'
    },
    {
      type: 'pair',
      figures: [
        {
          image: images.poster,
          alt: 'Black tour poster: Mira Sol in red, Low Orbit in huge condensed bone type over a glowing orbit, and 18 spring dates from Utrecht to Amsterdam in three columns.'
        },
        {
          image: images['fan-web'],
          alt: 'Two phones on a red ground: one playing the track Ballast with gravity at 64, the other showing a shareable orbit card with options to save a clip, copy a link or post a story.'
        }
      ],
      caption:
        'The spring tour poster, set in the same condensed grotesque as the show graphics, and the fan web version from album week with the card it makes when you share your orbit.'
    },
    {
      type: 'image',
      figure: {
        image: images.scenes,
        alt: 'A printed page of eight scene thumbnails, from Perigee to Re-entry, each with its place in the set and its tilt, ring, satellite and heat values.'
      },
      caption:
        'The scene library from the show bible: eight states of one system. The stem mapping never changes.'
    },
    {
      type: 'quote',
      quote:
        'By the second night I’d stopped thinking about the screen. When the room needs to hold its breath I pull gravity down, and the wall holds it with me.',
      name: 'Mira Sol',
      role: 'Artist, Halfmoon Records'
    },
    {
      type: 'metrics',
      items: [
        { value: '34', label: 'shows, with no visuals operator' },
        { value: '0', label: 'missed cues across the tour' },
        { value: '2:58', label: 'median setup on a new wall' },
        { value: '180k', label: 'plays of the fan version in album week' }
      ]
    }
  ]
});
