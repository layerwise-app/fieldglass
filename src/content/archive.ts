/**
 * Smaller work listed in the Index (Work → Index) next to the case studies.
 * These rows are text only; give a project its own case study file in
 * `src/content/work/` to make it a link.
 */
export type ArchiveItem = {
  year: number;
  title: string;
  /** What kind of thing it was, like "Workshop" or "Installation". */
  type: string;
  /** Who it was for, or where it happened. */
  client: string;
};

export const archive: ArchiveItem[] = [
  {
    year: 2026,
    title: 'Slow Signals',
    type: 'Workshop',
    client: 'Kade School of Interaction, Rotterdam'
  },
  {
    year: 2025,
    title: 'Weather for Typefaces',
    type: 'Experiment',
    client: 'Self-initiated'
  },
  {
    year: 2025,
    title: 'Notes on living systems',
    type: 'Talk',
    client: 'Fieldwork Conference, Ghent'
  },
  {
    year: 2024,
    title: 'Tidal Index',
    type: 'Riso edition of 40',
    client: 'Self-initiated'
  },
  {
    year: 2024,
    title: 'Code as material',
    type: 'Panel',
    client: 'Studio Hiaat, Amsterdam'
  },
  {
    year: 2023,
    title: 'Sixteen Bars',
    type: 'Real-time music video',
    client: 'Mira Sol'
  },
  {
    year: 2023,
    title: 'Grain',
    type: 'Generative posters',
    client: 'Galerie Ruimte, Utrecht'
  },
  {
    year: 2022,
    title: 'Shadow Rooms',
    type: 'Installation',
    client: 'Nachtlicht Festival, Eindhoven'
  },
  {
    year: 2021,
    title: 'Archive Weather',
    type: 'Data visualisation',
    client: 'Kustarchief Zeeland'
  },
  {
    year: 2020,
    title: 'A sky you can scroll',
    type: 'Exhibition interface',
    client: 'Sterrenwacht Nieuwland'
  },
  {
    year: 2019,
    title: 'Nightline',
    type: 'Brand system',
    client: 'Nightline Radio, Rotterdam'
  },
  {
    year: 2018,
    title: 'Moving type',
    type: 'Motion identity',
    client: 'Ensemble Klank'
  },
  {
    year: 2017,
    title: 'Reading Room',
    type: 'MA graduation project',
    client: 'Eindhoven'
  },
  {
    year: 2016,
    title: 'Signs of Hamra Street',
    type: 'Type research',
    client: 'BA thesis, Beirut'
  }
];
