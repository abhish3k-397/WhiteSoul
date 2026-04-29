/**
 * Level 11: CMYK SPLIT
 * Player splits into 4 parts. Each arrow key moves a different part.
 * All 4 must reach their respective goal zones.
 */
import { LevelBase } from '../LevelBase.js';
import { Platform } from '../../game/Platform.js';
import { Goal } from '../../game/Goal.js';

class SplitPlayer {
  constructor(x, y, color, key) {
    this.x = x; this.y = y; this.width = 14; this.height = 14;
    this.vx = 0; this.vy = 0; this.color = color; this.key = key;
    this.grounded = false; this.alive = true; this.atGoal = false;
  }
  render(ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color; ctx.shadowBlur = this.atGoal ? 12 : 4;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }
}

export class Level11_CMYKSplit extends LevelBase {
  constructor() { super(11, 'CMYK SPLIT', '#00ffff'); this.bgColor = '#0a0a0a'; this.splits = []; this.goals = []; }

  init(sublevel) {
    super.init(sublevel); this.bgColor = '#0a0a0a';
    this.player = null; // No single player — we use splits
    this.splits = [
      new SplitPlayer(60, 400, '#00ffff', 'ArrowUp'),   // C - Up
      new SplitPlayer(90, 400, '#ff00ff', 'ArrowDown'),  // M - Down (moves right)
      new SplitPlayer(120, 400, '#ffff00', 'ArrowLeft'), // Y - Left
      new SplitPlayer(150, 400, '#1a1a1a', 'ArrowRight'),// K - Right
    ];
    this.goals = [];
    // Simpler layout — platforms span the level
    const pls = [
      [0,470,960,20], [0,350,200,15], [250,280,200,15], [500,350,200,15], [750,280,200,15],
      [100,200,150,15], [400,180,150,15], [700,200,150,15],
    ];
    for (const [x,y,w,h] of pls) this.platforms.push(new Platform(x,y,w,h,{color:'#222'}));
    // Goal zones for each split
    const goalPositions = sublevel===1 ?
      [[150,330,20,20],[350,260,20,20],[550,330,20,20],[800,260,20,20]] :
      sublevel===2 ?
      [[120,180,20,20],[420,160,20,20],[580,330,20,20],[820,260,20,20]] :
      [[130,180,20,20],[450,160,20,20],[600,330,20,20],[850,180,20,20]];
    const gColors = ['#00ffff','#ff00ff','#ffff00','#404040'];
    for (let i=0;i<4;i++) {
      const [gx,gy,gw,gh] = goalPositions[i];
      this.goals.push({ x:gx, y:gy, width:gw, height:gh, color:gColors[i], reached:false });
    }
    this.completed = false; this.goal = null;
  }

  update(dt, input, renderer) {
    if (this.completed) return;
    this.timer += dt;
    const speed = 200 * this.getSpeedMult();
    const gravity = 1200;
    // Each split moves based on its assigned key
    // Up=C moves up/jump, Down=M moves right, Left=Y moves left, Right=K moves right
    for (let i=0;i<this.splits.length;i++) {
      const s = this.splits[i];
      if (!s.alive || s.atGoal) continue;
      // Simplified: each directional key moves corresponding split horizontally + all can jump
      if (i===0 && (input.isDown('ArrowUp')||input.isDown('KeyW'))) { s.vx = speed; }
      else if (i===1 && (input.isDown('ArrowDown')||input.isDown('KeyS'))) { s.vx = speed; }
      else if (i===2 && (input.isDown('ArrowLeft')||input.isDown('KeyA'))) { s.vx = -speed; }
      else if (i===3 && (input.isDown('ArrowRight')||input.isDown('KeyD'))) { s.vx = speed; }
      // Jump with Space for all
      if (input.justPressed('Space') && s.grounded) { s.vy = -400; s.grounded = false; }
      s.vy += gravity * dt;
      if (s.vy > 600) s.vy = 600;
      s.vx *= 0.85;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.grounded = false;
      // Collide with platforms
      for (const p of this.platforms) {
        if (s.x+s.width>p.x && s.x<p.x+p.width && s.y+s.height>p.y && s.y<p.y+p.height) {
          const overlapTop = (s.y+s.height)-p.y;
          if (overlapTop < 15 && s.vy >= 0) { s.y = p.y-s.height; s.vy = 0; s.grounded = true; }
        }
      }
      // Fall death
      if (s.y > 560) { s.y = 400; s.x = 60+i*30; s.vy = 0; s.vx = 0; }
      // Check goal
      const g = this.goals[i];
      if (!g.reached && s.x+s.width>g.x && s.x<g.x+g.width && s.y+s.height>g.y && s.y<g.y+g.height) {
        g.reached = true; s.atGoal = true;
        this.particles.burst(g.x+g.width/2, g.y+g.height/2, 15, { color:[g.color,'#fff'], gravity:-50 });
      }
    }
    // Check all goals reached
    if (this.goals.every(g=>g.reached)) { this.completed = true; }
    for (const p of this.platforms) p.update(dt);
    this.particles.update(dt);
  }

  render(ctx, camera) {
    ctx.fillStyle = this.bgColor; ctx.fillRect(0,0,this.width,this.height);
    ctx.save(); camera.apply(ctx);
    for (const p of this.platforms) p.render(ctx);
    // Goal zones
    for (let i=0;i<this.goals.length;i++) {
      const g = this.goals[i];
      ctx.save(); ctx.globalAlpha = g.reached ? 0.3 : 0.5+Math.sin(this.timer*3+i)*0.2;
      ctx.fillStyle = g.color; ctx.shadowColor = g.color; ctx.shadowBlur = 10;
      ctx.fillRect(g.x,g.y,g.width,g.height); ctx.restore();
    }
    for (const s of this.splits) s.render(ctx);
    this.particles.render(ctx); ctx.restore();
    // Labels
    ctx.save(); ctx.font = '10px "JetBrains Mono"'; ctx.textAlign='center';
    const labels = ['↑ CYAN','↓ MAGENTA','← YELLOW','→ KEY'];
    const colors = ['#00ffff','#ff00ff','#ffff00','#808080'];
    for (let i=0;i<4;i++) { ctx.fillStyle=colors[i]; ctx.fillText(labels[i], 120+i*200, 20); }
    ctx.restore();
  }
}
