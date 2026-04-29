/**
 * Hazard — Spikes, beams, zones, and projectiles.
 */
export class Hazard {
  constructor(x, y, width, height, options = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = options.color || '#ff0040';
    this.type = options.type || 'static'; // 'static', 'projectile', 'zone', 'beam', 'pulse'
    this.active = options.active !== undefined ? options.active : true;
    this.visible = options.visible !== undefined ? options.visible : true;

    // Projectile
    this.vx = options.vx || 0;
    this.vy = options.vy || 0;
    this.lifetime = options.lifetime || Infinity;
    this.age = 0;

    // Pulsing
    this.pulsePhase = options.pulsePhase || 0;
    this.pulseSpeed = options.pulseSpeed || 2;

    // Zone
    this.zoneRadius = options.zoneRadius || 0;

    // Troll mechanics (Level Devil style)
    this.trollType = options.trollType || 'pop'; // 'pop', 'fall', 'vanish'
    this.triggerDistance = options.triggerDistance || 120;
    this.triggered = false;
    this.originalY = y;
    this.targetY = options.targetY !== undefined ? options.targetY : y - 30;

    // Custom
    this.custom = options.custom || {};
  }

  update(dt, player) {
    this.age += dt;

    if (this.type === 'projectile') {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }

    if (this.type === 'pulse') {
      this.pulsePhase += this.pulseSpeed * dt;
      this.active = Math.sin(this.pulsePhase) > 0;
    }

    if (this.type === 'troll' && player) {
      const dx = Math.abs((player.x + player.width / 2) - (this.x + this.width / 2));
      const dy = Math.abs((player.y + player.height / 2) - (this.y + this.height / 2));
      
      if (!this.triggered && dx < this.triggerDistance && dy < 200) {
        this.triggered = true;
      }

      if (this.triggered) {
        if (this.trollType === 'pop') {
          // Smoothly move to targetY
          const dy = (this.targetY - this.y) * 10 * dt;
          this.y += dy;
        } else if (this.trollType === 'fall') {
          this.y += 500 * dt; // Drop down
        } else if (this.trollType === 'vanish') {
          this.active = false; // Disappear
          this.visible = false;
        }
      }
    }
  }

  get dead() {
    return this.age >= this.lifetime;
  }

  /**
   * Check if this hazard overlaps with an entity.
   */
  overlaps(entity) {
    if (!this.active) return false;
    const ex = entity.x, ey = entity.y, ew = entity.width, eh = entity.height;
    return !(ex + ew <= this.x || ex >= this.x + this.width ||
             ey + eh <= this.y || ey >= this.y + this.height);
  }

  render(ctx) {
    if (!this.visible || !this.active) return;

    ctx.save();

    if (this.type === 'zone') {
      // Radial zone rendering
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, this.zoneRadius || this.width / 2);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = this.color;

      // Spike-like shape for static hazards
      if (this.type === 'static' && this.height <= 12) {
        // Draw spikes
        const spikeCount = Math.floor(this.width / 12);
        const spikeW = this.width / spikeCount;
        ctx.beginPath();
        for (let i = 0; i < spikeCount; i++) {
          ctx.moveTo(this.x + i * spikeW, this.y + this.height);
          ctx.lineTo(this.x + i * spikeW + spikeW / 2, this.y);
          ctx.lineTo(this.x + (i + 1) * spikeW, this.y + this.height);
        }
        ctx.fill();
      } else {
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }

    ctx.restore();
  }
}

/**
 * Create a row of floor spikes.
 */
export function createSpikes(x, y, width, color) {
  return new Hazard(x, y, width, 10, { color: color || '#ff0040', type: 'static' });
}
