import { defineProject } from '~/content/types';
import { images } from './uniforms/images';

export default defineProject({
  slug: 'uniforms',
  title: 'Uniforms',
  tagline: 'A shader playground for students who have never written one',
  client: 'Kade School of Interaction, Rotterdam',
  year: 2025,
  role: 'Product design, creative code, curriculum design',
  team: [
    'Noor Haddad — design & front-end',
    'Bas Verhoef — course lead',
    'Mei Takahashi — WebGL engineering',
    '140 first-year students — testing'
  ],
  discipline: 'Shader playground',
  shape: 'lattice',
  order: 3,
  summary:
    'A browser shader playground for Kade’s first-year course Light & Number. It keeps the last working frame on screen, explains errors in plain language and turns every number into a slider. Completion went from 41% to 87%.',
  cover: {
    image: images.cover,
    alt: 'The Uniforms editor open on a laptop against a bright blue ground: lesson list on the left, shader code with a frequency slider in use, and blue and white stripes in the preview.'
  },
  problem: [
    'Light & Number teaches 140 first-year students at Kade to draw with maths. For three years its shader week was the one students dreaded. They typed into a generic online editor, missed one decimal point, and the preview went black. The compiler log then pointed at line 8 for a mistake on line 4, because the editor’s hidden header shifted every line number.',
    'Bas Verhoef, who leads the course, asked for a tool that gets every student to a working shader inside one lesson. The constraints were blunt: it had to run on the school’s Chromebooks, fit a 90-minute lesson with 24 students to one teacher, and need nothing installed beyond the school account.'
  ],
  decisions: [
    {
      title: 'Never a black screen',
      body: 'The preview keeps rendering the last shader that compiled while you type. A mistake doesn’t take the picture away; it puts a coral mark on the line and one sentence under it. I rewrote the 30 most common compiler messages from two years of student logs, so “wrong operand types” becomes “GLSL wants decimals here: write 24.0 instead of 24”.'
    },
    {
      title: 'Every number is a slider',
      body: 'Any number in the code can be dragged. Students find out what 24.0 does by moving it, then read why. Dragging writes the new value back into the code, so the sketch is always the text, never hidden state that disappears on reload.'
    },
    {
      title: 'Lessons are remixes',
      body: 'Each of the eight lessons opens on a sketch that already works, with one thing missing and marked. Nobody starts from an empty file, and the first change anyone makes is a single number.'
    },
    {
      title: 'Uniforms you can watch',
      body: 'The panel the tool is named after shows u_time, u_mouse and u_resolution as live values next to the preview. The three inputs every shader gets stop being magic words and become numbers you can see changing.'
    }
  ],
  outcome: [
    'Over two cohorts, completion of the shader exercises went from 41% to 87%, and the median time to a first working shader dropped from 26 minutes to 6. Students saved 2,300 sketches in the first term, most of them remixes of someone else’s.',
    'Mei rebuilt the compile step so a full recompile takes under 4 ms on the slowest Chromebook, which is what makes dragging a number feel like touching the picture. Three partner schools now teach with Uniforms, and the error rewrites are an open list that teachers keep adding to.'
  ],
  blocks: [
    {
      type: 'demo',
      title: 'Break it on purpose',
      caption:
        'The playground itself. Pick a sketch, drag its numbers or edit the code, then press Make a mistake: the preview keeps the last working frame and the error is explained at its line.',
      still: {
        image: images.demo,
        alt: 'The Uniforms playground: shader code on the left, blue and white stripes in the preview, the live uniform values and three sliders for frequency, speed and softness.'
      },
      load: () => import('./uniforms/demo'),
      mobileAspect: 0.58
    },
    {
      type: 'compare',
      before: {
        image: images.before,
        alt: 'The editor the course used before: dark theme, a black preview and a console of five red compiler errors pointing at lines 8, 9 and 12.'
      },
      after: {
        image: images.after,
        alt: 'The same mistake in Uniforms: line 4 is marked in coral with a card saying GLSL wants decimals here, while the preview still shows the last working stripes.'
      },
      labels: ['Generic editor', 'Uniforms'],
      caption:
        'One mistake, a whole number in float maths, before and after. The old editor reported five errors starting at line 8; Uniforms shows one, at line 4, and keeps the picture.'
    },
    {
      type: 'text',
      heading: 'Writing the error messages',
      body: [
        'Mei and I collected 11,000 compile errors from two years of the old editor’s logs and grouped them by what the student had actually done wrong. Thirty patterns covered 92% of them. Each rewrite follows the same shape: what’s wrong, on which line, and the one thing to try.',
        'Only the first error is ever shown. In student code, the second and third are almost always echoes of the first, and a list of five red lines reads as “you are bad at this” rather than “add .0 here”.'
      ]
    },
    {
      type: 'image',
      figure: {
        image: images.editor,
        alt: 'The full Uniforms editor at Lesson 4: a lesson list, code where the number 31.5 is being dragged on a ruler, the striped preview, the uniforms panel, a task card and a strip of earlier saves.'
      },
      caption:
        'Lesson 4 in the editor. Dragging the frequency rewrites the number in the code as the preview follows; every save lands in the history strip.'
    },
    {
      type: 'pair',
      figures: [
        {
          image: images.lesson,
          alt: 'A printable lesson sheet titled Stripes are just sin(), with a sine wave diagram above the stripes it produces, the starter code with one marked gap and four steps.'
        },
        {
          image: images.teacher,
          alt: 'The teacher view on a tablet: 21 of 24 students have a working shader, three need help with named errors, and a chart of the most common mistakes this lesson.'
        }
      ],
      caption:
        'Left: every lesson starts from a working sketch with one marked gap. Right: the teacher view groups the class by what people are stuck on, so one explanation reaches seven students at once.'
    },
    {
      type: 'quote',
      quote:
        'The first year we used it, nobody asked me why their screen was black. They asked why their stripes were wobbling. That’s a much better question to spend a lesson on.',
      name: 'Bas Verhoef',
      role: 'Course lead, Light & Number'
    },
    {
      type: 'image',
      figure: {
        image: images.gallery,
        alt: 'A gallery of twelve student sketches: diagonal stripes, a foggy skyline, coral ripples, a bent checkerboard, a sunset, a moiré, dots, a pulsing circle, city lights at night, zebra waves, plaid and an orbiting dot.'
      },
      caption:
        'Twelve of the 2,300 sketches saved in the first term, rendered from the students’ own code.'
    },
    {
      type: 'metrics',
      items: [
        { value: '87%', label: 'finished the shader exercises, up from 41%' },
        { value: '6 min', label: 'median to a first working shader, down from 26' },
        { value: '2,300', label: 'sketches saved in the first term' },
        { value: '3', label: 'partner schools now teaching with it' }
      ]
    }
  ]
});
