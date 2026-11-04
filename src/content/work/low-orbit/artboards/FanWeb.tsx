import { PhoneFrame } from '~/components/frames';
import { palette } from '../orbit';
import { OrbitCanvas } from '../OrbitCanvas';
import { condensed, Pixel, pixel, sans } from './shared';

function Visualiser() {
  return (
    <div
      style={{
        width: 390,
        height: 844,
        background: palette.stage,
        color: palette.bone,
        position: 'relative',
        fontFamily: 'var(--fg-font-sans)'
      }}
    >
      <OrbitCanvas
        width={390}
        height={844}
        scene='roche'
        time={14.2}
        gravity={0.64}
        size={520}
        offsetY={-0.04}
        stems={{ kick: 0.7, bass: 0.9, pads: 0.6, vocal: 0.2 }}
        style={{ position: 'absolute', inset: 0 }}
      />
      <div style={{ position: 'absolute', top: 58, left: 22, right: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Pixel color={palette.ash}>Mira Sol</Pixel>
          <Pixel color={palette.ash}>loworbit.halfmoon.fm</Pixel>
        </div>
        <div style={{ ...condensed, fontSize: 44, marginTop: 10 }}>Low Orbit</div>
      </div>

      <div style={{ position: 'absolute', left: 18, right: 18, bottom: 34 }}>
        <div
          style={{
            padding: 16,
            borderRadius: 22,
            background: 'rgba(20,19,24,0.82)',
            boxShadow: 'inset 0 0 0 1px rgba(237,230,218,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ ...sans, fontSize: 18, fontWeight: 600 }}>Ballast</span>
            <Pixel color={palette.ash}>Track 3 of 9</Pixel>
          </div>
          <div style={{ marginTop: 12, height: 3, borderRadius: 2, background: '#2c2a31' }}>
            <div style={{ width: '33%', height: 3, borderRadius: 2, background: palette.bone }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <Pixel color={palette.ash}>1:48</Pixel>
            <Pixel color={palette.ash}>5:30</Pixel>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
            <span
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                background: palette.bone,
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <svg width='16' height='16' viewBox='0 0 12 12' aria-hidden>
                <rect x='1.5' y='1' width='3' height='10' fill={palette.stage} />
                <rect x='7.5' y='1' width='3' height='10' fill={palette.stage} />
              </svg>
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Pixel>Gravity</Pixel>
                <Pixel color={palette.infrared}>64</Pixel>
              </div>
              <div style={{ position: 'relative', height: 22, marginTop: 4 }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: 10, height: 2, background: '#3a3840' }} />
                <div style={{ position: 'absolute', left: 0, width: '64%', top: 10, height: 2, background: palette.infrared }} />
                <span
                  style={{
                    position: 'absolute',
                    left: 'calc(64% - 11px)',
                    top: 0,
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    background: palette.bone
                  }}
                />
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 14,
              height: 46,
              borderRadius: 14,
              boxShadow: 'inset 0 0 0 1px rgba(237,230,218,0.22)',
              display: 'grid',
              placeItems: 'center',
              ...sans,
              fontSize: 15,
              fontWeight: 600
            }}
          >
            Share your orbit
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareSheet() {
  return (
    <div
      style={{
        width: 390,
        height: 844,
        background: '#0f0e12',
        color: palette.bone,
        position: 'relative',
        fontFamily: 'var(--fg-font-sans)'
      }}
    >
      <div style={{ padding: '62px 22px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Pixel color={palette.ash}>Your orbit</Pixel>
          <Pixel color={palette.ash}>Done</Pixel>
        </div>
      </div>
      <div
        style={{
          margin: '22px 22px 0',
          borderRadius: 20,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 30px 60px -30px rgba(255,45,85,0.5)'
        }}
      >
        <OrbitCanvas
          width={346}
          height={430}
          scene='roche'
          time={14.2}
          gravity={0.64}
          size={420}
          stems={{ kick: 0.7, bass: 0.9, pads: 0.6, vocal: 0.2 }}
        />
        <div style={{ position: 'absolute', left: 18, top: 16, right: 18, display: 'flex', justifyContent: 'space-between' }}>
          <Pixel>Mira Sol</Pixel>
          <Pixel color={palette.ash}>No. 0412</Pixel>
        </div>
        <div style={{ position: 'absolute', left: 18, bottom: 16, right: 18 }}>
          <div style={{ ...condensed, fontSize: 40 }}>Ballast</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <Pixel color={palette.ash}>At 1:48 · gravity 64</Pixel>
            <Pixel color={palette.infrared}>Low Orbit</Pixel>
          </div>
        </div>
      </div>
      <div style={{ margin: '22px 22px 0', display: 'grid', gap: 10 }}>
        {[
          ['Save a 15 s clip', 'MP4 · vertical'],
          ['Copy link', 'Opens at 1:48'],
          ['Post as a story', '9 : 16 card']
        ].map(([title, note], i) => (
          <div
            key={title}
            style={{
              height: 56,
              borderRadius: 14,
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: i === 0 ? palette.bone : '#1b1a20',
              color: i === 0 ? palette.stage : palette.bone
            }}
          >
            <span style={{ ...sans, fontSize: 16, fontWeight: 600 }}>{title}</span>
            <span style={{ ...pixel, opacity: 0.7 }}>{note}</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 22, right: 22, bottom: 34, textAlign: 'center' }}>
        <Pixel color={palette.ash}>180,214 orbits made this week</Pixel>
      </div>
    </div>
  );
}

export function FanWeb() {
  return (
    <div
      style={{
        width: 1440,
        height: 1800,
        background: palette.infrared,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ position: 'absolute', left: 120, top: 92 }}>
        <Pixel color={palette.stage}>Album week · fan web version</Pixel>
      </div>
      <div style={{ position: 'absolute', right: 120, top: 92 }}>
        <Pixel color={palette.stage}>Works in any phone browser</Pixel>
      </div>
      <PhoneFrame width={560} style={{ position: 'absolute', left: 120, top: 200 }}>
        <Visualiser />
      </PhoneFrame>
      <PhoneFrame width={560} style={{ position: 'absolute', right: 120, top: 520 }}>
        <ShareSheet />
      </PhoneFrame>
    </div>
  );
}
