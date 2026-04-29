/**
 * HUD — White Soul in-game overlay.
 * Minimal, ghostly, almost invisible until needed.
 */
import { useGameStore } from '../store/gameStore.js';
import { LEVEL_META } from '../levels/registry.js';
import './HUD.css';

export default function HUD() {
  const currentLevel = useGameStore(s => s.currentLevel);
  const currentSublevel = useGameStore(s => s.currentSublevel);
  const levelDeaths = useGameStore(s => s.levelDeaths);
  const meta = LEVEL_META.find(l => l.id === currentLevel);
  const diffLabels = ['normal', 'hard', 'insane'];

  return (
    <div className="hud" style={{ '--accent': meta?.accent || '#e8e4df' }}>
      <div className="hud-left">
        <span className="hud-num">{String(currentLevel).padStart(2, '0')}</span>
        <span className="hud-sep">·</span>
        <span className="hud-name">{meta?.name || '???'}</span>
      </div>

      <div className="hud-center">
        <div className="hud-ordeals">
          {[1, 2, 3].map(s => (
            <span key={s} className={`hud-ord ${s === currentSublevel ? 'active' : ''} ${s < currentSublevel ? 'done' : ''}`} />
          ))}
        </div>
        <span className="hud-diff">{diffLabels[currentSublevel - 1]}</span>
      </div>

      <div className="hud-right">
        {levelDeaths > 0 && <span className="hud-deaths">†{levelDeaths}</span>}
      </div>
    </div>
  );
}
