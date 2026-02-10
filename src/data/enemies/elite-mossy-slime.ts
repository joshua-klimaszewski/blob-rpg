/**
 * Elite Mossy Slime Enemy Definition
 *
 * FOE-exclusive variant. Defensive tank with high VIT and self-buff.
 * 2x HP, +30% stats, enhanced shield skill.
 */

import type { EnemyDefinition } from '../../types/combat'

export const ENEMY_ELITE_MOSSY_SLIME: EnemyDefinition = {
  id: 'elite-mossy-slime',
  name: 'Elite Mossy Slime',
  stats: {
    str: 8, // +30% from 6
    vit: 11, // +30% from 8
    int: 5, // +30% from 4
    wis: 7, // +30% from 5
    agi: 5, // +30% from 4
    luc: 5, // +30% from 4
  },
  maxHp: 80, // 2x standard mossy slime (40 -> 80)
  maxTp: 25,
  skills: ['mossy-shield', 'slime-acid-splash', 'arm-bind-basic'],
  aiPattern: 'defensive',
  dropTable: {
    materials: [
      { materialId: 'slime-gel', chance: 0.7 },
      { materialId: 'slime-core', chance: 0.5 },
    ],
    xp: 50,
    gold: { min: 20, max: 35 },
  },
}
