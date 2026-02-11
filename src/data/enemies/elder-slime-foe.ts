/**
 * Elder Slime FOE - Floor 3 Boss
 *
 * An ancient, massive slime of immense power. The guardian of the deep floors.
 * Well-rounded boss with high stats and diverse skill set.
 */

import type { EnemyDefinition } from '../../types/combat';

export const ENEMY_ELDER_SLIME_FOE: EnemyDefinition = {
  id: 'elder-slime-foe',
  name: 'Elder Slime',
  stats: {
    str: 22,
    vit: 20,
    int: 20,
    wis: 18,
    agi: 16,
    luc: 15,
  },
  maxHp: 250,
  maxTp: 80,
  skills: [
    'slime-acid-splash',
    'slime-sticky-slap',
    'arm-bind-basic',
    'leg-bind-basic',
    'poison-cloud',
    'push-back',
  ],
  aiPattern: 'defensive',
  dropTable: {
    materials: [
      { materialId: 'ancient-core', chance: 1.0 },
      { materialId: 'elder-essence', chance: 0.8 },
      { materialId: 'slime-core', chance: 0.9 },
      { materialId: 'slime-gel', chance: 1.0 },
    ],
    xp: 300,
    gold: { min: 150, max: 250 },
  },
};
