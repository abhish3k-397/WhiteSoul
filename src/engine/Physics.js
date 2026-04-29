/**
 * Physics — Gravity, velocity integration, friction, and per-level overrides.
 */
export const PHYSICS_DEFAULTS = {
  gravity: 1800,        // pixels/s²
  terminalVelocity: 800,
  playerSpeed: 320,
  jumpForce: -580,
  friction: 0.85,
  airFriction: 0.95,
  wallSlideSpeed: 100,
};

export class PhysicsEngine {
  constructor(overrides = {}) {
    this.config = { ...PHYSICS_DEFAULTS, ...overrides };
  }

  setOverrides(overrides) {
    this.config = { ...PHYSICS_DEFAULTS, ...overrides };
  }

  applyGravity(entity, dt) {
    entity.vy += this.config.gravity * dt;
    if (entity.vy > this.config.terminalVelocity) {
      entity.vy = this.config.terminalVelocity;
    }
  }

  applyFriction(entity, dt) {
    const fric = entity.grounded ? this.config.friction : this.config.airFriction;
    entity.vx *= fric;
  }

  integrate(entity, dt) {
    entity.x += entity.vx * dt;
    entity.y += entity.vy * dt;
  }

  /**
   * Check and resolve collision between player (entity) and a platform.
   * Returns collision side: 'top', 'bottom', 'left', 'right', or null.
   */
  resolveCollision(entity, platform) {
    // AABB overlap check
    const ex = entity.x, ey = entity.y, ew = entity.width, eh = entity.height;
    const px = platform.x, py = platform.y, pw = platform.width, ph = platform.height;

    if (ex + ew <= px || ex >= px + pw || ey + eh <= py || ey >= py + ph) {
      return null; // no overlap
    }

    // Calculate overlap on each axis
    const overlapLeft = (ex + ew) - px;
    const overlapRight = (px + pw) - ex;
    const overlapTop = (ey + eh) - py;
    const overlapBottom = (py + ph) - ey;

    // Find minimum overlap
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (minOverlap === overlapTop && entity.vy >= 0) {
      entity.y = py - eh;
      entity.vy = 0;
      entity.grounded = true;
      return 'top';
    } else if (minOverlap === overlapBottom && entity.vy < 0) {
      entity.y = py + ph;
      entity.vy = 0;
      return 'bottom';
    } else if (minOverlap === overlapLeft) {
      entity.x = px - ew;
      entity.vx = 0;
      return 'left';
    } else if (minOverlap === overlapRight) {
      entity.x = px + pw;
      entity.vx = 0;
      return 'right';
    }

    return null;
  }
}
