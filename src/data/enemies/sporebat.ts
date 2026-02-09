/**
 * Sporebat Enemy Definition
 *
 * Floor 2-3 fast aggressive enemy with blind.
 */

import type { EnemyDefinition } from '../../types/combat';

export const ENEMY_SPOREBAT: EnemyDefinition = {
  id: 'sporebat',
  name: 'Sporebat',
  stats: {
    str: 7,
    vit: 4,
    int: 5,
    wis: 4,
    agi: 12,
    luc: 6,
  },
  maxHp: 25,
  maxTp: 15,
  skills: ['sonic-screech', 'leech-bite'],
  aiPattern: 'aggressive',
  dropTable: {
    materials: [
      { materialId: 'bat-wing', chance: 0.5 },
    ],
    xp: 28,
    gold: { min: 8, max: 16 },
  },
};
