/**
 * Economy System Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateInnCost,
  getUnlockedItems,
  rollMaterialDrops,
  rollGoldDrop,
} from './economy';
import type { ShopRecipe } from '../types/economy';
import type { EnemyDefinition } from '../types/combat';

function createTestEnemy(overrides?: Partial<EnemyDefinition>): EnemyDefinition {
  return {
    id: 'test-enemy',
    name: 'Test Enemy',
    stats: { str: 10, vit: 10, int: 10, wis: 10, agi: 10, luc: 10 },
    maxHp: 30,
    maxTp: 10,
    skills: [],
    aiPattern: 'aggressive',
    dropTable: {
      materials: [
        { materialId: 'slime-gel', chance: 0.6 },
        { materialId: 'slime-core', chance: 0.15 },
      ],
      xp: 20,
      gold: { min: 5, max: 15 },
    },
    ...overrides,
  };
}

describe('calculateInnCost', () => {
  it('calculates full rest cost based on level', () => {
    expect(calculateInnCost(1, 1.0)).toBe(15); // 10 + 1*5
    expect(calculateInnCost(5, 1.0)).toBe(35); // 10 + 5*5
    expect(calculateInnCost(10, 1.0)).toBe(60); // 10 + 10*5
  });

  it('calculates partial rest at half cost', () => {
    expect(calculateInnCost(1, 0.5)).toBe(7); // floor(15 * 0.5)
    expect(calculateInnCost(5, 0.5)).toBe(17); // floor(35 * 0.5)
  });
});

describe('getUnlockedItems', () => {
  const recipes: ShopRecipe[] = [
    {
      unlocksItemId: 'iron-mace',
      requirements: [{ materialId: 'slime-gel', quantity: 3 }],
    },
    {
      unlocksItemId: 'leather-vest',
      requirements: [{ materialId: 'slime-gel', quantity: 5 }],
    },
    {
      unlocksItemId: 'speed-charm',
      requirements: [{ materialId: 'slime-core', quantity: 2 }],
    },
  ];

  it('returns empty when no materials sold', () => {
    expect(getUnlockedItems({}, recipes)).toEqual([]);
  });

  it('unlocks items when requirements met', () => {
    const sold = { 'slime-gel': 3 };
    expect(getUnlockedItems(sold, recipes)).toEqual(['iron-mace']);
  });

  it('unlocks multiple items when enough sold', () => {
    const sold = { 'slime-gel': 5, 'slime-core': 2 };
    const unlocked = getUnlockedItems(sold, recipes);
    expect(unlocked).toContain('iron-mace');
    expect(unlocked).toContain('leather-vest');
    expect(unlocked).toContain('speed-charm');
  });

  it('does not unlock when partially met', () => {
    const sold = { 'slime-gel': 2 };
    expect(getUnlockedItems(sold, recipes)).toEqual([]);
  });
});

describe('rollMaterialDrops', () => {
  it('drops materials when RNG below chance', () => {
    const enemy = createTestEnemy();
    // RNG returns 0.1 — below both 0.6 and 0.15
    const drops = rollMaterialDrops(enemy, () => 0.1);
    expect(drops).toHaveLength(2);
    expect(drops[0].materialId).toBe('slime-gel');
    expect(drops[1].materialId).toBe('slime-core');
  });

  it('drops nothing when RNG above all chances', () => {
    const enemy = createTestEnemy();
    const drops = rollMaterialDrops(enemy, () => 0.99);
    expect(drops).toHaveLength(0);
  });

  it('drops only high-chance materials', () => {
    const enemy = createTestEnemy();
    // 0.3 is below 0.6 (slime-gel) but above 0.15 (slime-core)
    const drops = rollMaterialDrops(enemy, () => 0.3);
    expect(drops).toHaveLength(1);
    expect(drops[0].materialId).toBe('slime-gel');
  });
});

describe('rollGoldDrop', () => {
  it('returns min when RNG is 0', () => {
    const enemy = createTestEnemy();
    expect(rollGoldDrop(enemy, () => 0)).toBe(5);
  });

  it('returns max when RNG approaches 1', () => {
    const enemy = createTestEnemy();
    expect(rollGoldDrop(enemy, () => 0.99)).toBe(15);
  });

  it('returns values in range', () => {
    const enemy = createTestEnemy();
    const gold = rollGoldDrop(enemy, () => 0.5);
    expect(gold).toBeGreaterThanOrEqual(5);
    expect(gold).toBeLessThanOrEqual(15);
  });
});
