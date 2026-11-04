import type { Duo, SceneName } from './scenes';

// The sample issue's editorial content. Everything here is fictional: the
// films, the directors and the writers.

export const essay = {
  kicker: 'Essay',
  title: 'The road doesn’t cut',
  author: 'Mathis Okafor',
  film: 'Kustweg',
  director: 'Agnès Verhulst',
  year: 1991,
  standfirst:
    'For eleven minutes Agnès Verhulst holds one shot of a coast road at dusk. Mathis Okafor watched it forty times, and stopped waiting for something to happen.',
  body: [
    'For eleven minutes and four seconds the camera in Kustweg does not move. It stands on the verge of the coast road a few kilometres south of the point, facing north, at the height of someone sitting in a parked car, and Verhulst lets it run until the light gives out.',
    'Nothing is cut, so nothing can be skipped. A woman walks into the frame from the left and keeps to the verge. A car comes from the far end of the road, lights her for a moment and is gone. Somewhere in the seventh minute the lighthouse on the headland comes on, and it turns twice before she looks up at it.',
    'On a first viewing this feels like patience. By the fortieth it feels like an argument. Verhulst is not asking us to wait for something to happen; she is asking how long we will keep looking once we know that nothing will.',
    'The shot was made on 35mm in the Academy ratio, 1.37 to 1, almost square by the standards of a road film. The road needs the height. In the 1.85 video release that circulated in the nineties the sky is cut to a strip and the lighthouse beam, which sweeps the top third of the frame, loses most of its arc. It changes the ending: in the wide version she walks into the dark; in Verhulst’s she walks towards a light that has just come on.',
    'Watched properly, the take has a structure of its own. There is the dusk, which lasts almost three minutes. There is the walker, who takes most of the fourth and fifth. There are the headlights, which arrive like a cut that never happens. And there is the blue hour, in which the image slowly stops being a road and becomes a colour.'
  ],
  pull: 'Nothing is cut, so nothing can be skipped.',
  sections: [
    { tc: '00:00', title: 'Dusk' },
    { tc: '02:48', title: 'The walker' },
    { tc: '05:31', title: 'Headlights' },
    { tc: '07:40', title: 'The lighthouse' },
    { tc: '10:58', title: 'Blue hour' }
  ]
} as const;

export type TakeFrame = {
  t: number;
  /** Timecode in the film. */
  tc: string;
  /** Time since the take began. */
  rel: string;
  caption: string;
};

export const take = {
  film: 'Kustweg',
  director: 'Agnès Verhulst',
  year: 1991,
  native: 1.37,
  length: '11′04″',
  frames: [
    {
      t: 0.04,
      tc: '01:32:18:00',
      rel: '00:00',
      caption:
        'Dusk. For the first forty seconds the road is empty and the sun is still above the sea.'
    },
    {
      t: 0.2,
      tc: '01:35:06:12',
      rel: '02:48',
      caption:
        'A woman walks into the frame from the left and keeps to the verge. The camera doesn’t turn to meet her.'
    },
    {
      t: 0.38,
      tc: '01:37:49:03',
      rel: '05:31',
      caption:
        'Headlights at the far end of the road. For a minute they are the brightest thing in the shot.'
    },
    {
      t: 0.56,
      tc: '01:39:10:20',
      rel: '06:52',
      caption:
        'The car passes her. For a few frames her coat is the colour of its lights.'
    },
    {
      t: 0.72,
      tc: '01:39:58:07',
      rel: '07:40',
      caption: 'The lighthouse comes on. It turns twice before she looks up at it.'
    },
    {
      t: 0.94,
      tc: '01:43:16:15',
      rel: '10:58',
      caption:
        'Blue hour. She is a mark on the road. The shot ends six seconds after we lose her.'
    }
  ] satisfies TakeFrame[]
} as const;

export const ratios = [
  {
    value: 1.37,
    name: 'Academy',
    note: 'As shot on 35mm. The lighthouse beam crosses the top third of the frame.'
  },
  {
    value: 1.85,
    name: 'Flat',
    note: 'The 1996 video release. The sky is cut to a strip and the beam loses its arc.'
  },
  {
    value: 2.39,
    name: 'Scope',
    note: 'A 2019 streaming crop. The road survives; the sky and most of the beam don’t.'
  }
] as const;

export type Issue = {
  number: number;
  theme: string;
  season: string;
  scene: SceneName;
  ratio: number;
  t?: number;
  duo?: Duo;
  film: string;
  line: string;
};

/** The back catalogue, reset in the 2023 system for the digital archive. */
export const issues: Issue[] = [
  { number: 3, theme: 'Doors', season: 'Winter 2021', scene: 'corridor', ratio: 1.85, duo: ['#1f2a2a', '#e9e1cf'], film: 'Corridor Light', line: 'Tamás Rideg’s hallways' },
  { number: 4, theme: 'Distance', season: 'Spring 2021', scene: 'coast', ratio: 1.37, t: 0.9, duo: ['#22263d', '#efd9c4'], film: 'Kustweg', line: 'Roads that don’t arrive' },
  { number: 5, theme: 'Light', season: 'Summer 2021', scene: 'kitchen', ratio: 1.37, duo: ['#3b2616', '#f6e7c8'], film: 'Rue Haute, le matin', line: 'Seven in the morning' },
  { number: 6, theme: 'Work', season: 'Autumn 2021', scene: 'harbour', ratio: 2.39, duo: ['#1d2b2a', '#d5ddd2'], film: 'Last Ferry to Vlieland', line: 'Harbour shifts' },
  { number: 7, theme: 'Cities', season: 'Winter 2022', scene: 'tram', ratio: 2.39, duo: ['#2a1414', '#f0c9a8'], film: 'Tram 81', line: 'Night lines' },
  { number: 8, theme: 'Silence', season: 'Spring 2022', scene: 'field', ratio: 1.85, duo: ['#111a2e', '#e3e6ee'], film: 'Night Field', line: 'Where sound stops' },
  { number: 9, theme: 'Water', season: 'Summer 2022', scene: 'harbour', ratio: 1.85, duo: ['#0f2a3a', '#cfe3e6'], film: 'Last Ferry to Vlieland', line: 'Fog, in nine parts' },
  { number: 10, theme: 'Faces', season: 'Autumn 2022', scene: 'kitchen', ratio: 1.85, duo: ['#40141a', '#f3d6cc'], film: 'Rue Haute, le matin', line: 'Profiles at the table' },
  { number: 11, theme: 'Weather', season: 'Winter 2023', scene: 'tram', ratio: 1.85, duo: ['#1c2433', '#d9e1ea'], film: 'Tram 81', line: 'Rain on glass' },
  { number: 12, theme: 'Rooms', season: 'Spring 2023', scene: 'corridor', ratio: 2.39, duo: ['#2f2418', '#f0dfc0'], film: 'Corridor Light', line: 'The end of the hall' },
  { number: 13, theme: 'Night', season: 'Summer 2023', scene: 'field', ratio: 2.39, duo: ['#191226', '#e6dcef'], film: 'Night Field', line: 'Headlights, at forty' },
  { number: 14, theme: 'Duration', season: 'Autumn 2023', scene: 'coast', ratio: 1.37, t: 0.2, film: 'Kustweg', line: 'The road doesn’t cut' }
];

export const contents = [
  { page: '04', title: 'Letter from the editor', who: 'Hanne Claes', film: null },
  { page: '08', title: 'The road doesn’t cut', who: 'Mathis Okafor on Kustweg (1991)', film: { scene: 'coast' as SceneName, ratio: 1.37, t: 0.2 } },
  { page: '22', title: 'A corridor, a doorway, a held breath', who: 'Saskia Lemmens on Corridor Light (2004)', film: { scene: 'corridor' as SceneName, ratio: 1.85 } },
  { page: '36', title: 'Tram 81, in the rain', who: 'Lieve Martens in conversation with Yusuf Demir', film: { scene: 'tram' as SceneName, ratio: 2.39 } },
  { page: '50', title: 'Night Field, forty years on', who: 'Idris Benali on Osei Brandt (1979)', film: { scene: 'field' as SceneName, ratio: 1.85 } },
  { page: '64', title: 'Seven in the morning', who: 'Sofie Wauters on Rue Haute, le matin (2011)', film: { scene: 'kitchen' as SceneName, ratio: 1.37 } },
  { page: '78', title: 'Screening diary', who: 'The quarter in Brussels, Ghent and Antwerp', film: null },
  { page: '92', title: 'End crawl', who: 'Everyone who made this issue', film: null }
];
