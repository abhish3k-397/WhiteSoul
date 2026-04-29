/**
 * Level Registry — Maps level IDs to their classes.
 */
import { Level01_Whiteout } from './chapter1/Level01_Whiteout.js';
import { Level02_RedAlert } from './chapter1/Level02_RedAlert.js';
import { Level03_BlueAbyss } from './chapter1/Level03_BlueAbyss.js';
import { Level04_YellowFever } from './chapter1/Level04_YellowFever.js';
import { Level05_GreenGrowth } from './chapter1/Level05_GreenGrowth.js';
import { Level06_PurpleWeight } from './chapter1/Level06_PurpleWeight.js';
import { Level07_OrangeOrbit } from './chapter1/Level07_OrangeOrbit.js';
import { Level08_Grayscale } from './chapter1/Level08_Grayscale.js';
import { Level09_InfraredMaze } from './chapter1/Level09_InfraredMaze.js';
import { Level10_Ultraviolet } from './chapter1/Level10_Ultraviolet.js';
import { Level11_CMYKSplit } from './chapter1/Level11_CMYKSplit.js';
import { Level12_ComplementaryShift } from './chapter1/Level12_ComplementaryShift.js';
import { Level13_RainbowBridge } from './chapter1/Level13_RainbowBridge.js';

export const LEVEL_REGISTRY = {
  1: Level01_Whiteout,
  2: Level02_RedAlert,
  3: Level03_BlueAbyss,
  4: Level04_YellowFever,
  5: Level05_GreenGrowth,
  6: Level06_PurpleWeight,
  7: Level07_OrangeOrbit,
  8: Level08_Grayscale,
  9: Level09_InfraredMaze,
  10: Level10_Ultraviolet,
  11: Level11_CMYKSplit,
  12: Level12_ComplementaryShift,
  13: Level13_RainbowBridge,
};

export const LEVEL_META = [
  { id: 1, name: 'WHITEOUT', accent: '#e0e0e0', chapter: 1 },
  { id: 2, name: 'RED ALERT', accent: '#ff2040', chapter: 1 },
  { id: 3, name: 'BLUE ABYSS', accent: '#2080ff', chapter: 1 },
  { id: 4, name: 'YELLOW FEVER', accent: '#ffaa00', chapter: 1 },
  { id: 5, name: 'GREEN GROWTH', accent: '#40ff40', chapter: 1 },
  { id: 6, name: 'PURPLE WEIGHT', accent: '#8040ff', chapter: 1 },
  { id: 7, name: 'ORANGE ORBIT', accent: '#ff8800', chapter: 1 },
  { id: 8, name: 'GRAYSCALE', accent: '#808080', chapter: 1 },
  { id: 9, name: 'INFRARED MAZE', accent: '#ff4400', chapter: 1 },
  { id: 10, name: 'ULTRAVIOLET', accent: '#a020ff', chapter: 1 },
  { id: 11, name: 'CMYK SPLIT', accent: '#00ffff', chapter: 1 },
  { id: 12, name: 'COMPLEMENTARY SHIFT', accent: '#ff30ff', chapter: 1 },
  { id: 13, name: 'RAINBOW BRIDGE', accent: '#ff30ff', chapter: 1 },
];

export function createLevel(id) {
  const LevelClass = LEVEL_REGISTRY[id];
  if (!LevelClass) throw new Error(`Level ${id} not found`);
  return new LevelClass();
}
