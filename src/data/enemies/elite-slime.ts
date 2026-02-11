/**
 * Elite Slime Enemy Definition
 *
 * FOE-exclusive variant. Significantly tougher than standard slime.
 * 2x HP, +30% stats, access to bind skills.
 */

import type { EnemyDefinition } from '../../types/combat'

export const ENEMY_ELITE_SLIME: EnemyDefinition = {
  id: 'elite-slime',
  name: 'Elite Slime',
  stats: {
    str: 11, // +30% from 8
    vit: 7, // +30% from 5
    int: 4, // +30% from 3
    wis: 5, // +30% from 4
    agi: 8, // +30% from 6
    luc: 7, // +30% from 5
  },
  maxHp: 60, // 2x standard slime (30 -> 60)
  maxTp: 20,
  skills: ['slime-acid-splash', 'slime-sticky-slap', 'leg-bind-basic'],
  aiPattern: 'aggressive',
  dropTable: {
    materials: [
      { materialId: 'slime-gel', chance: 0.8 },
      { materialId: 'slime-core', chance: 0.4 },
    ],
    xp: 40,
    gold: { min: 15, max: 30 },
  },
}
