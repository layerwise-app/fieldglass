import type { CSSProperties, ReactNode } from 'react';

/**
 * Device frames drawn in code. Each lays its screen out at the device's own
 * size and scales it to `width`, so a 390 px phone UI stays a 390 px UI.
 */

type Scaled = {
  /** Rendered width of the whole frame in CSS pixels. */
  width: number;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export function PhoneFrame({
  width,
  children,
  screenWidth = 390,
  screenHeight = 844,
  tone = 'graphite',
  style,
  className
}: Scaled & {
  screenWidth?: number;
  screenHeight?: number;
  tone?: 'graphite' | 'silver' | 'paper';
}) {
  const bezel = 11;
  const outerW = screenWidth + bezel * 2;
  const outerH = screenHeight + bezel * 2;
  const scale = width / outerW;
  const body = {
    graphite: '#1b1c1f',
    silver: '#d9dadc',
    paper: '#f4f3ef'
  }[tone];
  const edge = {
    graphite: '#3a3c41',
    silver: '#f5f5f6',
    paper: '#ffffff'
  }[tone];
  return (
    <div
      className={className}
      style={{ width, height: outerH * scale, position: 'relative', ...style }}
    >
      <div
        style={{
          width: outerW,
          height: outerH,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
          borderRadius: 62,
          background: body,
          padding: bezel,
          boxShadow: `inset 0 0 0 1.5px ${edge}, 0 40px 80px -30px rgba(10,10,14,.45), 0 12px 24px -12px rgba(10,10,14,.3)`
        }}
      >
        <div
          style={{
            width: screenWidth,
            height: screenHeight,
            borderRadius: 52,
            overflow: 'hidden',
            position: 'relative',
            background: '#000'
          }}
        >
          {children}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 11,
              left: '50%',
              width: 112,
              height: 32,
              marginLeft: -56,
              borderRadius: 20,
              background: '#050506',
              zIndex: 10
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function BrowserFrame({
  width,
  children,
  url,
  viewportWidth = 1440,
  viewportHeight = 900,
  tone = 'light',
  style,
  className
}: Scaled & {
  url: string;
  viewportWidth?: number;
  viewportHeight?: number;
  tone?: 'light' | 'dark';
}) {
  const bar = 44;
  const scale = width / viewportWidth;
  const dark = tone === 'dark';
  return (
    <div
      className={className}
      style={{
        width,
        height: (viewportHeight + bar) * scale,
        position: 'relative',
        ...style
      }}
    >
      <div
        style={{
          width: viewportWidth,
          height: viewportHeight + bar,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
          borderRadius: 14,
          overflow: 'hidden',
          background: dark ? '#1a1b1e' : '#ffffff',
          boxShadow:
            '0 0 0 1px rgba(10,10,14,.08), 0 50px 100px -40px rgba(10,10,14,.35), 0 18px 36px -18px rgba(10,10,14,.25)'
        }}
      >
        <div
          style={{
            height: bar,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '0 16px',
            background: dark ? '#232428' : '#f3f3f1',
            borderBottom: `1px solid ${dark ? '#2f3035' : '#e4e4e0'}`
          }}
        >
          <div style={{ display: 'flex', gap: 7 }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 6,
                  background: dark ? '#46474d' : '#d6d6d2'
                }}
              />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: 420,
                height: 26,
                borderRadius: 8,
                background: dark ? '#2d2e33' : '#e8e8e4',
                color: dark ? '#a5a7ad' : '#6b6d72',
                fontFamily: 'var(--fg-font-sans)',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                letterSpacing: 0
              }}
            >
              {url}
            </div>
          </div>
          <div style={{ width: 47 }} />
        </div>
        <div
          style={{
            width: viewportWidth,
            height: viewportHeight,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** A screen without a device, scaled from its own size to `width`. */
export function Scale({
  width,
  children,
  contentWidth,
  contentHeight,
  style,
  className
}: Scaled & { contentWidth: number; contentHeight: number }) {
  const scale = width / contentWidth;
  return (
    <div
      className={className}
      style={{ width, height: contentHeight * scale, position: 'relative', ...style }}
    >
      <div
        style={{
          width: contentWidth,
          height: contentHeight,
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
          position: 'absolute',
          inset: 0
        }}
      >
        {children}
      </div>
    </div>
  );
}
