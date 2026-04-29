/**
 * Level 2: RED ALERT
 * Platforms pulse with a heartbeat rhythm. Touching during a pulse is lethal.
 * Deep crimson aesthetic with cardiac monitor lines.
 */
import { LevelBase } from '../LevelBase.js';
import { Platform } from '../../game/Platform.js';
import { Goal } from '../../game/Goal.js';

export class Level02_RedAlert extends LevelBase {
  constructor() {
    super(2, 'RED ALERT', '#ff2040');
    this.bgColor = '#0a0000';
    this.heartbeatPhase = 0;
    this.heartbeatBPM = 72; // beats per minute
    this.pulseActive = false;
    this.ecgPoints = [];
  }

  init(sublevel) {
    super.init(sublevel);
    this.bgColor = '#0a0000';
    this.player.color = '#ffffff';
    this.player.setSpawn(60, 400);
    this.player.reset();
    this.heartbeatPhase = 0;

    // BPM scales with sublevel
    this.heartbeatBPM = sublevel === 1 ? 60 : sublevel === 2 ? 90 : 130;

    // Dangerous (pulsing) platforms and safe platforms
    // 'd' = dangerous, 's' = safe — player must time jumps between safe zones
    const layouts = {
      1: [
        [0, 470, 180, 20, 's'],     // start — safe
        [230, 420, 100, 20, 'd'],
        [380, 420, 60, 20, 's'],     // safe rest
        [490, 380, 100, 20, 'd'],
        [640, 340, 60, 20, 's'],     // safe rest
        [750, 300, 100, 20, 'd'],
        [890, 260, 70, 20, 's'],     // end — safe
      ],
      2: [
        [0, 470, 140, 20, 's'],
        [200, 410, 100, 20, 'd'],
        [350, 380, 50, 20, 's'],
        [460, 340, 90, 20, 'd'],
        [600, 310, 45, 20, 's'],
        [700, 280, 90, 20, 'd'],
        [840, 240, 60, 20, 's'],
      ],
      3: [
        [0, 470, 100, 20, 's'],
        [170, 400, 70, 20, 'd'],
        [300, 360, 40, 20, 's'],
        [400, 310, 60, 20, 'd'],
        [520, 280, 35, 20, 's'],
        [620, 240, 60, 20, 'd'],
        [740, 200, 35, 20, 's'],
        [840, 160, 60, 20, 's'],
      ],
    };

    const layout = layouts[sublevel] || layouts[1];
    for (const [x, y, w, h, type] of layout) {
      const safe = type === 's';
      const p = new Platform(x, y, w, h, { color: safe ? '#1a2a1a' : '#3a0000' });
      p.custom.safe = safe;
      this.platforms.push(p);
    }

    const lastP = layout[layout.length - 1];
    this.goal = new Goal(lastP[0] + 10, lastP[1] - 45);
    this.ecgPoints = [];
  }

  update(dt, input, renderer) {
    const bps = this.heartbeatBPM / 60;
    this.heartbeatPhase += dt * bps;

    // Heartbeat pattern: pulse active during the "beat"
    const beatPos = this.heartbeatPhase % 1;
    this.pulseActive = beatPos < 0.15 || (beatPos > 0.25 && beatPos < 0.35);

    // Color platforms based on pulse state — safe platforms never change
    for (const p of this.platforms) {
      if (p.custom.safe) {
        p.color = this.pulseActive ? '#1a3a1a' : '#1a2a1a'; // subtle green glow when safe
      } else {
        p.color = this.pulseActive ? '#ff2040' : '#3a0000';
      }
    }

    // Check if player is on a DANGEROUS platform during pulse — safe ones are fine
    if (this.player && this.player.alive && this.pulseActive && this.player.grounded) {
      for (const p of this.platforms) {
        if (p.custom.safe) continue;
        const onThis = this.player.x + this.player.width > p.x &&
                        this.player.x < p.x + p.width &&
                        Math.abs((this.player.y + this.player.height) - p.y) < 5;
        if (onThis) {
          this.onPlayerDeath(renderer);
          break;
        }
      }
    }

    // ECG line tracking
    this._updateECG(dt);

    super.update(dt, input, renderer);
  }

  _updateECG(dt) {
    const w = this.width;
    const midY = 60;

    // Add new ECG point
    const beatPos = this.heartbeatPhase % 1;
    let y = midY;
    if (beatPos < 0.1) y = midY - 30 * (beatPos / 0.1);
    else if (beatPos < 0.15) y = midY - 30 + 60 * ((beatPos - 0.1) / 0.05);
    else if (beatPos < 0.2) y = midY + 30 - 30 * ((beatPos - 0.15) / 0.05);
    else if (beatPos < 0.3) y = midY - 5 * Math.sin((beatPos - 0.2) * Math.PI * 10);

    this.ecgPoints.push({ x: w - 10, y });

    // Scroll left
    for (const p of this.ecgPoints) {
      p.x -= 200 * dt;
    }

    // Remove off-screen
    this.ecgPoints = this.ecgPoints.filter(p => p.x > 0);
  }

  render(ctx, camera) {
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.width, this.height);

    // ECG line
    if (this.ecgPoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = this.pulseActive ? '#ff2040' : '#4a0010';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff2040';
      ctx.shadowBlur = this.pulseActive ? 15 : 5;
      ctx.beginPath();
      ctx.moveTo(this.ecgPoints[0].x, this.ecgPoints[0].y);
      for (let i = 1; i < this.ecgPoints.length; i++) {
        ctx.lineTo(this.ecgPoints[i].x, this.ecgPoints[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Red vignette during pulse
    if (this.pulseActive) {
      ctx.save();
      const grad = ctx.createRadialGradient(
        this.width / 2, this.height / 2, this.height * 0.3,
        this.width / 2, this.height / 2, this.height
      );
      grad.addColorStop(0, 'rgba(255, 0, 0, 0)');
      grad.addColorStop(1, 'rgba(255, 0, 0, 0.15)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }

    ctx.save();
    camera.apply(ctx);

    for (const p of this.platforms) {
      ctx.save();
      if (this.pulseActive) {
        ctx.shadowColor = '#ff2040';
        ctx.shadowBlur = 20;
      }
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
