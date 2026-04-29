/**
 * ParticleSystem — Lightweight particle emitter for death, ambient, and level effects.
 */

class Particle {
  constructor(x, y, vx, vy, color, size, life, gravity = 0, fadeRate = 1) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.gravity = gravity;
    this.fadeRate = fadeRate;
    this.alpha = 1;
  }

  update(dt) {
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    this.alpha = Math.max(0, (this.life / this.maxLife) * this.fadeRate);
    this.size *= 0.998;
  }

  get dead() {
    return this.life <= 0;
  }
}

export class ParticleSystem {
  constructor(maxParticles = 500) {
    this.particles = [];
    this.maxParticles = maxParticles;
  }

  /**
   * Emit a burst of particles.
   */
  burst(x, y, count, options = {}) {
    const {
      color = '#ffffff',
      minSpeed = 50,
      maxSpeed = 300,
      minSize = 2,
      maxSize = 6,
      minLife = 0.3,
      maxLife = 1.0,
      gravity = 400,
      fadeRate = 1,
      spread = Math.PI * 2, // full circle
      angle = -Math.PI / 2, // upward
    } = options;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const a = angle + (Math.random() - 0.5) * spread;
      const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
      const size = minSize + Math.random() * (maxSize - minSize);
      const life = minLife + Math.random() * (maxLife - minLife);

      const c = Array.isArray(color)
        ? color[Math.floor(Math.random() * color.length)]
        : color;

      this.particles.push(new Particle(
        x, y,
        Math.cos(a) * speed,
        Math.sin(a) * speed,
        c, size, life, gravity, fadeRate
      ));
    }
  }

  /**
   * Emit ambient floating particles.
   */
  ambient(x, y, width, height, count, options = {}) {
    const {
      color = 'rgba(255,255,255,0.3)',
      minSize = 1,
      maxSize = 3,
      minLife = 2,
      maxLife = 5,
    } = options;

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const px = x + Math.random() * width;
      const py = y + Math.random() * height;
      const size = minSize + Math.random() * (maxSize - minSize);
      const life = minLife + Math.random() * (maxLife - minLife);
      const c = Array.isArray(color)
        ? color[Math.floor(Math.random() * color.length)]
        : color;
      this.particles.push(new Particle(
        px, py,
        (Math.random() - 0.5) * 20,
        -Math.random() * 15 - 5,
        c, size, life, -10, 0.8
      ));
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].dead) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    }
  }

  clear() {
    this.particles.length = 0;
  }
}
