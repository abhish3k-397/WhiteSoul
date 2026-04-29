/**
 * Level 4: YELLOW FEVER
 * High-speed corridor with Y-axis tracking solar flares.
 * Scorching yellow/orange, heat distortion, constant forward momentum.
 */
import { LevelBase } from '../LevelBase.js';
import { Platform } from '../../game/Platform.js';
import { Goal } from '../../game/Goal.js';
import { Hazard } from '../../game/Hazard.js';

class SolarFlare {
  constructor(x, speed) {
    this.x = x;
    this.y = 0;
    this.width = 40;
    this.height = 0; // extends from top
    this.targetY = 0; // tracks player Y
    this.speed = speed;
    this.active = true;
    this.warningTimer = 1.0; // 1s warning before activation
    this.state = 'warning'; // 'warning', 'charging', 'firing', 'cooldown'
    this.fireTimer = 0;
    this.cooldownTimer = 0;
  }

  update(dt, playerY) {
    this.targetY = playerY;

    switch (this.state) {
      case 'warning':
        this.warningTimer -= dt;
        if (this.warningTimer <= 0) this.state = 'charging';
        break;
      case 'charging':
        this.height += 800 * dt * this.speed;
        if (this.height >= this.targetY + 30) {
          this.state = 'firing';
          this.fireTimer = 0.3;
        }
        break;
      case 'firing':
        this.fireTimer -= dt;
        if (this.fireTimer <= 0) {
          this.state = 'cooldown';
          this.cooldownTimer = 0.5;
        }
        break;
      case 'cooldown':
        this.cooldownTimer -= dt;
        this.height -= 400 * dt;
        if (this.height < 0) this.height = 0;
        if (this.cooldownTimer <= 0) {
          this.state = 'warning';
          this.warningTimer = 0.8 + Math.random() * 0.5;
        }
        break;
    }
  }

  overlaps(entity) {
    if (this.state !== 'firing') return false;
    return !(entity.x + entity.width <= this.x || entity.x >= this.x + this.width ||
             entity.y + entity.height <= 0 || entity.y >= this.height);
  }

  render(ctx) {
    ctx.save();
    if (this.state === 'warning') {
      // Warning line
      ctx.strokeStyle = `rgba(255, 200, 0, ${0.3 + Math.sin(this.warningTimer * 20) * 0.3})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(this.x + this.width / 2, 0);
      ctx.lineTo(this.x + this.width / 2, 540);
      ctx.stroke();
    } else if (this.state === 'charging' || this.state === 'firing') {
      const alpha = this.state === 'firing' ? 0.8 : 0.4;
      const grad = ctx.createLinearGradient(this.x, 0, this.x + this.width, 0);
      grad.addColorStop(0, `rgba(255, 120, 0, ${alpha * 0.5})`);
      grad.addColorStop(0.5, `rgba(255, 200, 0, ${alpha})`);
      grad.addColorStop(1, `rgba(255, 120, 0, ${alpha * 0.5})`);
      ctx.fillStyle = grad;
      ctx.shadowColor = '#ffaa00';
      ctx.shadowBlur = this.state === 'firing' ? 30 : 10;
      ctx.fillRect(this.x, 0, this.width, this.height);
    }
    ctx.restore();
  }
}

export class Level04_YellowFever extends LevelBase {
  constructor() {
    super(4, 'YELLOW FEVER', '#ffaa00');
    this.bgColor = '#0a0800';
    this.flares = [];
    this.heatDistortion = 0;
  }

  init(sublevel) {
    super.init(sublevel);
    this.bgColor = '#0a0800';
    this.player.color = '#ffffff';
    this.player.setSpawn(60, 400);
    this.player.reset();
    this.flares = [];
    this.heatDistortion = 0;

    // Faster physics
    const sm = this.getSpeedMult();
    this.physics.setOverrides({
      playerSpeed: 380 * sm,
      gravity: 2000,
      jumpForce: -600,
    });

    const layouts = {
      1: [
        [0, 470, 160, 20],
        [200, 430, 120, 20],
        [370, 390, 130, 20],
        [550, 350, 120, 20],
        [720, 310, 130, 20],
        [890, 270, 70, 20],
      ],
      2: [
        [0, 470, 120, 20],
        [180, 420, 90, 20],
        [330, 370, 80, 20],
        [470, 430, 70, 20],
        [600, 320, 90, 20],
        [750, 370, 70, 20],
        [880, 250, 80, 20],
      ],
      3: [
        [0, 470, 100, 20],
        [160, 410, 60, 20],
        [290, 350, 50, 20],
        [400, 400, 50, 20],
        [520, 300, 50, 20],
        [640, 360, 40, 20],
        [750, 260, 50, 20],
        [870, 210, 60, 20],
      ],
    };

    const layout = layouts[sublevel] || layouts[1];
    for (const [x, y, w, h] of layout) {
      this.platforms.push(new Platform(x, y, w, h, { color: '#2a1800' }));
    }

    // Solar flares between platforms
    const flareCount = sublevel === 1 ? 3 : sublevel === 2 ? 5 : 7;
    for (let i = 0; i < flareCount; i++) {
      const fx = 150 + i * (this.width / (flareCount + 1));
      this.flares.push(new SolarFlare(fx, 0.8 + sublevel * 0.3));
    }

    const lastP = layout[layout.length - 1];
    this.goal = new Goal(lastP[0] + 10, lastP[1] - 45);
  }

  update(dt, input, renderer) {
    this.heatDistortion += dt;

    // Update flares
    const py = this.player ? this.player.y : 270;
    for (const f of this.flares) {
      f.update(dt, py);
      if (this.player && this.player.alive && f.overlaps(this.player)) {
        this.onPlayerDeath(renderer);
      }
    }

    super.update(dt, input, renderer);
  }

  render(ctx, camera) {
    // Hot gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#1a0800');
    grad.addColorStop(0.5, '#0a0400');
    grad.addColorStop(1, '#1a0500');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Heat shimmer lines
    ctx.save();
    ctx.globalAlpha = 0.03;
    for (let y = 0; y < this.height; y += 4) {
      const offset = Math.sin(y * 0.02 + this.heatDistortion * 3) * 3;
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(offset, y, this.width, 1);
    }
    ctx.restore();

    // Flares (behind platforms)
    for (const f of this.flares) f.render(ctx);

    ctx.save();
    camera.apply(ctx);

    for (const p of this.platforms) {
      ctx.save();
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 5;
      p.render(ctx);
      ctx.restore();
    }

    for (const h of this.hazards) h.render(ctx);
    if (this.goal) this.goal.render(ctx);
    if (this.player) this.player.render(ctx);
    this.particles.render(ctx);

    ctx.restore();
  }
}
