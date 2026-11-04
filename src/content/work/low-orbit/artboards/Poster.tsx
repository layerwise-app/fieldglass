import { palette } from '../orbit';
import { OrbitCanvas } from '../OrbitCanvas';
import { tourDates } from '../data';
import { condensed, Pixel, sans } from './shared';

export function Poster() {
  const columns = [tourDates.slice(0, 6), tourDates.slice(6, 12), tourDates.slice(12, 18)];
  return (
    <div
      style={{
        width: 1440,
        height: 1800,
        background: palette.stage,
        color: palette.bone,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <OrbitCanvas
        width={1440}
        height={900}
        scene='perigee'
        time={9.6}
        gravity={0.12}
        size={1500}
        stems={{ kick: 0.95, bass: 0.8, pads: 0.75, vocal: 0.7 }}
        style={{ position: 'absolute', left: 0, top: 360 }}
      />

      <div
        style={{
          position: 'absolute',
          left: 64,
          right: 64,
          top: 60,
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Pixel>Halfmoon Records presents</Pixel>
        <Pixel>Europe · spring 2024</Pixel>
      </div>

      <div style={{ position: 'absolute', left: 58, top: 112 }}>
        <div style={{ ...condensed, fontSize: 92, color: palette.infrared }}>Mira Sol</div>
        <div style={{ ...condensed, fontSize: 330, marginTop: 6, letterSpacing: '-0.012em' }}>
          Low Orbit
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 64,
          top: 1060,
          textAlign: 'right'
        }}
      >
        <Pixel color={palette.ash}>Live, with visuals that play the room</Pixel>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 64,
          right: 64,
          top: 1150,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 40,
          borderTop: `1px solid ${palette.bone}`,
          paddingTop: 26
        }}
      >
        {columns.map((column, c) => (
          <div key={c} style={{ display: 'grid', gap: 17 }}>
            {column.map((d) => (
              <div key={d.date} style={{ display: 'grid', gridTemplateColumns: '84px 1fr', alignItems: 'baseline' }}>
                <Pixel color={palette.infrared} style={{ fontSize: 13 }}>{d.date}</Pixel>
                <div>
                  <div style={{ ...sans, fontSize: 27, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    {d.city}
                  </div>
                  <div style={{ ...sans, fontSize: 16, color: palette.ash, marginTop: 2 }}>{d.venue}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 64,
          right: 64,
          bottom: 56,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          paddingTop: 20,
          borderTop: '1px solid #2a2830'
        }}
      >
        <span style={{ ...condensed, fontSize: 44 }}>+16 festival dates, summer</span>
        <Pixel>Tickets loworbit.halfmoon.fm · on sale 12 Jan</Pixel>
      </div>
    </div>
  );
}
