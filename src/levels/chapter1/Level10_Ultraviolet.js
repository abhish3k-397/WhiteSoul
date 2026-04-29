/**
 * Level 10: ULTRAVIOLET
 * Platforms only exist under the UV Spotlight (Mouse Cursor).
 * Dark purple void, glowing UV cone following mouse.
 */
import { LevelBase } from '../LevelBase.js';
import { Platform } from '../../game/Platform.js';
import { Goal } from '../../game/Goal.js';

export class Level10_Ultraviolet extends LevelBase {
  constructor() { super(10, 'ULTRAVIOLET', '#a020ff'); this.bgColor = '#04000a'; this.spotlightX = 480; this.spotlightY = 270; this.spotlightR = 120; }

  init(sublevel) {
    super.init(sublevel); this.bgColor = '#04000a'; this.player.color = '#d080ff';
    this.player.setSpawn(60,400); this.player.reset();
    this.spotlightR = sublevel===1?140:sublevel===2?100:65;
    const layouts = {
      1: [[0,470,180,20],[230,420,130,20],[410,370,120,20],[590,320,120,20],[770,270,120,20]],
      2: [[0,470,140,20],[200,410,100,20],[370,350,90,20],[530,400,80,20],[680,300,90,20],[840,250,80,20]],
      3: [[0,470,100,20],[180,400,60,20],[310,340,50,20],[440,390,45,20],[560,280,55,20],[690,330,45,20],[820,220,55,20]],
    };
    const layout = layouts[sublevel]||layouts[1];
    for (const [x,y,w,h] of layout) this.platforms.push(new Platform(x,y,w,h,{color:'#2a0050', visible:false, solid:false}));
    // First platform always solid
    this.platforms[0].visible = true; this.platforms[0].solid = true; this.platforms[0].color = '#3a0070';
    const lp = layout[layout.length-1]; this.goal = new Goal(lp[0]+10, lp[1]-45);
  }

  update(dt, input, renderer) {
    // Mouse controls spotlight
    this.spotlightX = input.mouse.x;
    this.spotlightY = input.mouse.y;
    // Platforms under spotlight become solid and visible
    for (const p of this.platforms) {
      if (p === this.platforms[0]) continue; // first always solid
      const pcx = p.x+p.width/2, pcy = p.y+p.height/2;
      const dist = Math.hypot(pcx-this.spotlightX, pcy-this.spotlightY);
      const inSpot = dist < this.spotlightR + p.width/2;
      p.solid = inSpot;
      p.visible = inSpot;
      if (inSpot) p.color = `rgba(100,0,200,${Math.max(0.2, 1-dist/this.spotlightR)})`;
    }
    super.update(dt, input, renderer);
  }

  render(ctx, camera) {
    ctx.fillStyle = this.bgColor; ctx.fillRect(0,0,this.width,this.height);
    // UV spotlight cone
    ctx.save();
    const grad = ctx.createRadialGradient(this.spotlightX,this.spotlightY,0,this.spotlightX,this.spotlightY,this.spotlightR);
    grad.addColorStop(0,'rgba(120,0,255,0.2)'); grad.addColorStop(0.5,'rgba(80,0,200,0.1)'); grad.addColorStop(1,'rgba(40,0,100,0)');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(this.spotlightX,this.spotlightY,this.spotlightR,0,Math.PI*2); ctx.fill();
    // Spotlight ring
    ctx.strokeStyle = 'rgba(120,0,255,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(this.spotlightX,this.spotlightY,this.spotlightR,0,Math.PI*2); ctx.stroke();
    ctx.restore();

    ctx.save(); camera.apply(ctx);
    for (const p of this.platforms) { if (p.visible) { ctx.save(); ctx.shadowColor='#8020ff'; ctx.shadowBlur=8; p.render(ctx); ctx.restore(); } }
    if (this.goal) this.goal.render(ctx);
    if (this.player) this.player.render(ctx);
    this.particles.render(ctx); ctx.restore();
    // Hint
    if (this.timer < 4) { ctx.save(); ctx.globalAlpha=0.3+Math.sin(this.timer*3)*0.15; ctx.font='12px "JetBrains Mono"'; ctx.fillStyle='#8040ff'; ctx.textAlign='center'; ctx.fillText('MOVE MOUSE TO REVEAL', this.width/2, this.height/2); ctx.restore(); }
  }
}
