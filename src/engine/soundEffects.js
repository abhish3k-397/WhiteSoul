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

    const levelThemes = [
      { chords: [[130.81, 155.56, 196.00], [146.83, 174.61, 220.00]], type: 'sawtooth', bpm: 125 }, // Level 1
      { chords: [[146.83, 174.61, 220.00], [164.81, 196.00, 246.94]], type: 'square', bpm: 130 },   // Level 2
      { chords: [[116.54, 138.59, 174.61], [130.81, 155.56, 196.00]], type: 'sawtooth', bpm: 120 }, // Level 3
      { chords: [[103.83, 130.81, 155.56], [116.54, 138.59, 174.61]], type: 'triangle', bpm: 128 }, // Level 4
      { chords: [[130.81, 164.81, 196.00], [174.61, 220.00, 261.63]], type: 'sawtooth', bpm: 135 }, // Level 5
      { chords: [[146.83, 164.81, 220.00], [196.00, 246.94, 293.66]], type: 'square', bpm: 140 },   // Level 6
      { chords: [[164.81, 196.00, 246.94], [220.00, 261.63, 329.63]], type: 'sawtooth', bpm: 125 }, // Level 7
      { chords: [[110.00, 130.81, 164.81], [130.81, 155.56, 196.00]], type: 'triangle', bpm: 115 }, // Level 8
      { chords: [[98.00, 123.47, 146.83], [110.00, 130.81, 164.81]], type: 'sawtooth', bpm: 132 }, // Level 9
      { chords: [[87.31, 110.00, 130.81], [103.83, 130.81, 155.56]], type: 'square', bpm: 145 },   // Level 10
      { chords: [[130.81, 155.56, 196.00], [164.81, 196.00, 246.94]], type: 'sawtooth', bpm: 138 }, // Level 11
      { chords: [[146.83, 174.61, 220.00], [174.61, 220.00, 261.63]], type: 'triangle', bpm: 122 }, // Level 12
      { chords: [[164.81, 207.65, 246.94], [196.00, 246.94, 293.66]], type: 'sawtooth', bpm: 150 }  // Level 13
    ];
    
    const theme = levelThemes[(levelIndex - 1) % levelThemes.length];
    const bpm = theme.bpm;
    const stepInterval = (60 / bpm) / 4; 

    const chordSet = theme.chords;

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
        const currentChord = chordSet[Math.floor(step / 8) % chordSet.length];
        const note = currentChord[Math.floor(step / 2) % currentChord.length] / 2; 
        
        bass.type = theme.type;
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
