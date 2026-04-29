/**
 * Platform — Static and dynamic platforms with per-level behavior variants.
 */
export class Platform {
  constructor(x, y, width, height, options = {}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = options.color || '#3a3a3a';
    this.visible = options.visible !== undefined ? options.visible : true;
    this.solid = options.solid !== undefined ? options.solid : true;
    this.type = options.type || 'static'; // 'static', 'moving', 'pulsing', 'expanding'

    // Movement
    this.startX = x;
    this.startY = y;
    this.endX = options.endX || x;
    this.endY = options.endY || y;
    this.moveSpeed = options.moveSpeed || 1;
    this.moveProgress = options.movePhase || 0;

    // Expansion
    this.baseWidth = width;
    this.baseHeight = height;
    this.expanded = false;
    this.expandRate = options.expandRate || 30;

    // Pulsing
    this.pulsePhase = options.pulsePhase || 0;
    this.pulseSpeed = options.pulseSpeed || 2;
    this.isPulseDangerous = false;

    // Custom state
    this.custom = options.custom || {};
  }

  update(dt) {
    if (this.type === 'moving') {
      this.moveProgress += this.moveSpeed * dt;
      const t = (Math.sin(this.moveProgress) + 1) / 2;
      this.x = this.startX + (this.endX - this.startX) * t;
      this.y = this.startY + (this.endY - this.startY) * t;
    }

    if (this.type === 'pulsing') {
      this.pulsePhase += this.pulseSpeed * dt;
      this.isPulseDangerous = Math.sin(this.pulsePhase) > 0.5;
    }

    if (this.type === 'expanding' && this.expanded) {
      this.width += this.expandRate * dt;
      this.height += this.expandRate * dt * 0.5;
      // Expand from center
      this.x = this.startX - (this.width - this.baseWidth) / 2;
    }
  }

  render(ctx) {
    if (!this.visible) return;

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Edge highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(this.x, this.y, this.width, 2);
  }

  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Check if a point is inside this platform.
   */
  containsPoint(px, py) {
    return px >= this.x && px <= this.x + this.width &&
           py >= this.y && py <= this.y + this.height;
  }
}

/**
 * Create a floor platform spanning the level width.
 */
export function createFloor(y, width, color) {
  return new Platform(0, y, width, 40, { color: color || '#1a1a1a' });
}

/**
 * Create walls on both sides.
 */
export function createWalls(height, width) {
  return [
    new Platform(-20, 0, 20, height, { color: '#1a1a1a' }),
    new Platform(width, 0, 20, height, { color: '#1a1a1a' }),
  ];
}
