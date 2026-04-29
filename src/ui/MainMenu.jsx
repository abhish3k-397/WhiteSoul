/**
 * MainMenu — White Soul ethereal title screen.
 * A ghostly, spectral aesthetic with floating particles and
 * a soul that breathes in the center.
 */
import { useGameStore } from '../store/gameStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useEffect, useRef, useState } from 'react';
import './MainMenu.css';

export default function MainMenu() {
  const startGame = useGameStore(s => s.startLevel);
  const goToLevelSelect = useGameStore(s => s.goToLevelSelect);
  const totalDeaths = useGameStore(s => s.totalDeaths);
  
  const unlockedCheats = useGameStore(s => s.unlockedCheats);
  const activeCheats = useGameStore(s => s.activeCheats);
  const unlockCheat = useGameStore(s => s.unlockCheat);
  const toggleCheat = useGameStore(s => s.toggleCheat);

  const [showWishBox, setShowWishBox] = useState(false);
  const [showWishJar, setShowWishJar] = useState(false);
  const [cheatInput, setCheatInput] = useState('');
  const canvasRef = useRef(null);

  // Ambient particle effect on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        alpha: Math.random() * 0.4 + 0.05,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    let t = 0;
    function draw() {
      t += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        ctx.save();
        ctx.globalAlpha = p.alpha * (0.6 + Math.sin(p.pulse) * 0.4);
        ctx.fillStyle = '#e8e4df';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div className="main-menu">
      <canvas ref={canvasRef} className="menu-particles" />

      <div className="menu-bg-radial" />

      <div className="menu-content">
        {/* Soul orb */}
        <div className="soul-orb">
          <div className="soul-core" />
          <div className="soul-ring soul-ring-1" />
          <div className="soul-ring soul-ring-2" />
          <div className="soul-ring soul-ring-3" />
        </div>

        <h1 className="menu-title">WHITE SOUL</h1>
        <p className="menu-subtitle">13 Chromatic Trials</p>

        <div className="menu-divider" />

        <div className="menu-buttons">
          <button className="menu-btn primary" onClick={() => startGame(1, 1)}>
            ENTER
          </button>
          <button className="menu-btn" onClick={goToLevelSelect}>
            TRIALS
          </button>
          <button className="menu-btn" onClick={() => useGameStore.getState().setScreen('leaderboard')}>
            LEADERBOARD
          </button>
          {useAuthStore.getState().user && (
            unlockedCheats.length === 0 ? (
              <button className="menu-btn" onClick={() => setShowWishBox(true)} style={{ color: '#ffd700' }}>
                MAKE A WISH
              </button>
            ) : (
              <button className="menu-btn" onClick={() => setShowWishJar(true)} style={{ color: '#ffd700' }}>
                WISH JAR
              </button>
            )
          )}
          {useAuthStore.getState().user ? (
            <button className="menu-btn" style={{color: '#888', textTransform: 'none'}} onClick={() => useAuthStore.getState().signOut()}>
              {useAuthStore.getState().profile?.username || 'SOUL'} (LOGOUT)
            </button>
          ) : (
            <button className="menu-btn" onClick={() => useGameStore.getState().setScreen('auth')}>
              BIND SOUL (LOGIN)
            </button>
          )}
        </div>

        {totalDeaths > 0 && (
          <div className="menu-deaths">
            <span className="deaths-label">souls lost</span>
            <span className="deaths-count">{totalDeaths}</span>
          </div>
        )}
      </div>

      <div className="menu-footer-text">
        <span>WASD / Arrows to move</span>
        <span>·</span>
        <span>Space to jump</span>
        <span>·</span>
        <span>ESC to pause</span>
      </div>

      {/* Wish Box Overlay */}
      {showWishBox && (
        <div className="overlay complete-overlay" style={{ background: 'rgba(6, 6, 6, 0.95)' }}>
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
        <div className="overlay complete-overlay" style={{ background: 'rgba(6, 6, 6, 0.95)' }}>
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
                    background: activeCheats[cheat] ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255,255,255,0.05)',
                    border: activeCheats[cheat] ? '1px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                    color: activeCheats[cheat] ? '#ffd700' : '#aaa',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontFamily: '"JetBrains Mono", monospace',
                    transition: 'all 0.2s'
                  }}
                >
                  {cheat === 'YESIAMLAZY' ? 'YESIAMLAZY (Shift + N to Skip)' : cheat}
                </div>
              ))}
            </div>

            <div className="overlay-buttons" style={{ display: 'flex', gap: '10px' }}>
              <button className="overlay-btn primary" onClick={() => setShowWishBox(true)}>
                WISH MORE
              </button>
              <button className="overlay-btn" onClick={() => setShowWishJar(false)}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
