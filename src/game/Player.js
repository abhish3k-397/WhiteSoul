/**
 * Player — Player entity with movement, jump, wall-slide, and per-level state.
 */
export class Player {
  constructor(x, y) {
    this.spawnX = x;
    this.spawnY = y;
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 28;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.alive = true;
    this.color = '#ffffff';
    this.facing = 1; // 1 = right, -1 = left

    // Death animation
    this.dying = false;
    this.deathTimer = 0;
    this.deathDuration = 0.5;

    // Per-level custom state
    this.custom = {};
  }

  reset() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.alive = true;
    this.dying = false;
    this.deathTimer = 0;
    this.color = '#ffffff';
    this.custom = {};
  }

  setSpawn(x, y) {
    this.spawnX = x;
    this.spawnY = y;
  }

  die(type = 'hazard') {
    if (!this.alive) return;
    this.alive = false;
    this.dying = true;
    this.deathTimer = this.deathDuration;
    import('../engine/soundEffects').then(({ sfx }) => {
      if (type === 'fall') sfx.playFallDeath();
      else sfx.playHazardDeath();
    });
  }

  update(dt, input, physics) {
    if (this.dying) {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        this.dying = false;
      }
      return;
    }

    if (!this.alive) return;

    // Horizontal movement
    const speed = physics.config.playerSpeed;
    if (input.moveLeft()) {
      this.vx = -speed;
      this.facing = -1;
    } else if (input.moveRight()) {
      this.vx = speed;
      this.facing = 1;
    }

    // Jumping (with buffer + coyote time)
    if (input.wantsJump() && (this.grounded || input.coyoteTime > 0)) {
      this.vy = physics.config.jumpForce;
      this.grounded = false;
      input.consumeJump();
      import('../engine/soundEffects').then(({ sfx }) => sfx.playJump());
    }

    // Track coyote time
    if (this.grounded) {
      input.coyoteTime = input.coyoteTimeMax;
    }

    // Physics
    physics.applyGravity(this, dt);
    physics.applyFriction(this, dt);
    physics.integrate(this, dt);

    // Reset grounded (will be set by collision detection)
    this.grounded = false;
  }

  render(ctx) {
    if (this.dying) {
      // Death flash effect
      const t = 1 - (this.deathTimer / this.deathDuration);
      ctx.save();
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = '#ff0040';
      const expand = t * 20;
      ctx.fillRect(
        this.x - expand / 2,
        this.y - expand / 2,
        this.width + expand,
        this.height + expand
      );
      ctx.restore();
      return;
    }

    if (!this.alive) return;

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Eyes
    const eyeY = this.y + 8;
    const eyeSize = 3;
    ctx.fillStyle = '#0a0a0a';
    if (this.facing > 0) {
      ctx.fillRect(this.x + 11, eyeY, eyeSize, eyeSize);
      ctx.fillRect(this.x + 16, eyeY, eyeSize, eyeSize);
    } else {
      ctx.fillRect(this.x + 1, eyeY, eyeSize, eyeSize);
      ctx.fillRect(this.x + 6, eyeY, eyeSize, eyeSize);
    }
  }

  /**
   * Get bounding box for collision.
   */
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Check if player is moving (used by Level 1 Whiteout).
   */
  isMoving() {
    return Math.abs(this.vx) > 10 || Math.abs(this.vy) > 10;
  }
}
