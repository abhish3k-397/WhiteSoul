/**
 * Level 12: COMPLEMENTARY SHIFT
 * Must change player color to match platform color.
 * Standing on a wrong-colored platform = lethal.
 */
import { LevelBase } from '../LevelBase.js';
import { Platform } from '../../game/Platform.js';
import { Goal } from '../../game/Goal.js';

const COLORS = [
  { name: 'RED', hex: '#ff3030', key: 'KeyR' },
  { name: 'GREEN', hex: '#30ff30', key: 'KeyG' },
  { name: 'BLUE', hex: '#3030ff', key: 'KeyB' },
];

export class Level12_ComplementaryShift extends LevelBase {
  constructor() { super(12, 'COMPLEMENTARY SHIFT', '#ff30ff'); this.bgColor = '#0a0a0a'; this.playerColorIndex = 0; this.colorWheel = 0; }

  init(sublevel) {
    super.init(sublevel); this.bgColor = '#0a0a0a';
    this.playerColorIndex = 0;
    this.player.color = COLORS[0].hex;
    this.player.setSpawn(60,400); this.player.reset();
    // Platforms with assigned colors
    const layouts = {
      1: [
        [0,470,150,20,0],[200,420,120,20,1],[380,370,120,20,2],[560,320,120,20,0],[740,270,120,20,1],[880,220,80,20,2],
      ],
      2: [
        [0,470,120,20,0],[180,410,90,20,1],[330,360,80,20,2],[470,310,80,20,0],[610,360,70,20,1],[740,270,80,20,2],[870,220,80,20,0],
      ],
      3: [
        [0,470,100,20,0],[160,400,60,20,2],[290,340,50,20,1],[400,380,50,20,0],[520,280,50,20,2],[640,330,45,20,1],[750,240,50,20,0],[870,190,60,20,2],
      ],
    };
    const layout = layouts[sublevel]||layouts[1];
    for (const [x,y,w,h,ci] of layout) {
      const p = new Platform(x,y,w,h,{color:COLORS[ci].hex+'60'});
      p.custom.colorIndex = ci;
      this.platforms.push(p);
    }
    const lp = layout[layout.length-1]; this.goal = new Goal(lp[0]+10, lp[1]-45);
  }

  update(dt, input, renderer) {
    this.colorWheel += dt;
    // Color switching
    for (let i=0;i<COLORS.length;i++) {
      if (input.justPressed(COLORS[i].key)) {
        this.playerColorIndex = i;
        this.player.color = COLORS[i].hex;
        this.particles.burst(this.player.x+this.player.width/2, this.player.y+this.player.height/2, 8, { color:COLORS[i].hex, gravity:-50, maxSpeed:60 });
      }
    }
    // Check if player is on wrong-colored platform
    if (this.player && this.player.alive && this.player.grounded) {
      for (const p of this.platforms) {
        const on = this.player.x+this.player.width>p.x && this.player.x<p.x+p.width && Math.abs((this.player.y+this.player.height)-p.y)<5;
        if (on && p.custom.colorIndex !== undefined && p.custom.colorIndex !== this.playerColorIndex) {
          this.onPlayerDeath(renderer);
          break;
        }
      }
    }
    // Sublevel 2+: platforms shift colors over time
    if (this.sublevel >= 2) {
      const shiftInterval = this.sublevel===2 ? 4 : 2;
      const shiftPhase = Math.floor(this.timer / shiftInterval);
      for (const p of this.platforms) {
        if (p.custom.colorIndex !== undefined) {
          const newCI = (p.custom.colorIndex + shiftPhase) % COLORS.length;
          p.color = COLORS[newCI].hex + '60';
          p.custom.colorIndex = newCI;
        }
      }
    }
    super.update(dt, input, renderer);
  }

  render(ctx, camera) {
    ctx.fillStyle = this.bgColor; ctx.fillRect(0,0,this.width,this.height);
    ctx.save(); camera.apply(ctx);
    for (const p of this.platforms) {
      ctx.save();
      const ci = p.custom.colorIndex;
      if (ci !== undefined) { ctx.shadowColor = COLORS[ci].hex; ctx.shadowBlur = 6; }
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x,p.y,p.width,p.height);
      // Color indicator dot
      if (ci !== undefined) {
        ctx.fillStyle = COLORS[ci].hex;
        ctx.beginPath(); ctx.arc(p.x+p.width/2, p.y-8, 4, 0, Math.PI*2); ctx.fill();
      }
      ctx.restore();
    }
    if (this.goal) this.goal.render(ctx);
    if (this.player) this.player.render(ctx);
    this.particles.render(ctx); ctx.restore();
    // Color selector UI
    ctx.save();
    for (let i=0;i<COLORS.length;i++) {
      const bx = this.width/2 - 60 + i*40, by = 15;
      ctx.fillStyle = i===this.playerColorIndex ? COLORS[i].hex : COLORS[i].hex+'40';
      ctx.shadowColor = i===this.playerColorIndex ? COLORS[i].hex : 'transparent';
      ctx.shadowBlur = i===this.playerColorIndex ? 10 : 0;
      ctx.fillRect(bx,by,30,12);
      ctx.font = '9px "JetBrains Mono"'; ctx.fillStyle='#fff'; ctx.textAlign='center';
      ctx.shadowBlur = 0;
      ctx.fillText(COLORS[i].key.replace('Key',''), bx+15, by+10);
    }
    ctx.restore();
  }
}
