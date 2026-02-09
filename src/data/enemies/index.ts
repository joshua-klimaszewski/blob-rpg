/**
 * Enemy Registry
 */

import type { EnemyDefinition } from '../../types/combat';
import { ENEMY_SLIME } from './slime';

const ALL_ENEMIES: EnemyDefinition[] = [ENEMY_SLIME];

const ENEMY_REGISTRY: Record<string, EnemyDefinition> = {};
for (const enemy of ALL_ENEMIES) {
  ENEMY_REGISTRY[enemy.id] = enemy;
}

/** Get enemy definition by ID */
export function getEnemy(id: string): EnemyDefinition | undefined {
  return ENEMY_REGISTRY[id];
}
