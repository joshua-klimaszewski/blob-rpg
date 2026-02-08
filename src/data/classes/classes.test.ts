/**
 * Class & Skill Data Integrity Tests
 */

import { describe, it, expect } from 'vitest';
import {
  getAllClasses,
  getClass,
  getSkill,
  getClassSkills,
  IRONBLOB_SKILLS,
  STRIKBLOB_SKILLS,
  HEXBLOB_SKILLS,
  SPARKBLOB_SKILLS,
  MENDBLOB_SKILLS,
  TOXBLOB_SKILLS,
} from './index';

const ALL_SKILL_ARRAYS = [
  IRONBLOB_SKILLS,
  STRIKBLOB_SKILLS,
  HEXBLOB_SKILLS,
  SPARKBLOB_SKILLS,
  MENDBLOB_SKILLS,
  TOXBLOB_SKILLS,
];

describe('Class Registry', () => {
  it('has 6 classes', () => {
    expect(getAllClasses()).toHaveLength(6);
  });

  it('can look up each class by ID', () => {
    const ids = ['ironblob', 'strikblob', 'hexblob', 'sparkblob', 'mendblob', 'toxblob'];
    for (const id of ids) {
      const cls = getClass(id);
      expect(cls.id).toBe(id);
      expect(cls.name).toBeTruthy();
      expect(cls.role).toBeTruthy();
    }
  });

  it('throws for unknown class ID', () => {
    expect(() => getClass('unknown')).toThrow('Unknown class');
  });

  it('each class has 6 skills', () => {
    for (const cls of getAllClasses()) {
      expect(cls.skillIds).toHaveLength(6);
    }
  });

  it('each class has valid base stats', () => {
    for (const cls of getAllClasses()) {
      expect(cls.baseStats.str).toBeGreaterThan(0);
      expect(cls.baseStats.vit).toBeGreaterThan(0);
      expect(cls.baseHp).toBeGreaterThan(0);
      expect(cls.baseTp).toBeGreaterThan(0);
      expect(cls.hpGrowth).toBeGreaterThan(0);
      expect(cls.tpGrowth).toBeGreaterThan(0);
    }
  });

  it('each class has positive growth rates', () => {
    for (const cls of getAllClasses()) {
      const totalGrowth = Object.values(cls.growth).reduce((sum, v) => sum + v, 0);
      expect(totalGrowth).toBeGreaterThan(0);
    }
  });
});

describe('Skill Registry', () => {
  it('has 36 total skills (6 per class)', () => {
    const total = ALL_SKILL_ARRAYS.reduce((sum, arr) => sum + arr.length, 0);
    expect(total).toBe(36);
  });

  it('can look up each skill by ID', () => {
    for (const skills of ALL_SKILL_ARRAYS) {
      for (const skill of skills) {
        const looked = getSkill(skill.id);
        expect(looked.id).toBe(skill.id);
      }
    }
  });

  it('throws for unknown skill ID', () => {
    expect(() => getSkill('unknown')).toThrow('Unknown skill');
  });

  it('all skill IDs are unique', () => {
    const allIds = ALL_SKILL_ARRAYS.flat().map((s) => s.id);
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it('each skill references its parent class', () => {
    for (const skills of ALL_SKILL_ARRAYS) {
      for (const skill of skills) {
        expect(() => getClass(skill.classId)).not.toThrow();
      }
    }
  });

  it('each non-passive skill has TP cost > 0', () => {
    for (const skills of ALL_SKILL_ARRAYS) {
      for (const skill of skills) {
        if (!skill.isPassive) {
          expect(skill.tpCost).toBeGreaterThan(0);
        }
      }
    }
  });

  it('each passive skill has TP cost 0', () => {
    for (const skills of ALL_SKILL_ARRAYS) {
      for (const skill of skills) {
        if (skill.isPassive) {
          expect(skill.tpCost).toBe(0);
        }
      }
    }
  });

  it('each skill has at least one effect', () => {
    for (const skills of ALL_SKILL_ARRAYS) {
      for (const skill of skills) {
        expect(skill.effects.length).toBeGreaterThan(0);
      }
    }
  });

  it('getClassSkills returns skills in order for each class', () => {
    for (const cls of getAllClasses()) {
      const skills = getClassSkills(cls.id);
      expect(skills).toHaveLength(6);
      for (let i = 0; i < skills.length; i++) {
        expect(skills[i].id).toBe(cls.skillIds[i]);
      }
    }
  });

  it('each class has exactly one passive skill', () => {
    for (const skills of ALL_SKILL_ARRAYS) {
      const passives = skills.filter((s) => s.isPassive);
      expect(passives).toHaveLength(1);
    }
  });
});
