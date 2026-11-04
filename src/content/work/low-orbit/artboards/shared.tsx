import type { CSSProperties, ReactNode } from 'react';
import { palette } from '../orbit';

export const pixel: CSSProperties = {
  fontFamily: 'var(--fg-font-pixel)',
  fontSize: 11,
  lineHeight: '16px',
  letterSpacing: '0.02em',
  textTransform: 'uppercase'
};

export const condensed: CSSProperties = {
  fontFamily: 'var(--fg-font-sans)',
  fontWeight: 700,
  fontStretch: '75%',
  letterSpacing: '-0.005em',
  lineHeight: 0.86,
  textTransform: 'uppercase'
};

export const sans: CSSProperties = {
  fontFamily: 'var(--fg-font-sans)',
  letterSpacing: '-0.01em'
};

export function Pixel({
  children,
  color,
  style
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) {
  return <span style={{ ...pixel, color, ...style }}>{children}</span>;
}

/** A segmented level meter, like a hardware channel strip. */
export function Meter({
  value,
  segments = 24,
  height = 6,
  gap = 2,
  hot = 0.8
}: {
  value: number;
  segments?: number;
  height?: number;
  gap?: number;
  hot?: number;
}) {
  return (
    <div style={{ display: 'flex', gap }}>
      {Array.from({ length: segments }, (_, i) => {
        const lit = i / segments < value;
        const isHot = i / segments >= hot;
        return (
          <span
            key={i}
            style={{
              flex: 1,
              height,
              background: lit
                ? isHot
                  ? palette.infrared
                  : palette.bone
                : 'rgba(237,230,218,0.09)'
            }}
          />
        );
      })}
    </div>
  );
}

/** A tablet drawn in code, in landscape. Lays out the screen at its own size. */
export function TabletFrame({
  width,
  screenWidth,
  screenHeight,
  children
}: {
  width: number;
  screenWidth: number;
  screenHeight: number;
  children: ReactNode;
}) {
  const bezel = 22;
  const outerW = screenWidth + bezel * 2;
  const outerH = screenHeight + bezel * 2;
  const scale = width / outerW;
  return (
    <div style={{ width, height: outerH * scale, position: 'relative' }}>
      <div
        style={{
          width: outerW,
          height: outerH,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
          padding: bezel,
          borderRadius: 44,
          background: '#141417',
          boxShadow:
            'inset 0 0 0 2px #2b2b30, 0 60px 90px -40px rgba(7,7,10,.55), 0 20px 40px -20px rgba(7,7,10,.4)'
        }}
      >
        <div
          style={{
            width: screenWidth,
            height: screenHeight,
            borderRadius: 24,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
