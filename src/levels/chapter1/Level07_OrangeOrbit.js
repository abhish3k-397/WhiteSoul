/**
 * Level 7: ORANGE ORBIT
 * Stay inside moving orange circles to avoid projectile rain outside.
 */
import { LevelBase } from '../LevelBase.js';
import { Platform } from '../../game/Platform.js';
import { Goal } from '../../game/Goal.js';

class SafeOrbit {
  constructor(x, y, r, speed, rangeX, rangeY) {
    this.cx = x; this.cy = y; this.radius = r;
    this.startX = x; this.startY = y;
    this.rangeX = rangeX; this.rangeY = rangeY;
    this.speed = speed; this.phase = Math.random()*Math.PI*2;
  }
  update(dt) {
    this.phase += dt * this.speed;
    this.cx = this.startX + Math.sin(this.phase) * this.rangeX;
    this.cy = this.startY + Math.cos(this.phase * 0.7) * this.rangeY;
  }
  containsEntity(e) {
    const ex = e.x+e.width/2, ey = e.y+e.height/2;
    return Math.hypot(ex-this.cx, ey-this.cy) < this.radius;
  }
  render(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,160,0,0.4)';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff8800'; ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI*2); ctx.stroke();
    const grad = ctx.createRadialGradient(this.cx,this.cy,0,this.cx,this.cy,this.radius);
    grad.addColorStop(0, 'rgba(255,140,0,0.08)');
    grad.addColorStop(1, 'rgba(255,140,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(this.cx, this.cy, this.radius, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

class Raindrop {
  constructor(x, speed) { this.x = x; this.y = -10; this.speed = speed; this.dead = false; }
  update(dt) { this.y += this.speed * dt; if (this.y > 560) this.dead = true; }
  render(ctx) { ctx.fillStyle='rgba(255,80,0,0.6)'; ctx.fillRect(this.x,this.y,2,8); }
}

export class Level07_OrangeOrbit extends LevelBase {
  constructor() { super(7, 'ORANGE ORBIT', '#ff8800'); this.bgColor = '#0a0400'; this.orbits = []; this.rain = []; this.rainTimer = 0; this.playerSafe = false; }

  init(sublevel) {
    super.init(sublevel); this.bgColor = '#0a0400'; this.player.color = '#ffffff';
    this.player.setSpawn(60,400); this.player.reset(); this.orbits = []; this.rain = []; this.rainTimer = 0;
    const layouts = {
      1: [[0,470,180,20],[220,420,130,20],[400,370,120,20],[580,320,120,20],[750,270,120,20]],
      2: [[0,470,140,20],[200,410,100,20],[360,360,90,20],[520,310,90,20],[680,360,80,20],[830,260,90,20]],
      3: [[0,470,100,20],[170,400,70,20],[310,340,60,20],[440,380,50,20],[570,280,60,20],[700,330,50,20],[830,230,60,20]],
    };
    const layout = layouts[sublevel]||layouts[1];
    for (const [x,y,w,h] of layout) this.platforms.push(new Platform(x,y,w,h,{color:'#1a0a00'}));
    const orbitR = sublevel===1?90:sublevel===2?70:55;
    const orbitSpeed = sublevel===1?1.2:sublevel===2?1.8:2.5;
    for (let i=1;i<layout.length-1;i++) {
      const [px,py,pw] = layout[i];
      this.orbits.push(new SafeOrbit(px+pw/2, py-40, orbitR, orbitSpeed, 40, 25));
    }
    const lp = layout[layout.length-1]; this.goal = new Goal(lp[0]+15, lp[1]-45);
  }

  update(dt, input, renderer) {
    for (const o of this.orbits) o.update(dt);
    // Check if player is inside any orbit
    this.playerSafe = false;
    if (this.player && this.player.alive) {
      // Safe on first/last platform too
      if (this.player.x < 200 || this.player.x > this.width - 150) this.playerSafe = true;
      for (const o of this.orbits) { if (o.containsEntity(this.player)) { this.playerSafe = true; break; } }
    }
    // Projectile rain
    this.rainTimer += dt;
    const rainRate = this.sublevel===1?0.05:this.sublevel===2?0.03:0.02;
    if (this.rainTimer > rainRate) {
      this.rainTimer = 0;
      const rx = Math.random() * this.width;
      // Don't spawn inside safe orbits
      let inOrbit = false;
      for (const o of this.orbits) { if (Math.hypot(rx-o.cx, -10-o.cy) < o.radius+10) { inOrbit = true; break; } }
      if (!inOrbit) this.rain.push(new Raindrop(rx, 250 + this.sublevel * 80));
    }
    for (let i=this.rain.length-1;i>=0;i--) {
      this.rain[i].update(dt);
      if (this.rain[i].dead) { this.rain.splice(i,1); continue; }
      // Check hit player
      if (this.player && this.player.alive && !this.playerSafe) {
        const r = this.rain[i];
        if (r.x >= this.player.x && r.x <= this.player.x+this.player.width && r.y >= this.player.y && r.y <= this.player.y+this.player.height) {
          this.onPlayerDeath(renderer); break;
        }
      }
    }
    super.update(dt, input, renderer);
  }

  render(ctx, camera) {
    ctx.fillStyle = this.bgColor; ctx.fillRect(0,0,this.width,this.height);
    // Rain
    for (const r of this.rain) r.render(ctx);
    ctx.save(); camera.apply(ctx);
    // Orbits
    for (const o of this.orbits) o.render(ctx);
    for (const p of this.platforms) { ctx.save(); ctx.shadowColor='#ff8800'; ctx.shadowBlur=3; p.render(ctx); ctx.restore(); }
    if (this.goal) this.goal.render(ctx);
    if (this.player) this.player.render(ctx);
    this.particles.render(ctx); ctx.restore();
  }
}
