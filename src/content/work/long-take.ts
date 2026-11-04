import { defineProject } from '~/content/types';
import { images } from './long-take/images';

export default defineProject({
  slug: 'long-take',
  title: 'Long Take',
  tagline: 'A film quarterly whose grid is made of aspect ratios',
  client: 'Long Take, Brussels',
  year: 2023,
  role: 'Art direction, editorial design, web',
  team: [
    'Noor Haddad — art direction & web design',
    'Hanne Claes — editor-in-chief',
    'Yusuf Demir — picture editor',
    'Lotte van Dijk — development'
  ],
  discipline: 'Editorial design',
  shape: 'ribbon',
  order: 6,
  summary:
    'A relaunch for a Brussels film quarterly: a print grid built from film formats, so no still is ever cropped, and a website where essays pause for takes.',
  cover: {
    image: images.cover,
    alt: 'Issue 14 of Long Take, “Duration”, with a coast road at dusk on its cover, beside issue 13 and a stack of back issues on a dark red ground.'
  },
  problem: [
    'Long Take had 6,000 print subscribers and a website that was a list of PDFs. Its essays about single shots, the thing the magazine is known for, were split into seven pages and run between banner ads. The one idea the magazine cares about, not cutting away, was the first thing the website did to every essay.',
    'The constraints were real. The team is four people who think in print first. Most stills are licensed only at specific crops, usually the film’s own ratio, so I couldn’t resize pictures to suit a layout. And there was budget for one developer for three months, for print and web together.'
  ],
  decisions: [
    {
      title: 'Aspect ratio as grid',
      body: 'I built the print grid from film formats before columns. Every picture box is the full measure or one column wide, at one of three heights: 1.37, 1.85 or 2.39. A still always sits at its native ratio, so Yusuf never has to ask a distributor for a different crop, and every page shows how the film was shot.'
    },
    {
      title: 'Takes',
      body: 'On the web, an essay pauses for a take. The page dims like a cinema and a sequence of stills from the shot under discussion runs sideways, uninterrupted, with its timecodes. You can scroll it, step through it with the arrow keys or let it play.'
    },
    {
      title: 'Type from the cinema',
      body: 'Instrument Serif sets the essays, with the warmth of an old cinema programme. A condensed grotesque sets the masthead, captions and credits like an end crawl. Departure Mono carries every timecode, so numbers that refer to the film look like they came off a screen.'
    },
    {
      title: 'Timecodes as navigation',
      body: 'Each essay’s sections are marked with timecodes from the film it discusses. The rail beside every essay is a table of contents and a position in the shot at once: 07:40 is both “The lighthouse” and how far into the take you are.'
    }
  ],
  outcome: [
    'The relaunch issue, N°14, went out in September 2023 with the new site. In the first six months web readership rose 3.2 times, and readers stayed an average of 11 minutes on an essay. On the old site most of them left after the first of seven pages.',
    'Print subscriptions rose 18% after the relaunch issue, which mattered more to the magazine than any web number: the site now works as the trailer for the paper. Lotte built it in eleven weeks, and the four of them now put each new issue online in a day.'
  ],
  blocks: [
    {
      type: 'demo',
      title: 'Take viewer',
      caption:
        'Six stills from the eleven-minute final shot of Kustweg. Switch the ratio to see what a 1996 video release and a 2019 streaming crop did to it, and step through with the arrow keys, the scrubber or Play.',
      still: {
        image: images.demo,
        alt: 'The take viewer: a coast road at blue hour with a lighthouse beam, masked to 1.85, with the timecode +07:40, a caption, a scrubber and six thumbnails.'
      },
      load: () => import('./long-take/demo'),
      mobileAspect: 4 / 5
    },
    {
      type: 'text',
      heading: 'Lights down',
      body: [
        'The dark take section started as a joke in a meeting: what if the page turned the lights off? It stayed because it does a job. Readers move from reading to looking, and the change of colour tells them the rules have changed. The text stops, the pictures run, and nothing is cut until the take ends.',
        'It also solved the licensing problem on screen. A take shows each still at its native ratio inside the same frame, so a 2.39 shot and a 1.37 shot can sit in one essay without either being cropped to match the other.'
      ]
    },
    {
      type: 'image',
      figure: {
        image: images.spread,
        alt: 'The opening spread of the essay “The road doesn’t cut”: a large serif headline and a 1.37 still of the coast road on the left page, two columns of text with a 2.39 still of rain on a tram window and a 1.85 still of a lit corridor on the right.'
      },
      caption:
        'The opening spread of the cover essay. The 1.37 still runs the full measure on the left; the right page uses a 2.39 box and a column-wide 1.85 box on the same grid.'
    },
    {
      type: 'image',
      figure: {
        image: images.grid,
        alt: 'A diagram of the page grid with picture boxes at 2.39, 1.37 and 1.85, next to the title “Three formats, one measure” and the same frame shown at each of the three ratios.'
      },
      caption:
        'The grid. Every picture box is the full measure or one column wide, at one of three film formats.'
    },
    {
      type: 'compare',
      before: {
        image: images.before,
        alt: 'The old Long Take website: a blue header, a list of PDF downloads, the essay split into page 1 of 7 with a small cropped still, banner ads and a cookie bar.'
      },
      after: {
        image: images.after,
        alt: 'The new essay page: a timecode rail on the left, a large serif headline “The road doesn’t cut”, a standfirst, film credits on the right and the still beginning below.'
      },
      labels: ['Before', 'After'],
      caption:
        'The cover essay of N°14 as the old site would have run it, split across seven pages between banners, and as it runs now.'
    },
    {
      type: 'image',
      figure: {
        image: images.take,
        alt: 'A take on the website: the page has turned dark and three stills from the coast road run sideways with timecodes, captions and a timeline below.'
      },
      caption:
        'A take on the web. The page dims and the stills run sideways with their timecodes; the timeline below is the eleven minutes of the shot.'
    },
    {
      type: 'quote',
      quote:
        'We used to apologise for our pictures. Every still was the wrong shape for the page. Now the page is the shape of the pictures, and readers notice before they can say why.',
      name: 'Hanne Claes',
      role: 'Editor-in-chief, Long Take'
    },
    {
      type: 'image',
      figure: {
        image: images['essay-web'],
        alt: 'Further down the essay page: a paragraph, the coast road at blue hour with the lighthouse beam at its native 1.37 ratio, and a margin note showing the same frame cropped to 1.85.'
      },
      caption:
        'Further into the essay: the still at its native ratio, and a margin note with the same frame as the 1996 release cropped it.'
    },
    {
      type: 'pair',
      figures: [
        {
          image: images.subscribe,
          alt: 'Two phones on a dark red ground: the subscription page with three plans and a member screening, and the issue reader showing the essay with a still of a car passing the walker.'
        },
        {
          image: images.contents,
          alt: 'The printed contents page of issue 14, “Duration”, listing eight features with page numbers in red and small stills at their native ratios.'
        }
      ],
      caption:
        'Subscribing and reading on a phone, and the printed contents page of N°14, where every thumbnail keeps its film’s ratio.'
    },
    {
      type: 'image',
      figure: {
        image: images.archive,
        alt: 'Twelve covers of Long Take, issues 3 to 14, in two rows on a dark ground. Each has the condensed masthead, a still at its own ratio printed in two inks and a one-word theme in serif.'
      },
      caption:
        'The back catalogue, reset in the new system for the digital archive. Earlier issues are printed in two inks; N°14 was the first in full colour.'
    },
    {
      type: 'metrics',
      items: [
        { value: '3.2×', label: 'Web readership in the first six months' },
        { value: '11 min', label: 'Average time on an essay' },
        { value: '+18%', label: 'Print subscriptions after N°14' },
        { value: '0', label: 'Stills cropped to fit a page' }
      ]
    }
  ]
});
