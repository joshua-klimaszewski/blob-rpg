/**
 * Economy System - Pure TypeScript Logic
 *
 * Functions for inn costs, shop unlocks, material drops, and gold.
 * No React imports, no side effects. Injectable RNG for testing.
 */

import type { ShopRecipe } from '../types/economy';
import type { EnemyDefinition } from '../types/combat';
import type { RNG } from './combat';

/**
 * Calculate inn rest cost based on average party level.
 * Full rest costs more than partial rest.
 */
export function calculateInnCost(
  avgLevel: number,
  fraction: number,
): number {
  const baseCost = 10 + avgLevel * 5;
  return Math.floor(baseCost * fraction);
}

/**
 * Determine which equipment items are unlocked based on cumulative sold materials.
 * Returns the set of equipment IDs available for purchase.
 */
export function getUnlockedItems(
  soldMaterials: Record<string, number>,
  recipes: ShopRecipe[],
): string[] {
  const unlocked: string[] = [];

  for (const recipe of recipes) {
    const meetsAll = recipe.requirements.every(
      (req) => (soldMaterials[req.materialId] ?? 0) >= req.quantity,
    );
    if (meetsAll) {
      unlocked.push(recipe.unlocksItemId);
    }
  }

  return unlocked;
}

/**
 * Roll material drops from a defeated enemy.
 * Each material in the drop table is rolled independently.
 */
export function rollMaterialDrops(
  enemy: EnemyDefinition,
  rng: RNG,
): Array<{ materialId: string; quantity: number }> {
  const drops: Array<{ materialId: string; quantity: number }> = [];

  for (const entry of enemy.dropTable.materials) {
    if (rng() < entry.chance) {
      drops.push({ materialId: entry.materialId, quantity: 1 });
    }
  }

  return drops;
}

/**
 * Roll gold drop from a defeated enemy.
 * Returns a value in [min, max] range.
 */
export function rollGoldDrop(
  enemy: EnemyDefinition,
  rng: RNG,
): number {
  const { min, max } = enemy.dropTable.gold;
  return min + Math.floor(rng() * (max - min + 1));
}
