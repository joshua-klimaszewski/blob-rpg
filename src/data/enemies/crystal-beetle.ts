/**
 * Crystal Beetle Enemy Definition
 *
 * Floor 3 defensive enemy with high VIT and push attack.
 */

import type { EnemyDefinition } from '../../types/combat';

export const ENEMY_CRYSTAL_BEETLE: EnemyDefinition = {
  id: 'crystal-beetle',
  name: 'Crystal Beetle',
  stats: {
    str: 10,
    vit: 12,
    int: 3,
    wis: 5,
    agi: 4,
    luc: 5,
  },
  maxHp: 50,
  maxTp: 12,
  skills: ['shell-guard', 'horn-charge'],
  aiPattern: 'defensive',
  dropTable: {
    materials: [
      { materialId: 'crystal-shard', chance: 0.4 },
    ],
    xp: 40,
    gold: { min: 15, max: 25 },
  },
};
