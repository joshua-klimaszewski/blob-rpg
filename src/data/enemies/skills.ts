/**
 * Enemy Skill Definitions
 *
 * Skills used by enemy types. Separate from class skills
 * to keep player and enemy skill pools independent.
 */

import type { SkillDefinition } from '../../types/character';

export const ENEMY_SKILLS: SkillDefinition[] = [
  // === Slime skills ===
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

  // === Mossy Slime skills ===
  {
    id: 'mossy-shield',
    name: 'Mossy Shield',
    description: 'Hardens mossy exterior, boosting VIT for 3 turns.',
    classId: 'enemy',
    tpCost: 4,
    targetType: 'self',
    bodyPartRequired: null,
    levelRequired: 1,
    skillPointCost: 0,
    isPassive: false,
    effects: [
      { type: 'self-buff', buffStat: 'vit', amount: 5, duration: 3 },
    ],
  },

  // === Fungoid skills ===
  {
    id: 'fungal-slam',
    name: 'Fungal Slam',
    description: 'Slams a target with a heavy fungal arm.',
    classId: 'enemy',
    tpCost: 3,
    targetType: 'single-tile',
    bodyPartRequired: null,
    levelRequired: 1,
    skillPointCost: 0,
    isPassive: false,
    effects: [
      { type: 'damage', stat: 'str', multiplier: 1.0 },
    ],
  },
  {
    id: 'spore-burst',
    name: 'Spore Burst',
    description: 'Releases a cloud of spores that may put targets to sleep.',
    classId: 'enemy',
    tpCost: 6,
    targetType: 'adjacent-tiles',
    bodyPartRequired: 'head',
    levelRequired: 1,
    skillPointCost: 0,
    isPassive: false,
    effects: [
      { type: 'damage', stat: 'int', multiplier: 0.6 },
      { type: 'ailment', ailmentType: 'sleep', chance: 50, duration: 2 },
    ],
  },

  // === Sporebat skills ===
  {
    id: 'sonic-screech',
    name: 'Sonic Screech',
    description: 'A piercing screech that may blind the target.',
    classId: 'enemy',
    tpCost: 4,
    targetType: 'single-tile',
    bodyPartRequired: 'head',
    levelRequired: 1,
    skillPointCost: 0,
    isPassive: false,
    effects: [
      { type: 'damage', stat: 'int', multiplier: 0.5 },
      { type: 'ailment', ailmentType: 'blind', chance: 60, duration: 3 },
    ],
  },
  {
    id: 'leech-bite',
    name: 'Leech Bite',
    description: 'Drains life from the target, healing the attacker.',
    classId: 'enemy',
    tpCost: 5,
    targetType: 'single-tile',
    bodyPartRequired: null,
    levelRequired: 1,
    skillPointCost: 0,
    isPassive: false,
    effects: [
      { type: 'damage', stat: 'str', multiplier: 0.8 },
      { type: 'heal', multiplier: 0.5 },
    ],
  },

  // === Crystal Beetle skills ===
  {
    id: 'shell-guard',
    name: 'Shell Guard',
    description: 'Retreats into shell, boosting VIT for 3 turns.',
    classId: 'enemy',
    tpCost: 3,
    targetType: 'self',
    bodyPartRequired: null,
    levelRequired: 1,
    skillPointCost: 0,
    isPassive: false,
    effects: [
      { type: 'self-buff', buffStat: 'vit', amount: 6, duration: 3 },
    ],
  },
  {
    id: 'horn-charge',
    name: 'Horn Charge',
    description: 'Charges forward, dealing heavy damage and pushing the target back.',
    classId: 'enemy',
    tpCost: 5,
    targetType: 'single-tile',
    bodyPartRequired: null,
    levelRequired: 1,
    skillPointCost: 0,
    isPassive: false,
    effects: [
      { type: 'damage', stat: 'str', multiplier: 1.2 },
      { type: 'displacement', direction: 'push', distance: 1 },
    ],
  },

  // === Caveworm skills ===
  {
    id: 'burrow-strike',
    name: 'Burrow Strike',
    description: 'Erupts from underground, dealing heavy damage that bypasses defense.',
    classId: 'enemy',
    tpCost: 5,
    targetType: 'single-tile',
    bodyPartRequired: null,
    levelRequired: 1,
    skillPointCost: 0,
    isPassive: false,
    effects: [
      { type: 'damage', stat: 'str', multiplier: 1.3 },
    ],
  },
  {
    id: 'constrict',
    name: 'Constrict',
    description: 'Wraps around target, dealing damage and binding arms.',
    classId: 'enemy',
    tpCost: 4,
    targetType: 'single-tile',
    bodyPartRequired: null,
    levelRequired: 1,
    skillPointCost: 0,
    isPassive: false,
    effects: [
      { type: 'damage', stat: 'str', multiplier: 0.7 },
      { type: 'bind', bindType: 'arm', chance: 0.5, duration: 3 },
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
