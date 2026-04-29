/**
 * GameLoop — Fixed-timestep update loop with variable rendering.
 * Runs at 60 UPS (updates per second) regardless of frame rate.
 */
export class GameLoop {
  constructor({ update, render }) {
    this.update = update;
    this.render = render;
    this.timestep = 1000 / 60; // ~16.67ms per update
    this.maxFrameTime = 250; // prevent spiral of death
    this.accumulator = 0;
    this.lastTime = 0;
    this.running = false;
    this.paused = false;
    this.rafId = null;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.rafId = requestAnimationFrame(this._tick.bind(this));
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  pause() {
    this.paused = true;
  }

  resume() {
    if (this.paused) {
      this.paused = false;
      this.lastTime = performance.now();
      this.accumulator = 0;
    }
  }

  _tick(currentTime) {
    if (!this.running) return;

    let frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Clamp frame time to prevent death spiral
    if (frameTime > this.maxFrameTime) {
      frameTime = this.maxFrameTime;
    }

    if (!this.paused) {
      this.accumulator += frameTime;

      // Fixed timestep updates
      const dt = this.timestep / 1000; // convert to seconds
      while (this.accumulator >= this.timestep) {
        this.update(dt);
        this.accumulator -= this.timestep;
      }

      // Variable render with interpolation
      const interpolation = this.accumulator / this.timestep;
      this.render(interpolation);
    }

    this.rafId = requestAnimationFrame(this._tick.bind(this));
  }
}
