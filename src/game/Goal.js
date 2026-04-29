/**
 * Goal — Level exit trigger zone.
 */
export class Goal {
  constructor(x, y, width = 30, height = 40) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.pulsePhase = 0;
    this.collected = false;
  }

  update(dt) {
    this.pulsePhase += dt * 3;
  }

  /**
   * Check if player overlaps the goal.
   */
  overlaps(entity) {
    if (this.collected) return false;
    const ex = entity.x, ey = entity.y, ew = entity.width, eh = entity.height;
    return !(ex + ew <= this.x || ex >= this.x + this.width ||
             ey + eh <= this.y || ey >= this.y + this.height);
  }

  render(ctx) {
    if (this.collected) return;

    const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    // Glow
    ctx.save();
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 20 * pulse;
    ctx.fillStyle = `rgba(0, 255, 136, ${0.3 * pulse})`;
    ctx.fillRect(this.x - 4, this.y - 4, this.width + 8, this.height + 8);

    // Core
    ctx.fillStyle = '#00ff88';
    ctx.globalAlpha = pulse;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Arrow up icon
    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.moveTo(cx, this.y + 8);
    ctx.lineTo(cx - 8, this.y + this.height / 2);
    ctx.lineTo(cx + 8, this.y + this.height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(cx - 3, this.y + this.height / 2, 6, this.height / 2 - 8);

    ctx.restore();
  }
}
