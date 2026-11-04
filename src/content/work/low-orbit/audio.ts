import type { StemId, Stems } from './orbit';

/**
 * A synthesised 120 BPM loop, split into the four stems the visual listens
 * to. Each stem has its own analyser before the master, so muting the master
 * keeps the visuals driven by the music.
 */

const BPM = 120;
const STEP = 60 / BPM / 4; // one sixteenth
const LOOKAHEAD = 0.12;

// A minor: Am – F – C – G, one chord per bar.
const CHORDS = [
  [220.0, 261.63, 329.63],
  [174.61, 220.0, 261.63],
  [196.0, 261.63, 329.63],
  [196.0, 246.94, 293.66]
];
const BASS_ROOTS = [55.0, 43.65, 65.41, 49.0];
// Vocal motif over two bars: [step, frequency, length in steps]
const MOTIF: [number, number, number][] = [
  [0, 659.25, 3],
  [4, 587.33, 2],
  [6, 523.25, 4],
  [12, 440.0, 6],
  [20, 523.25, 2],
  [22, 587.33, 2],
  [24, 659.25, 8]
];

type Stem = {
  bus: GainNode;
  analyser: AnalyserNode;
  data: Float32Array<ArrayBuffer>;
  level: number;
  calibration: number;
};

export class OrbitAudio {
  readonly ctx: AudioContext;
  private master: GainNode;
  private stems: Record<StemId, Stem>;
  private pads: OscillatorNode[] = [];
  private padFilter: BiquadFilterNode;
  private noise: AudioBuffer;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextTime = 0;
  private step = 0;
  private startedAt = 0;
  private startedStep = 0;

  constructor() {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    this.ctx = new Ctor();
    const ctx = this.ctx;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -14;
    compressor.ratio.value = 3;
    this.master = ctx.createGain();
    this.master.gain.value = 0.55;
    this.master.connect(compressor).connect(ctx.destination);

    const makeStem = (gain: number, calibration: number): Stem => {
      const bus = ctx.createGain();
      bus.gain.value = gain;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0;
      bus.connect(analyser);
      bus.connect(this.master);
      return {
        bus,
        analyser,
        data: new Float32Array(analyser.fftSize),
        level: 0,
        calibration
      };
    };
    this.stems = {
      kick: makeStem(0.9, 2.4),
      bass: makeStem(0.5, 5),
      pads: makeStem(0.22, 9),
      vocal: makeStem(0.3, 6)
    };

    // Pads: three detuned saws per voice, through one slow filter.
    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.value = 900;
    this.padFilter.Q.value = 0.7;
    this.padFilter.connect(this.stems.pads.bus);
    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();
    lfo.frequency.value = 0.09;
    lfoDepth.gain.value = 450;
    lfo.connect(lfoDepth).connect(this.padFilter.frequency);
    lfo.start();
    for (const freq of CHORDS[0]!) {
      for (const detune of [-8, 7]) {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        osc.detune.value = detune;
        const g = ctx.createGain();
        g.gain.value = 0.16;
        osc.connect(g).connect(this.padFilter);
        osc.start();
        this.pads.push(osc);
      }
    }

    this.noise = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
    const channel = this.noise.getChannelData(0);
    let seed = 7;
    for (let i = 0; i < channel.length; i++) {
      seed = (seed * 16807) % 2147483647;
      channel[i] = (seed / 2147483647) * 2 - 1;
    }
  }

  get playing() {
    return this.timer !== null;
  }

  async start() {
    if (this.timer) return;
    await this.ctx.resume();
    this.nextTime = this.ctx.currentTime + 0.06;
    this.startedAt = this.nextTime;
    this.startedStep = this.step;
    this.timer = setInterval(() => this.schedule(), 25);
    this.schedule();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    void this.ctx.suspend();
  }

  setMuted(muted: boolean) {
    this.master.gain.setTargetAtTime(muted ? 0 : 0.55, this.ctx.currentTime, 0.02);
  }

  /** Seconds of music played, for the visual's clock. */
  get position() {
    if (!this.timer) return this.step * STEP;
    return this.startedStep * STEP + Math.max(0, this.ctx.currentTime - this.startedAt);
  }

  /** Smoothed 0–1 loudness per stem. */
  levels(): Stems {
    const out = {} as Stems;
    for (const id of Object.keys(this.stems) as StemId[]) {
      const stem = this.stems[id];
      stem.analyser.getFloatTimeDomainData(stem.data);
      let sum = 0;
      for (let i = 0; i < stem.data.length; i++) sum += stem.data[i]! * stem.data[i]!;
      const rms = Math.sqrt(sum / stem.data.length) * stem.calibration;
      const target = Math.min(1, rms);
      // Fast attack, slower release so the visual breathes.
      stem.level = target > stem.level ? target : stem.level * 0.9 + target * 0.1;
      out[id] = stem.level;
    }
    return out;
  }

  dispose() {
    this.stop();
    void this.ctx.close();
  }

  private schedule() {
    while (this.nextTime < this.ctx.currentTime + LOOKAHEAD) {
      this.playStep(this.step, this.nextTime);
      this.nextTime += STEP;
      this.step += 1;
    }
  }

  private playStep(step: number, time: number) {
    const inBar = step % 16;
    const bar = Math.floor(step / 16) % 4;

    if (inBar % 4 === 0) this.kick(time);
    if (inBar % 4 === 2) this.hat(time, 0.18);
    if (inBar === 15) this.hat(time, 0.08);

    // Bass on the off-beat eighths, an octave jump at the end of the bar.
    if (inBar % 4 === 2 || inBar === 7 || inBar === 15) {
      const root = BASS_ROOTS[bar]!;
      this.bass(time, inBar === 15 ? root * 2 : root);
    }

    if (inBar === 0) {
      const chord = CHORDS[bar]!;
      this.pads.forEach((osc, i) => {
        osc.frequency.setTargetAtTime(chord[Math.floor(i / 2)]!, time, 0.08);
      });
    }

    // The vocal sings in bars two and four.
    const phrase = step % 64;
    if (phrase >= 16 && phrase < 32) {
      this.motif(phrase - 16, time);
    } else if (phrase >= 48) {
      this.motif(phrase - 48 + 16, time, 0.84);
    }
  }

  private motif(index: number, time: number, transpose = 1) {
    for (const [at, freq, length] of MOTIF) {
      if (at === index) this.voice(time, freq * transpose, length * STEP);
    }
  }

  private kick(time: number) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(44, time + 0.12);
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.42);
    osc.connect(gain).connect(this.stems.kick.bus);
    osc.start(time);
    osc.stop(time + 0.45);
  }

  private hat(time: number, level: number) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(level, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    src.connect(hp).connect(gain).connect(this.stems.kick.bus);
    src.start(time);
    src.stop(time + 0.06);
  }

  private bass(time: number, freq: number) {
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 6;
    lp.frequency.setValueAtTime(900, time);
    lp.frequency.exponentialRampToValueAtTime(140, time + 0.2);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.9, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26);
    osc.connect(lp).connect(gain).connect(this.stems.bass.bus);
    osc.start(time);
    osc.stop(time + 0.3);
  }

  private voice(time: number, freq: number, length: number) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    const vibrato = ctx.createOscillator();
    const depth = ctx.createGain();
    vibrato.frequency.value = 5.2;
    depth.gain.value = freq * 0.012;
    vibrato.connect(depth).connect(osc.frequency);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.5, time + 0.06);
    gain.gain.setTargetAtTime(0.0001, time + length, 0.09);
    // Two formants make the saw read as an "ah".
    for (const [f, q] of [
      [800, 9],
      [1150, 11]
    ] as const) {
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.frequency.value = f;
      band.Q.value = q;
      osc.connect(band).connect(gain);
    }
    gain.connect(this.stems.vocal.bus);
    osc.start(time);
    vibrato.start(time);
    osc.stop(time + length + 0.6);
    vibrato.stop(time + length + 0.6);
  }
}
