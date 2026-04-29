/**
 * Level 3: BLUE ABYSS
 * Underwater physics with oxygen bubbles. O₂ timer resets on bubble collect.
 * Deep ocean blue, bubble particles, reduced gravity, floaty movement.
 */
import { LevelBase } from '../LevelBase.js';
import { Platform } from '../../game/Platform.js';
import { Goal } from '../../game/Goal.js';

class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.collected = false;
    this.wobble = Math.random() * Math.PI * 2;
  }
  update(dt) {
    this.wobble += dt * 3;
    this.x += Math.sin(this.wobble) * 0.3;
  }
  overlaps(entity) {
    if (this.collected) return false;
    const cx = this.x, cy = this.y, r = this.radius;
    const ex = entity.x + entity.width / 2, ey = entity.y + entity.height / 2;
    return Math.hypot(cx - ex, cy - ey) < r + 15;
  }
  render(ctx) {
    if (this.collected) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#40c0ff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    // Highlight
    ctx.beginPath();
    ctx.arc(this.x - 3, this.y - 3, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 240, 255, 0.6)';
    ctx.fill();
    ctx.restore();
  }
}

export class Level03_BlueAbyss extends LevelBase {
  constructor() {
    super(3, 'BLUE ABYSS', '#2080ff');
    this.bgColor = '#020a18';
    this.oxygen = 5;
    this.maxOxygen = 5;
    this.bubbles = [];
    this.bgBubbles = []; // ambient background bubbles
  }

  init(sublevel) {
    super.init(sublevel);
    this.bgColor = '#020a18';
    this.player.color = '#80c0ff';
    this.player.setSpawn(60, 350);
    this.player.reset();
    this.oxygen = 5;
    this.maxOxygen = sublevel === 3 ? 3 : 5;
    this.bubbles = [];
    this.bgBubbles = [];

    // Underwater physics: low gravity, high friction
    this.physics.setOverrides({
      gravity: 600,
      terminalVelocity: 200,
      playerSpeed: 200,
      jumpForce: -350,
      friction: 0.7,
      airFriction: 0.85,
    });

    const layouts = {
      1: [
        [0, 450, 200, 20],
        [240, 390, 140, 20],
        [430, 350, 120, 20],
        [600, 300, 130, 20],
        [780, 250, 120, 20],
      ],
      2: [
        [0, 450, 150, 20],
        [210, 380, 100, 20],
        [380, 330, 90, 20],
        [530, 400, 80, 20],
        [670, 280, 100, 20],
        [810, 220, 100, 20],
      ],
      3: [
        [0, 450, 120, 20],
        [190, 370, 70, 20],
        [330, 310, 60, 20],
        [460, 370, 50, 20],
        [580, 260, 60, 20],
        [710, 320, 50, 20],
        [840, 200, 70, 20],
      ],
    };

    const layout = layouts[sublevel] || layouts[1];
    for (const [x, y, w, h] of layout) {
      this.platforms.push(new Platform(x, y, w, h, { color: '#0a2040' }));
    }

    // Place oxygen bubbles between platforms
    const bubbleSpacing = sublevel === 1 ? 1 : sublevel === 2 ? 2 : 3;
    for (let i = 1; i < layout.length; i += bubbleSpacing) {
      const [px, py] = layout[i];
      this.bubbles.push(new Bubble(px + 30, py - 40));
    }

    // Initialize background bubbles
    for (let i = 0; i < 15; i++) {
      this.bgBubbles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        r: 1 + Math.random() * 4,
        speed: 10 + Math.random() * 30,
        alpha: 0.1 + Math.random() * 0.2,
      });
    }

    const lastP = layout[layout.length - 1];
    this.goal = new Goal(lastP[0] + 15, lastP[1] - 45);
  }

  update(dt, input, renderer) {
    // O₂ countdown
    if (this.player && this.player.alive) {
      this.oxygen -= dt;

      // Check bubble collection
      for (const b of this.bubbles) {
        if (!b.collected && b.overlaps(this.player)) {
          b.collected = true;
          this.oxygen = this.maxOxygen;
          this.particles.burst(b.x, b.y, 10, {
            color: ['#40c0ff', '#80e0ff'],
            gravity: -100,
            maxSpeed: 80,
          });
        }
        b.update(dt);
      }

      // Suffocation
      if (this.oxygen <= 0) {
        this.oxygen = 0;
        this.onPlayerDeath(renderer);
      }
    }

    // Background bubbles
    for (const b of this.bgBubbles) {
      b.y -= b.speed * dt;
      b.x += Math.sin(this.timer * 2 + b.y * 0.01) * 0.5;
      if (b.y < -10) {
        b.y = this.height + 10;
        b.x = Math.random() * this.width;
      }
    }

    super.update(dt, input, renderer);
  }

  render(ctx, camera) {
    // Deep ocean gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#020a18');
    grad.addColorStop(1, '#041830');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Background bubbles
    for (const b of this.bgBubbles) {
      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.strokeStyle = '#2060a0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Light rays from above
    ctx.save();
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 200 + Math.sin(this.timer * 0.5 + i) * 30;
      ctx.fillStyle = '#4080c0';
      ctx.beginPath();
      ctx.moveTo(x - 20, 0);
      ctx.lineTo(x + 20, 0);
      ctx.lineTo(x + 60, this.height);
      ctx.lineTo(x - 60, this.height);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    camera.apply(ctx);

    for (const p of this.platforms) p.render(ctx);
    for (const b of this.bubbles) b.render(ctx);
    for (const h of this.hazards) h.render(ctx);
    if (this.goal) this.goal.render(ctx);
    if (this.player) this.player.render(ctx);
    this.particles.render(ctx);

    ctx.restore();

    // O₂ meter
    this._renderO2Meter(ctx);
  }

  _renderO2Meter(ctx) {
    const w = 120, h = 8;
    const x = this.width - w - 20;
    const y = 20;
    const ratio = Math.max(0, this.oxygen / this.maxOxygen);

    ctx.save();
    // Background
    ctx.fillStyle = '#0a2040';
    ctx.fillRect(x, y, w, h);
    // Fill
    const barColor = ratio > 0.3 ? '#2080ff' : '#ff4040';
    ctx.fillStyle = barColor;
    ctx.shadowColor = barColor;
    ctx.shadowBlur = ratio < 0.3 ? 10 : 5;
    ctx.fillRect(x, y, w * ratio, h);
    // Label
    ctx.font = '10px "JetBrains Mono"';
    ctx.fillStyle = '#6090c0';
    ctx.textAlign = 'right';
    ctx.shadowBlur = 0;
    ctx.fillText('O₂', x - 8, y + 8);
    ctx.restore();
  }
}
