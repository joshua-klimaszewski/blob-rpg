/**
 * Character System Tests
 */

import { describe, it, expect } from 'vitest';
import type { EntityStats, PartyMemberState } from '../types/combat';
import type { ClassDefinition, SkillDefinition, EquipmentDefinition } from '../types/character';
import {
  MAX_LEVEL,
  xpForLevel,
  checkLevelUp,
  applyLevelUp,
  processLevelUps,
  calculateBaseStats,
  calculateEffectiveStats,
  calculateMaxHp,
  calculateMaxTp,
  recalculatePartyMember,
  canLearnSkill,
  learnSkill,
  createPartyMember,
  getEquipmentBonuses,
  getPassiveStatBonuses,
  getPassiveModifiers,
} from './character';

// ============================================================================
// Test Fixtures
// ============================================================================

function createTestClass(overrides?: Partial<ClassDefinition>): ClassDefinition {
  return {
    id: 'test-class',
    name: 'Testblob',
    role: 'tank',
    description: 'A test class',
    baseStats: { str: 10, vit: 10, int: 5, wis: 5, agi: 8, luc: 5 },
    baseHp: 50,
    baseTp: 20,
    hpGrowth: 5,
    tpGrowth: 2,
    growth: { str: 2.0, vit: 1.5, int: 0.5, wis: 0.5, agi: 1.0, luc: 0.5 },
    skillIds: [],
    ...overrides,
  };
}

function createTestMember(overrides?: Partial<PartyMemberState>): PartyMemberState {
  return {
    id: 'member-1',
    name: 'Testblob',
    classId: 'test-class',
    stats: { str: 10, vit: 10, int: 5, wis: 5, agi: 8, luc: 5 },
    baseStats: { str: 10, vit: 10, int: 5, wis: 5, agi: 8, luc: 5 },
    maxHp: 50,
    hp: 50,
    maxTp: 20,
    tp: 20,
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
    ...overrides,
  };
}

function createTestSkill(overrides?: Partial<SkillDefinition>): SkillDefinition {
  return {
    id: 'test-skill',
    name: 'Test Skill',
    description: 'A test skill',
    classId: 'test-class',
    tpCost: 5,
    targetType: 'single-tile',
    bodyPartRequired: null,
    levelRequired: 1,
    skillPointCost: 1,
    effects: [{ type: 'damage', stat: 'str', multiplier: 1.0 }],
    isPassive: false,
    ...overrides,
  };
}

function createTestEquipment(overrides?: Partial<EquipmentDefinition>): EquipmentDefinition {
  return {
    id: 'test-weapon',
    name: 'Test Weapon',
    slot: 'weapon',
    bonuses: { str: 3 },
    classRestriction: null,
    description: 'A test weapon',
    buyPrice: 50,
    ...overrides,
  };
}

// ============================================================================
// XP & Leveling Tests
// ============================================================================

describe('xpForLevel', () => {
  it('calculates XP threshold correctly', () => {
    expect(xpForLevel(1)).toBe(25);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(5)).toBe(625);
    expect(xpForLevel(10)).toBe(2500);
    expect(xpForLevel(20)).toBe(10000);
  });
});

describe('checkLevelUp', () => {
  const classData = createTestClass();

  it('returns null if not enough XP', () => {
    const member = createTestMember({ xp: 50 });
    expect(checkLevelUp(member, classData)).toBeNull();
  });

  it('returns level-up result when XP is sufficient', () => {
    const member = createTestMember({ xp: 100 });
    const result = checkLevelUp(member, classData);

    expect(result).not.toBeNull();
    expect(result!.newLevel).toBe(2);
    expect(result!.skillPointGain).toBe(1);
    expect(result!.hpGain).toBe(5);
    expect(result!.tpGain).toBe(2);
  });

  it('returns null if already at max level', () => {
    const member = createTestMember({ level: MAX_LEVEL, xp: 999999 });
    expect(checkLevelUp(member, classData)).toBeNull();
  });

  it('calculates stat gains from growth rates (floored)', () => {
    const classWithFractional = createTestClass({
      growth: { str: 1.7, vit: 0.3, int: 0.9, wis: 2.4, agi: 0.1, luc: 1.0 },
    });
    const member = createTestMember({ xp: 400 });
    const result = checkLevelUp(member, classWithFractional);

    expect(result!.statGains.str).toBe(1);
    expect(result!.statGains.vit).toBe(0);
    expect(result!.statGains.int).toBe(0);
    expect(result!.statGains.wis).toBe(2);
    expect(result!.statGains.agi).toBe(0);
    expect(result!.statGains.luc).toBe(1);
  });
});

describe('applyLevelUp', () => {
  it('increases level and stats', () => {
    const member = createTestMember({ xp: 500 });
    const result = checkLevelUp(member, createTestClass())!;
    const updated = applyLevelUp(member, result);

    expect(updated.level).toBe(2);
    expect(updated.baseStats.str).toBe(12); // 10 + 2
    expect(updated.baseStats.vit).toBe(11); // 10 + 1 (floor(1.5))
    expect(updated.maxHp).toBe(55); // 50 + 5
    expect(updated.maxTp).toBe(22); // 20 + 2
    expect(updated.skillPoints).toBe(1);
  });

  it('heals HP/TP by the gain amount', () => {
    const member = createTestMember({ hp: 30, tp: 10, xp: 500 });
    const result = checkLevelUp(member, createTestClass())!;
    const updated = applyLevelUp(member, result);

    expect(updated.hp).toBe(35); // 30 + 5
    expect(updated.tp).toBe(12); // 10 + 2
  });
});

describe('processLevelUps', () => {
  it('handles multiple level ups', () => {
    const member = createTestMember({ xp: 10000 }); // Enough for L1->L5+
    const classData = createTestClass();
    const { member: updated, levelsGained } = processLevelUps(member, classData);

    expect(levelsGained).toBeGreaterThan(1);
    expect(updated.level).toBeGreaterThan(1);
    expect(updated.skillPoints).toBe(levelsGained);
  });

  it('returns 0 levels gained if not enough XP', () => {
    const member = createTestMember({ xp: 0 });
    const { levelsGained } = processLevelUps(member, createTestClass());
    expect(levelsGained).toBe(0);
  });

  it('stops at max level', () => {
    const member = createTestMember({ xp: 999999 });
    const classData = createTestClass();
    const { member: updated } = processLevelUps(member, classData);

    expect(updated.level).toBe(MAX_LEVEL);
  });
});

// ============================================================================
// Stat Calculation Tests
// ============================================================================

describe('calculateBaseStats', () => {
  it('returns base stats at level 1', () => {
    const classData = createTestClass();
    const stats = calculateBaseStats(classData, 1);

    expect(stats).toEqual(classData.baseStats);
  });

  it('adds growth per level (floored)', () => {
    const classData = createTestClass({
      baseStats: { str: 10, vit: 8, int: 5, wis: 5, agi: 6, luc: 5 },
      growth: { str: 2.0, vit: 1.5, int: 0.5, wis: 0.5, agi: 1.0, luc: 0.5 },
    });
    const stats = calculateBaseStats(classData, 5); // 4 levels of growth

    expect(stats.str).toBe(18); // 10 + floor(2.0 * 4) = 10 + 8
    expect(stats.vit).toBe(14); // 8 + floor(1.5 * 4) = 8 + 6
    expect(stats.int).toBe(7);  // 5 + floor(0.5 * 4) = 5 + 2
    expect(stats.agi).toBe(10); // 6 + floor(1.0 * 4) = 6 + 4
  });
});

describe('calculateEffectiveStats', () => {
  it('returns base stats with no equipment', () => {
    const base: EntityStats = { str: 10, vit: 10, int: 5, wis: 5, agi: 8, luc: 5 };
    expect(calculateEffectiveStats(base, [])).toEqual(base);
  });

  it('adds equipment bonuses', () => {
    const base: EntityStats = { str: 10, vit: 10, int: 5, wis: 5, agi: 8, luc: 5 };
    const weapon = createTestEquipment({ bonuses: { str: 3, agi: 1 } });
    const armor = createTestEquipment({ bonuses: { vit: 2 } });

    const stats = calculateEffectiveStats(base, [weapon, armor]);
    expect(stats.str).toBe(13);
    expect(stats.vit).toBe(12);
    expect(stats.agi).toBe(9);
  });
});

describe('calculateMaxHp', () => {
  it('calculates HP from class base + growth', () => {
    const classData = createTestClass({ baseHp: 50, hpGrowth: 5 });
    expect(calculateMaxHp(classData, 1, [])).toBe(50);
    expect(calculateMaxHp(classData, 5, [])).toBe(70); // 50 + 5*4
  });

  it('adds equipment HP bonus', () => {
    const classData = createTestClass({ baseHp: 50, hpGrowth: 5 });
    const armor = createTestEquipment({ bonuses: { hp: 10 } });
    expect(calculateMaxHp(classData, 1, [armor])).toBe(60);
  });
});

describe('calculateMaxTp', () => {
  it('calculates TP from class base + growth', () => {
    const classData = createTestClass({ baseTp: 20, tpGrowth: 2 });
    expect(calculateMaxTp(classData, 1, [])).toBe(20);
    expect(calculateMaxTp(classData, 5, [])).toBe(28); // 20 + 2*4
  });

  it('adds equipment TP bonus', () => {
    const classData = createTestClass({ baseTp: 20, tpGrowth: 2 });
    const robe = createTestEquipment({ bonuses: { tp: 5 } });
    expect(calculateMaxTp(classData, 1, [robe])).toBe(25);
  });
});

describe('recalculatePartyMember', () => {
  it('updates stats, maxHp, maxTp from equipment', () => {
    const classData = createTestClass();
    const member = createTestMember();
    const weapon = createTestEquipment({ bonuses: { str: 3 } });
    const armor = createTestEquipment({ bonuses: { vit: 2, hp: 10 } });

    const updated = recalculatePartyMember(member, classData, [weapon, armor]);

    expect(updated.stats.str).toBe(13); // 10 + 3
    expect(updated.stats.vit).toBe(12); // 10 + 2
    expect(updated.maxHp).toBe(60); // 50 + 10
  });

  it('clamps current HP to new max if max decreased', () => {
    const classData = createTestClass({ baseHp: 50 });
    const member = createTestMember({ hp: 50, maxHp: 60 }); // Had HP bonus
    const updated = recalculatePartyMember(member, classData, []);

    expect(updated.maxHp).toBe(50);
    expect(updated.hp).toBe(50); // Clamped down
  });
});

// ============================================================================
// Skill Learning Tests
// ============================================================================

describe('canLearnSkill', () => {
  it('allows learning a valid skill', () => {
    const member = createTestMember({ skillPoints: 1 });
    const skill = createTestSkill();
    expect(canLearnSkill(member, skill).canLearn).toBe(true);
  });

  it('rejects if already learned', () => {
    const member = createTestMember({ learnedSkills: ['test-skill'], skillPoints: 1 });
    const skill = createTestSkill();
    const { canLearn, reason } = canLearnSkill(member, skill);
    expect(canLearn).toBe(false);
    expect(reason).toBe('Already learned');
  });

  it('rejects if level too low', () => {
    const member = createTestMember({ level: 1, skillPoints: 1 });
    const skill = createTestSkill({ levelRequired: 5 });
    const { canLearn, reason } = canLearnSkill(member, skill);
    expect(canLearn).toBe(false);
    expect(reason).toContain('level 5');
  });

  it('rejects if not enough skill points', () => {
    const member = createTestMember({ skillPoints: 0 });
    const skill = createTestSkill({ skillPointCost: 1 });
    const { canLearn, reason } = canLearnSkill(member, skill);
    expect(canLearn).toBe(false);
    expect(reason).toContain('SP');
  });

  it('rejects if wrong class', () => {
    const member = createTestMember({ classId: 'other-class', skillPoints: 1 });
    const skill = createTestSkill({ classId: 'test-class' });
    const { canLearn, reason } = canLearnSkill(member, skill);
    expect(canLearn).toBe(false);
    expect(reason).toBe('Wrong class');
  });
});

describe('learnSkill', () => {
  it('adds skill to learned list and deducts SP', () => {
    const member = createTestMember({ skillPoints: 3 });
    const skill = createTestSkill({ skillPointCost: 1 });
    const updated = learnSkill(member, skill);

    expect(updated.learnedSkills).toContain('test-skill');
    expect(updated.skillPoints).toBe(2);
  });
});

// ============================================================================
// Party Member Creation Tests
// ============================================================================

describe('createPartyMember', () => {
  it('creates a level 1 member with class base stats', () => {
    const classData = createTestClass({
      baseStats: { str: 12, vit: 10, int: 4, wis: 6, agi: 5, luc: 5 },
      baseHp: 50,
      baseTp: 20,
    });

    const member = createPartyMember('party-1', 'Ironblob', classData);

    expect(member.level).toBe(1);
    expect(member.xp).toBe(0);
    expect(member.skillPoints).toBe(0);
    expect(member.learnedSkills).toEqual([]);
    expect(member.hp).toBe(50);
    expect(member.maxHp).toBe(50);
    expect(member.tp).toBe(20);
    expect(member.maxTp).toBe(20);
    expect(member.stats).toEqual(classData.baseStats);
    expect(member.baseStats).toEqual(classData.baseStats);
    expect(member.classId).toBe('test-class');
  });

  it('initializes empty equipment slots', () => {
    const member = createPartyMember('p-1', 'Blob', createTestClass());
    expect(member.equipment.weapon).toBeNull();
    expect(member.equipment.armor).toBeNull();
    expect(member.equipment.accessory1).toBeNull();
    expect(member.equipment.accessory2).toBeNull();
  });
});

describe('getEquipmentBonuses', () => {
  it('returns zero bonuses for empty equipment', () => {
    const bonuses = getEquipmentBonuses([]);
    expect(bonuses.str ?? 0).toBe(0);
    expect(bonuses.hp ?? 0).toBe(0);
  });

  it('sums bonuses from multiple equipment', () => {
    const weapon = createTestEquipment({ bonuses: { str: 3, agi: 1 } });
    const armor = createTestEquipment({ bonuses: { vit: 2, hp: 10 } });
    const bonuses = getEquipmentBonuses([weapon, armor]);

    expect(bonuses.str).toBe(3);
    expect(bonuses.vit).toBe(2);
    expect(bonuses.agi).toBe(1);
    expect(bonuses.hp).toBe(10);
  });
});

// ============================================================================
// Passive Skill Bonus Tests
// ============================================================================

function createTestPassiveSkill(overrides?: Partial<SkillDefinition>): SkillDefinition {
  return {
    id: 'test-passive',
    name: 'Test Passive',
    description: 'A test passive',
    classId: 'test-class',
    tpCost: 0,
    targetType: 'self',
    bodyPartRequired: null,
    levelRequired: 3,
    skillPointCost: 1,
    effects: [],
    isPassive: true,
    passiveModifier: { type: 'flat-stat', stat: 'vit', amount: 2 },
    ...overrides,
  };
}

describe('getPassiveStatBonuses', () => {
  it('returns zero bonuses when no passives learned', () => {
    const lookup = () => createTestSkill();
    const bonuses = getPassiveStatBonuses([], lookup);
    expect(bonuses).toEqual({ str: 0, vit: 0, int: 0, wis: 0, agi: 0, luc: 0 });
  });

  it('returns flat stat bonuses from learned passives', () => {
    const passive = createTestPassiveSkill({
      id: 'vit-passive',
      passiveModifier: { type: 'flat-stat', stat: 'vit', amount: 2 },
    });
    const lookup = (id: string) => id === 'vit-passive' ? passive : createTestSkill();
    const bonuses = getPassiveStatBonuses(['vit-passive'], lookup);
    expect(bonuses.vit).toBe(2);
    expect(bonuses.str).toBe(0);
  });

  it('ignores non-stat passive modifiers', () => {
    const passive = createTestPassiveSkill({
      id: 'bind-passive',
      passiveModifier: { type: 'bind-duration-bonus', amount: 1 },
    });
    const lookup = (id: string) => id === 'bind-passive' ? passive : createTestSkill();
    const bonuses = getPassiveStatBonuses(['bind-passive'], lookup);
    expect(bonuses).toEqual({ str: 0, vit: 0, int: 0, wis: 0, agi: 0, luc: 0 });
  });

  it('sums multiple passive stat bonuses', () => {
    const vitPassive = createTestPassiveSkill({
      id: 'vit-passive',
      passiveModifier: { type: 'flat-stat', stat: 'vit', amount: 2 },
    });
    const agiPassive = createTestPassiveSkill({
      id: 'agi-passive',
      passiveModifier: { type: 'flat-stat', stat: 'agi', amount: 3 },
    });
    const lookup = (id: string) => {
      if (id === 'vit-passive') return vitPassive;
      if (id === 'agi-passive') return agiPassive;
      return createTestSkill();
    };
    const bonuses = getPassiveStatBonuses(['vit-passive', 'agi-passive'], lookup);
    expect(bonuses.vit).toBe(2);
    expect(bonuses.agi).toBe(3);
  });
});

describe('getPassiveModifiers', () => {
  it('returns all passive modifiers from learned skills', () => {
    const bindPassive = createTestPassiveSkill({
      id: 'bind-passive',
      passiveModifier: { type: 'bind-duration-bonus', amount: 1 },
    });
    const poisonPassive = createTestPassiveSkill({
      id: 'poison-passive',
      passiveModifier: { type: 'poison-damage-bonus', amount: 2 },
    });
    const lookup = (id: string) => {
      if (id === 'bind-passive') return bindPassive;
      if (id === 'poison-passive') return poisonPassive;
      return createTestSkill();
    };
    const mods = getPassiveModifiers(['bind-passive', 'poison-passive'], lookup);
    expect(mods).toHaveLength(2);
    expect(mods[0].type).toBe('bind-duration-bonus');
    expect(mods[1].type).toBe('poison-damage-bonus');
  });
});

describe('calculateEffectiveStats with passives', () => {
  it('adds passive bonuses to effective stats', () => {
    const base: EntityStats = { str: 10, vit: 10, int: 5, wis: 5, agi: 8, luc: 5 };
    const passiveBonuses: EntityStats = { str: 0, vit: 2, int: 0, wis: 0, agi: 3, luc: 0 };
    const stats = calculateEffectiveStats(base, [], passiveBonuses);
    expect(stats.vit).toBe(12);
    expect(stats.agi).toBe(11);
    expect(stats.str).toBe(10);
  });

  it('stacks equipment and passive bonuses', () => {
    const base: EntityStats = { str: 10, vit: 10, int: 5, wis: 5, agi: 8, luc: 5 };
    const weapon = createTestEquipment({ bonuses: { str: 3 } });
    const passiveBonuses: EntityStats = { str: 0, vit: 2, int: 0, wis: 0, agi: 0, luc: 0 };
    const stats = calculateEffectiveStats(base, [weapon], passiveBonuses);
    expect(stats.str).toBe(13);
    expect(stats.vit).toBe(12);
  });
});

describe('recalculatePartyMember with skillLookup', () => {
  it('includes passive stat bonuses when skillLookup provided', () => {
    const classData = createTestClass();
    const passive = createTestPassiveSkill({
      id: 'vit-passive',
      passiveModifier: { type: 'flat-stat', stat: 'vit', amount: 2 },
    });
    const member = createTestMember({ learnedSkills: ['vit-passive'] });
    const lookup = (id: string) => id === 'vit-passive' ? passive : createTestSkill();

    const updated = recalculatePartyMember(member, classData, [], lookup);
    expect(updated.stats.vit).toBe(12); // 10 base + 2 passive
  });

  it('works without skillLookup (backward compatible)', () => {
    const classData = createTestClass();
    const member = createTestMember({ learnedSkills: ['vit-passive'] });
    const updated = recalculatePartyMember(member, classData, []);
    expect(updated.stats.vit).toBe(10); // No passive bonus applied
  });
});
