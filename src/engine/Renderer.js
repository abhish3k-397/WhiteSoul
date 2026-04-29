/**
 * Renderer — Canvas context management, post-processing effects pipeline.
 * Handles scanlines, chromatic aberration, vignette, screen shake.
 */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;

    // Screen shake
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;

    // Post-processing toggles
    this.enableScanlines = true;
    this.enableVignette = true;
    this.enableChromaticAberration = false;
    this.chromaticOffset = 2;

    // Flash effect
    this.flashColor = null;
    this.flashAlpha = 0;
    this.flashDecay = 0;
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
  }

  clear(color = '#0a0a0a') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * Trigger screen shake.
   */
  shake(intensity = 8, duration = 0.3) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = duration;
  }

  /**
   * Trigger screen flash.
   */
  flash(color = '#ffffff', alpha = 0.6, decay = 3) {
    this.flashColor = color;
    this.flashAlpha = alpha;
    this.flashDecay = decay;
  }

  updateEffects(dt) {
    // Shake decay
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const t = this.shakeTimer / this.shakeDuration;
      this.shakeOffsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity * t;
      this.shakeOffsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity * t;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    // Flash decay
    if (this.flashAlpha > 0) {
      this.flashAlpha -= this.flashDecay * dt;
      if (this.flashAlpha < 0) this.flashAlpha = 0;
    }
  }

  beginFrame() {
    this.ctx.save();
    this.ctx.translate(this.shakeOffsetX, this.shakeOffsetY);
  }

  endFrame() {
    this.ctx.restore();

    // Post-processing
    if (this.enableScanlines) this._drawScanlines();
    if (this.enableVignette) this._drawVignette();
    if (this.flashAlpha > 0) this._drawFlash();
  }

  _drawScanlines() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < this.height; y += 3) {
      ctx.fillRect(0, y, this.width, 1);
    }
  }

  _drawVignette() {
    const ctx = this.ctx;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const r = Math.max(this.width, this.height) * 0.7;
    const gradient = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  _drawFlash() {
    const ctx = this.ctx;
    ctx.fillStyle = this.flashColor;
    ctx.globalAlpha = this.flashAlpha;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalAlpha = 1;
  }

  /**
   * Draw text with CRT-style glow effect.
   */
  drawGlowText(text, x, y, color, size = 24, font = 'JetBrains Mono') {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = `${size}px "${font}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Glow layers
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    ctx.shadowBlur = 10;
    ctx.fillText(text, x, y);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);

    ctx.restore();
  }
}
