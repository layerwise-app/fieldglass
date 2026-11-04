import { palette, scenes } from '../orbit';
import { OrbitCanvas } from '../OrbitCanvas';
import { condensed, Pixel, sans } from './shared';

const ink = '#16141A';
const muted = '#6B6570';
const rule = '#CFC6B8';

const legend = [
  ['Kick', 'Core'],
  ['Bass', 'Rings'],
  ['Pads', 'Dust'],
  ['Vox', 'Satellite']
];

export function Scenes() {
  return (
    <div
      style={{
        width: 1440,
        height: 900,
        background: palette.bone,
        color: ink,
        padding: '52px 56px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          paddingBottom: 22,
          borderBottom: `1px solid ${ink}`
        }}
      >
        <div>
          <Pixel color={muted}>Low Orbit · show bible · p. 14</Pixel>
          <div style={{ ...condensed, fontSize: 76, marginTop: 10 }}>Scene library</div>
        </div>
        <div style={{ display: 'flex', gap: 28, paddingBottom: 6 }}>
          {legend.map(([stem, orbit]) => (
            <div key={stem}>
              <Pixel color={muted}>{stem}</Pixel>
              <div style={{ ...sans, fontSize: 16, fontWeight: 600, marginTop: 2 }}>→ {orbit}</div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '30px 24px',
          marginTop: 30
        }}
      >
        {scenes.map((scene, i) => (
          <div key={scene.id}>
            <div style={{ borderRadius: 4, overflow: 'hidden' }}>
              <OrbitCanvas
                width={314}
                height={176}
                scene={scene.id}
                time={5 + i * 1.37}
                gravity={scene.id === 'roche' ? 0.5 : scene.id === 'escape' ? 0 : 0.2}
                density={0.6}
                size={300}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginTop: 12
              }}
            >
              <span style={{ ...sans, fontSize: 19, fontWeight: 600, letterSpacing: '-0.02em' }}>
                <span style={{ color: palette.ember, marginRight: 8 }}>{scene.number}</span>
                {scene.name}
              </span>
              {scene.eclipse && <Pixel color={palette.ember}>Eclipse disc</Pixel>}
            </div>
            <div style={{ ...sans, fontSize: 14, color: muted, marginTop: 3 }}>{scene.use}</div>
            <div
              style={{
                display: 'flex',
                gap: 14,
                marginTop: 10,
                paddingTop: 8,
                borderTop: `1px solid ${rule}`
              }}
            >
              <Pixel color={muted}>Tilt {scene.tilt.toFixed(2).replace(/^0/, '')}</Pixel>
              <Pixel color={muted}>Rings {scene.rings}</Pixel>
              <Pixel color={muted}>Sat {scene.satellites}</Pixel>
              <Pixel color={muted}>Heat {Math.round(scene.heat * 100)}</Pixel>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: 14,
          borderTop: `1px solid ${rule}`
        }}
      >
        <Pixel color={muted}>Every scene reads the same four stems. Only the geometry changes.</Pixel>
        <Pixel color={muted}>Strobe limit 3 Hz in all scenes</Pixel>
      </div>
    </div>
  );
}
