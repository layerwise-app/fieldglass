import type { ReactNode } from 'react';
import { PhoneFrame, Scale } from '~/components/frames';
import type { ScreenSet } from '~/content/screens';
import { palette as c } from './data';
import UndertoneDemo from './demo';
import {
  ListeningScreen,
  MappingScreen,
  OnCallAlert,
  OnCallPlayer,
  PilotReport,
  ReplayScreen,
  ScadaScreen
} from './views';

/** A monitor on an arm: bezel, screen and a little stand. */
function Monitor({
  width,
  children,
  tilt = 0
}: {
  width: number;
  children: ReactNode;
  tilt?: number;
}) {
  const h = (width * 900) / 1440;
  return (
    <div style={{ transform: `perspective(1800px) rotateY(${tilt}deg)`, transformOrigin: tilt > 0 ? 'right center' : 'left center' }}>
      <div
        style={{
          width: width + 20,
          padding: 10,
          borderRadius: 12,
          background: '#05090E',
          boxShadow: '0 0 0 1px #1B2733, 0 30px 80px -20px rgba(71,211,197,0.16), 0 40px 60px -30px rgba(0,0,0,.9)'
        }}
      >
        <div style={{ width, height: h, overflow: 'hidden', borderRadius: 4 }}>
          <Scale width={width} contentWidth={1440} contentHeight={900}>
            {children}
          </Scale>
        </div>
      </div>
      <div style={{ width: 70, height: 46, margin: '0 auto', background: 'linear-gradient(#0B121A, #060A0F)' }} />
    </div>
  );
}

function Speaker() {
  return (
    <div
      style={{
        width: 78,
        height: 118,
        borderRadius: 10,
        background: '#0C131B',
        boxShadow: 'inset 0 0 0 1px #1C2834, 0 20px 30px -16px rgba(0,0,0,.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12
      }}
    >
      <span style={{ width: 22, height: 22, borderRadius: 22, background: '#070B10', boxShadow: 'inset 0 0 0 2px #1C2834' }} />
      <span style={{ width: 48, height: 48, borderRadius: 48, background: '#070B10', boxShadow: 'inset 0 0 0 3px #1C2834, inset 0 0 0 12px #0A1017' }} />
    </div>
  );
}

function ControlRoom() {
  return (
    <div style={{ width: 1440, height: 900, background: '#060C13', position: 'relative', overflow: 'hidden' }}>
      {/* Wall panels */}
      <svg width='1440' height='900' style={{ position: 'absolute', inset: 0 }} aria-hidden>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={i * 180} x2={i * 180} y1='0' y2='610' stroke='#0C1620' strokeWidth='2' />
        ))}
        <rect x='0' y='610' width='1440' height='290' fill='#0A121B' />
        <rect x='0' y='610' width='1440' height='3' fill='#16222E' />
        <ellipse cx='720' cy='640' rx='620' ry='70' fill='#47D3C5' opacity='0.05' />
        <ellipse cx='720' cy='640' rx='360' ry='40' fill='#47D3C5' opacity='0.05' />
      </svg>
      <div style={{ position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 18 }}>
        <div style={{ marginTop: 52 }}>
          <Monitor width={330} tilt={14}>
            <ScadaScreen withUndertone={false} />
          </Monitor>
        </div>
        <Monitor width={580}>
          <ListeningScreen />
        </Monitor>
        <div style={{ marginTop: 52 }}>
          <Monitor width={330} tilt={-14}>
            <ReplayScreen />
          </Monitor>
        </div>
      </div>
      {/* Desk */}
      <div style={{ position: 'absolute', top: 664, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 64 }}>
        <Speaker />
        <Keyboard />
        <Speaker />
      </div>
      <div style={{ position: 'absolute', left: 48, bottom: 40, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ width: 8, height: 8, borderRadius: 8, background: c.amber }} />
        <span style={{ fontFamily: 'var(--fg-font-pixel)', fontSize: 11, letterSpacing: '0.02em', textTransform: 'uppercase', color: c.muted }}>
          Lage Delta control room · Fri 15 Mar · 03:18
        </span>
      </div>
    </div>
  );
}

function Keyboard() {
  const rows = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6],
    [1.4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.2],
    [1.7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.9],
    [1.2, 1, 1, 5.6, 1, 1, 1, 1]
  ];
  return (
    <div
      style={{
        width: 460,
        padding: 12,
        borderRadius: 12,
        background: '#0C141D',
        boxShadow: 'inset 0 0 0 1px #1A2531, 0 24px 40px -20px rgba(0,0,0,.9)',
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }}
    >
      {rows.map((row, r) => (
        <div key={r} style={{ display: 'flex', gap: 5, height: 24 }}>
          {row.map((w, k) => (
            <span key={k} style={{ flex: w, borderRadius: 4, background: '#131D28', boxShadow: 'inset 0 -2px 0 #091017' }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Concentric ripples under the phones, like sound under water. */
function Ripples({ height }: { height: number }) {
  return (
    <svg width='1440' height={height} style={{ position: 'absolute', inset: 0 }} aria-hidden>
      {Array.from({ length: 16 }, (_, i) => (
        <ellipse key={i} cx='720' cy={height * 0.56} rx={120 + i * 70} ry={(120 + i * 70) * 0.62} fill='none' stroke='#1E3A4E' strokeWidth='1.5' opacity={1 - i / 18} />
      ))}
    </svg>
  );
}

// The dev render page can show Vite's error overlay when another file is
// mid-edit; keep it out of the captures.
const hideOverlay = <style>{'vite-error-overlay{display:none!important}'}</style>;
const board = (node: ReactNode) => (
  <>
    {hideOverlay}
    {node}
  </>
);

export const screens: ScreenSet = {
  cover: { width: 1440, height: 900, render: () => board(<ControlRoom />) },
  listening: { width: 1440, height: 900, render: () => board(<ListeningScreen />) },
  mapping: { width: 1440, height: 900, render: () => board(<MappingScreen />) },
  replay: { width: 1440, height: 900, render: () => board(<ReplayScreen />) },
  'scada-before': {
    width: 1440,
    height: 900,
    render: () => board(<ScadaScreen withUndertone={false} />)
  },
  'scada-after': {
    width: 1440,
    height: 900,
    render: () => board(<ScadaScreen withUndertone />)
  },
  oncall: {
    width: 1440,
    height: 1800,
    render: () => board(
      <div style={{ width: 1440, height: 1800, background: '#0D1C2A', position: 'relative', overflow: 'hidden' }}>
        <Ripples height={1800} />
        <div style={{ position: 'absolute', left: 250, top: 330 }}>
          <PhoneFrame width={460}>
            <OnCallAlert />
          </PhoneFrame>
        </div>
        <div style={{ position: 'absolute', left: 750, top: 470 }}>
          <PhoneFrame width={460}>
            <OnCallPlayer />
          </PhoneFrame>
        </div>
      </div>
    )
  },
  pilot: { width: 1440, height: 1800, render: () => board(<PilotReport />) },
  demo: {
    width: 1440,
    height: 900,
    render: () => board(<UndertoneDemo initialMinute={918} />)
  }
};
