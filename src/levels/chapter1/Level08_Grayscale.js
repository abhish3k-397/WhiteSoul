/**
 * Level 8: GRAYSCALE
 * Total gray-on-gray. Collect color drops to "paint" the path visible.
 */
import { LevelBase } from '../LevelBase.js';
import { Platform } from '../../game/Platform.js';
import { Goal } from '../../game/Goal.js';
import { createSpikes } from '../../game/Hazard.js';

class ColorDrop {
  constructor(x, y, color) {
    this.x = x; this.y = y; this.color = color; this.collected = false; this.pulse = Math.random()*Math.PI*2;
    this.revealRadius = 120;
  }
  update(dt) { this.pulse += dt*3; }
  overlaps(e) {
    if (this.collected) return false;
    const ex = e.x+e.width/2, ey = e.y+e.height/2;
    return Math.hypot(ex-this.x, ey-this.y) < 18;
  }
  render(ctx) {
    if (this.collected) return;
    ctx.save();
    ctx.shadowColor = this.color; ctx.shadowBlur = 12;
    ctx.fillStyle = this.color; ctx.globalAlpha = 0.7+Math.sin(this.pulse)*0.3;
    ctx.beginPath(); ctx.arc(this.x, this.y, 6, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

export class Level08_Grayscale extends LevelBase {
  constructor() { super(8, 'GRAYSCALE', '#808080'); this.bgColor = '#1a1a1a'; this.colorDrops = []; this.revealZones = []; }

  init(sublevel) {
    super.init(sublevel); this.bgColor = '#1a1a1a'; this.player.color = '#808080';
    this.player.setSpawn(60,400); this.player.reset(); this.colorDrops = []; this.revealZones = [];
    const layouts = {
      1: [[0,470,180,20],[220,420,130,20],[400,370,120,20],[580,320,120,20],[750,270,120,20]],
      2: [[0,470,140,20],[190,410,100,20],[350,360,90,20],[500,420,80,20],[640,310,90,20],[800,260,90,20]],
      3: [[0,470,100,20],[170,400,70,20],[310,340,60,20],[440,390,50,20],[560,280,60,20],[700,340,50,20],[830,220,60,20]],
    };
    const layout = layouts[sublevel]||layouts[1];
    for (const [x,y,w,h] of layout) this.platforms.push(new Platform(x,y,w,h,{color:'#2a2a2a', visible: false}));
    // First platform always visible
    this.platforms[0].visible = true; this.platforms[0].color = '#3a3a3a';
    // Color drops between platforms
    const colors = ['#ff4040','#40ff40','#4040ff','#ffff40','#ff40ff','#40ffff'];
    const revealR = sublevel===1?140:sublevel===2?100:70;
    for (let i=1;i<layout.length;i++) {
      const [px,py] = layout[i];
      const drop = new ColorDrop(px+30, py-30, colors[i%colors.length]);
      drop.revealRadius = revealR;
      this.colorDrops.push(drop);
    }
    // Spikes on higher sublevels
    if (sublevel >= 2) {
      this.hazards.push(createSpikes(300, 460, 60, '#555'));
      this.hazards.push(createSpikes(600, 460, 60, '#555'));
    }
    const lp = layout[layout.length-1]; this.goal = new Goal(lp[0]+15, lp[1]-45);
  }

  update(dt, input, renderer) {
    for (const d of this.colorDrops) {
      d.update(dt);
      if (!d.collected && d.overlaps(this.player)) {
        d.collected = true;
        this.revealZones.push({ x:d.x, y:d.y, r:d.revealRadius, color:d.color });
        this.particles.burst(d.x, d.y, 15, { color:[d.color,'#ffffff'], gravity:-100, maxSpeed:120 });
        // Reveal nearby platforms
        for (const p of this.platforms) {
          const pcx = p.x+p.width/2, pcy = p.y+p.height/2;
          if (Math.hypot(pcx-d.x, pcy-d.y) < d.revealRadius) { p.visible = true; p.color = d.color+'40'; }
        }
      }
    }
    super.update(dt, input, renderer);
  }

  render(ctx, camera) {
    ctx.fillStyle = this.bgColor; ctx.fillRect(0,0,this.width,this.height);
    // Static noise
    ctx.save(); ctx.globalAlpha = 0.02;
    for (let i=0;i<50;i++) { ctx.fillStyle=Math.random()>0.5?'#2a2a2a':'#1a1a1a'; ctx.fillRect(Math.random()*this.width,Math.random()*this.height,Math.random()*20+5,Math.random()*20+5); }
    ctx.restore();
    // Reveal zone glows
    for (const z of this.revealZones) {
      ctx.save();
      const grad = ctx.createRadialGradient(z.x,z.y,0,z.x,z.y,z.r);
      grad.addColorStop(0, z.color+'20'); grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(z.x,z.y,z.r,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    ctx.save(); camera.apply(ctx);
    for (const p of this.platforms) { if (p.visible || p.solid) p.render(ctx); }
    for (const d of this.colorDrops) d.render(ctx);
    for (const h of this.hazards) h.render(ctx);
    if (this.goal) { if (this.revealZones.length > 0 || this.colorDrops.every(d=>d.collected)) this.goal.render(ctx); }
    if (this.player) this.player.render(ctx);
    this.particles.render(ctx); ctx.restore();
  }
}
