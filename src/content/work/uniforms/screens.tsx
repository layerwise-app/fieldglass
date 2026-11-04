import { Scale } from '~/components/frames';
import type { ScreenSet } from '~/content/screens';
import Demo from './demo';
import {
  EditorUI,
  Gallery,
  Laptop,
  LessonSheet,
  OldEditor,
  Tablet,
  TeacherView
} from './parts';
import { presets } from './shaders';
import { Pixel, Wordmark, uf } from './ui';

const stripes = presets[0]!.code;
const scrubbed = stripes.replace('uv.x * 24.0', 'uv.x * 31.5');
const mistake = stripes.replace('uv.x * 24.0', 'uv.x * 24');

const freq = (value: string) => stripes.replace('uv.x * 24.0', `uv.x * ${value}`);
const still = (value: string) => freq(value).replace('u_time * 2.0', 'u_time * 0.0');

const editorHistory = [
  { label: '12:31', code: still('4.0'), time: 0 },
  { label: '12:33', code: still('8.0'), time: 0 },
  { label: '12:36', code: still('16.0'), time: 0 },
  { label: '12:38', code: still('24.0'), time: 0 },
  { label: '12:40', code: freq('24.0'), time: 1.2 },
  { label: 'Now', code: scrubbed, time: 2.4, state: 'current' as const }
];

const afterHistory = [
  { label: '12:33', code: still('8.0'), time: 0 },
  { label: '12:36', code: still('16.0'), time: 0 },
  { label: '12:38', code: still('24.0'), time: 0 },
  { label: '12:39', code: freq('24.0'), time: 0.6 },
  { label: '12:40:18', code: stripes, time: 2.4, state: 'current' as const },
  { label: 'Now · 1 fix', code: stripes, time: 2.4, state: 'broken' as const }
];

const scrub = {
  line: 4,
  index: 0,
  label: 'Frequency',
  min: 2,
  max: 80,
  value: 31.5
};

const oldLog = [
  "ERROR: 0:8: '*' : wrong operand types - no operation '*' exists that takes a left-hand operand of type 'in mediump float' and a right operand of type 'const int' (or there is no acceptable conversion)",
  "ERROR: 0:9: 'wave' : undeclared identifier",
  "ERROR: 0:9: 'smoothstep' : no matching overloaded function found",
  "ERROR: 0:12: 'stripe' : undeclared identifier",
  "ERROR: 0:12: 'mix' : no matching overloaded function found",
  'ERROR: 5 compilation errors.  No code generated.'
];

export const screens: ScreenSet = {
  cover: {
    width: 1440,
    height: 900,
    render: () => (
      <div style={{ width: 1440, height: 900, background: uf.blue, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 64, top: 56 }}>
          <Wordmark size={24} color={uf.white} live={uf.ink} />
        </div>
        <div style={{ position: 'absolute', right: 64, top: 60 }}>
          <Pixel color='#C9CEFF'>A shader playground · 2025</Pixel>
        </div>
        <div style={{ position: 'absolute', left: (1440 - 1026) / 2, top: 176 }}>
          <Laptop width={900}>
            <EditorUI
              width={1366}
              height={768}
              code={scrubbed}
              previewCode={scrubbed}
              previewTime={2.4}
              scrub={scrub}
              uniforms={['14.27 s', '0.62, 0.41', '960 × 690']}
            />
          </Laptop>
        </div>
        <div style={{ position: 'absolute', left: 64, bottom: 52 }}>
          <Pixel color='#C9CEFF'>Light &amp; Number — Kade School of Interaction, Rotterdam</Pixel>
        </div>
        <div style={{ position: 'absolute', right: 64, bottom: 52 }}>
          <Pixel color='#C9CEFF'>140 students · 8 lessons · 0 installs</Pixel>
        </div>
      </div>
    )
  },
  editor: {
    width: 1440,
    height: 900,
    render: () => (
      <EditorUI
        width={1440}
        height={900}
        code={scrubbed}
        previewCode={scrubbed}
        previewTime={2.4}
        scrub={scrub}
        history={editorHistory}
      />
    )
  },
  before: {
    width: 1440,
    height: 900,
    render: () => <OldEditor width={1440} height={900} code={mistake} log={oldLog} />
  },
  after: {
    width: 1440,
    height: 900,
    render: () => (
      <EditorUI
        width={1440}
        height={900}
        sidebar={false}
        code={mistake}
        previewCode={stripes}
        previewTime={2.4}
        error={{
          line: 4,
          title: 'GLSL wants decimals here',
          hint: 'Write 24.0 instead of 24. In a shader, a number that meets a float needs a decimal point.',
          raw: "Compiler said: 0:8 '*' wrong operand types"
        }}
        uniforms={['12.03 s', '0.50, 0.50', '1220 × 704']}
        history={afterHistory}
      />
    )
  },
  lesson: {
    width: 1440,
    height: 1800,
    render: () => <LessonSheet />
  },
  teacher: {
    width: 1440,
    height: 1800,
    render: () => (
      <div style={{ width: 1440, height: 1800, background: uf.blue, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 220, top: 197 }}>
          <Tablet width={1000}>
            <TeacherView />
          </Tablet>
        </div>
      </div>
    )
  },
  gallery: {
    width: 1440,
    height: 900,
    render: () => <Gallery />
  },
  demo: {
    width: 1440,
    height: 900,
    render: () => (
      <Scale width={1440} contentWidth={1120} contentHeight={700}>
        <div style={{ position: 'relative', width: 1120, height: 700 }}>
          <Demo />
        </div>
      </Scale>
    )
  }
};
