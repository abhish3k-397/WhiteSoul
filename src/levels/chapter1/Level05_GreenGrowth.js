/**
 * Level 5: GREEN GROWTH
 * Platforms expand on touch. If they expand enough to hit the toxic floor, you die.
 * Toxic green, organic tendrils, growth animation.
 */
import { LevelBase } from '../LevelBase.js';
import { Platform } from '../../game/Platform.js';
import { Goal } from '../../game/Goal.js';

export class Level05_GreenGrowth extends LevelBase {
  constructor() {
    super(5, 'GREEN GROWTH', '#40ff40');
    this.bgColor = '#000a00';
    this.toxicFloorY = 500;
    this.touchedPlatforms = new Set();
  }

  init(sublevel) {
    super.init(sublevel);
    this.bgColor = '#000a00';
    this.player.color = '#ffffff';
    this.player.setSpawn(60, 340);
    this.player.reset();
    this.touchedPlatforms = new Set();
    this.toxicFloorY = 520;

    const expandRate = sublevel === 1 ? 10 : sublevel === 2 ? 20 : 35;

    const layouts = {
      1: [
        [0, 420, 150, 15],
        [210, 370, 120, 15],
        [390, 330, 110, 15],
        [560, 280, 120, 15],
        [740, 240, 100, 15],
        [880, 200, 80, 15],
      ],
      2: [
        [0, 420, 120, 15],
        [180, 360, 90, 15],
        [340, 310, 80, 15],
        [480, 370, 70, 15],
        [610, 260, 90, 15],
        [770, 310, 70, 15],
        [880, 200, 80, 15],
      ],
      3: [
        [0, 420, 100, 15],
        [160, 350, 60, 15],
        [280, 290, 50, 15],
        [400, 350, 45, 15],
        [510, 250, 55, 15],
        [640, 310, 45, 15],
        [750, 220, 50, 15],
        [870, 180, 60, 15],
      ],
    };

    const layout = layouts[sublevel] || layouts[1];
    for (const [x, y, w, h] of layout) {
      const p = new Platform(x, y, w, h, {
        color: '#0a3a0a',
        type: 'expanding',
        expandRate: expandRate,
      });
      this.platforms.push(p);
    }

    const lastP = layout[layout.length - 1];
    this.goal = new Goal(lastP[0] + 10, lastP[1] - 45);
  }

  update(dt, input, renderer) {
    // Check which platforms the player is touching
    if (this.player && this.player.alive) {
      for (let i = 0; i < this.platforms.length; i++) {
        const p = this.platforms[i];
        // Check if player is standing on this platform
        const onPlatform = this.player.grounded &&
          this.player.x + this.player.width > p.x &&
          this.player.x < p.x + p.width &&
          Math.abs((this.player.y + this.player.height) - p.y) < 5;

        if (onPlatform && !this.touchedPlatforms.has(i)) {
          this.touchedPlatforms.add(i);
          p.expanded = true;
        }

        // Check if expanded platform touches toxic floor
        if (p.expanded && p.y + p.height >= this.toxicFloorY) {
          // Platform reached toxic floor — LETHAL
          this.onPlayerDeath(renderer);
          this.particles.burst(p.x + p.width / 2, this.toxicFloorY, 20, {
            color: ['#40ff40', '#80ff80', '#00aa00'],
            gravity: -200,
          });
        }
      }
    }

    super.update(dt, input, renderer);
  }

  render(ctx, camera) {
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.width, this.height);

    // Toxic floor
    ctx.save();
    const floorGrad = ctx.createLinearGradient(0, this.toxicFloorY - 20, 0, this.height);
    floorGrad.addColorStop(0, 'rgba(0, 255, 0, 0.05)');
    floorGrad.addColorStop(0.3, 'rgba(0, 255, 0, 0.15)');
    floorGrad.addColorStop(1, 'rgba(0, 180, 0, 0.3)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, this.toxicFloorY - 20, this.width, this.height - this.toxicFloorY + 20);

    // Toxic bubbles on floor
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 10; i++) {
      const bx = (i * 97 + this.timer * 30) % this.width;
      const by = this.toxicFloorY + Math.sin(this.timer * 2 + i) * 5;
      ctx.fillStyle = '#40ff40';
      ctx.beginPath();
      ctx.arc(bx, by, 2 + Math.sin(this.timer + i) * 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    camera.apply(ctx);

    for (const p of this.platforms) {
      // Draw tendrils/roots on expanding platforms
      if (p.expanded) {
        ctx.save();
        ctx.strokeStyle = '#1a5a1a';
        ctx.lineWidth = 2;
        const cx = p.x + p.width / 2;
        for (let t = 0; t < 3; t++) {
          ctx.beginPath();
          ctx.moveTo(cx + (t - 1) * 15, p.y + p.height);
          const endY = Math.min(p.y + p.height + 30, this.toxicFloorY);
          ctx.lineTo(cx + (t - 1) * 15 + Math.sin(this.timer * 2 + t) * 5, endY);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.save();
      if (p.expanded) {
        ctx.shadowColor = '#40ff40';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#1a6a1a';
      } else {
        ctx.fillStyle = p.color;
      }
      ctx.fillRect(p.x, p.y, p.width, p.height);
      ctx.restore();
    }

    for (const h of this.hazards) h.render(ctx);
    if (this.goal) this.goal.render(ctx);
    if (this.player) this.player.render(ctx);
    this.particles.render(ctx);

    ctx.restore();
  }
}
