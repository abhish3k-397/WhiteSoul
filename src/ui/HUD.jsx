/**
 * HUD — White Soul in-game overlay.
 * Minimal, ghostly, almost invisible until needed.
 */
import { useGameStore } from '../store/gameStore.js';
import { LEVEL_META } from '../levels/registry.js';
import './HUD.css';

import { useState } from 'react';

export default function HUD() {
  const currentLevel = useGameStore(s => s.currentLevel);
  const currentSublevel = useGameStore(s => s.currentSublevel);
  const levelDeaths = useGameStore(s => s.levelDeaths);
  const meta = LEVEL_META.find(l => l.id === currentLevel);
  const diffLabels = ['normal', 'hard', 'insane'];

  const unlockedCheats = useGameStore(s => s.unlockedCheats);
  const activeCheats = useGameStore(s => s.activeCheats);
  const toggleCheat = useGameStore(s => s.toggleCheat);
  const unlockCheat = useGameStore(s => s.unlockCheat);

  const [showWishBox, setShowWishBox] = useState(false);
  const [showWishJar, setShowWishJar] = useState(false);
  const [cheatInput, setCheatInput] = useState('');

  return (
    <>
      <div className="hud" style={{ '--accent': meta?.accent || '#e8e4df' }}>
        <div className="hud-left" style={{ pointerEvents: 'auto' }}>
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

        <div className="hud-right" style={{ pointerEvents: 'auto', display: 'flex', gap: '15px', alignItems: 'center' }}>
          {levelDeaths > 0 && <span className="hud-deaths" style={{ marginRight: '10px' }}>†{levelDeaths}</span>}
          
          <button className="hud-btn" onClick={() => useGameStore.getState().goToMenu()}>
            MENU
          </button>
          <button className="hud-btn" onClick={() => useGameStore.getState().setScreen('leaderboard')}>
            RANKS
          </button>
          
          {unlockedCheats.length === 0 ? (
            <button className="hud-btn wish" onClick={() => setShowWishBox(true)}>
              WISH
            </button>
          ) : (
            <button className="hud-btn wish" onClick={() => setShowWishJar(true)}>
              JAR
            </button>
          )}
        </div>
      </div>

      {/* Make a Wish Overlay */}
      {showWishBox && (
        <div className="overlay complete-overlay" style={{ background: 'rgba(6, 6, 6, 0.95)', zIndex: 100 }}>
          <div className="overlay-content" style={{ maxWidth: '400px' }}>
            <h2 className="overlay-title" style={{ color: '#ffd700' }}>Make a Wish</h2>
            <p className="overlay-subtitle">Speak your hidden desire.</p>
            <input 
              type="text" 
              value={cheatInput}
              onChange={(e) => setCheatInput(e.target.value)}
              placeholder="Enter Code"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid #444',
                color: '#fff',
                fontFamily: '"JetBrains Mono", monospace',
                textAlign: 'center',
                marginBottom: '15px',
                outline: 'none'
              }}
            />
            <div className="overlay-buttons" style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="overlay-btn primary" 
                onClick={() => {
                  unlockCheat(cheatInput);
                  setCheatInput('');
                  setShowWishBox(false);
                }}
              >
                SUBMIT
              </button>
              <button className="overlay-btn" onClick={() => { setShowWishBox(false); setCheatInput(''); }}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wish Jar Overlay */}
      {showWishJar && (
        <div className="overlay complete-overlay" style={{ background: 'rgba(6, 6, 6, 0.95)', zIndex: 100 }}>
          <div className="overlay-content" style={{ maxWidth: '400px' }}>
            <h2 className="overlay-title" style={{ color: '#ffd700' }}>Wish Jar</h2>
            <p className="overlay-subtitle">Active incantations in your soul.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginBottom: '20px' }}>
              {unlockedCheats.map(cheat => (
                <div 
                  key={cheat} 
                  onClick={() => toggleCheat(cheat)}
                  style={{
                    padding: '12px',
                    background: activeCheats[cheat] ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: activeCheats[cheat] ? '1px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                    color: activeCheats[cheat] ? '#ffd700' : '#888',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {cheat} ({activeCheats[cheat] ? 'ACTIVE' : 'INACTIVE'})
                </div>
              ))}
            </div>
            
            <div className="overlay-buttons">
              <button className="overlay-btn" onClick={() => setShowWishJar(false)}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
