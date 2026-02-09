/**
 * Fungoid Enemy Definition
 *
 * Floor 2 aggressive caster with sleep AoE.
 */

import type { EnemyDefinition } from '../../types/combat';

export const ENEMY_FUNGOID: EnemyDefinition = {
  id: 'fungoid',
  name: 'Fungoid',
  stats: {
    str: 6,
    vit: 6,
    int: 8,
    wis: 6,
    agi: 5,
    luc: 4,
  },
  maxHp: 35,
  maxTp: 20,
  skills: ['fungal-slam', 'spore-burst'],
  aiPattern: 'aggressive',
  dropTable: {
    materials: [
      { materialId: 'fungal-cap', chance: 0.55 },
    ],
    xp: 30,
    gold: { min: 10, max: 20 },
  },
};
