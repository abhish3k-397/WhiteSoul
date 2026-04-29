/**
 * PauseMenu — White Soul pause.
 */
import { useGameStore } from '../store/gameStore.js';
import './Overlay.css';

export default function PauseMenu() {
  const setScreen = useGameStore(s => s.setScreen);
  const goToMenu = useGameStore(s => s.goToMenu);
  const goToLevelSelect = useGameStore(s => s.goToLevelSelect);

  return (
    <div className="overlay pause-overlay">
      <div className="overlay-content">
        <h2 className="overlay-title">Rest</h2>
        <div className="overlay-buttons">
          <button className="overlay-btn primary" onClick={() => setScreen('playing')}>CONTINUE</button>
          <button className="overlay-btn" onClick={goToLevelSelect}>TRIALS</button>
          <button className="overlay-btn" onClick={goToMenu}>ABANDON</button>
        </div>
      </div>
    </div>
  );
}
