// About-page content. The bio, tools and CV link live in
// src/portfolio.config.ts; clients from case studies are added automatically.

export type Service = { title: string; description: string };

export type Role = {
  years: string;
  role: string;
  studio: string;
  city: string;
};

export type Note = {
  /** Used as the note's anchor on the About page: /about#<slug>. */
  slug: string;
  title: string;
  venue: string;
  /** `YYYY-MM`, newest first. */
  date: string;
  /** One string per paragraph. */
  body: string[];
};

export const services: Service[] = [
  {
    title: 'Generative identity systems',
    description:
      'Identities that draw themselves from a rule, plus the tool your team uses to make them.'
  },
  {
    title: 'Creative coding and real-time graphics',
    description:
      'Visuals for stages, screens and installations that run live instead of being rendered once.'
  },
  {
    title: 'Data sonification and visualisation',
    description:
      'Turning measurements into something people can see or hear at a glance.'
  },
  {
    title: 'Tools and prototypes',
    description:
      'Internal tools, playgrounds and working prototypes that settle an argument before anything is built properly.'
  },
  {
    title: 'Spatial interfaces',
    description:
      'Interfaces for headsets and rooms, designed and reviewed at 1:1 scale.'
  },
  {
    title: 'Workshops and teaching',
    description:
      'Short courses on code as a design material, for studios and art schools.'
  }
];

export const experience: Role[] = [
  {
    years: '2022 – now',
    role: 'Independent designer and creative coder',
    studio: 'Own practice',
    city: 'Amsterdam'
  },
  {
    years: '2023 – now',
    role: 'Guest lecturer, Light & Number',
    studio: 'Kade School of Interaction',
    city: 'Rotterdam'
  },
  {
    years: '2019 – 2022',
    role: 'Senior designer, creative technology',
    studio: 'Lumen & Pol',
    city: 'Amsterdam'
  },
  {
    years: '2017 – 2019',
    role: 'Designer, identity and motion',
    studio: 'Fabrikant Studio',
    city: 'Rotterdam'
  },
  {
    years: '2016 – 2017',
    role: 'Junior designer',
    studio: 'Werkplaats Noord',
    city: 'Eindhoven'
  }
];

export const education: Role[] = [
  {
    years: '2014 – 2016',
    role: 'MA Interaction Design',
    studio: 'Graduated with the project “Weather for Two”',
    city: 'Eindhoven'
  },
  {
    years: '2009 – 2013',
    role: 'BA Graphic Design',
    studio: 'Thesis on Arabic and Latin type in public signage',
    city: 'Beirut'
  }
];

/**
 * Clients that aren't case studies. Clients of the case studies in
 * src/content/work are listed first automatically.
 */
export const otherClients: string[] = [
  'Paviljoen Zuid',
  'Orfeo Ensemble',
  'Meridian Type Foundry',
  'Nieuwe Haven Film Fund',
  'Coastline Radio',
  'Bureau Wolk',
  'Tegelhuis Delft',
  'Atelier Moreau',
  'Noordlicht Festival',
  'Studio Lindenhof'
];

export const writing: Note[] = [
  {
    slug: 'fewer-knobs',
    title: 'Give the tool fewer knobs',
    venue: 'Talk at Kaderwerk, Utrecht',
    date: '2026-09',
    body: [
      'The first version of the Veld generator had nineteen sliders. It could make anything, which meant the comms team made something different every time, and the identity dissolved by its third exhibition. The version they use now has three: density, drift and seed.',
      'Every control you add to a generative tool is a decision you hand back to someone who hired you so they wouldn’t have to make it. Locking the rest isn’t distrust. It’s the design. The system decides the type, the inks, the margins and the way the lines meet the edge of the sheet; the person decides how loud this particular show should be.',
      'My test now is simple. If two people using the tool on the same afternoon make posters that look like they came from different institutions, there are too many knobs. If they make posters that look identical, there are too few. Somewhere between is a family, and a family is what an identity is for.'
    ]
  },
  {
    slug: 'last-working-frame',
    title: 'The last working frame',
    venue: 'Kade School reader, issue 3',
    date: '2025-11',
    body: [
      'Teaching shaders, I noticed students didn’t quit at hard ideas. They quit at black screens. One missing semicolon and the picture they had been nudging for twenty minutes vanished, replaced by a log written for compiler engineers.',
      'So in Uniforms the picture never goes away. While you type, the last version that compiled keeps running, and the error appears next to the line it belongs to, in a sentence: “This line needs a semicolon at the end.” The difference in the room was immediate. People kept typing.',
      'I think about this beyond shaders. Any tool that punishes a small mistake by taking away everything you had is teaching people to stop experimenting. Keep the last good state on screen, explain what changed and let them carry on. Most of learning is just not being thrown out.'
    ]
  },
  {
    slug: 'quiet-by-default',
    title: 'Quiet by default',
    venue: 'Notes from the Undertone pilot',
    date: '2025-03',
    body: [
      'A control room at three in the morning is not a concert hall. When we started sonifying river sensors for the Lage Delta night shift, the first prototype sounded like a modular synth demo, and the operators turned it off within an hour.',
      'The version that stayed on is almost silent. Normal readings sit below the hum of the room: a low drone you notice only when it stops. Only deviation is allowed to be audible, and it arrives as a sour interval rather than an alarm, so it pulls your attention without spiking your pulse.',
      'The lesson I took away is that sound design for monitoring is mostly subtraction. You’re not making the data expressive. You’re making normal disappear, so that the one thing worth hearing has the room to itself.'
    ]
  },
  {
    slug: 'aspect-ratio-is-a-grid',
    title: 'Aspect ratio is a grid',
    venue: 'Long Take, issue 12',
    date: '2024-02',
    body: [
      'Film magazines crop stills to fit their columns, and every crop is a small act of vandalism. A frame shot at 2.39:1 was composed for that width; trim it to a tidy rectangle and you lose the actor standing at the edge, which was often the point.',
      'For the Long Take redesign we turned the problem around and built the grid from the films. Columns and rows are derived from 1.37, 1.85 and 2.39, so any still drops in at its native ratio and still lines up with the text around it. The layouts look less regular than a classic magazine, and much more like cinema.',
      'It meant giving up some control over the page. I think that was the right trade: the pictures are the subject, so the pictures set the measure.'
    ]
  }
];

export function formatNoteDate(date: string): string {
  const [year, month] = date.split('-').map(Number);
  return new Date(Date.UTC(year!, (month ?? 1) - 1, 1)).toLocaleDateString(
    'en-GB',
    { month: 'long', year: 'numeric', timeZone: 'UTC' }
  );
}
