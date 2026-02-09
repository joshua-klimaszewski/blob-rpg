/**
 * Slime Enemy Definition
 *
 * MVP test enemy for Phase 3 combat system.
 */

import type { EnemyDefinition } from '../../types/combat';

export const ENEMY_SLIME: EnemyDefinition = {
  id: 'slime',
  name: 'Slime',
  stats: {
    str: 8,
    vit: 5,
    int: 3,
    wis: 4,
    agi: 6,
    luc: 5,
  },
  maxHp: 30,
  maxTp: 10,
  skills: ['slime-acid-splash', 'slime-sticky-slap'],
  aiPattern: 'aggressive',
  dropTable: {
    materials: [
      { materialId: 'slime-gel', chance: 0.6 },
      { materialId: 'slime-core', chance: 0.15 },
    ],
    xp: 20,
    gold: { min: 5, max: 15 },
  },
};
