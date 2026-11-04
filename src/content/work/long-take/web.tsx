import type { CSSProperties, ReactNode } from 'react';
import { essay, issues, take } from './copy';
import { credits, font, lt } from './palette';
import { Masthead } from './print';
import { Still } from './scenes';

/* longtake.be, laid out at 1280 × 800. */
export const WEB_W = 1280;
export const WEB_H = 800;

function Nav({ dark = false, active }: { dark?: boolean; active?: string }) {
  const fg = dark ? lt.paper : lt.ink;
  return (
    <div
      style={{
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        borderBottom: `1px solid ${dark ? '#3a3330' : lt.ink}`,
        color: fg,
        background: dark ? lt.screen : lt.paper,
        position: 'relative',
        zIndex: 2
      }}
    >
      <Masthead width={150} height={26} color={fg} />
      <div style={{ display: 'flex', gap: 30, marginLeft: 64, ...credits, fontSize: 13 }}>
        {['Issues', 'Essays', 'Takes', 'Screenings', 'Archive'].map((item) => (
          <span
            key={item}
            style={{
              borderBottom: item === active ? `2px solid ${dark ? lt.paper : lt.oxblood}` : '2px solid transparent',
              paddingBottom: 3
            }}
          >
            {item}
          </span>
        ))}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 22 }}>
        <span style={{ fontFamily: font.pixel, fontSize: 11, letterSpacing: '0.04em', opacity: 0.8 }}>N°14 — DURATION</span>
        <span
          style={{
            ...credits,
            fontSize: 13,
            background: dark ? lt.paper : lt.oxblood,
            color: dark ? lt.ink : lt.paper,
            padding: '9px 16px 8px',
            borderRadius: 2
          }}
        >
          Subscribe
        </span>
      </div>
    </div>
  );
}

function TimecodeRail({ active, progress }: { active: number; progress: number }) {
  return (
    <div style={{ width: 196 }}>
      <div style={{ fontFamily: font.pixel, fontSize: 10, letterSpacing: '0.06em', color: lt.grey }}>IN THIS TAKE</div>
      <div style={{ position: 'relative', marginTop: 16, paddingLeft: 16 }}>
        <div style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 1, background: lt.rule }} />
        <div style={{ position: 'absolute', left: 0, top: 6, height: `${progress * 100}%`, width: 1, background: lt.oxblood }} />
        {essay.sections.map((section, i) => (
          <div key={section.tc} style={{ position: 'relative', padding: '7px 0' }}>
            <span
              style={{
                position: 'absolute',
                left: -19,
                top: 13,
                width: 7,
                height: 7,
                borderRadius: 4,
                background: i <= active ? lt.oxblood : lt.paper,
                border: `1px solid ${i <= active ? lt.oxblood : lt.rule}`
              }}
            />
            <div style={{ fontFamily: font.pixel, fontSize: 11, color: i === active ? lt.oxblood : lt.grey }}>{section.tc}</div>
            <div style={{ fontFamily: font.serif, fontSize: 18, lineHeight: 1.15, color: i === active ? lt.ink : lt.inkSoft }}>{section.title}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 22, ...credits, fontSize: 10, color: lt.grey, lineHeight: 1.6 }}>
        14 min read
        <br />
        Issue 14, Autumn 2023
      </div>
    </div>
  );
}

function FilmCredits() {
  const rows: [string, string][] = [
    ['Film', 'Kustweg'],
    ['Country', 'Belgium, 1991'],
    ['Directed by', 'Agnès Verhulst'],
    ['Photography', 'Toon de Graeve'],
    ['Format', '35mm, 1.37:1'],
    ['Running time', '104 min'],
    ['The take', '01:32:18 – 01:43:22']
  ];
  return (
    <div style={{ width: 210 }}>
      <div style={{ fontFamily: font.pixel, fontSize: 10, letterSpacing: '0.06em', color: lt.grey }}>CREDITS</div>
      <div style={{ marginTop: 14 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ padding: '7px 0', borderTop: `1px solid ${lt.rule}` }}>
            <div style={{ ...credits, fontSize: 10, color: lt.grey, fontWeight: 500 }}>{k}</div>
            <div style={{ ...credits, fontSize: 14, marginTop: 1 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  width: WEB_W,
  height: WEB_H,
  background: lt.paper,
  color: lt.ink,
  position: 'relative',
  overflow: 'hidden'
};

/** The top of the essay page. */
export function EssayOpening() {
  return (
    <div style={pageStyle}>
      <Nav active='Essays' />
      <div style={{ display: 'flex', padding: '56px 40px 0', gap: 56 }}>
        <TimecodeRail active={0} progress={0.04} />
        <div style={{ width: 640 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
            <span style={{ ...credits, fontSize: 13, color: lt.oxblood }}>Essay</span>
            <span style={{ fontFamily: font.pixel, fontSize: 11, color: lt.grey }}>ON KUSTWEG (1991) — ONE SHOT, 11′04″</span>
          </div>
          <h1 style={{ fontFamily: font.serif, fontWeight: 400, fontSize: 104, lineHeight: 0.9, letterSpacing: '-0.025em', margin: '18px 0 0' }}>
            The road
            <br />
            doesn’t cut
          </h1>
          <p style={{ fontFamily: font.serif, fontStyle: 'italic', fontSize: 25, lineHeight: 1.3, marginTop: 26, color: lt.inkSoft }}>
            {essay.standfirst}
          </p>
          <div style={{ ...credits, fontSize: 12, marginTop: 22 }}>Words Mathis Okafor</div>
          <div style={{ marginTop: 34 }}>
            <Still scene='coast' ratio={1.37} width={640} t={0.04} />
          </div>
        </div>
        <div style={{ paddingTop: 6 }}>
          <FilmCredits />
        </div>
      </div>
    </div>
  );
}

/** Further down: a still at its native ratio, with a margin note. */
export function EssayMiddle() {
  return (
    <div style={pageStyle}>
      <Nav active='Essays' />
      <div style={{ display: 'flex', padding: '40px 40px 0', gap: 56 }}>
        <TimecodeRail active={3} progress={0.68} />
        <div style={{ width: 640 }}>
          <p style={{ fontFamily: font.serif, fontSize: 21, lineHeight: 1.5, margin: 0 }}>{essay.body[2]}</p>
          <div style={{ marginTop: 30 }}>
            <Still scene='coast' ratio={1.37} width={640} t={0.72} />
            <div style={{ display: 'flex', gap: 14, marginTop: 10, alignItems: 'baseline' }}>
              <span style={{ fontFamily: font.pixel, fontSize: 12, color: lt.oxblood }}>07:40</span>
              <span style={{ ...credits, fontSize: 12, fontWeight: 500, color: lt.inkSoft }}>
                The lighthouse comes on. Kustweg, 1991, at its native 1.37:1. Nothing in this frame has been cropped.
              </span>
            </div>
          </div>
          <p style={{ fontFamily: font.serif, fontSize: 21, lineHeight: 1.5, marginTop: 30 }}>{essay.body[3]}</p>
        </div>
        <div style={{ width: 210, paddingTop: 300 }}>
          <div style={{ fontFamily: font.pixel, fontSize: 10, letterSpacing: '0.06em', color: lt.grey }}>THE SAME FRAME, 1996</div>
          <div style={{ marginTop: 10 }}>
            <Still scene='coast' ratio={1.85} width={210} t={0.72} grain={false} />
          </div>
          <p style={{ fontFamily: font.serif, fontStyle: 'italic', fontSize: 16, lineHeight: 1.35, marginTop: 10, color: lt.inkSoft }}>
            The video release masked the frame to 1.85. The beam’s arc runs out of picture.
          </p>
        </div>
      </div>
    </div>
  );
}

/** A take: the page goes dark and the stills run sideways. */
export function TakeSection() {
  const frames = take.frames;
  const h = 430;
  const w = h * 1.37;
  const current = 2;
  const left = (WEB_W - w) / 2 - current * (w + 28);
  return (
    <div style={{ ...pageStyle, background: lt.screen, color: lt.paper }}>
      <Nav dark active='Essays' />
      <div style={{ display: 'flex', alignItems: 'baseline', padding: '40px 40px 0', gap: 18 }}>
        <span style={{ fontFamily: font.pixel, fontSize: 12, letterSpacing: '0.06em' }}>TAKE 01</span>
        <span style={{ ...credits, fontSize: 14 }}>Kustweg — the final shot — six stills — 11′04″ without a cut</span>
        <span style={{ marginLeft: 'auto', fontFamily: font.pixel, fontSize: 12, color: '#a39a8b' }}>03 / 06</span>
      </div>
      <div style={{ position: 'absolute', top: 150, left, display: 'flex', gap: 28 }}>
        {frames.map((frame, i) => (
          <div key={frame.tc} style={{ width: w, opacity: i === current ? 1 : 0.45 }}>
            <Still scene='coast' ratio={1.37} width={w} t={frame.t} />
            <div style={{ display: 'flex', gap: 14, marginTop: 14, alignItems: 'baseline' }}>
              <span style={{ fontFamily: font.pixel, fontSize: 12, color: '#e7b0a6' }}>+{frame.rel}</span>
              <span style={{ fontFamily: font.serif, fontSize: 19, lineHeight: 1.3, maxWidth: w - 80 }}>{frame.caption}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 40, right: 40, bottom: 34 }}>
        <div style={{ position: 'relative', height: 14 }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 6, height: 1, background: '#3a3330' }} />
          <div style={{ position: 'absolute', left: 0, width: '49.8%', top: 6, height: 1, background: lt.paper }} />
          {frames.map((frame, i) => {
            const [m, s] = frame.rel.split(':').map(Number);
            const x = ((m! * 60 + s!) / 664) * 100;
            return (
              <span
                key={frame.tc}
                style={{
                  position: 'absolute',
                  left: `${x}%`,
                  top: 1,
                  width: 1,
                  height: 11,
                  background: i <= current ? lt.paper : '#5a514b'
                }}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: font.pixel, fontSize: 11, color: '#a39a8b', marginTop: 8 }}>
          <span>01:32:18</span>
          <span>SCROLL SIDEWAYS — OR USE ← →</span>
          <span>01:43:22</span>
        </div>
      </div>
    </div>
  );
}

/* The site before: every issue as a PDF, essays split into pages. */

const old = {
  blue: '#2d4f8c',
  link: '#1a4fd6',
  text: '#333333',
  line: '#d8d8d8'
};

function OldAd({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, color: '#999', textTransform: 'uppercase', marginBottom: 3 }}>Advertisement</div>
      {children}
    </div>
  );
}

export function OldSite() {
  const pdfs = issues
    .slice(-7, -1)
    .reverse()
    .map((issue, i) => `Issue ${issue.number} – ${issue.season} (PDF, ${[48.2, 51.7, 39.4, 44.9, 57.3, 41.6][i]} MB)`);
  return (
    <div style={{ ...pageStyle, background: '#ffffff', color: old.text, fontFamily: 'Verdana, Geneva, sans-serif' }}>
      <div style={{ background: old.blue, color: '#fff', padding: '18px 40px 14px', display: 'flex', alignItems: 'flex-end', gap: 16 }}>
        <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 34, letterSpacing: '0.02em' }}>LONG TAKE</span>
        <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, marginBottom: 6 }}>the magazine for people who love film</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, marginBottom: 6 }}>Login | Register | Contact</span>
      </div>
      <div style={{ display: 'flex', gap: 2, padding: '0 40px', background: '#e9edf5', borderBottom: `1px solid ${old.line}` }}>
        {['Home', 'Current issue', 'Back issues', 'Reviews', 'Events', 'Shop', 'About us'].map((item, i) => (
          <span key={item} style={{ fontSize: 12, padding: '9px 14px', background: i === 2 ? '#fff' : 'transparent', borderRight: `1px solid ${old.line}`, color: i === 2 ? old.text : old.link }}>
            {item}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 30, padding: '22px 40px' }}>
        <div style={{ width: 230, fontSize: 11, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, fontSize: 13, borderBottom: `2px solid ${old.blue}`, paddingBottom: 4 }}>Download back issues</div>
          {pdfs.map((line) => (
            <div key={line} style={{ color: old.link, textDecoration: 'underline', padding: '5px 0', borderBottom: `1px dotted ${old.line}` }}>
              {line}
            </div>
          ))}
          <div style={{ marginTop: 10, color: '#777' }}>Adobe Reader is required to view these files.</div>
          <OldAd style={{ marginTop: 22 }}>
            <div style={{ width: 230, height: 190, background: '#ffd400', border: '3px solid #0b2a8a', padding: 12, color: '#0b2a8a', fontFamily: 'Arial Black, Arial, sans-serif' }}>
              <div style={{ fontSize: 22, lineHeight: 1 }}>NOCTURNE</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>FILM WEEKEND — GHENT</div>
              <div style={{ fontSize: 40, lineHeight: 1, marginTop: 14, color: '#d4001a' }}>21 FILMS</div>
              <div style={{ fontSize: 12, marginTop: 10 }}>3 NIGHTS · BOOK NOW!!</div>
            </div>
          </OldAd>
        </div>
        <div style={{ width: 650 }}>
          <div style={{ fontSize: 11, color: '#777' }}>Home › Current issue › Issue 14 › Essays</div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 24, marginTop: 10, color: '#111' }}>THE ROAD DOESN&apos;T CUT (part 1)</div>
          <div style={{ fontSize: 11, color: '#777', marginTop: 4 }}>Posted by admin on 12/09/2023 | 0 comments | Page 1 of 7</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            <div style={{ width: 280, flexShrink: 0 }}>
              <div style={{ width: 280, height: 158, overflow: 'hidden', border: '1px solid #ccc' }}>
                <div style={{ width: 280, height: 204, marginTop: -30 }}>
                  <Still scene='coast' ratio={1.37} width={280} t={0.2} grain={false} />
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#777', marginTop: 4 }}>photo: still from the film</div>
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.65 }}>
              {essay.body[0]} {essay.body[1].slice(0, 120)}…
            </div>
          </div>
          <OldAd style={{ marginTop: 18 }}>
            <div style={{ height: 90, background: '#101b3a', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 18, fontFamily: 'Arial, sans-serif' }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: '#ffcc00' }}>-20%</span>
              <span style={{ fontSize: 15 }}>Projector lamps &amp; home cinema screens — free delivery in Belgium</span>
              <span style={{ marginLeft: 'auto', background: '#ffcc00', color: '#101b3a', fontWeight: 700, fontSize: 13, padding: '8px 14px' }}>SHOP NOW</span>
            </div>
          </OldAd>
          <div style={{ fontSize: 12, marginTop: 18, color: old.link }}>
            « Previous &nbsp; <b style={{ color: old.text }}>1</b> &nbsp;2 &nbsp;3 &nbsp;4 &nbsp;5 &nbsp;6 &nbsp;7 &nbsp; Next page »
          </div>
        </div>
        <div style={{ width: 180 }}>
          <OldAd>
            <div style={{ width: 180, height: 300, background: '#8a0f2e', color: '#fff', padding: 14, fontFamily: 'Georgia, serif' }}>
              <div style={{ fontSize: 13, fontStyle: 'italic' }}>Subscribe now and get</div>
              <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1, marginTop: 10 }}>4 issues</div>
              <div style={{ fontSize: 15, marginTop: 8 }}>delivered to your door</div>
              <div style={{ marginTop: 60, background: '#fff', color: '#8a0f2e', textAlign: 'center', padding: 8, fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 13 }}>CLICK HERE</div>
            </div>
          </OldAd>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#222', color: '#eee', fontSize: 12, padding: '12px 40px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <span>This website uses cookies to improve your experience. By continuing to browse you agree to our use of cookies.</span>
        <span style={{ marginLeft: 'auto', background: '#4a8c2a', padding: '6px 14px', fontWeight: 700 }}>OK</span>
      </div>
    </div>
  );
}
