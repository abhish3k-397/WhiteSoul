/**
 * InputManager — Keyboard + Mouse state tracking with input buffering.
 */
export class InputManager {
  constructor(canvas) {
    this.keys = {};
    this.keysJustPressed = {};
    this.keysJustReleased = {};
    this.prevKeys = {};

    this.mouse = { x: 0, y: 0, down: false };

    // Jump buffer — allows pressing jump slightly before landing
    this.jumpBuffer = 0;
    this.jumpBufferTime = 0.1; // 100ms buffer

    // Coyote time — allows jumping briefly after leaving a ledge
    this.coyoteTime = 0;
    this.coyoteTimeMax = 0.08; // 80ms

    this._canvas = canvas;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    canvas.addEventListener('mousemove', this._onMouseMove);
    canvas.addEventListener('mousedown', this._onMouseDown);
    canvas.addEventListener('mouseup', this._onMouseUp);
  }

  _onKeyDown(e) {
    if (!this.keys[e.code]) {
      this.keysJustPressed[e.code] = true;
    }
    this.keys[e.code] = true;

    // Jump buffer
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      this.jumpBuffer = this.jumpBufferTime;
    }

    // Prevent default for game keys
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
         'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyR', 'KeyG', 'KeyB', 'KeyY',
         'Escape', 'Enter'].includes(e.code)) {
      e.preventDefault();
    }
  }

  _onKeyUp(e) {
    this.keys[e.code] = false;
    this.keysJustReleased[e.code] = true;
  }

  _onMouseMove(e) {
    const rect = this._canvas.getBoundingClientRect();
    const scaleX = this._canvas.width / rect.width;
    const scaleY = this._canvas.height / rect.height;
    this.mouse.x = (e.clientX - rect.left) * scaleX;
    this.mouse.y = (e.clientY - rect.top) * scaleY;
  }

  _onMouseDown() { this.mouse.down = true; }
  _onMouseUp() { this.mouse.down = false; }

  update(dt) {
    this.jumpBuffer -= dt;
    if (this.jumpBuffer < 0) this.jumpBuffer = 0;

    this.coyoteTime -= dt;
    if (this.coyoteTime < 0) this.coyoteTime = 0;
  }

  endFrame() {
    this.keysJustPressed = {};
    this.keysJustReleased = {};
  }

  isDown(code) {
    return !!this.keys[code];
  }

  justPressed(code) {
    return !!this.keysJustPressed[code];
  }

  justReleased(code) {
    return !!this.keysJustReleased[code];
  }

  /**
   * Check for left movement (Arrow Left or A).
   */
  moveLeft() {
    return this.isDown('ArrowLeft') || this.isDown('KeyA');
  }

  moveRight() {
    return this.isDown('ArrowRight') || this.isDown('KeyD');
  }

  /**
   * Jump with buffer and coyote time support.
   */
  wantsJump() {
    return this.jumpBuffer > 0;
  }

  consumeJump() {
    this.jumpBuffer = 0;
    this.coyoteTime = 0;
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this._canvas.removeEventListener('mousemove', this._onMouseMove);
    this._canvas.removeEventListener('mousedown', this._onMouseDown);
    this._canvas.removeEventListener('mouseup', this._onMouseUp);
  }
}
