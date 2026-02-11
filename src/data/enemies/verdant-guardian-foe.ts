/**
 * Verdant Guardian FOE - Floor 1 Exit Puzzle
 *
 * An ancient guardian that patrols the exit corridor. Blocks access to the stairs.
 * Mixed attacker with defensive capabilities and bind skills.
 * This FOE never pursues (canPursue: false) - stays on patrol loop forever.
 */

import type { EnemyDefinition } from '../../types/combat';

export const ENEMY_VERDANT_GUARDIAN_FOE: EnemyDefinition = {
  id: 'verdant-guardian-foe',
  name: 'Verdant Guardian',
  stats: {
    str: 16,
    vit: 18,
    int: 12,
    wis: 14,
    agi: 10,
    luc: 12,
  },
  maxHp: 140,
  maxTp: 40,
  skills: [
    'slime-acid-splash',
    'slime-sticky-slap',
    'mossy-shield', // Self-buff for defense
    'leg-bind-basic', // Can bind legs to prevent escape
  ],
  aiPattern: 'defensive',
  dropTable: {
    materials: [
      { materialId: 'verdant-core', chance: 0.9 },
      { materialId: 'ancient-moss', chance: 0.7 },
      { materialId: 'slime-core', chance: 0.5 },
      { materialId: 'slime-gel', chance: 0.6 },
    ],
    xp: 120,
    gold: { min: 50, max: 90 },
  },
};
