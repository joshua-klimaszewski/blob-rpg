/**
 * Elite Crystal Beetle Enemy Definition
 *
 * FOE-exclusive variant. Ultra-defensive tank with displacement.
 * 2x HP, +30% stats, enhanced shell guard.
 */

import type { EnemyDefinition } from '../../types/combat'

export const ENEMY_ELITE_CRYSTAL_BEETLE: EnemyDefinition = {
  id: 'elite-crystal-beetle',
  name: 'Elite Crystal Beetle',
  stats: {
    str: 13, // +30% from 10
    vit: 16, // +30% from 12
    int: 4, // +30% from 3
    wis: 7, // +30% from 5
    agi: 5, // +30% from 4
    luc: 7, // +30% from 5
  },
  maxHp: 100, // 2x crystal beetle (50 -> 100)
  maxTp: 20,
  skills: ['shell-guard', 'horn-charge', 'push-back'],
  aiPattern: 'defensive',
  dropTable: {
    materials: [
      { materialId: 'crystal-shard', chance: 0.7 },
      { materialId: 'pristine-shell', chance: 0.3 },
    ],
    xp: 80,
    gold: { min: 30, max: 50 },
  },
}
