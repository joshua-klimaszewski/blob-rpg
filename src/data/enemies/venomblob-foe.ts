/**
 * Venomblob FOE - Floor 2 Chase
 *
 * A toxic blob that secretes deadly poison. Aggressively chases intruders.
 * Poison specialist with multiple ailment skills.
 */

import type { EnemyDefinition } from '../../types/combat';

export const ENEMY_VENOMBLOB_FOE: EnemyDefinition = {
  id: 'venomblob-foe',
  name: 'Venomblob',
  stats: {
    str: 16,
    vit: 15,
    int: 18,
    wis: 14,
    agi: 14,
    luc: 12,
  },
  maxHp: 140,
  maxTp: 50,
  skills: [
    'slime-acid-splash',
    'poison-cloud',
    'paralyzing-pollen',
  ],
  aiPattern: 'aggressive',
  dropTable: {
    materials: [
      { materialId: 'venom-sac', chance: 0.9 },
      { materialId: 'toxic-gel', chance: 0.7 },
      { materialId: 'slime-core', chance: 0.4 },
    ],
    xp: 150,
    gold: { min: 60, max: 100 },
  },
};
