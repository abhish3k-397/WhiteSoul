/**
 * LevelBase — Base class all levels extend.
 * Provides common infrastructure: platforms, hazards, goal, player spawn,
 * sublevel management, and difficulty scaling.
 */
import { Player } from '../game/Player.js';
import { Platform } from '../game/Platform.js';
import { Goal } from '../game/Goal.js';
import { PhysicsEngine } from '../engine/Physics.js';
import { ParticleSystem } from '../engine/ParticleSystem.js';

// Sublevel difficulty multipliers
const SUBLEVEL_CONFIG = {
  1: { speedMult: 1.0, hazardMult: 1.0, label: 'NORMAL', permaDeath: true },
  2: { speedMult: 1.5, hazardMult: 1.5, label: 'HARD', permaDeath: true },
  3: { speedMult: 2.0, hazardMult: 2.0, label: 'INSANE', permaDeath: true },
};

export class LevelBase {
  constructor(levelNumber, levelName, accentColor) {
    this.levelNumber = levelNumber;
    this.levelName = levelName;
    this.accentColor = accentColor;
    this.sublevel = 1;
    this.sublevelConfig = SUBLEVEL_CONFIG[1];

    // Level dimensions
    this.width = 960;
    this.height = 540;

    // Entities
    this.player = null;
    this.platforms = [];
    this.hazards = [];
    this.goal = null;
    this.particles = new ParticleSystem(300);
    this.physics = new PhysicsEngine();

    // State
    this.completed = false;
    this.timer = 0;
    this.deathCount = 0;
    this.bgColor = '#0a0a0a';

    // Ambient particle timer
    this._ambientTimer = 0;
  }

  /**
   * Initialize the level with a given sublevel (1, 2, or 3).
   * Override in subclass to set up platforms, hazards, and player spawn.
   */
  init(sublevel = 1) {
    this.sublevel = sublevel;
    this.sublevelConfig = SUBLEVEL_CONFIG[sublevel];
    this.completed = false;
    this.timer = 0;
    this.platforms = [];
    this.hazards = [];
    this.particles.clear();
    this.goal = null;
    this.player = new Player(60, 400);
    this.physics = new PhysicsEngine();
  }

  /**
   * Per-frame update. Override for level-specific mechanic logic.
   */
  update(dt, input, renderer) {
    if (this.completed) return;

    this.timer += dt;

    // Update player
    if (this.player && this.player.alive) {
      this.player.update(dt, input, this.physics);

      // Collision with platforms
      this.player.grounded = false;
      for (const platform of this.platforms) {
        if (!platform.solid || !platform.visible) continue;
        this.physics.resolveCollision(this.player, platform);
      }

      // Check hazards
      for (const hazard of this.hazards) {
        if (hazard.overlaps(this.player)) {
          this.onPlayerDeath(renderer, 'hazard');
          break;
        }
      }

      // Check goal
      if (this.goal && this.goal.overlaps(this.player)) {
        this.onSublevelComplete();
      }

      // Fall out of level
      if (this.player.y > this.height + 100) {
        this.onPlayerDeath(renderer, 'fall');
      }
    } else if (this.player && this.player.dying) {
      this.player.update(dt, input, this.physics);
      if (!this.player.dying) {
        // Death animation finished — respawn or restart
        if (this.sublevelConfig.permaDeath) {
          // Perma-death: signal to game loop to restart level
          this.needsRestart = true;
        } else {
          this.player.reset();
        }
      }
    }

    // Update platforms
    for (const platform of this.platforms) {
      platform.update(dt);
    }

    // Update hazards
    for (let i = this.hazards.length - 1; i >= 0; i--) {
      this.hazards[i].update(dt);
      if (this.hazards[i].dead) {
        this.hazards.splice(i, 1);
      }
    }

    // Update goal
    if (this.goal) this.goal.update(dt);

    // Update particles
    this.particles.update(dt);

    // Ambient particles
    this._ambientTimer += dt;
    if (this._ambientTimer > 0.5) {
      this._ambientTimer = 0;
      this.particles.ambient(0, 0, this.width, this.height, 1, {
        color: this.accentColor + '40',
      });
    }
  }

  /**
   * Render the level. Override for custom rendering.
   */
  render(ctx, camera) {
    // Background
    ctx.fillStyle = this.bgColor;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    camera.apply(ctx);

    // Platforms
    for (const platform of this.platforms) {
      if (camera.isVisible(platform.x, platform.y, platform.width, platform.height)) {
        platform.render(ctx);
      }
    }

    // Hazards
    for (const hazard of this.hazards) {
      hazard.render(ctx);
    }

    // Goal
    if (this.goal) this.goal.render(ctx);

    // Player
    if (this.player) this.player.render(ctx);

    // Particles
    this.particles.render(ctx);

    ctx.restore();
  }

  onPlayerDeath(renderer, type = 'hazard') {
    if (!this.player.alive) return;
    this.deathCount++;
    this.player.die(type);

    // Death effects
    this.particles.burst(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      30,
      { color: [this.accentColor, '#ffffff', '#ff0040'], gravity: 600 }
    );
    if (renderer) {
      renderer.shake(12, 0.3);
      renderer.flash('#ff0040', 0.4, 3);
    }
  }

  onSublevelComplete() {
    this.completed = true;
    if (this.goal) this.goal.collected = true;
  }

  /**
   * Get sublevel label text.
   */
  getSublevelLabel() {
    return this.sublevelConfig.label;
  }

  /**
   * Get speed multiplier for current sublevel.
   */
  getSpeedMult() {
    return this.sublevelConfig.speedMult;
  }
}
