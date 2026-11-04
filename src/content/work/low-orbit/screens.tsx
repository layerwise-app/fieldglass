import type { ScreenSet } from '~/content/screens';
import { Cover } from './artboards/Cover';
import { FanWeb } from './artboards/FanWeb';
import { Operator } from './artboards/Operator';
import { Poster } from './artboards/Poster';
import { Scenes } from './artboards/Scenes';
import { VenueSetup } from './artboards/VenueSetup';
import LowOrbitDemo from './demo';

export const screens: ScreenSet = {
  cover: { width: 1440, height: 900, render: () => <Cover /> },
  operator: { width: 1440, height: 900, render: () => <Operator /> },
  'venue-setup': { width: 1440, height: 900, render: () => <VenueSetup /> },
  scenes: { width: 1440, height: 900, render: () => <Scenes /> },
  'fan-web': { width: 1440, height: 1800, render: () => <FanWeb /> },
  poster: { width: 1440, height: 1800, render: () => <Poster /> },
  demo: {
    width: 1440,
    height: 900,
    render: () => (
      <div style={{ width: 1440, height: 900, position: 'relative' }}>
        <LowOrbitDemo />
      </div>
    )
  }
};
