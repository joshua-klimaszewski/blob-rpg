/**
 * Caveworm Enemy Definition
 *
 * Floor 3 aggressive enemy with arm bind and high STR.
 */

import type { EnemyDefinition } from '../../types/combat';

export const ENEMY_CAVEWORM: EnemyDefinition = {
  id: 'caveworm',
  name: 'Caveworm',
  stats: {
    str: 14,
    vit: 7,
    int: 3,
    wis: 4,
    agi: 5,
    luc: 4,
  },
  maxHp: 45,
  maxTp: 12,
  skills: ['burrow-strike', 'constrict'],
  aiPattern: 'aggressive',
  dropTable: {
    materials: [
      { materialId: 'tough-carapace', chance: 0.45 },
    ],
    xp: 35,
    gold: { min: 12, max: 22 },
  },
};
