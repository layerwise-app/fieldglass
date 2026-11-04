import { defineProject } from '~/content/types';
import { images } from './veld-kunsthal/images';

export default defineProject({
  slug: 'veld-kunsthal',
  title: 'Veld Kunsthal',
  tagline: 'An identity that redraws itself from every exhibition’s floor plan',
  client: 'Veld Kunsthal, Utrecht',
  year: 2025,
  role: 'Identity system, creative code, type',
  team: [
    'Noor Haddad — design & code',
    'Ilse Brandsma — head of communications, Veld',
    'Tomás Lindqvist — type engineering',
    'Drukkerij Kaap — risograph printing'
  ],
  discipline: 'Generative identity',
  shape: 'contour',
  order: 1,
  summary:
    'Veld runs eleven exhibitions a year with a team of two. I built an identity whose mark is a contour map grown from each show’s floor plan, and a browser tool that turns it into a full campaign in two days.',
  cover: {
    image: images.cover,
    alt: 'Three Veld posters on a dark green ground: Soft Ground in green and yellow, Field Notes for a Flood in blue and pink, Night Shift in burgundy and aqua, each with the VELD wordmark over a different contour field.'
  },
  problem: [
    'Veld Kunsthal runs eleven exhibitions a year with a communications team of two. Until 2024 every show got a guest designer and its own look, held together by a small square logo that moved from corner to corner. Eleven good campaigns a year added up to no identity at all: in a street survey, fewer than one in five people could match a Veld poster to Veld.',
    'The constraints were plain. There was no budget for agency work per show. The team doesn’t use design software day to day. And everything printed goes through Drukkerij Kaap, a risograph studio in Lombok, which means two spot inks and a fixed set of drums.'
  ],
  decisions: [
    {
      title: 'The building is the seed',
      body: 'Every show at Veld is built from temporary walls, so every show already has an installation drawing. I use that drawing as the input. Each point on the poster gets a height from its distance to the nearest wall, so walls become ridges and the contour lines flow around them. Same algorithm, a different building each time: the posters are related without being the same.'
    },
    {
      title: 'Two inks, always',
      body: 'The generator never outputs more than two layers: contour lines and type on master 1, the height as a halftone on master 2. Files go straight onto Kaap’s drums with no separation work. Each season has its pair (Hunter Green with Fluorescent Yellow, Medium Blue with Fluorescent Pink, Burgundy with Aqua), and on screen those two inks are the whole palette.'
    },
    {
      title: 'A tool, not a template',
      body: 'The team gets a browser tool with three controls, density, drift and seed, plus the plan and the show details. Typeface, grid, margins and wordmark are locked. It is very hard to make a bad Veld poster and easy to make one that feels like yours. One file exports to A2, flyers, bus shelters, Instagram and the website.'
    },
    {
      title: 'A wordmark with room for the field',
      body: 'VELD is set in a condensed grotesque, wide enough to carry the top of every poster. A thin paper halo keeps it readable on any field, and the contour lines keep running through its counters, so the mark shifts a little with every show too.'
    }
  ],
  outcome: [
    'The first season under the system ran from January to November 2025. Ilse and her colleague made all eleven campaigns in-house, and the time from installation drawing to printed poster dropped from about three weeks to two days. Veld spent nothing on agency fees for campaign design.',
    'In the autumn street survey, 64% of people recognised a Veld poster with the logo covered, against 18% the year before. Next season the generator gets one new input: the sound map Veld records at each opening, which will bend the field the way the crowd moved.'
  ],
  blocks: [
    {
      type: 'image',
      figure: {
        image: images.process,
        alt: 'Four steps left to right: a floor plan with walls, the same plan as pink halftone ridges, blue contour lines around the walls, and the finished poster for Field Notes for a Flood.'
      },
      caption:
        'Every poster starts from the show’s installation drawing. Walls become ridges, ridges become lines.'
    },
    {
      type: 'demo',
      title: 'Make a Veld poster',
      caption:
        'This is the generator the team uses, with three of the hall configurations. Change the plan or drag drift and the field redraws; switch to M1 or M2 to see each riso master on its own.',
      still: {
        image: images.demo,
        alt: 'The Veld generator: controls for title, floor plan, density, drift, seed and inks on the left, a burgundy and aqua poster for Weather Inside on the right.'
      },
      load: () => import('./veld-kunsthal/demo'),
      mobileAspect: 0.6
    },
    {
      type: 'image',
      figure: {
        image: images.posters,
        alt: 'A hoarding pasted with rows of Veld posters for six exhibitions in three seasonal ink pairs.'
      },
      caption:
        'Six of the season’s eleven campaigns, pasted up the way the city’s poster crew does it.'
    },
    {
      type: 'compare',
      before: {
        image: images.before,
        alt: 'Six 2024 Veld posters by different guest designers, each in its own style, with a small V logo in a different corner each time.'
      },
      after: {
        image: images.after,
        alt: 'Six 2025 Veld posters from the system, sharing a wordmark, grid and contour field in three ink pairs.'
      },
      labels: ['2024', '2025'],
      caption: 'The same six campaign slots, before and after.'
    },
    {
      type: 'pair',
      figures: [
        {
          image: images.layers,
          alt: 'The two riso masters for Field Notes for a Flood, blue lines and type, pink halftone, beside the combined print and Drukkerij Kaap’s job ticket.'
        },
        {
          image: images.shelter,
          alt: 'The Night Shift poster backlit in a bus shelter at the Veldkade stop at night.'
        }
      ],
      caption:
        'Two masters, one print run. The same file scales up to the city’s bus shelter format.'
    },
    {
      type: 'text',
      heading: 'What a campaign day looks like',
      body: [
        'A campaign starts when the exhibition designer signs off the installation drawing. Ilse imports it, types the title and dates, and spends ten minutes with the curator trying seeds. Drift is the only real argument: low drift keeps the rooms legible, high drift lets the topography take over.',
        'When they agree, one button writes the two masters and the digital formats. Kaap prints 300 A2 posters by Thursday, and the shelter files go to the city’s media contractor the same afternoon.'
      ]
    },
    {
      type: 'image',
      figure: {
        image: images.generator,
        alt: 'The generator in a browser: exhibition fields, six floor plans, field sliders and locked season inks on the left, the poster preview in the middle, export formats and the print run on the right.'
      },
      caption:
        'The full tool: six export formats from one file, and a short list of things nobody can change.'
    },
    {
      type: 'quote',
      quote:
        'We used to brief a designer, wait three weeks and hope. Now I open the drawing on Tuesday, try twenty seeds with the curator over coffee and send the masters to Kaap that afternoon.',
      name: 'Ilse Brandsma',
      role: 'Head of communications, Veld Kunsthal'
    },
    {
      type: 'image',
      figure: {
        image: images.website,
        alt: 'The Veld homepage with the current show, Field Notes for a Flood, beside a wide crop of its contour field, and three upcoming shows below.'
      },
      caption:
        'On the website the field crops to any shape. Each show’s banner is the same field as its poster.'
    },
    {
      type: 'metrics',
      items: [
        { value: '11/11', label: 'campaigns made in-house in 2025' },
        {
          value: '2 days',
          label: 'from installation drawing to printed poster, down from three weeks'
        },
        {
          value: '64%',
          label: 'recognised a Veld poster with the logo covered, up from 18%'
        },
        { value: '€0', label: 'spent on agency fees for campaign design' }
      ]
    }
  ]
});
