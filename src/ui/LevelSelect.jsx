/**
 * LevelSelect — White Soul trials grid.
 * Ethereal card layout with soul-state indicators.
 */
import { useGameStore } from '../store/gameStore.js';
import { LEVEL_META } from '../levels/registry.js';
import './LevelSelect.css';

export default function LevelSelect() {
  const startLevel = useGameStore(s => s.startLevel);
  const goToMenu = useGameStore(s => s.goToMenu);
  const highestUnlocked = useGameStore(s => s.highestUnlocked);
  const completedSublevels = useGameStore(s => s.completedSublevels);

  return (
    <div className="level-select">
      <div className="ls-header">
        <button className="ls-back" onClick={goToMenu}>← return</button>
        <h2 className="ls-title">The Chromatic Trials</h2>
        <div className="ls-subtitle">13 trials of color · 3 ordeals each</div>
      </div>

      <div className="ls-grid">
        {LEVEL_META.map((level) => {
          const unlocked = level.id <= highestUnlocked;
          const s1 = completedSublevels[`${level.id}-1`];
          const s2 = completedSublevels[`${level.id}-2`];
          const s3 = completedSublevels[`${level.id}-3`];
          const completed = !!s3;

          return (
            <button
              key={level.id}
              className={`ls-card ${unlocked ? 'unlocked' : 'locked'} ${completed ? 'completed' : ''}`}
              onClick={() => unlocked && startLevel(level.id, 1)}
              disabled={!unlocked}
              style={{ '--accent': level.accent }}
            >
              <div className="ls-card-index">{String(level.id).padStart(2, '0')}</div>
              <div className="ls-card-name">{level.name}</div>
              <div className="ls-card-ordeals">
                <span className={`ordeal ${s1 ? 'lit' : ''}`} title="Normal" />
                <span className={`ordeal ${s2 ? 'lit' : ''}`} title="Hard" />
                <span className={`ordeal ${s3 ? 'lit' : ''}`} title="Insane" />
              </div>
              {!unlocked && <div className="ls-sealed">sealed</div>}
              {completed && <div className="ls-soul-mark">✦</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
