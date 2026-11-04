import type { CSSProperties, ReactNode } from 'react';
import { BrowserFrame, PhoneFrame, Scale } from '~/components/frames';
import type { ScreenSet } from '~/content/screens';
import { issues } from './copy';
import { TakeViewer } from './demo';
import { credits, font, lt } from './palette';
import { ContentsPage, Cover, Masthead, Spine, Spread } from './print';
import { PhoneReader, PhoneSubscribe } from './phone';
import { Still } from './scenes';
import { EssayMiddle, EssayOpening, OldSite, TakeSection, WEB_H, WEB_W } from './web';

const issue = (n: number) => issues.find((i) => i.number === n)!;

function Board({
  width = 1440,
  height = 900,
  bg,
  children,
  style
}: {
  width?: number;
  height?: number;
  bg: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={{ width, height, background: bg, position: 'relative', overflow: 'hidden', ...style }}>{children}</div>
  );
}

const shadow = '0 50px 90px -40px rgba(15,6,5,.7), 0 14px 28px -14px rgba(15,6,5,.5)';

function CoverBoard() {
  const stack = [10, 11, 12, 13, 14];
  return (
    <Board bg={lt.oxbloodDeep}>
      {/* A stack of back issues, spines out. */}
      <div style={{ position: 'absolute', left: 150, top: 318, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {stack.map((n, i) => (
          <div key={n} style={{ transform: `translateX(${[18, -6, 10, -14, 4][i]}px)`, boxShadow: '0 6px 10px -6px rgba(0,0,0,.6)' }}>
            <Spine issue={issue(n)} length={440} thickness={[30, 34, 30, 32, 36][i]} />
          </div>
        ))}
        <div style={{ height: 22, marginTop: -4, background: 'radial-gradient(50% 50% at 50% 0%, rgba(0,0,0,.45), rgba(0,0,0,0))' }} />
      </div>
      {/* The back issue, under the new one. */}
      <div style={{ position: 'absolute', left: 900, top: 136, transform: 'rotate(5deg)', boxShadow: shadow }}>
        <Cover issue={issue(13)} width={440} />
      </div>
      <div style={{ position: 'absolute', left: 690, top: 140, transform: 'rotate(-1.5deg)', boxShadow: shadow }}>
        <Cover issue={issue(14)} width={476} />
      </div>
    </Board>
  );
}

function SpreadBoard() {
  return (
    <Board bg='#201b18'>
      <div style={{ position: 'absolute', left: 120, top: 59 }}>
        <Spread />
      </div>
    </Board>
  );
}

function Box({ w, ratio, label, size }: { w: number; ratio: number; label: string; size: string }) {
  const h = w / ratio;
  return (
    <div style={{ width: w, height: h, border: `1px solid ${lt.ink}`, position: 'relative', background: 'rgba(122,31,31,.05)' }}>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }} aria-hidden>
        <line x1='0' y1='0' x2={w} y2={h} stroke={lt.ink} strokeWidth='0.6' opacity='0.35' />
        <line x1={w} y1='0' x2='0' y2={h} stroke={lt.ink} strokeWidth='0.6' opacity='0.35' />
      </svg>
      <div style={{ position: 'absolute', left: 8, top: 6, fontFamily: font.pixel, fontSize: 11, color: lt.oxblood }}>{label}</div>
      <div style={{ position: 'absolute', right: 8, bottom: 6, fontFamily: font.pixel, fontSize: 10, color: lt.inkSoft }}>{size}</div>
    </div>
  );
}

function GridBoard() {
  const pageW = 520;
  const pageH = pageW / (230 / 300);
  const m = 34;
  const measure = pageW - m * 2;
  const col = (measure - 16) / 2;
  const formats = [
    { r: 1.37, name: 'Academy', note: '35mm before widescreen, and much art cinema since' },
    { r: 1.85, name: 'Flat', note: 'Most European and American features' },
    { r: 2.39, name: 'Scope', note: 'Anamorphic widescreen' }
  ];
  return (
    <Board bg={lt.paper}>
      {/* A page with its picture boxes. */}
      <div style={{ position: 'absolute', left: 120, top: (900 - pageH) / 2, width: pageW, height: pageH, background: '#f6f1e6', boxShadow: '0 30px 60px -30px rgba(40,25,15,.35), 0 0 0 1px rgba(40,25,15,.08)' }}>
        <div style={{ position: 'absolute', inset: m, outline: `1px dashed ${lt.oxblood}`, opacity: 0.55 }} />
        <div style={{ position: 'absolute', top: m, bottom: m, left: m + col, width: 16, background: 'rgba(122,31,31,.07)' }} />
        <div style={{ position: 'absolute', left: m, top: m, width: measure }}>
          <div style={{ position: 'relative' }}>
            <Still scene='tram' ratio={2.39} width={measure} grain={false} />
            <div style={{ position: 'absolute', left: 8, top: 6, fontFamily: font.pixel, fontSize: 11, color: lt.paper }}>2.39</div>
            <div style={{ position: 'absolute', right: 8, bottom: 6, fontFamily: font.pixel, fontSize: 10, color: lt.paper }}>196 × 82 MM</div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            <div style={{ width: col }}>
              <Box w={col} ratio={1.37} label='1.37' size='90 × 66' />
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Array.from({ length: 13 }, (_, i) => (
                  <div key={i} style={{ height: 4, background: lt.rule, width: i === 12 ? '60%' : '100%' }} />
                ))}
              </div>
            </div>
            <div style={{ width: col, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} style={{ height: 4, background: lt.rule, width: i === 8 ? '40%' : '100%' }} />
              ))}
              <div style={{ margin: '10px 0' }}>
                <Box w={col} ratio={1.85} label='1.85' size='90 × 49' />
              </div>
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} style={{ height: 4, background: lt.rule, width: i === 6 ? '70%' : '100%' }} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: m, bottom: 13, fontFamily: font.pixel, fontSize: 9, color: lt.grey }}>230 × 300 MM — MEASURE 196 MM — 2 COLUMNS</div>
      </div>
      {/* The key. */}
      <div style={{ position: 'absolute', left: 760, top: 120, width: 560 }}>
        <div style={{ fontFamily: font.pixel, fontSize: 12, letterSpacing: '0.06em', color: lt.oxblood }}>THE GRID</div>
        <div style={{ fontFamily: font.serif, fontSize: 62, lineHeight: 0.95, letterSpacing: '-0.02em', marginTop: 14, color: lt.ink }}>
          Three formats,
          <br />
          one measure
        </div>
        <p style={{ fontFamily: font.serif, fontSize: 21, lineHeight: 1.4, marginTop: 22, color: lt.inkSoft }}>
          Every picture box is the full measure or one column wide, and always one of three heights. Stills arrive cropped by their licence, so the page is built to fit the still.
        </p>
        <div style={{ display: 'flex', gap: 22, marginTop: 40, alignItems: 'flex-end' }}>
          {formats.map((f) => (
            <div key={f.r} style={{ width: 168 }}>
              <div style={{ width: 168, height: 168 / f.r, overflow: 'hidden' }}>
                <Still scene='coast' ratio={f.r} width={168} t={0.72} grain={false} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 22, marginTop: 12 }}>
          {formats.map((f) => (
            <div key={f.r} style={{ width: 168, borderTop: `1px solid ${lt.ink}`, paddingTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: font.pixel, fontSize: 13, color: lt.oxblood }}>{f.r.toFixed(2)}</span>
                <span style={{ ...credits, fontSize: 12, color: lt.ink }}>{f.name}</span>
              </div>
              <div style={{ fontFamily: font.sans, fontSize: 13, lineHeight: 1.35, color: lt.inkSoft, marginTop: 6 }}>{f.note}</div>
            </div>
          ))}
        </div>
      </div>
    </Board>
  );
}

function BrowserBoard({ bg, url, dark, children }: { bg: string; url: string; dark?: boolean; children: ReactNode }) {
  const width = 1200;
  const height = ((WEB_H + 44) * width) / WEB_W;
  return (
    <Board bg={bg}>
      <div style={{ position: 'absolute', left: 120, top: (900 - height) / 2 }}>
        <BrowserFrame width={width} url={url} viewportWidth={WEB_W} viewportHeight={WEB_H} tone={dark ? 'dark' : 'light'}>
          {children}
        </BrowserFrame>
      </div>
    </Board>
  );
}

function ArchiveBoard() {
  const w = 192;
  const gap = 30;
  const x0 = (1440 - (6 * w + 5 * gap)) / 2;
  return (
    <Board bg='#201b18'>
      <div style={{ position: 'absolute', left: x0, right: x0, top: 92, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', color: lt.paper }}>
        <Masthead width={156} height={28} color={lt.paper} />
        <span style={{ fontFamily: font.pixel, fontSize: 12, letterSpacing: '0.06em', color: '#b8ad9c' }}>THE ARCHIVE — N°3 TO N°14 — 2021 TO 2023</span>
      </div>
      <div style={{ position: 'absolute', left: x0, top: 150, display: 'grid', gridTemplateColumns: `repeat(6, ${w}px)`, columnGap: gap, rowGap: 34 }}>
        {issues.map((iss) => (
          <div key={iss.number}>
            <div style={{ boxShadow: '0 20px 30px -18px rgba(0,0,0,.8)' }}>
              <Cover issue={iss} width={w} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: font.pixel, fontSize: 10, color: '#b8ad9c', letterSpacing: '0.04em' }}>
              <span style={{ color: lt.paper }}>N°{iss.number}</span>
              <span>{iss.season.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </Board>
  );
}

function SubscribeBoard() {
  return (
    <Board bg={lt.oxblood} height={1800}>
      <div style={{ position: 'absolute', left: 104, top: 250 }}>
        <PhoneFrame width={590} tone='graphite'>
          <PhoneSubscribe />
        </PhoneFrame>
      </div>
      <div style={{ position: 'absolute', left: 746, top: 330 }}>
        <PhoneFrame width={590} tone='graphite'>
          <PhoneReader />
        </PhoneFrame>
      </div>
      <div style={{ position: 'absolute', left: 104, top: 160, display: 'flex', gap: 18, alignItems: 'baseline', color: lt.paper }}>
        <span style={{ fontFamily: font.pixel, fontSize: 18, letterSpacing: '0.06em' }}>LONGTAKE.BE</span>
        <span style={{ ...credits, fontSize: 22, opacity: 0.85 }}>Subscribe, then read the issue</span>
      </div>
    </Board>
  );
}

function ContentsBoard() {
  return (
    <Board bg={lt.paperShade} height={1800}>
      <div style={{ position: 'absolute', left: 100, top: 92 }}>
        <Scale width={1240} contentWidth={620} contentHeight={808} style={{ boxShadow: '0 50px 90px -40px rgba(40,25,15,.45), 0 0 0 1px rgba(40,25,15,.06)' }}>
          <ContentsPage />
        </Scale>
      </div>
    </Board>
  );
}

function DemoBoard() {
  return (
    <Scale width={1440} contentWidth={1120} contentHeight={700}>
      <div style={{ position: 'relative', width: 1120, height: 700 }}>
        <TakeViewer initialFrame={4} initialRatio={1.85} />
      </div>
    </Scale>
  );
}

const compareBg = lt.paperDeep;

export const screens: ScreenSet = {
  cover: { width: 1440, height: 900, render: () => <CoverBoard /> },
  spread: { width: 1440, height: 900, render: () => <SpreadBoard /> },
  grid: { width: 1440, height: 900, render: () => <GridBoard /> },
  'essay-web': {
    width: 1440,
    height: 900,
    render: () => (
      <BrowserBoard bg={lt.oxblood} url='longtake.be/14/the-road-doesnt-cut#07-40'>
        <EssayMiddle />
      </BrowserBoard>
    )
  },
  take: {
    width: 1440,
    height: 900,
    render: () => (
      <BrowserBoard bg={lt.paperDeep} url='longtake.be/14/the-road-doesnt-cut#take-01' dark>
        <TakeSection />
      </BrowserBoard>
    )
  },
  archive: { width: 1440, height: 900, render: () => <ArchiveBoard /> },
  subscribe: { width: 1440, height: 1800, render: () => <SubscribeBoard /> },
  contents: { width: 1440, height: 1800, render: () => <ContentsBoard /> },
  before: {
    width: 1440,
    height: 900,
    render: () => (
      <BrowserBoard bg={compareBg} url='www.longtake-magazine.be/index.php?page=essay&id=1142&p=1'>
        <OldSite />
      </BrowserBoard>
    )
  },
  after: {
    width: 1440,
    height: 900,
    render: () => (
      <BrowserBoard bg={compareBg} url='longtake.be/14/the-road-doesnt-cut'>
        <EssayOpening />
      </BrowserBoard>
    )
  },
  demo: { width: 1440, height: 900, render: () => <DemoBoard /> }
};

