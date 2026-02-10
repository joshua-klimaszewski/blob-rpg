/**
 * Elite Fungoid Enemy Definition
 *
 * FOE-exclusive variant. Support/debuffer with paralysis and poison.
 * 2x HP, +30% stats, enhanced ailment skills.
 */

import type { EnemyDefinition } from '../../types/combat'

export const ENEMY_ELITE_FUNGOID: EnemyDefinition = {
  id: 'elite-fungoid',
  name: 'Elite Fungoid',
  stats: {
    str: 6, // +30% from ~5
    vit: 8, // +30% from ~6
    int: 10, // +30% from ~8
    wis: 10, // +30% from ~8
    agi: 5, // +30% from ~4
    luc: 8, // +30% from ~6
  },
  maxHp: 70, // 2x estimated base (~35 -> 70)
  maxTp: 30,
  skills: ['fungal-spores', 'paralyzing-pollen', 'poison-cloud'],
  aiPattern: 'defensive',
  dropTable: {
    materials: [
      { materialId: 'fungal-spores', chance: 0.7 },
      { materialId: 'toxic-cap', chance: 0.4 },
    ],
    xp: 45,
    gold: { min: 18, max: 32 },
  },
}
