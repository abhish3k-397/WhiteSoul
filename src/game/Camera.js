/**
 * Camera — Viewport tracking with smooth lerp and level-bound clamping.
 */
export class Camera {
  constructor(width, height) {
    this.x = 0;
    this.y = 0;
    this.width = width;
    this.height = height;
    this.targetX = 0;
    this.targetY = 0;
    this.smoothing = 0.08; // lerp factor

    // Level bounds
    this.levelWidth = width;
    this.levelHeight = height;
  }

  setLevelBounds(w, h) {
    this.levelWidth = w;
    this.levelHeight = h;
  }

  follow(entity, dt) {
    this.targetX = entity.x + entity.width / 2 - this.width / 2;
    this.targetY = entity.y + entity.height / 2 - this.height / 2;

    // Smooth lerp
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;

    // Clamp to level bounds
    this.x = Math.max(0, Math.min(this.x, this.levelWidth - this.width));
    this.y = Math.max(0, Math.min(this.y, this.levelHeight - this.height));
  }

  /**
   * Apply camera transform to canvas context.
   */
  apply(ctx) {
    ctx.translate(-Math.round(this.x), -Math.round(this.y));
  }

  /**
   * Check if a rectangle is visible within the camera viewport.
   */
  isVisible(x, y, w, h) {
    return !(x + w < this.x || x > this.x + this.width ||
             y + h < this.y || y > this.y + this.height);
  }

  /**
   * Convert screen coordinates to world coordinates.
   */
  screenToWorld(sx, sy) {
    return { x: sx + this.x, y: sy + this.y };
  }

  /**
   * Reset camera position immediately (no lerp).
   */
  snap(entity) {
    this.x = entity.x + entity.width / 2 - this.width / 2;
    this.y = entity.y + entity.height / 2 - this.height / 2;
    this.x = Math.max(0, Math.min(this.x, this.levelWidth - this.width));
    this.y = Math.max(0, Math.min(this.y, this.levelHeight - this.height));
  }
}
