import type { CSSProperties, ReactNode } from 'react';

// Season 2024: six campaigns by six guest designers, before the system. Each
// is a credible poster on its own; together they share nothing but a logo
// that never sits in the same place twice.

const SANS = 'var(--fg-font-sans)';
const SERIF = 'var(--fg-font-serif)';
const MONO = 'var(--fg-font-pixel)';

/** The old fixed mark: a square with a serif V. */
function OldLogo({
  size,
  invert = false,
  style
}: {
  size: number;
  invert?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: invert ? '#fff' : '#111',
        color: invert ? '#111' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: SERIF,
        fontSize: size * 0.78,
        lineHeight: 1,
        paddingTop: size * 0.06,
        position: 'absolute',
        ...style
      }}
    >
      V
    </div>
  );
}

function Sheet({
  width,
  background,
  children
}: {
  width: number;
  background: string;
  children: ReactNode;
}) {
  const height = width * 1.414;
  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        background,
        boxShadow:
          '0 1px 2px rgba(20,20,18,.16), 0 16px 32px -18px rgba(20,20,18,.4)'
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: 268,
          height: 379,
          transform: `scale(${width / 268})`,
          transformOrigin: '0 0'
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function SecondNature({ width }: { width: number }) {
  return (
    <Sheet width={width} background='#E03C2A'>
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: 18,
          right: 16,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 58,
          lineHeight: 0.86,
          letterSpacing: '-0.045em',
          color: '#111'
        }}
      >
        Second
        <br />
        Nature
      </div>
      <div
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          top: 150,
          height: 1.5,
          background: '#111'
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 16,
          top: 160,
          width: 110,
          fontFamily: SANS,
          fontSize: 9.5,
          fontWeight: 500,
          lineHeight: 1.3,
          color: '#111'
        }}
      >
        Groepstentoonstelling over tuinen, kassen en de zorg voor wat groeit.
      </div>
      <div
        style={{
          position: 'absolute',
          left: 140,
          top: 160,
          fontFamily: SANS,
          fontSize: 9.5,
          fontWeight: 500,
          lineHeight: 1.3,
          color: '#111'
        }}
      >
        13.01 – 03.03
        <br />
        2024
      </div>
      <div
        style={{
          position: 'absolute',
          left: 16,
          bottom: 16,
          fontFamily: SANS,
          fontSize: 9,
          fontWeight: 500,
          color: '#111',
          lineHeight: 1.35
        }}
      >
        Kunsthal Utrecht
        <br />
        Design: Studio Marjolein Kok
      </div>
      <OldLogo size={26} style={{ right: 16, bottom: 16 }} />
    </Sheet>
  );
}

export function RoomOfEchoes({ width }: { width: number }) {
  return (
    <Sheet width={width} background='#CDBBE6'>
      <svg
        width={268}
        height={379}
        style={{ position: 'absolute', inset: 0 }}
        aria-hidden
      >
        <circle cx={92} cy={140} r={84} fill='#F4EEE2' />
        <circle cx={178} cy={196} r={70} fill='#D9A441' opacity={0.9} />
        <circle cx={150} cy={118} r={36} fill='none' stroke='#2B2340' strokeWidth={1.2} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 284,
          textAlign: 'center',
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: 34,
          lineHeight: 1,
          color: '#2B2340'
        }}
      >
        A Room of Echoes
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 326,
          textAlign: 'center',
          fontFamily: SANS,
          fontSize: 9,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#2B2340'
        }}
      >
        Mirjam Oduya · 09.03 – 21.04.2024
      </div>
      <OldLogo size={18} style={{ left: 14, top: 14 }} />
    </Sheet>
  );
}

export function HoldStill({ width }: { width: number }) {
  return (
    <Sheet width={width} background='#111111'>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 46,
          height: 18,
          background: '#F5D90A'
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 14,
          top: 92,
          fontFamily: MONO,
          fontSize: 44,
          lineHeight: 0.95,
          color: '#fff',
          letterSpacing: '-0.02em'
        }}
      >
        HOLD
        <br />
        STILL_
      </div>
      <div
        style={{
          position: 'absolute',
          left: 14,
          top: 206,
          right: 14,
          fontFamily: MONO,
          fontSize: 11,
          lineHeight: 1.45,
          color: '#F5D90A'
        }}
      >
        &gt; video works 1998–2023
        <br />
        &gt; Jurre Wessels
        <br />
        &gt; 27.04 → 16.06.2024
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 40,
          height: 6,
          background: '#F5D90A'
        }}
      />
      <OldLogo size={40} invert style={{ right: 14, top: 300 }} />
    </Sheet>
  );
}

export function SaltwaterArchive({ width }: { width: number }) {
  return (
    <Sheet width={width} background='#F2F1EC'>
      <svg
        width={268}
        height={379}
        style={{ position: 'absolute', inset: 0 }}
        aria-hidden
      >
        {Array.from({ length: 24 }, (_, i) => (
          <rect
            key={i}
            x={0}
            y={i * 16}
            width={268}
            height={8}
            fill='#1F3A6B'
          />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 38,
          right: 38,
          top: 118,
          padding: '20px 14px',
          background: '#F2F1EC',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 30,
            lineHeight: 1,
            color: '#1F3A6B'
          }}
        >
          Saltwater
          <br />
          Archive
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: 12,
            color: '#1F3A6B'
          }}
        >
          Pieter-Jan Haan
        </div>
        <div
          style={{
            marginTop: 4,
            fontFamily: SANS,
            fontSize: 8.5,
            letterSpacing: '0.08em',
            color: '#1F3A6B'
          }}
        >
          22 JUNI — 11 AUGUSTUS
        </div>
      </div>
      <OldLogo size={22} style={{ left: 123, bottom: 20 }} />
    </Sheet>
  );
}

export function TenderMachines({ width }: { width: number }) {
  return (
    <Sheet width={width} background='#D6E64B'>
      <div
        style={{
          position: 'absolute',
          left: -8,
          top: 0,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 250,
          lineHeight: 1,
          letterSpacing: '-0.06em',
          color: 'transparent',
          WebkitTextStroke: '1.4px #1A1A1A'
        }}
      >
        24
      </div>
      <div
        style={{
          position: 'absolute',
          left: 16,
          bottom: 54,
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: 25,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          color: '#1A1A1A'
        }}
      >
        tender machines
      </div>
      <div
        style={{
          position: 'absolute',
          left: 16,
          bottom: 20,
          fontFamily: SANS,
          fontSize: 9,
          lineHeight: 1.35,
          color: '#1A1A1A'
        }}
      >
        robots, looms &amp; other carers
        <br />
        17.08 – 29.09 · veld
      </div>
      <OldLogo size={14} style={{ right: 16, bottom: 22 }} />
    </Sheet>
  );
}

export function Afterimage({ width }: { width: number }) {
  return (
    <Sheet width={width} background='#16141A'>
      <svg
        width={268}
        height={379}
        style={{ position: 'absolute', inset: 0 }}
        aria-hidden
      >
        {Array.from({ length: 11 }, (_, i) => (
          <circle
            key={i}
            cx={134}
            cy={166}
            r={14 + i * 11}
            fill='none'
            stroke={i % 2 ? '#FF4D8F' : '#FF7A1A'}
            strokeWidth={i % 3 === 0 ? 3 : 1.2}
          />
        ))}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 52,
          textAlign: 'center',
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: '0.32em',
          color: '#F1EDE6'
        }}
      >
        AFTERIMAGE
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 34,
          textAlign: 'center',
          fontFamily: SANS,
          fontSize: 8.5,
          letterSpacing: '0.12em',
          color: '#9A95A3'
        }}
      >
        NOA BAPTISTE · 05.10 – 01.12.2024
      </div>
      <OldLogo size={24} invert style={{ left: 16, top: 16 }} />
    </Sheet>
  );
}

export const oldSeason = [
  { title: 'Second Nature', designer: 'Studio Marjolein Kok', Poster: SecondNature },
  { title: 'A Room of Echoes', designer: 'Femke Ruys', Poster: RoomOfEchoes },
  { title: 'Hold Still', designer: 'Bureau Dorst', Poster: HoldStill },
  { title: 'Saltwater Archive', designer: 'Jasper Lim', Poster: SaltwaterArchive },
  { title: 'Tender Machines', designer: 'Studio Ommen', Poster: TenderMachines },
  { title: 'Afterimage', designer: 'Noa Baptiste', Poster: Afterimage }
];
