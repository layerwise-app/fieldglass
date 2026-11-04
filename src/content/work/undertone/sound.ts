import { getSeries, stations } from './data';

/**
 * The mapping from sensor values to sound. The audio engine and the on-screen
 * readouts both use it, so what you see is exactly what you hear.
 */
export type Voice = {
  /** Drone frequency in Hz; drifts sharp as the station leaves normal. */
  hz: number;
  cents: number;
  /** Low-pass cutoff in Hz: brighter as chloride rises. */
  cutoff: number;
  /** Soft noise ticks per second of listening: denser with more flow. */
  ticks: number;
  /** 0–1. Room tone is quiet; only deviation gets louder. */
  gain: number;
  /** 0–1. The off-key partial that makes an anomaly audible. */
  dissonance: number;
};

const SALT_BASE = [188, 210, 9400];
const FLOW_BASE = [8.4, 2.6, 1.1];

export function voiceAt(lane: number, minute: number): Voice {
  const s = getSeries()[lane]!;
  const i = Math.max(0, Math.min(s.level.length - 1, Math.round(minute)));
  const dev = s.deviation[i]!;
  const cents = dev * 70;
  const hz = stations[lane]!.baseHz * Math.pow(2, cents / 1200);
  const ratio = s.salinity[i]! / SALT_BASE[lane]!;
  const cutoff = Math.min(4200, 520 * Math.pow(ratio, 0.85));
  const ticks = Math.max(0.6, Math.min(6, 3.2 * (s.flow[i]! / FLOW_BASE[lane]!)));
  return {
    hz,
    cents,
    cutoff,
    ticks,
    gain: 0.22 + dev * 0.78,
    dissonance: dev
  };
}

type LaneNodes = {
  drone: OscillatorNode;
  body: OscillatorNode;
  off: OscillatorNode;
  offGain: GainNode;
  filter: BiquadFilterNode;
  voice: GainNode;
  mute: GainNode;
  pan: StereoPannerNode;
  nextTick: number;
};

/** Three soft drones and their noise ticks. Create only after a user gesture. */
export class Sonifier {
  readonly ctx: AudioContext;
  private master: GainNode;
  private noise: AudioBuffer;
  private lanes: LaneNodes[];

  constructor() {
    this.ctx = new AudioContext();
    const ctx = this.ctx;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -24;
    comp.ratio.value = 3;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(comp).connect(ctx.destination);

    this.noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.08), ctx.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    }

    this.lanes = stations.map((station) => {
      const pan = ctx.createStereoPanner();
      pan.pan.value = station.pan;
      const mute = ctx.createGain();
      mute.connect(pan).connect(this.master);
      const voice = ctx.createGain();
      voice.gain.value = 0;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 0.7;
      filter.frequency.value = 600;
      filter.connect(voice).connect(mute);

      const drone = ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.value = station.baseHz;
      const body = ctx.createOscillator();
      body.type = 'triangle';
      body.frequency.value = station.baseHz * 2;
      body.detune.value = 4;
      const bodyGain = ctx.createGain();
      bodyGain.gain.value = 0.35;
      drone.connect(filter);
      body.connect(bodyGain).connect(filter);

      // A minor ninth above: silent until the station sounds wrong.
      const off = ctx.createOscillator();
      off.type = 'sine';
      off.frequency.value = station.baseHz * Math.pow(2, 13 / 12);
      const offGain = ctx.createGain();
      offGain.gain.value = 0;
      off.connect(offGain).connect(filter);

      drone.start();
      body.start();
      off.start();
      return { drone, body, off, offGain, filter, voice, mute, pan, nextTick: 0 };
    });
  }

  async start() {
    if (this.ctx.state !== 'running') await this.ctx.resume();
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(0.11, now, 0.25);
  }

  async stop() {
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(0, now, 0.08);
    await new Promise((resolve) => setTimeout(resolve, 260));
    if (this.ctx.state === 'running') await this.ctx.suspend();
  }

  /** Call every frame while playing. */
  update(minute: number, muted: boolean[]) {
    const now = this.ctx.currentTime;
    this.lanes.forEach((lane, index) => {
      const v = voiceAt(index, minute);
      lane.drone.frequency.setTargetAtTime(v.hz, now, 0.12);
      lane.body.frequency.setTargetAtTime(v.hz * 2, now, 0.12);
      lane.off.frequency.setTargetAtTime(v.hz * Math.pow(2, 13 / 12), now, 0.12);
      lane.offGain.gain.setTargetAtTime(v.dissonance * 0.55, now, 0.2);
      lane.filter.frequency.setTargetAtTime(v.cutoff, now, 0.15);
      lane.voice.gain.setTargetAtTime(v.gain * 0.5, now, 0.2);
      lane.mute.gain.setTargetAtTime(muted[index] ? 0 : 1, now, 0.05);

      if (muted[index]) return;
      if (lane.nextTick < now) lane.nextTick = now + Math.random() * 0.1;
      while (lane.nextTick < now + 0.12) {
        this.tick(lane, lane.nextTick, v.cutoff);
        lane.nextTick += (1 / v.ticks) * (0.75 + Math.random() * 0.5);
      }
    });
  }

  private tick(lane: LaneNodes, when: number, cutoff: number) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const band = this.ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = Math.min(6000, cutoff * 2.4);
    band.Q.value = 2.5;
    const g = this.ctx.createGain();
    g.gain.value = 0.09;
    src.connect(band).connect(g).connect(lane.mute);
    src.start(when);
  }

  close() {
    void this.ctx.close();
  }
}
