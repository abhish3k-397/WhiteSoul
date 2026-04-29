/**
 * Level 9: INFRARED MAZE
 * Move as a heat-blob. Blue walls are absolute zero (lethal).
 * Thermal camera palette: red→yellow→blue.
 */
import { LevelBase } from '../LevelBase.js';
import { Platform } from '../../game/Platform.js';
import { Goal } from '../../game/Goal.js';
import { Hazard } from '../../game/Hazard.js';

export class Level09_InfraredMaze extends LevelBase {
  constructor() { super(9, 'INFRARED MAZE', '#ff4400'); this.bgColor = '#0a0000'; this.coldWalls = []; }

  init(sublevel) {
    super.init(sublevel); this.bgColor = '#0a0000'; this.player.color = '#ffaa00';
    this.player.setSpawn(60,400); this.player.reset(); this.coldWalls = [];
    // Maze-like platforms
    const layouts = {
      1: [[0,470,960,20],[0,0,960,20],[0,0,20,540],[940,0,20,540],
          [100,380,200,15],[350,300,180,15],[580,380,150,15],[780,280,120,15],
          [200,200,150,15],[450,150,200,15],[700,180,120,15]],
      2: [[0,470,960,20],[0,0,960,20],[0,0,20,540],[940,0,20,540],
          [80,380,160,15],[300,300,140,15],[500,380,120,15],[700,280,100,15],
          [150,200,130,15],[380,150,160,15],[600,200,100,15],[820,150,100,15]],
      3: [[0,470,960,20],[0,0,960,20],[0,0,20,540],[940,0,20,540],
          [60,380,120,15],[240,310,100,15],[400,380,90,15],[560,280,80,15],
          [100,200,100,15],[300,150,120,15],[500,200,80,15],[700,150,80,15],[850,120,70,15]],
    };
    const layout = layouts[sublevel]||layouts[1];
    for (const [x,y,w,h] of layout) this.platforms.push(new Platform(x,y,w,h,{color:'#2a0a00'}));
    // Cold walls (blue = lethal)
    const walls = {
      1: [[280,200,15,180],[530,100,15,200],[730,180,15,200]],
      2: [[230,180,15,200],[440,80,15,220],[600,150,15,230],[800,100,15,180]],
      3: [[180,150,15,230],[380,80,15,250],[540,120,15,260],[720,80,15,220],[870,70,15,200]],
    };
    for (const [x,y,w,h] of (walls[sublevel]||walls[1])) {
      this.coldWalls.push(new Hazard(x,y,w,h,{color:'#0060ff',type:'static'}));
      this.hazards.push(new Hazard(x,y,w,h,{color:'#0060ff',type:'static'}));
    }
    this.goal = new Goal(880, 80);
  }

  render(ctx, camera) {
    // Thermal background
    const grad = ctx.createLinearGradient(0,0,0,this.height);
    grad.addColorStop(0,'#0a0000'); grad.addColorStop(0.5,'#1a0500'); grad.addColorStop(1,'#0a0200');
    ctx.fillStyle = grad; ctx.fillRect(0,0,this.width,this.height);
    // Thermal noise
    ctx.save(); ctx.globalAlpha = 0.03;
    for (let i=0;i<30;i++) {
      const c = Math.random()>0.7?'#ff4400':'#1a0500';
      ctx.fillStyle = c;
      ctx.fillRect(Math.random()*this.width, Math.random()*this.height, Math.random()*30+5, Math.random()*3+1);
    }
    ctx.restore();

    ctx.save(); camera.apply(ctx);
    // Platforms with thermal glow
    for (const p of this.platforms) {
      ctx.save(); ctx.fillStyle = '#2a0800'; ctx.shadowColor = '#ff2200'; ctx.shadowBlur = 3;
      ctx.fillRect(p.x,p.y,p.width,p.height); ctx.restore();
    }
    // Cold walls with blue glow
    for (const w of this.coldWalls) {
      ctx.save(); ctx.fillStyle = '#0040cc'; ctx.shadowColor = '#0080ff'; ctx.shadowBlur = 15;
      ctx.fillRect(w.x,w.y,w.width,w.height); ctx.restore();
    }
    if (this.goal) this.goal.render(ctx);
    // Player as heat blob
    if (this.player && this.player.alive) {
      const px = this.player.x+this.player.width/2, py = this.player.y+this.player.height/2;
      ctx.save();
      const heatGrad = ctx.createRadialGradient(px,py,0,px,py,30);
      heatGrad.addColorStop(0,'#ffffff'); heatGrad.addColorStop(0.3,'#ffff00'); heatGrad.addColorStop(0.6,'#ff6600'); heatGrad.addColorStop(1,'rgba(255,0,0,0)');
      ctx.fillStyle = heatGrad; ctx.beginPath(); ctx.arc(px,py,30,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = '#ffcc00';
      ctx.fillRect(this.player.x,this.player.y,this.player.width,this.player.height);
      ctx.restore();
    } else if (this.player) { this.player.render(ctx); }
    this.particles.render(ctx); ctx.restore();
  }
}
