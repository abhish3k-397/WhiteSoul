/**
 * Level 6: PURPLE WEIGHT
 * High-gravity zones prevent jumping.
 */
import { LevelBase } from '../LevelBase.js';
import { Platform } from '../../game/Platform.js';
import { Goal } from '../../game/Goal.js';

class GravityZone {
  constructor(x, y, w, h, mult = 5) {
    this.x = x; this.y = y; this.width = w; this.height = h;
    this.multiplier = mult; this.pulse = 0;
  }
  containsEntity(e) {
    const cx = e.x + e.width/2, cy = e.y + e.height/2;
    return cx >= this.x && cx <= this.x+this.width && cy >= this.y && cy <= this.y+this.height;
  }
  update(dt) { this.pulse += dt * 2; }
  render(ctx) {
    ctx.save();
    const a = 0.15 + Math.sin(this.pulse)*0.05;
    ctx.fillStyle = `rgba(100,0,200,${a})`;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = 'rgba(150,50,255,0.3)';
    ctx.setLineDash([4,6]); ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }
}

export class Level06_PurpleWeight extends LevelBase {
  constructor() { super(6, 'PURPLE WEIGHT', '#8040ff'); this.bgColor = '#06000a'; this.gravityZones = []; this.inGravityZone = false; }

  init(sublevel) {
    super.init(sublevel); this.bgColor = '#06000a'; this.player.color = '#d0a0ff';
    this.player.setSpawn(60, 400); this.player.reset(); this.gravityZones = [];
    const layouts = {
      1: [[0,470,180,20],[230,420,140,20],[420,370,120,20],[590,320,130,20],[770,270,120,20]],
      2: [[0,470,140,20],[190,410,100,20],[350,360,90,20],[500,410,80,20],[640,300,100,20],[800,250,100,20]],
      3: [[0,470,100,20],[160,400,70,20],[290,340,60,20],[420,390,50,20],[540,280,60,20],[680,340,50,20],[800,220,60,20]],
    };
    const layout = layouts[sublevel] || layouts[1];
    for (const [x,y,w,h] of layout) this.platforms.push(new Platform(x,y,w,h,{color:'#1a0030'}));
    const gm = sublevel===1?4:sublevel===2?6:8;
    const zones = { 1:[[200,200,200,250],[550,150,200,200]], 2:[[150,180,180,280],[400,150,150,250],[680,100,180,250]], 3:[[100,150,200,300],[350,100,180,300],[580,130,160,280],[780,80,160,300]] };
    for (const [zx,zy,zw,zh] of (zones[sublevel]||zones[1])) this.gravityZones.push(new GravityZone(zx,zy,zw,zh,gm));
    const lp = layout[layout.length-1]; this.goal = new Goal(lp[0]+15, lp[1]-45);
  }

  update(dt, input, renderer) {
    for (const z of this.gravityZones) z.update(dt);
    this.inGravityZone = false;
    if (this.player && this.player.alive) {
      for (const z of this.gravityZones) {
        if (z.containsEntity(this.player)) {
          this.inGravityZone = true;
          this.physics.config.gravity = 1800 * z.multiplier;
          this.physics.config.jumpForce = -100;
          break;
        }
      }
      if (!this.inGravityZone) { this.physics.config.gravity = 1800; this.physics.config.jumpForce = -580; }
    }
    super.update(dt, input, renderer);
  }

  render(ctx, camera) {
    ctx.fillStyle = this.bgColor; ctx.fillRect(0,0,this.width,this.height);
    ctx.save(); camera.apply(ctx);
    for (const z of this.gravityZones) z.render(ctx);
    for (const p of this.platforms) { ctx.save(); ctx.shadowColor='#8040ff'; ctx.shadowBlur=3; p.render(ctx); ctx.restore(); }
    if (this.goal) this.goal.render(ctx);
    if (this.player) {
      if (this.inGravityZone && this.player.alive) { ctx.save(); ctx.globalAlpha=0.4; ctx.fillStyle='#8040ff'; ctx.fillRect(this.player.x-3,this.player.y-3,this.player.width+6,this.player.height+6); ctx.restore(); }
      this.player.render(ctx);
    }
    this.particles.render(ctx); ctx.restore();
    if (this.inGravityZone) { ctx.save(); ctx.font='11px "JetBrains Mono"'; ctx.fillStyle='#8040ff'; ctx.textAlign='center'; ctx.globalAlpha=0.6+Math.sin(this.timer*5)*0.3; ctx.fillText('⬇ HIGH GRAVITY ⬇',this.width/2,30); ctx.restore(); }
  }
}
