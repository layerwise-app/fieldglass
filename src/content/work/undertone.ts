import { defineProject } from '~/content/types';
import { images } from './undertone/images';

export default defineProject({
  slug: 'undertone',
  title: 'Undertone',
  tagline: 'Making a river’s sensor data audible for the night shift',
  client: 'Waterschap Lage Delta',
  year: 2024,
  role: 'Product design, sound mapping, front-end',
  team: [
    'Noor Haddad — design, sound mapping and front-end',
    'Dr. Femke Oudshoorn — hydrology, Lage Delta',
    'Jules Amrani — audio engineering',
    'Lage Delta control-room operators — testing and tuning'
  ],
  discipline: 'Data sonification',
  shape: 'waveform',
  order: 4,
  summary:
    'A listening layer for a water board’s night shift. Each station is a soft drone; when one leaves normal it drifts off-key, often minutes before the threshold alarm.',
  cover: {
    image: images.cover,
    alt: 'A control room desk at night with three monitors: the old SCADA wall on the left, Undertone’s listening view in the middle with an amber anomaly, and a replay summary on the right, two small speakers on the desk.'
  },
  problem: [
    'Lage Delta’s control room watches 31 stations through the night: about 140 sensor graphs across six screens. The thing it most needs to catch, salt water pushing up an inlet, starts as a slow bend in a chloride line that looks flat at three in the morning. By the time it crosses the SCADA threshold, the inlet has been taking in brackish water for half an hour.',
    'Femke Oudshoorn, the board’s hydrologist, asked whether operators could hear the network instead of staring at it. The constraints were strict. No alarms or loud sounds: the room is shared and its rules forbid them. Nothing that replaces or touches the SCADA system. And a sound vocabulary that works for operators who have never played an instrument.'
  ],
  decisions: [
    {
      title: 'Timbre families, not melodies',
      body: 'Each station is one soft drone. Water level sets its pitch, chloride opens a filter so it gets brighter, and flow sets the density of a layer of quiet ticks. Normal stations sit in a consonant chord. A station that leaves its forecast band drifts sharp and picks up a minor ninth, so an anomaly is heard as something going out of tune rather than as an alarm.'
    },
    {
      title: 'Quiet by default',
      body: 'Room tone sits around −30 LUFS, under the air handling. Level is only added for deviation, and nothing in the mix can go above −18 LUFS. On a normal night it is a hum you stop noticing, which is exactly what makes a change stand out.'
    },
    {
      title: 'Scrub and replay',
      body: 'Breaks and handovers are when things get missed. Replay plays the whole network at 600×, so a 36-minute break takes 3.6 seconds and a full night takes 2 minutes 24. Every event in the break summary has its own four-second clip.'
    },
    {
      title: 'A visual twin for every sound',
      body: 'The waveform lanes show exactly what is playing: the band swells and turns amber when a station goes off-key, and the readouts name the note, the cents and the filter. Sound is never the only way to find out, and an operator with headphones off loses nothing.'
    }
  ],
  outcome: [
    'We ran a ten-week pilot from January to March 2024. Femke’s team injected eleven anomalies into live data without telling the night shift. Operators flagged nine of them by ear before the threshold alarm fired, with a median lead of four minutes. The two misses were masked by gate maintenance and a long radio call.',
    'Nobody complained about the sound in seventy nights. The night shift asked to keep it running when the pilot ended, and Undertone now covers two more pumping stations alongside the first three.'
  ],
  blocks: [
    {
      type: 'demo',
      title: 'Play the night of 14 March',
      caption:
        'Three stations from the pilot, twelve hours either side of midnight. Press play (the sound is gentle), scrub with the slider or the arrow keys, and jump to the three anomalies. Mute a lane to hear what it adds.',
      still: {
        image: images.demo,
        alt: 'The Undertone player paused at 03:18: three station lanes as teal waveforms, with amber swells where Oosterdiep, Molenkreek and Zuidpolder went off-key, and a timeline with three anomaly buttons.'
      },
      load: () => import('./undertone/demo')
    },
    {
      type: 'image',
      figure: {
        image: images.listening,
        alt: 'The listening view: a station list on the left, three lanes of waveform for the last six hours in the middle with Molenkreek turning amber at the right edge, and a “now hearing” panel with tuning dials on the right.'
      },
      caption:
        'The listening view at 03:18. Molenkreek has drifted sharp since 02:47; the SCADA alarm is still 140 mg/l away.'
    },
    {
      type: 'compare',
      before: {
        image: images['scada-before'],
        alt: 'The existing SCADA wall: 140 small trend tiles in green on grey, and an alarm list below that reads “No active alarms”.'
      },
      after: {
        image: images['scada-after'],
        alt: 'The same SCADA wall with the Molenkreek chloride tile outlined in amber and an Undertone strip docked below, reading “Molenkreek sounds wrong”.'
      },
      labels: ['SCADA alone', 'With Undertone'],
      caption:
        'The same moment on the existing SCADA wall. The chloride tile has bent upwards but no alarm has fired. Undertone docks beside SCADA rather than replacing it.'
    },
    {
      type: 'text',
      heading: 'Designing a sound nobody hears',
      body: [
        'The hardest part was making the normal state boring. Early versions gave each station a short melodic motif. Operators found them charming for one night and exhausting by the third. Drones won because they disappear: after twenty minutes you stop hearing them, and the first beat of an out-of-tune interval brings them straight back.',
        'Jules Amrani and I tuned the mapping on recordings of real nights rather than synthetic data, so the ranges follow how these stations actually move. Any change to a sound map can be auditioned against a stored night before it goes live.'
      ]
    },
    {
      type: 'image',
      figure: {
        image: images.mapping,
        alt: 'The sound map editor for Molenkreek: a matrix of sensors against sound parameters, the selected chloride-to-brightness curve with the SCADA alarm marked, and audition buttons for three stored nights.'
      },
      caption:
        'The sound map for Molenkreek. Each sensor drives one parameter, with ranges taken from real nights and a preview of 14 March.'
    },
    {
      type: 'quote',
      quote:
        'I used to scroll back through the trends after every break and still feel like I’d missed something. Now I listen to my break on the way back to the desk, and if something’s off I know before I sit down.',
      name: 'Pieter Smit',
      role: 'Night-shift operator, Lage Delta'
    },
    {
      type: 'image',
      figure: {
        image: images.replay,
        alt: 'The replay screen titled “While you were away”: 31 thin waveform rows for the whole night with the break highlighted, and three event cards on the right, one in amber.'
      },
      caption:
        'Replay after a break: 36 minutes of the whole network in 3.6 seconds, with a summary of what changed.'
    },
    {
      type: 'pair',
      figures: [
        {
          image: images.oncall,
          alt: 'Two phones: an alert that Molenkreek has sounded wrong since 02:47 with the last ten minutes as a waveform, and a player halfway through those ten minutes.'
        },
        {
          image: images.pilot,
          alt: 'A printed pilot report headed “Heard before the alarm in 9 of 11 tests”, with a dot chart of how many minutes before the alarm each test was flagged.'
        }
      ],
      caption:
        'Left: the on-call companion plays the last ten minutes of a flagged station. Right: the pilot report, with all eleven injected anomalies.'
    },
    {
      type: 'metrics',
      items: [
        { value: '9 / 11', label: 'injected anomalies flagged by ear before the alarm' },
        { value: '4 min', label: 'median lead over the threshold alarm' },
        { value: '600×', label: 'replay speed: a full night in 2 min 24 s' },
        { value: '0', label: 'noise complaints in seventy nights' }
      ]
    }
  ]
});
