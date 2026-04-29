/**
 * Level 13: RAINBOW BRIDGE
 * Rhythm-matching: press R, G, B, or Y to match the shifting floor color.
 * Standing on the floor when your color doesn't match = death.
 */
import { LevelBase } from '../LevelBase.js';
import { Platform } from '../../game/Platform.js';
import { Goal } from '../../game/Goal.js';

const RHYTHM_COLORS = [
  { name:'RED', hex:'#ff3030', key:'KeyR' },
  { name:'GREEN', hex:'#30ff30', key:'KeyG' },
  { name:'BLUE', hex:'#3030ff', key:'KeyB' },
  { name:'YELLOW', hex:'#ffff30', key:'KeyY' },
];

export class Level13_RainbowBridge extends LevelBase {
  constructor() { super(13, 'RAINBOW BRIDGE', '#ff30ff'); this.bgColor = '#0a0a0a'; this.currentFloorColor = 0; this.playerColor = 0; this.beatTimer = 0; this.beatInterval = 2; this.beats = []; this.comboCount = 0; }

  init(sublevel) {
    super.init(sublevel); this.bgColor = '#080808';
    this.playerColor = 0; this.player.color = RHYTHM_COLORS[0].hex;
    this.player.setSpawn(60,420); this.player.reset();
    this.currentFloorColor = 0; this.beatTimer = 0; this.comboCount = 0;
    this.beatInterval = sublevel===1?2.5:sublevel===2?1.5:0.8;
    this.beats = [];
    // Generate beat sequence
    const beatCount = sublevel===1?12:sublevel===2?18:25;
    for (let i=0;i<beatCount;i++) {
      this.beats.push(Math.floor(Math.random()*4));
    }
    this.currentBeat = 0;
    // Long flat bridge
    this.platforms.push(new Platform(0, 460, 960, 30, { color: RHYTHM_COLORS[0].hex+'40' }));
    // Some elevated platforms for safety
    if (sublevel <= 2) {
      this.platforms.push(new Platform(200,380,60,15,{color:'#333'}));
      this.platforms.push(new Platform(500,380,60,15,{color:'#333'}));
      this.platforms.push(new Platform(750,380,60,15,{color:'#333'}));
    }
    this.goal = new Goal(900, 415);
    this.width = 960; this.height = 540;
  }

  update(dt, input, renderer) {
    // Color switching
    for (let i=0;i<RHYTHM_COLORS.length;i++) {
      if (input.justPressed(RHYTHM_COLORS[i].key)) {
        this.playerColor = i;
        this.player.color = RHYTHM_COLORS[i].hex;
      }
    }
    // Beat progression
    this.beatTimer += dt;
    if (this.beatTimer >= this.beatInterval && this.currentBeat < this.beats.length) {
      this.beatTimer = 0;
      this.currentFloorColor = this.beats[this.currentBeat];
      this.currentBeat++;
      // Update floor color
      this.platforms[0].color = RHYTHM_COLORS[this.currentFloorColor].hex + '40';
      // Flash
      if (renderer) renderer.flash(RHYTHM_COLORS[this.currentFloorColor].hex, 0.15, 4);
    }
    // Check if player is on the floor with wrong color
    if (this.player && this.player.alive && this.player.grounded) {
      // Check if on the main bridge (platform 0)
      const p = this.platforms[0];
      const onBridge = this.player.x+this.player.width>p.x && this.player.x<p.x+p.width && Math.abs((this.player.y+this.player.height)-p.y)<5;
      if (onBridge && this.playerColor !== this.currentFloorColor) {
        this.onPlayerDeath(renderer);
        this.comboCount = 0;
      } else if (onBridge) {
        this.comboCount++;
      }
    }
    // Win condition: reach end
    if (this.currentBeat >= this.beats.length && this.player && this.player.alive) {
      // Beats done — bridge is safe
      this.platforms[0].color = '#ffffff20';
    }
    super.update(dt, input, renderer);
  }

  render(ctx, camera) {
    ctx.fillStyle = this.bgColor; ctx.fillRect(0,0,this.width,this.height);
    // Rhythm bars at top
    const barW = this.width / Math.max(this.beats.length, 1);
    for (let i=0;i<this.beats.length;i++) {
      const ci = this.beats[i];
      ctx.fillStyle = i < this.currentBeat ? RHYTHM_COLORS[ci].hex+'30' : i === this.currentBeat ? RHYTHM_COLORS[ci].hex : RHYTHM_COLORS[ci].hex+'60';
      ctx.fillRect(i*barW, 0, barW-1, 20);
      if (i === this.currentBeat) {
        ctx.save(); ctx.shadowColor=RHYTHM_COLORS[ci].hex; ctx.shadowBlur=10;
        ctx.fillRect(i*barW, 0, barW-1, 20);
        ctx.restore();
      }
    }
    // Beat progress indicator
    const progress = this.currentBeat / this.beats.length;
    ctx.fillStyle = '#ffffff20';
    ctx.fillRect(0, 22, this.width * progress, 2);
    // Current color display
    ctx.save();
    ctx.fillStyle = RHYTHM_COLORS[this.currentFloorColor].hex;
    ctx.shadowColor = RHYTHM_COLORS[this.currentFloorColor].hex;
    ctx.shadowBlur = 20;
    ctx.font = '16px "JetBrains Mono"'; ctx.textAlign = 'center';
    ctx.fillText(RHYTHM_COLORS[this.currentFloorColor].name, this.width/2, 50);
    ctx.restore();

    ctx.save(); camera.apply(ctx);
    // Floor with color glow
    const fp = this.platforms[0];
    ctx.save();
    ctx.fillStyle = RHYTHM_COLORS[this.currentFloorColor].hex + '30';
    ctx.shadowColor = RHYTHM_COLORS[this.currentFloorColor].hex;
    ctx.shadowBlur = 15;
    ctx.fillRect(fp.x, fp.y, fp.width, fp.height);
    ctx.restore();
    // Other platforms
    for (let i=1;i<this.platforms.length;i++) this.platforms[i].render(ctx);
    if (this.goal) this.goal.render(ctx);
    if (this.player) this.player.render(ctx);
    this.particles.render(ctx); ctx.restore();
    // Key hints
    ctx.save(); ctx.font='10px "JetBrains Mono"'; ctx.textAlign='center';
    for (let i=0;i<4;i++) {
      ctx.fillStyle = i===this.playerColor ? RHYTHM_COLORS[i].hex : RHYTHM_COLORS[i].hex+'50';
      ctx.fillText(RHYTHM_COLORS[i].key.replace('Key',''), this.width/2 - 45 + i*30, this.height-10);
    }
    ctx.restore();
  }
}
