/**
 * MainMenu — White Soul ethereal title screen.
 * A ghostly, spectral aesthetic with floating particles and
 * a soul that breathes in the center.
 */
import { useGameStore } from '../store/gameStore.js';
import { useAuthStore } from '../store/authStore.js';
import { useEffect, useRef } from 'react';
import './MainMenu.css';

export default function MainMenu() {
  const startGame = useGameStore(s => s.startLevel);
  const goToLevelSelect = useGameStore(s => s.goToLevelSelect);
  const totalDeaths = useGameStore(s => s.totalDeaths);
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
    </div>
  );
}
