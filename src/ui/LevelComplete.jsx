/**
 * LevelComplete — White Soul trial cleared.
 */
import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { useAuthStore } from '../store/authStore.js';
import { supabase } from '../lib/supabase.js';
import { LEVEL_META } from '../levels/registry.js';
import './Overlay.css';

export default function LevelComplete() {
  const currentLevel = useGameStore(s => s.currentLevel);
  const currentSublevel = useGameStore(s => s.currentSublevel);
  const levelDeaths = useGameStore(s => s.levelDeaths);
  const levelTimer = useGameStore(s => s.levelTimer);
  const nextSublevel = useGameStore(s => s.nextSublevel);
  const goToLevelSelect = useGameStore(s => s.goToLevelSelect);
  const user = useAuthStore(s => s.user);
  
  const meta = LEVEL_META.find(l => l.id === currentLevel);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Only submit score when the ENTIRE trial is cleared (sublevel 3)
    if (currentSublevel === 3 && user) {
      submitScore();
    }
  }, [currentSublevel, user]);

  const submitScore = async () => {
    setSubmitting(true);
    const timeMs = Math.floor(levelTimer * 1000);
    const totalScore = (levelDeaths * 1000000) + timeMs;

    try {
      // First check if a score already exists to only update if it's better
      const { data: existing } = await supabase
        .from('scores')
        .select('total_score')
        .eq('user_id', user.id)
        .eq('level_id', currentLevel)
        .single();

      if (!existing || totalScore < Number(existing.total_score)) {
        await supabase.from('scores').upsert({
          user_id: user.id,
          level_id: currentLevel,
          sublevel: currentSublevel,
          deaths: levelDeaths,
          time_ms: timeMs,
          total_score: totalScore
        }, { onConflict: 'user_id, level_id' });
      }
    } catch (e) {
      console.error('Failed to submit score', e);
    }
    setSubmitting(false);
  };

  const nextLabel = currentSublevel < 3
    ? 'NEXT ORDEAL'
    : currentLevel < 13
      ? 'NEXT TRIAL'
      : 'ALL TRIALS COMPLETE';

  return (
    <div className="overlay complete-overlay">
      <div className="overlay-content">
        <div className="complete-badge" style={{ color: meta?.accent }}>✦</div>
        <h2 className="overlay-title" style={{ color: '#c8c2b8' }}>Cleared</h2>
        <p className="overlay-subtitle" style={{ color: meta?.accent + '90' }}>
          {meta?.name} — ordeal {Math.min(currentSublevel, 3)}
        </p>
        {levelDeaths > 0 && (
          <div className="overlay-stat">deaths: <span className="stat-val">{levelDeaths}</span></div>
        )}

        <div className="overlay-buttons">
          <button className="overlay-btn primary" onClick={nextSublevel}>{nextLabel}</button>
          <button className="overlay-btn" onClick={goToLevelSelect}>TRIALS</button>
        </div>
      </div>
    </div>
  );
}
