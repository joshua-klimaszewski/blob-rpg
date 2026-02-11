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
import { ENEMY_ELITE_SLIME } from './elite-slime';
import { ENEMY_ELITE_MOSSY_SLIME } from './elite-mossy-slime';
import { ENEMY_ELITE_FUNGOID } from './elite-fungoid';
import { ENEMY_ELITE_CRYSTAL_BEETLE } from './elite-crystal-beetle';
import { ENEMY_ELITE_CAVEWORM } from './elite-caveworm';
import { ENEMY_THORNBLOB_FOE } from './thornblob-foe';
import { ENEMY_GUARDBLOB_FOE } from './guardblob-foe';
import { ENEMY_VENOMBLOB_FOE } from './venomblob-foe';
import { ENEMY_ELDER_SLIME_FOE } from './elder-slime-foe';
import { ENEMY_VERDANT_GUARDIAN_FOE } from './verdant-guardian-foe';

const ALL_ENEMIES: EnemyDefinition[] = [
  ENEMY_SLIME,
  ENEMY_MOSSY_SLIME,
  ENEMY_FUNGOID,
  ENEMY_SPOREBAT,
  ENEMY_CRYSTAL_BEETLE,
  ENEMY_CAVEWORM,
  ENEMY_ELITE_SLIME,
  ENEMY_ELITE_MOSSY_SLIME,
  ENEMY_ELITE_FUNGOID,
  ENEMY_ELITE_CRYSTAL_BEETLE,
  ENEMY_ELITE_CAVEWORM,
  ENEMY_THORNBLOB_FOE,
  ENEMY_GUARDBLOB_FOE,
  ENEMY_VENOMBLOB_FOE,
  ENEMY_ELDER_SLIME_FOE,
  ENEMY_VERDANT_GUARDIAN_FOE,
];

const ENEMY_REGISTRY: Record<string, EnemyDefinition> = {};
for (const enemy of ALL_ENEMIES) {
  ENEMY_REGISTRY[enemy.id] = enemy;
}

/** Get enemy definition by ID */
export function getEnemy(id: string): EnemyDefinition | undefined {
  return ENEMY_REGISTRY[id];
}
