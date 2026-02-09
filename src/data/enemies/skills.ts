/**
 * Enemy Skill Definitions
 *
 * Skills used by enemy types. Separate from class skills
 * to keep player and enemy skill pools independent.
 */

import type { SkillDefinition } from '../../types/character';

export const ENEMY_SKILLS: SkillDefinition[] = [
  {
    id: 'slime-acid-splash',
    name: 'Acid Splash',
    description: 'Splash of corrosive acid that hits a tile.',
    classId: 'enemy',
    tpCost: 3,
    targetType: 'single-tile',
    bodyPartRequired: null,
    levelRequired: 1,
    skillPointCost: 0,
    isPassive: false,
    effects: [
      { type: 'damage', stat: 'int', multiplier: 1.2 },
    ],
  },
  {
    id: 'slime-sticky-slap',
    name: 'Sticky Slap',
    description: 'A sticky attack that may bind the target\'s legs.',
    classId: 'enemy',
    tpCost: 4,
    targetType: 'single-tile',
    bodyPartRequired: null,
    levelRequired: 1,
    skillPointCost: 0,
    isPassive: false,
    effects: [
      { type: 'damage', stat: 'str', multiplier: 0.8 },
      { type: 'bind', bindType: 'leg', chance: 0.4, duration: 2 },
    ],
  },
];

const ENEMY_SKILL_REGISTRY: Record<string, SkillDefinition> = {};
for (const skill of ENEMY_SKILLS) {
  ENEMY_SKILL_REGISTRY[skill.id] = skill;
}

/** Look up an enemy skill by ID */
export function getEnemySkill(id: string): SkillDefinition | undefined {
  return ENEMY_SKILL_REGISTRY[id];
}
