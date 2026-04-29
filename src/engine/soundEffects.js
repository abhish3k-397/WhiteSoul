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

  // 2. Death: White noise explosion mixed with a low pitch drop
  playDeath() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;

    // Low rumble
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
    
    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.linearRampToValueAtTime(0.01, now + 0.4);
    
    osc.connect(oscGain);
    oscGain.connect(this.masterVolume);
    
    osc.start(now);
    osc.stop(now + 0.4);

    // Noise Burst (Explosion effect)
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(800, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.3);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.linearRampToValueAtTime(0.01, now + 0.3);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterVolume);
    
    noise.start(now);
    noise.stop(now + 0.3);
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
