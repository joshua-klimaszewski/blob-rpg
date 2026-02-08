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
  skills: [], // MVP: No skills yet
  aiPattern: 'aggressive',
  dropTable: {
    materials: [],
    xp: 20,
  },
};
