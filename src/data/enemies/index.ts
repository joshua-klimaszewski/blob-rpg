/**
 * Enemy Registry
 */

import type { EnemyDefinition } from '../../types/combat';
import { ENEMY_SLIME } from './slime';
import { ENEMY_MOSSY_SLIME } from './mossy-slime';
import { ENEMY_FUNGOID } from './fungoid';
import { ENEMY_SPOREBAT } from './sporebat';
import { ENEMY_CRYSTAL_BEETLE } from './crystal-beetle';
import { ENEMY_CAVEWORM } from './caveworm';

const ALL_ENEMIES: EnemyDefinition[] = [
  ENEMY_SLIME,
  ENEMY_MOSSY_SLIME,
  ENEMY_FUNGOID,
  ENEMY_SPOREBAT,
  ENEMY_CRYSTAL_BEETLE,
  ENEMY_CAVEWORM,
];

const ENEMY_REGISTRY: Record<string, EnemyDefinition> = {};
for (const enemy of ALL_ENEMIES) {
  ENEMY_REGISTRY[enemy.id] = enemy;
}

/** Get enemy definition by ID */
export function getEnemy(id: string): EnemyDefinition | undefined {
  return ENEMY_REGISTRY[id];
}
