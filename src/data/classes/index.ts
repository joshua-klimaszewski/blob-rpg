/**
 * Class & Skill Registry
 *
 * Central lookup for all class definitions and skill data.
 */

import type { ClassDefinition, SkillDefinition } from '../../types/character';
import { IRONBLOB_CLASS, IRONBLOB_SKILLS } from './ironblob';
import { STRIKBLOB_CLASS, STRIKBLOB_SKILLS } from './strikblob';
import { HEXBLOB_CLASS, HEXBLOB_SKILLS } from './hexblob';
import { SPARKBLOB_CLASS, SPARKBLOB_SKILLS } from './sparkblob';
import { MENDBLOB_CLASS, MENDBLOB_SKILLS } from './mendblob';
import { TOXBLOB_CLASS, TOXBLOB_SKILLS } from './toxblob';

/** All class definitions indexed by ID */
const CLASS_REGISTRY: Record<string, ClassDefinition> = {
  [IRONBLOB_CLASS.id]: IRONBLOB_CLASS,
  [STRIKBLOB_CLASS.id]: STRIKBLOB_CLASS,
  [HEXBLOB_CLASS.id]: HEXBLOB_CLASS,
  [SPARKBLOB_CLASS.id]: SPARKBLOB_CLASS,
  [MENDBLOB_CLASS.id]: MENDBLOB_CLASS,
  [TOXBLOB_CLASS.id]: TOXBLOB_CLASS,
};

/** All skill definitions indexed by ID */
const SKILL_REGISTRY: Record<string, SkillDefinition> = {};

for (const skills of [
  IRONBLOB_SKILLS,
  STRIKBLOB_SKILLS,
  HEXBLOB_SKILLS,
  SPARKBLOB_SKILLS,
  MENDBLOB_SKILLS,
  TOXBLOB_SKILLS,
]) {
  for (const skill of skills) {
    SKILL_REGISTRY[skill.id] = skill;
  }
}

/** Get a class definition by ID. Throws if not found. */
export function getClass(id: string): ClassDefinition {
  const cls = CLASS_REGISTRY[id];
  if (!cls) throw new Error(`Unknown class: ${id}`);
  return cls;
}

/** Get a skill definition by ID. Throws if not found. */
export function getSkill(id: string): SkillDefinition {
  const skill = SKILL_REGISTRY[id];
  if (!skill) throw new Error(`Unknown skill: ${id}`);
  return skill;
}

/** Get all class definitions */
export function getAllClasses(): ClassDefinition[] {
  return Object.values(CLASS_REGISTRY);
}

/** Get all skills for a given class */
export function getClassSkills(classId: string): SkillDefinition[] {
  const cls = getClass(classId);
  return cls.skillIds.map((id) => getSkill(id));
}

/** All class definitions (re-exports for direct access) */
export {
  IRONBLOB_CLASS,
  STRIKBLOB_CLASS,
  HEXBLOB_CLASS,
  SPARKBLOB_CLASS,
  MENDBLOB_CLASS,
  TOXBLOB_CLASS,
};

/** All skill arrays (re-exports for direct access) */
export {
  IRONBLOB_SKILLS,
  STRIKBLOB_SKILLS,
  HEXBLOB_SKILLS,
  SPARKBLOB_SKILLS,
  MENDBLOB_SKILLS,
  TOXBLOB_SKILLS,
};
