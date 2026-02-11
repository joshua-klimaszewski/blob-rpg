/**
 * Guardblob FOE - Floor 1 Stationary
 *
 * A fortified blob with hardened exterior. Guards a specific location.
 * Defensive tank that buffs itself and has high VIT.
 */

import type { EnemyDefinition } from '../../types/combat';

export const ENEMY_GUARDBLOB_FOE: EnemyDefinition = {
  id: 'guardblob-foe',
  name: 'Guardblob',
  stats: {
    str: 15,
    vit: 20,
    int: 8,
    wis: 12,
    agi: 8,
    luc: 10,
  },
  maxHp: 150,
  maxTp: 35,
  skills: [
    'slime-acid-splash',
    'mossy-shield', // Self-buff for VIT
  ],
  aiPattern: 'defensive',
  dropTable: {
    materials: [
      { materialId: 'hardened-gel', chance: 0.8 },
      { materialId: 'slime-core', chance: 0.4 },
      { materialId: 'slime-gel', chance: 0.6 },
    ],
    xp: 90,
    gold: { min: 40, max: 70 },
  },
};
