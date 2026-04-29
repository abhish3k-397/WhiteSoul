/**
 * soundEffects.js — Dynamic Web Audio API SFX Synthesizer
 */

class SoundEffectsManager {
  constructor() {
    this.ctx = null;
    this.masterVolume = null;
    this.enabled = true;
  }

  init() {
    if (this.ctx) return;
    // Initialize AudioContext on first user interaction
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterVolume = this.ctx.createGain();
    this.masterVolume.gain.value = 0.3; // Keep it pleasant
    this.masterVolume.connect(this.ctx.destination);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // --- SOUND EFFECTS ---

  // 1. Jump: Short upward pitch sweep
  playJump() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(this.masterVolume);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // 2a. Hazard Death: Loud noisy distortion explosion
  playHazardDeath() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
    
    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.linearRampToValueAtTime(0.01, now + 0.4);
    osc.connect(oscGain).connect(this.masterVolume);
    osc.start(now);
    osc.stop(now + 0.4);

    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.linearRampToValueAtTime(0.01, now + 0.3);
    noise.connect(filter).connect(noiseGain).connect(this.masterVolume);
    noise.start(now);
    noise.stop(now + 0.3);
  }

  // 2b. Fall Death: Deep echoing void sweep
  playFallDeath() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.7);
    
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
    
    osc.connect(gainNode).connect(this.masterVolume);
    osc.start(now);
    osc.stop(now + 0.7);
  }

  // EDM BGM Synth Setup
  startBgm(levelIndex = 1) {
    if (!this.enabled) return;
    this.init();
    this.stopBgm();
    
    this.bgmActive = true;
    let step = 0;
    const bpm = 125;
    const stepInterval = (60 / bpm) / 4; // 16th notes

    const chords = [
      [130.81, 155.56, 196.00], // Cm
      [146.83, 174.61, 220.00], // Dm
      [116.54, 138.59, 174.61], // Bbm
      [103.83, 130.81, 155.56]  // Ab
    ];
    
    const chord = chords[(levelIndex - 1) % chords.length];

    this.bgmTimer = setInterval(() => {
      const now = this.ctx.currentTime;

      // Kick Drum on quarter notes (beats 0, 4, 8, 12)
      if (step % 4 === 0) {
        const kick = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kick.frequency.setValueAtTime(150, now);
        kick.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        kickGain.gain.setValueAtTime(0.6, now);
        kickGain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        kick.connect(kickGain).connect(this.masterVolume);
        kick.start(now);
        kick.stop(now + 0.1);
      }

      // EDM Bassline
      if (step % 2 === 0) {
        const bass = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        const note = chord[Math.floor(step / 4) % chord.length] / 2; // Drop one octave
        bass.type = 'sawtooth';
        bass.frequency.setValueAtTime(note, now);
        bassGain.gain.setValueAtTime(0.15, now);
        bassGain.gain.linearRampToValueAtTime(0.01, now + stepInterval * 1.5);
        bass.connect(bassGain).connect(this.masterVolume);
        bass.start(now);
        bass.stop(now + stepInterval * 1.5);
      }

      step = (step + 1) % 16;
    }, stepInterval * 1000);
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.bgmActive = false;
  }

  // 3. Victory / Level Complete: Bright, happy arpeggio
  playVictory() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    
    notes.forEach((note, index) => {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now + index * 0.08);
      
      gainNode.gain.setValueAtTime(0.3, now + index * 0.08);
      gainNode.gain.linearRampToValueAtTime(0.01, now + index * 0.08 + 0.2);
      
      osc.connect(gainNode);
      gainNode.connect(this.masterVolume);
      
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + 0.2);
    });
  }

  // 4. Menu Click: Short arcade blip
  playClick() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.05);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.05);
    
    osc.connect(gainNode);
    gainNode.connect(this.masterVolume);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const sfx = new SoundEffectsManager();
