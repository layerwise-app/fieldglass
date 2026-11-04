import { defineProject } from '~/content/types';
import { images } from './atlas-room/images';

export default defineProject({
  slug: 'atlas-room',
  title: 'Atlas Room',
  tagline: 'A spatial review room where clients stand in a building before it’s built',
  client: 'Hollander & Saar Architects, Rotterdam',
  year: 2026,
  role: 'Spatial interface design, prototyping',
  team: [
    'Noor Haddad — spatial UI and prototyping',
    'Sanne de Bruijn — associate architect',
    'Rafael Okoye — real-time development',
    'The Kade Noord client review panel'
  ],
  discipline: 'Spatial computing prototype',
  shape: 'volume',
  order: 5,
  summary:
    'A headset prototype for Hollander & Saar that opens every client review at the front door, at true scale, so ceiling heights and daylight get judged before they’re built.',
  cover: {
    image: images.cover,
    alt: 'Headset view of a living room at true scale in December light: a dimension line shows the 2.70 m ceiling, a teal pin marks the window seat with a client’s note, and a sun dial reads 13:24.'
  },
  problem: [
    'Hollander & Saar review designs with their clients over rendered flythroughs. The films are beautiful and they lie about size: a camera at 2.5 metres with a wide lens makes every room feel generous. Ceiling heights and daylight were signed off in the meeting room and regretted on site, when changing them cost the most.',
    'The constraints were practical. The office owns four headsets, shared between eleven architects. Most clients are buying their first or their last home, are between 40 and 75, and have never worn a headset. And the model had to come straight out of the architects’ BIM tool and load in under two minutes, because nobody sits through a longer wait in front of a client.'
  ],
  decisions: [
    {
      title: 'Start at 1:1, not in a menu',
      body: 'Every session opens standing at the front door of the apartment, at your own eye height. There’s no lobby, no start screen and nothing to press. The first thing clients do is look around, which is exactly what we wanted them to do.'
    },
    {
      title: 'Notes without hands',
      body: 'Look at a surface and say “note”. The pin lands where you were looking, within a couple of centimetres, and what you say is transcribed onto it. Each note syncs to the architect’s issue list with its exact position, so nobody has to work out what “that bit by the window” meant after the session.'
    },
    {
      title: 'A dial for the sun',
      body: 'Daylight was the second most regretted decision, so time of day got its own dial. It uses the site’s real latitude and façade orientation, and only two dates, 21 June and 21 December, because the extremes are what people end up living with.'
    },
    {
      title: 'Shrink the building to find yourself',
      body: 'Walking through rooms at full size gets disorienting after a while. A dollhouse toggle shrinks the apartment to 1:50 on the table in front of you, with your position as a glowing marker. One tap puts you back where the marker is.'
    }
  ],
  outcome: [
    'Atlas Room ran in 14 client reviews on the Kade Noord housing project. Late-stage design changes dropped from 23 to 6 compared with the practice’s previous scheme of the same size, because the changes happened earlier: in the room, during the review.',
    'Reviews averaged 38 minutes, about the same as the old flythrough meetings, and clients left 212 spatial notes. The most common kind was about a height: of a seat, a worktop, a pendant, a sill.'
  ],
  blocks: [
    {
      type: 'demo',
      title: 'Walk it, shrink it, move the sun',
      caption:
        'The Apartment 2.04 model from the pilot, drawn in your browser. Drag or use the arrow keys to look around, switch between 1:1 and 1:50, move the sun through 21 June or 21 December, and pin a note to a surface.',
      still: {
        image: images.demo,
        alt: 'The live demo in its walking view: the living room with a pinned note on the window seat, a time-of-day slider set to 21 December at 13:30, and a list of notes.'
      },
      load: () => import('./atlas-room/demo')
    },
    {
      type: 'compare',
      before: {
        image: images.flythrough,
        alt: 'A frame from a rendered flythrough of the living room, shot from 2.5 m high with a 104° lens that makes the room look larger than it is.'
      },
      after: {
        image: images.walkthrough,
        alt: 'The same living room in Atlas Room at an eye height of 1.62 m, with dimension labels on the ceiling, the window sill and the window head.'
      },
      labels: ['Rendered flythrough', 'Atlas Room at 1:1'],
      caption:
        'The same room at the same hour. The flythrough camera sits at 2.50 m with a 104° lens; Atlas Room puts you at your own eye height and labels the heights you’re looking at.'
    },
    {
      type: 'text',
      heading: 'The first thirty seconds',
      body: [
        'Most clients had never worn a headset, so the onboarding was the product. I kept cutting it until there was nothing left to explain: the model loads while the headset is being fitted, and the session begins at the front door with one panel that says where you are and the three things you can do.',
        'Everything else waits until someone needs it. The dock appears when you look down at your hands, and the note tool starts when you say the word.'
      ]
    },
    {
      type: 'pair',
      figures: [
        {
          image: images.onboarding,
          alt: 'Welcome panel at the front door of Apartment 2.04 with three steps, look around, walk and leave a note, above a timeline of the first 31 seconds.'
        },
        {
          image: images.annotate,
          alt: 'A gaze reticle on the kitchen worktop while a client’s spoken note is transcribed, pinned to the worktop at 0.90 m and synced as issue HS-231.'
        }
      ],
      caption:
        'Left: the welcome panel at the front door. Right: a note being spoken. The pin lands where the reticle was, and the issue syncs before the sentence ends.'
    },
    {
      type: 'image',
      figure: {
        image: images.dollhouse,
        alt: 'The apartment shrunk to a 1:50 model on a white base, with room names and areas, a teal marker for the viewer’s position, a level switcher and a button to return to 1:1.'
      },
      caption:
        'The 1:50 dollhouse: levels on the left, your position as a marker, one button back to full size.'
    },
    {
      type: 'quote',
      quote:
        'We used to spend the first twenty minutes of a site visit explaining why the room felt smaller than the film. Now clients tell us in the review, while we can still do something about it.',
      name: 'Sanne de Bruijn',
      role: 'Associate architect, Hollander & Saar'
    },
    {
      type: 'image',
      figure: {
        image: images.sundial,
        alt: 'The sun dial set to 21 December at 13:24, next to a light study of the living room at six times of day in June and in December.'
      },
      caption:
        'The sun dial and a light study for the living room. Clients asked to see December far more often than June.'
    },
    {
      type: 'image',
      figure: {
        image: images['review-summary'],
        alt: 'Web report for review 09: client notes with their status, a floor plan with numbered pins, and a summary of the issues synced to the architects’ list.'
      },
      caption:
        'After each session the architect gets a report: every note, where it was made, and what happened to it in the issue list.'
    },
    {
      type: 'metrics',
      items: [
        { value: '14', label: 'client reviews on the pilot' },
        { value: '23 → 6', label: 'late-stage design changes' },
        { value: '38 min', label: 'average review' },
        { value: '212', label: 'spatial notes from clients' }
      ]
    },
    {
      type: 'text',
      heading: 'What I’d change',
      body: [
        'Voice notes worked better than I expected and the dollhouse worse. Clients used 1:50 to find their way but rarely to judge anything; the room at 1:1 did that. In the next version the dollhouse becomes a small map on your wrist instead of a mode you switch into.',
        'The two-minute load limit shaped the whole prototype. We strip fittings from the BIM export and replace furniture with simple volumes, which is why the model looks like an architect’s model rather than a render. Clients liked that more than we did.'
      ]
    }
  ]
});
