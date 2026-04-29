/**
 * Zustand Game Store — Central state for game progress, screens, and settings.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGameStore = create(
  persist(
    (set, get) => ({
  // Screen state
  screen: 'menu', // 'menu' | 'levelSelect' | 'playing' | 'paused' | 'death' | 'levelComplete'

  // Current level
  currentLevel: 1,
  currentSublevel: 1,
  totalDeaths: 0,
  levelDeaths: 0,
  levelTimer: 0,
  restartTrigger: 0,

  // Progress
  completedSublevels: {}, // { "1-1": true, "1-2": true, etc. }
  highestUnlocked: 1,
  
  // Cheats
  unlockedCheats: [], 
  activeCheats: {},   
  
  unlockCheat: (code) => set((state) => {
    const upper = code.toUpperCase().trim();
    const validCheats = ['YESIAMLAZY', 'NOIAMNOTLEAVING', 'GODMODE', 'YESIWANTTOBESPOILED'];
    
    if (upper === 'UPUPDOWNDOWNLEFTRIGHTLEFTRIGHTBA') {
      const allUnlocked = [...new Set([...state.unlockedCheats, 'YESIAMLAZY', 'NOIAMNOTLEAVING', 'GODMODE'])];
      const allActive = { ...state.activeCheats, YESIAMLAZY: true, NOIAMNOTLEAVING: true, GODMODE: true };
      return { unlockedCheats: allUnlocked, activeCheats: allActive };
    }

    if (upper === 'YESIWANTTOBESPOILED') {
      const allUnlocked = [...new Set([...state.unlockedCheats, 'YESIWANTTOBESPOILED'])];
      const allActive = { ...state.activeCheats, YESIWANTTOBESPOILED: true };
      return { unlockedCheats: allUnlocked, activeCheats: allActive, highestUnlocked: 13 };
    }

    if (validCheats.includes(upper) && !state.unlockedCheats.includes(upper)) {
      return {
        unlockedCheats: [...state.unlockedCheats, upper],
        activeCheats: { ...state.activeCheats, [upper]: true }
      };
    }
    return {};
  }),
  
  toggleCheat: (code) => set((state) => ({
    activeCheats: { 
      ...state.activeCheats, 
      [code]: !state.activeCheats[code] 
    }
  })),

  // Actions
  setScreen: (screen) => set({ screen }),

  startLevel: (levelId, sublevel = 1) => set((state) => {
    const newCompleted = { ...state.completedSublevels };
    // Clear current level completions when starting fresh
    delete newCompleted[`${levelId}-1`];
    delete newCompleted[`${levelId}-2`];
    delete newCompleted[`${levelId}-3`];
    return {
      screen: 'playing',
      currentLevel: levelId,
      currentSublevel: sublevel,
      levelDeaths: 0,
      levelTimer: 0,
      completedSublevels: newCompleted,
    };
  }),

  onDeath: () => set((state) => ({
    totalDeaths: state.totalDeaths + 1,
    levelDeaths: state.levelDeaths + 1,
  })),

  addTime: (dt) => set((state) => ({
    levelTimer: state.levelTimer + dt,
  })),

  restartLevel: () => set((state) => {
    const unlocked = state.unlockedCheats || [];
    const active = state.activeCheats || {};
    const isLazyRespawn = unlocked.includes('NOIAMNOTLEAVING') && active['NOIAMNOTLEAVING'];

    const newCompleted = { ...state.completedSublevels };
    if (!isLazyRespawn) {
      delete newCompleted[`${state.currentLevel}-1`];
      delete newCompleted[`${state.currentLevel}-2`];
      delete newCompleted[`${state.currentLevel}-3`];
    }
    
    return {
      currentSublevel: isLazyRespawn ? state.currentSublevel : 1,
      restartTrigger: state.restartTrigger + 1,
      completedSublevels: newCompleted,
    };
  }),

  completeSublevel: () => {
    const state = get();
    const key = `${state.currentLevel}-${state.currentSublevel}`;
    const completed = { ...state.completedSublevels, [key]: true };

    if (state.currentSublevel < 3) {
      set({
        screen: 'levelComplete',
        completedSublevels: completed,
      });
      import('../engine/soundEffects').then(({ sfx }) => sfx.playVictory());
    } else {
      const nextLevel = state.currentLevel + 1;
      set({
        screen: 'levelComplete',
        completedSublevels: completed,
        highestUnlocked: Math.max(state.highestUnlocked, nextLevel),
      });
      import('../engine/soundEffects').then(({ sfx }) => sfx.playVictory());
    }
  },

  nextSublevel: () => {
    const state = get();
    if (state.currentSublevel < 3) {
      set({ screen: 'playing', currentSublevel: state.currentSublevel + 1 });
    } else {
      // Go to next level
      const nextLevel = state.currentLevel + 1;
      if (nextLevel <= 13) {
        set({ screen: 'playing', currentLevel: nextLevel, currentSublevel: 1, levelDeaths: 0 });
      } else {
        set({ screen: 'menu' }); // All levels done for now
      }
    }
  },

  goToMenu: () => set({ screen: 'menu' }),
  goToLevelSelect: () => set({ screen: 'levelSelect' }),

  isLevelUnlocked: (levelId) => {
    return levelId <= get().highestUnlocked;
  },

  isLevelCompleted: (levelId) => {
    const state = get();
    return state.completedSublevels[`${levelId}-3`] === true;
  },
}),
{
  name: 'whitesoul-progress-storage',
}
)
);
