/**
 * GameCanvas — Bridges React ↔ Canvas game engine.
 * Mounts <canvas>, initializes game loop, handles resize.
 */
import { useEffect, useRef, useCallback } from 'react';
import { GameLoop } from '../engine/GameLoop.js';
import { Renderer } from '../engine/Renderer.js';
import { InputManager } from '../engine/InputManager.js';
import { Camera } from '../game/Camera.js';
import { createLevel } from '../levels/registry.js';
import { useGameStore } from '../store/gameStore.js';

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const store = useGameStore;

  const initEngine = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const W = 960, H = 540;
    canvas.width = W;
    canvas.height = H;

    const renderer = new Renderer(canvas);
    const input = new InputManager(canvas);
    const camera = new Camera(W, H);
    let currentLevel = null;

    function loadLevel() {
      const state = store.getState();
      const levelId = state.currentLevel;
      const sublevel = state.currentSublevel;
      currentLevel = createLevel(levelId);
      currentLevel.init(sublevel);
      camera.setLevelBounds(currentLevel.width, currentLevel.height);
      if (currentLevel.player) camera.snap(currentLevel.player);
    }

    loadLevel();

    const loop = new GameLoop({
      update(dt) {
        const state = store.getState();
        if (state.screen !== 'playing') return;

        input.update(dt);
        renderer.updateEffects(dt);
        store.getState().addTime(dt);

        if (currentLevel) {
          const prevDeaths = currentLevel.deathCount;
          currentLevel.update(dt, input, renderer);

          // Check for death
          if (currentLevel.deathCount > prevDeaths) {
            store.getState().onDeath();
          }

          // Check for completion
          if (currentLevel.completed) {
            store.getState().completeSublevel();
          }

          // Check for perma-death restart
          if (currentLevel.needsRestart) {
            currentLevel.needsRestart = false;
            store.getState().restartLevel();
          }

          // Camera follow
          if (currentLevel.player) {
            camera.follow(currentLevel.player, dt);
          }
        }

        input.endFrame();
      },

      render(interpolation) {
        renderer.clear();
        renderer.beginFrame();

        if (currentLevel) {
          currentLevel.render(renderer.ctx, camera);
        }

        renderer.endFrame();
      },
    });

    loop.start();

    // Store engine ref for cleanup and level reloading
    engineRef.current = {
      loop, renderer, input, camera,
      loadLevel,
      destroy() {
        loop.stop();
        input.destroy();
      },
    };

    // Subscribe to store changes for level reloading
    const unsub = store.subscribe((state, prev) => {
      if (state.screen === 'playing' && (
        state.currentLevel !== prev.currentLevel ||
        state.currentSublevel !== prev.currentSublevel ||
        state.restartTrigger !== prev.restartTrigger
      )) {
        loadLevel();
      }
      // Pause/resume
      if (state.screen === 'paused') loop.pause();
      else if (prev.screen === 'paused' && state.screen === 'playing') loop.resume();
    });

    return () => {
      unsub();
      engineRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    const cleanup = initEngine();
    return cleanup;
  }, [initEngine]);

  // Handle Escape for pause
  useEffect(() => {
    const onKey = (e) => {
      const state = store.getState();
      if (e.code === 'Escape') {
        if (state.screen === 'playing') store.getState().setScreen('paused');
        else if (state.screen === 'paused') store.getState().setScreen('playing');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="game-canvas"
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '960px',
        maxHeight: '540px',
        display: 'block',
        margin: '0 auto',
        imageRendering: 'pixelated',
        cursor: 'crosshair',
      }}
    />
  );
}
