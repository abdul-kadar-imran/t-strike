
class SoundService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private musicInterval: number | null = null;
  private muted: boolean = false;

  constructor() {}

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.25;
      this.musicGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(mute: boolean) {
    this.muted = mute;
    if (this.masterGain) {
      this.masterGain.gain.value = mute ? 0 : 1;
    }
  }

  // Synthesizes a driving arcade-style synth track with high intensity
  startBackgroundMusic() {
    this.init();
    if (this.musicInterval) return;

    const ctx = this.ctx!;
    let beat = 0;
    const melody = [110, 110, 164, 110, 138, 110, 164, 146]; 

    this.musicInterval = window.setInterval(() => {
      if (this.muted) return;
      
      const time = ctx.currentTime;
      
      // Heavy Bass Thump (Rhythmic engine sound)
      if (beat % 2 === 0) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.setValueAtTime(melody[beat % melody.length], time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.3);
        g.gain.setValueAtTime(0.4, time);
        g.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
        osc.connect(g);
        g.connect(this.musicGain!);
        osc.start(time);
        osc.stop(time + 0.3);
      }

      // Snare / Metallic Clap (Combat beat)
      if (beat % 4 === 2) {
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.15, time);
        ng.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        noise.connect(ng);
        ng.connect(this.musicGain!);
        noise.start(time);
      }

      // Rapid Hi-Hat (Constant tension)
      if (beat % 1 === 0) {
        const hBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
        const hData = hBuffer.getChannelData(0);
        for (let i = 0; i < hData.length; i++) hData[i] = Math.random() * 0.5;
        const hNoise = ctx.createBufferSource();
        hNoise.buffer = hBuffer;
        const hg = ctx.createGain();
        hg.gain.setValueAtTime(0.05, time);
        hg.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
        hNoise.connect(hg);
        hg.connect(this.musicGain!);
        hNoise.start(time);
      }

      // High-frequency "Alarm" or Lead (Cinematic urgency)
      if (beat % 32 === 0) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, time);
        osc.frequency.linearRampToValueAtTime(880, time + 0.5);
        g.gain.setValueAtTime(0.05, time);
        g.gain.linearRampToValueAtTime(0, time + 0.5);
        osc.connect(g);
        g.connect(this.musicGain!);
        osc.start(time);
        osc.stop(time + 0.5);
      }

      beat++;
    }, 150);
  }

  stopBackgroundMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  playLaser(color: string) {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx!;
    
    // Multi-stage firing sound
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(350, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.15);
    g1.gain.setValueAtTime(0.3, ctx.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc1.connect(g1);
    g1.connect(this.masterGain!);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.15);

    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1800, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
    g2.gain.setValueAtTime(0.12, ctx.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc2.connect(g2);
    g2.connect(this.masterGain!);
    osc2.start();
    osc2.stop(ctx.currentTime + 0.08);
  }

  playExplosion() {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx!;
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.7, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.7);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    noise.start();
  }

  playError() {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(60, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  playLevelUp() {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx!;
    [523, 659, 783, 1046].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.1);
      g.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
      g.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.1 + 0.05);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.1 + 0.3);
      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.3);
    });
  }

  playGameOver() {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.7, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
    osc.connect(g);
    g.connect(this.masterGain!);
    osc.start();
    osc.stop(ctx.currentTime + 3);
  }
}

export const soundService = new SoundService();
