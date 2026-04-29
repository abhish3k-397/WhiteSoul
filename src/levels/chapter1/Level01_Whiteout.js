/**
 * Level 1: WHITEOUT
 * Platforms only visible when the player is moving.
 * The world is a pure white void — motion reveals the path.
 */
import { LevelBase } from '../LevelBase.js';
import { Platform } from '../../game/Platform.js';
import { Goal } from '../../game/Goal.js';
import { Hazard, createSpikes } from '../../game/Hazard.js';

export class Level01_Whiteout extends LevelBase {
  constructor() {
    super(1, 'WHITEOUT', '#e0e0e0');
    this.bgColor = '#f0f0f0';
    this.platformReveal = 0; // 0 = invisible, 1 = fully visible
  }

  init(sublevel) {
    super.init(sublevel);
    this.bgColor = '#f0f0f0';
    this.player.color = '#1a1a1a';
    this.player.setSpawn(60, 400);
    this.player.reset();

    const sm = this.getSpeedMult();

    // Create platforms — invisible until player moves
    const layouts = {
      1: [ // Sublevel 1: Simple path
        [0, 470, 200, 20],
        [250, 420, 120, 20],
        [420, 370, 100, 20],
        [560, 320, 120, 20],
        [720, 270, 100, 20],
        [860, 220, 100, 20],
      ],
      2: [ // Sublevel 2: Harder gaps + spikes
        [0, 470, 140, 20],
        [200, 410, 80, 20],
        [350, 360, 70, 20],
        [480, 300, 80, 20],
        [600, 350, 60, 20],
        [720, 270, 80, 20], // Adjusted from y=250 (impossible 100px jump)
        [860, 220, 80, 20], // Adjusted from y=200
      ],
      3: [ // Sublevel 3: Insane — tiny platforms, bigger gaps
        [0, 470, 100, 20],
        [180, 400, 50, 20],
        [310, 340, 40, 20],
        [420, 280, 50, 20],
        [560, 340, 40, 20],
        [670, 260, 50, 20], // Adjusted from y=240 (impossible 100px jump)
        [800, 200, 50, 20], // Adjusted from y=180
        [890, 160, 60, 20], // Adjusted from y=140
      ],
    };

    const layout = layouts[sublevel] || layouts[1];
    for (const [x, y, w, h] of layout) {
      const p = new Platform(x, y, w, h, { color: '#c0c0c0', visible: false });
      this.platforms.push(p);
    }

    // Spikes on sublevel 2+
    if (sublevel >= 2) {
      this.hazards.push(createSpikes(200, 460, 50, '#ff3030'));
      this.hazards.push(createSpikes(500, 460, 80, '#ff3030'));
    }

    // Goal
    const lastPlatform = layout[layout.length - 1];
    this.goal = new Goal(lastPlatform[0] + 20, lastPlatform[1] - 45);

    // Level bounds
    this.width = 960;
    this.height = 540;
  }

  update(dt, input, renderer) {
    // Platform visibility: reveal when player is moving, fade when still
    if (this.player && this.player.alive) {
      const moving = this.player.isMoving();
      const targetReveal = moving ? 1 : 0;
      const fadeSpeed = moving ? 8 : 2; // Fast reveal, slow fade
      this.platformReveal += (targetReveal - this.platformReveal) * fadeSpeed * dt;
      this.platformReveal = Math.max(0, Math.min(1, this.platformReveal));

      for (const p of this.platforms) {
        p.visible = this.platformReveal > 0.05;
        p.color = `rgba(80, 80, 80, ${this.platformReveal * 0.8})`;
        p.solid = true; // Always solid, even when invisible
      }
    }

    super.update(dt, input, renderer);
  }

  render(ctx, camera) {
    // White void background
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle grid when moving
    if (this.platformReveal > 0.1) {
      ctx.save();
      ctx.globalAlpha = this.platformReveal * 0.05;
      ctx.strokeStyle = '#aaaaaa';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < this.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.height);
        ctx.stroke();
      }
      for (let y = 0; y < this.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.width, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.save();
    camera.apply(ctx);

    // Platforms
    for (const p of this.platforms) {
      if (p.visible) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.width, p.height);
      }
    }

    // Hazards
    for (const h of this.hazards) {
      ctx.globalAlpha = this.platformReveal;
      h.render(ctx);
      ctx.globalAlpha = 1;
    }

    // Goal
    if (this.goal) this.goal.render(ctx);

    // Player
    if (this.player) this.player.render(ctx);

    // Particles
    this.particles.render(ctx);

    ctx.restore();

    // "MOVE TO SEE" hint text
    if (this.platformReveal < 0.2 && this.timer < 5 && this.player && this.player.alive) {
      ctx.save();
      ctx.globalAlpha = 0.3 + Math.sin(this.timer * 3) * 0.15;
      ctx.font = '14px "JetBrains Mono"';
      ctx.fillStyle = '#888888';
      ctx.textAlign = 'center';
      ctx.fillText('MOVE TO SEE', this.width / 2, this.height / 2);
      ctx.restore();
    }
  }
}
