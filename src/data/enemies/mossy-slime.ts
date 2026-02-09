/**
 * Mossy Slime Enemy Definition
 *
 * Floor 1-2 defensive enemy that self-buffs VIT.
 */

import type { EnemyDefinition } from '../../types/combat';

export const ENEMY_MOSSY_SLIME: EnemyDefinition = {
  id: 'mossy-slime',
  name: 'Mossy Slime',
  stats: {
    str: 6,
    vit: 8,
    int: 4,
    wis: 5,
    agi: 4,
    luc: 4,
  },
  maxHp: 40,
  maxTp: 15,
  skills: ['mossy-shield', 'slime-acid-splash'],
  aiPattern: 'defensive',
  dropTable: {
    materials: [
      { materialId: 'slime-gel', chance: 0.5 },
      { materialId: 'slime-core', chance: 0.2 },
    ],
    xp: 25,
    gold: { min: 8, max: 18 },
  },
};
