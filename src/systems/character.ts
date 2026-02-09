/**
 * Character System - Pure TypeScript Logic
 *
 * Handles leveling, stat calculation, skill learning, and party member creation.
 * All functions are pure (no side effects, no React imports).
 */

import type { EntityStats, PartyMemberState } from '../types/combat';
import type {
  ClassDefinition,
  SkillDefinition,
  EquipmentDefinition,
  EquipmentBonuses,
  LevelUpResult,
} from '../types/character';

// ============================================================================
// Constants
// ============================================================================

/** Maximum character level */
export const MAX_LEVEL = 20;

// ============================================================================
// XP & Leveling
// ============================================================================

/**
 * Calculate XP required for a given level.
 * Formula: level * level * 100
 * L2=400, L5=2500, L10=10000, L20=40000
 */
export function xpForLevel(level: number): number {
  return level * level * 100;
}

/**
 * Check if a party member can level up.
 * Returns null if no level up is possible.
 */
export function checkLevelUp(
  member: PartyMemberState,
  classData: ClassDefinition
): LevelUpResult | null {
  if (member.level >= MAX_LEVEL) return null;

  const nextLevel = member.level + 1;
  const requiredXp = xpForLevel(nextLevel);

  if (member.xp < requiredXp) return null;

  const statGains: EntityStats = {
    str: Math.floor(classData.growth.str),
    vit: Math.floor(classData.growth.vit),
    int: Math.floor(classData.growth.int),
    wis: Math.floor(classData.growth.wis),
    agi: Math.floor(classData.growth.agi),
    luc: Math.floor(classData.growth.luc),
  };

  return {
    newLevel: nextLevel,
    statGains,
    hpGain: classData.hpGrowth,
    tpGain: classData.tpGrowth,
    skillPointGain: 1,
  };
}

/**
 * Apply a level-up result to a party member.
 * Returns a new member with updated level, stats, HP/TP, and skill points.
 */
export function applyLevelUp(
  member: PartyMemberState,
  result: LevelUpResult
): PartyMemberState {
  const newBaseStats: EntityStats = {
    str: member.baseStats.str + result.statGains.str,
    vit: member.baseStats.vit + result.statGains.vit,
    int: member.baseStats.int + result.statGains.int,
    wis: member.baseStats.wis + result.statGains.wis,
    agi: member.baseStats.agi + result.statGains.agi,
    luc: member.baseStats.luc + result.statGains.luc,
  };

  const newMaxHp = member.maxHp + result.hpGain;
  const newMaxTp = member.maxTp + result.tpGain;

  return {
    ...member,
    level: result.newLevel,
    baseStats: newBaseStats,
    stats: newBaseStats, // Will be recalculated with equipment later
    maxHp: newMaxHp,
    hp: member.hp + result.hpGain, // Heal the gain amount
    maxTp: newMaxTp,
    tp: member.tp + result.tpGain,
    skillPoints: member.skillPoints + result.skillPointGain,
  };
}

/**
 * Process all pending level-ups for a party member.
 * May level up multiple times if XP is sufficient.
 */
export function processLevelUps(
  member: PartyMemberState,
  classData: ClassDefinition
): { member: PartyMemberState; levelsGained: number } {
  let current = member;
  let levelsGained = 0;

  let result = checkLevelUp(current, classData);
  while (result) {
    current = applyLevelUp(current, result);
    levelsGained++;
    result = checkLevelUp(current, classData);
  }

  return { member: current, levelsGained };
}

// ============================================================================
// Stat Calculation
// ============================================================================

/**
 * Calculate base stats from class definition and level.
 * Base stats at level N = classBase + floor(growth * (N-1))
 */
export function calculateBaseStats(classData: ClassDefinition, level: number): EntityStats {
  const lvlBonus = level - 1;
  return {
    str: classData.baseStats.str + Math.floor(classData.growth.str * lvlBonus),
    vit: classData.baseStats.vit + Math.floor(classData.growth.vit * lvlBonus),
    int: classData.baseStats.int + Math.floor(classData.growth.int * lvlBonus),
    wis: classData.baseStats.wis + Math.floor(classData.growth.wis * lvlBonus),
    agi: classData.baseStats.agi + Math.floor(classData.growth.agi * lvlBonus),
    luc: classData.baseStats.luc + Math.floor(classData.growth.luc * lvlBonus),
  };
}

/**
 * Calculate effective stats from base stats + equipment bonuses.
 */
export function calculateEffectiveStats(
  baseStats: EntityStats,
  equipment: EquipmentDefinition[]
): EntityStats {
  const bonuses = equipment.reduce(
    (acc, eq) => ({
      str: acc.str + (eq.bonuses.str ?? 0),
      vit: acc.vit + (eq.bonuses.vit ?? 0),
      int: acc.int + (eq.bonuses.int ?? 0),
      wis: acc.wis + (eq.bonuses.wis ?? 0),
      agi: acc.agi + (eq.bonuses.agi ?? 0),
      luc: acc.luc + (eq.bonuses.luc ?? 0),
    }),
    { str: 0, vit: 0, int: 0, wis: 0, agi: 0, luc: 0 }
  );

  return {
    str: baseStats.str + bonuses.str,
    vit: baseStats.vit + bonuses.vit,
    int: baseStats.int + bonuses.int,
    wis: baseStats.wis + bonuses.wis,
    agi: baseStats.agi + bonuses.agi,
    luc: baseStats.luc + bonuses.luc,
  };
}

/**
 * Calculate max HP from class, level, and equipment.
 */
export function calculateMaxHp(
  classData: ClassDefinition,
  level: number,
  equipment: EquipmentDefinition[]
): number {
  const baseHp = classData.baseHp + classData.hpGrowth * (level - 1);
  const hpBonus = equipment.reduce((sum, eq) => sum + (eq.bonuses.hp ?? 0), 0);
  return baseHp + hpBonus;
}

/**
 * Calculate max TP from class, level, and equipment.
 */
export function calculateMaxTp(
  classData: ClassDefinition,
  level: number,
  equipment: EquipmentDefinition[]
): number {
  const baseTp = classData.baseTp + classData.tpGrowth * (level - 1);
  const tpBonus = equipment.reduce((sum, eq) => sum + (eq.bonuses.tp ?? 0), 0);
  return baseTp + tpBonus;
}

/**
 * Recalculate all derived fields on a party member.
 * Call after equipping/unequipping or leveling up.
 */
export function recalculatePartyMember(
  member: PartyMemberState,
  classData: ClassDefinition,
  equipment: EquipmentDefinition[]
): PartyMemberState {
  const newStats = calculateEffectiveStats(member.baseStats, equipment);
  const newMaxHp = calculateMaxHp(classData, member.level, equipment);
  const newMaxTp = calculateMaxTp(classData, member.level, equipment);

  return {
    ...member,
    stats: newStats,
    maxHp: newMaxHp,
    hp: Math.min(member.hp, newMaxHp),
    maxTp: newMaxTp,
    tp: Math.min(member.tp, newMaxTp),
  };
}

// ============================================================================
// Skill Learning
// ============================================================================

/**
 * Check if a party member can learn a skill.
 */
export function canLearnSkill(
  member: PartyMemberState,
  skill: SkillDefinition
): { canLearn: boolean; reason?: string } {
  if (member.learnedSkills.includes(skill.id)) {
    return { canLearn: false, reason: 'Already learned' };
  }
  if (member.level < skill.levelRequired) {
    return { canLearn: false, reason: `Requires level ${skill.levelRequired}` };
  }
  if (member.skillPoints < skill.skillPointCost) {
    return { canLearn: false, reason: `Need ${skill.skillPointCost} SP` };
  }
  if (member.classId !== skill.classId) {
    return { canLearn: false, reason: 'Wrong class' };
  }
  return { canLearn: true };
}

/**
 * Learn a skill (deducts skill points, adds to learned list).
 * Caller should check canLearnSkill first.
 */
export function learnSkill(
  member: PartyMemberState,
  skill: SkillDefinition
): PartyMemberState {
  return {
    ...member,
    learnedSkills: [...member.learnedSkills, skill.id],
    skillPoints: member.skillPoints - skill.skillPointCost,
  };
}

// ============================================================================
// Party Member Creation
// ============================================================================

/**
 * Create a new level 1 party member from a class definition.
 */
export function createPartyMember(
  id: string,
  name: string,
  classData: ClassDefinition
): PartyMemberState {
  const baseStats = calculateBaseStats(classData, 1);

  return {
    id,
    name,
    classId: classData.id,
    stats: { ...baseStats },
    baseStats,
    maxHp: classData.baseHp,
    hp: classData.baseHp,
    maxTp: classData.baseTp,
    tp: classData.baseTp,
    level: 1,
    xp: 0,
    skillPoints: 0,
    learnedSkills: [],
    equipment: {
      weapon: null,
      armor: null,
      accessory1: null,
      accessory2: null,
    },
  };
}

/**
 * Get equipment bonuses summary from a list of equipment.
 */
export function getEquipmentBonuses(equipment: EquipmentDefinition[]): EquipmentBonuses {
  return equipment.reduce(
    (acc, eq) => ({
      str: (acc.str ?? 0) + (eq.bonuses.str ?? 0),
      vit: (acc.vit ?? 0) + (eq.bonuses.vit ?? 0),
      int: (acc.int ?? 0) + (eq.bonuses.int ?? 0),
      wis: (acc.wis ?? 0) + (eq.bonuses.wis ?? 0),
      agi: (acc.agi ?? 0) + (eq.bonuses.agi ?? 0),
      luc: (acc.luc ?? 0) + (eq.bonuses.luc ?? 0),
      hp: (acc.hp ?? 0) + (eq.bonuses.hp ?? 0),
      tp: (acc.tp ?? 0) + (eq.bonuses.tp ?? 0),
    }),
    {} as EquipmentBonuses
  );
}
