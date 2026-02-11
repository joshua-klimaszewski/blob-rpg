/**
 * Thornblob FOE - Floor 1 Patrol
 *
 * A unique spiky blob covered in thorns. Patrols the first floor corridors.
 * Physical attacker that can bind limbs with its thorny tendrils.
 */

import type { EnemyDefinition } from '../../types/combat';

export const ENEMY_THORNBLOB_FOE: EnemyDefinition = {
  id: 'thornblob-foe',
  name: 'Thornblob',
  stats: {
    str: 18,
    vit: 14,
    int: 8,
    wis: 10,
    agi: 12,
    luc: 8,
  },
  maxHp: 120,
  maxTp: 30,
  skills: [
    'slime-acid-splash',
    'slime-sticky-slap',
    'leg-bind-basic',
    'arm-bind-basic',
  ],
  aiPattern: 'aggressive',
  dropTable: {
    materials: [
      { materialId: 'thorn-fragment', chance: 0.8 },
      { materialId: 'slime-gel', chance: 0.5 },
      { materialId: 'slime-core', chance: 0.3 },
    ],
    xp: 80,
    gold: { min: 30, max: 60 },
  },
};
