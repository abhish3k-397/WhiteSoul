/**
 * App.jsx — Root component, screen state machine.
 */
import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { useAuthStore } from '../store/authStore.js';
import MainMenu from './MainMenu.jsx';
import LevelSelect from './LevelSelect.jsx';
import GameCanvas from './GameCanvas.jsx';
import HUD from './HUD.jsx';
import PauseMenu from './PauseMenu.jsx';
import LevelComplete from './LevelComplete.jsx';
import AuthScreen from './AuthScreen.jsx';
import LeaderboardScreen from './LeaderboardScreen.jsx';

export default function App() {
  const screen = useGameStore(s => s.screen);
  const initAuth = useAuthStore(s => s.init);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <div className="app-root">
      {screen === 'menu' && <MainMenu />}
      {screen === 'levelSelect' && <LevelSelect />}
      {screen === 'auth' && <AuthScreen />}
      {screen === 'leaderboard' && <LeaderboardScreen />}

      {(screen === 'playing' || screen === 'paused' || screen === 'levelComplete') && (
        <div className="game-wrapper">
          <GameCanvas />
          <HUD />
          {screen === 'paused' && <PauseMenu />}
          {screen === 'levelComplete' && <LevelComplete />}
        </div>
      )}
    </div>
  );
}
