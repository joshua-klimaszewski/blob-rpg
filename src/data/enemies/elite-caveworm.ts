/**
 * Elite Caveworm Enemy Definition
 *
 * FOE-exclusive variant. High-damage physical attacker with bind.
 * 2x HP, +30% stats, enhanced constrict skill.
 */

import type { EnemyDefinition } from '../../types/combat'

export const ENEMY_ELITE_CAVEWORM: EnemyDefinition = {
  id: 'elite-caveworm',
  name: 'Elite Caveworm',
  stats: {
    str: 18, // +30% from 14
    vit: 9, // +30% from 7
    int: 4, // +30% from 3
    wis: 5, // +30% from 4
    agi: 7, // +30% from 5
    luc: 5, // +30% from 4
  },
  maxHp: 90, // 2x caveworm (45 -> 90)
  maxTp: 20,
  skills: ['burrow-strike', 'constrict', 'arm-bind-basic'],
  aiPattern: 'aggressive',
  dropTable: {
    materials: [
      { materialId: 'tough-carapace', chance: 0.7 },
      { materialId: 'venomous-fang', chance: 0.3 },
    ],
    xp: 70,
    gold: { min: 25, max: 45 },
  },
}
