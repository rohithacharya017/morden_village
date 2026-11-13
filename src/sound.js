// ==========================================================================
// WEB AUDIO API PROCEDURAL SOUNDSCAPE FOR MODERN VILLAGE
// Serene nature soundscape (gentle breeze, birds chirping) & clean UI feedback
// ==========================================================================

class VillageSoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlayingAmbience = false;
    this.ambienceGain = null;
    this.birdTimer = null;
    this.noiseNode = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleAmbience() {
    this.init();
    if (this.isPlayingAmbience) {
      this.stopAmbience();
      return false;
    } else {
      this.startAmbience();
      return true;
    }
  }

  startAmbience() {
    if (this.isPlayingAmbience) return;
    this.isPlayingAmbience = true;

    // Master ambience gain node
    this.ambienceGain = this.ctx.createGain();
    this.ambienceGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.ambienceGain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 2);
    this.ambienceGain.connect(this.ctx.destination);

    // 1. Gentle Wind / Rustling Leaves via filtered pink noise
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.12;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

    // Subtle LFO modulating the wind frequency
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);
    lfo.start();

    this.noiseNode.connect(windFilter);
    windFilter.connect(this.ambienceGain);
    this.noiseNode.start();

    // 2. Procedural Gentle Bird Chirping at semi-random intervals
    const playRandomBirdChirp = () => {
      if (!this.isPlayingAmbience) return;
      this.synthesizeBirdChirp();
      const nextDelay = 3500 + Math.random() * 6000;
      this.birdTimer = setTimeout(playRandomBirdChirp, nextDelay);
    };
    this.birdTimer = setTimeout(playRandomBirdChirp, 1500);
  }

  synthesizeBirdChirp() {
    if (!this.ctx || !this.isPlayingAmbience) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 2400 + Math.random() * 800;

    // Pitch sweep mimicking bird song
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + 700, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq - 300, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(baseFreq + 400, now + 0.28);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.ambienceGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  stopAmbience() {
    this.isPlayingAmbience = false;
    if (this.birdTimer) clearTimeout(this.birdTimer);
    if (this.ambienceGain && this.ctx) {
      this.ambienceGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1);
      setTimeout(() => {
        try {
          if (this.noiseNode) this.noiseNode.stop();
        } catch (_) {}
      }, 1000);
    }
  }

  playClick() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  playSuccess() {
    this.init();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.07, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  }

  playAlertPing() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(440, now + 0.15);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }
}

export const villageAudio = new VillageSoundEngine();
