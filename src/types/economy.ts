/**
 * Economy & Town System Types
 *
 * Type definitions for the Phase 5 town & economy system:
 * materials, consumables, shop recipes, and quests.
 * All types are JSON-serializable for save system compatibility.
 */

// ============================================================================
// Materials & Items
// ============================================================================

/** A material dropped by enemies, used for shop unlocks */
export interface MaterialDefinition {
  id: string;
  name: string;
  description: string;
  /** Base sell price in gold */
  sellPrice: number;
}

/** A consumable item usable in combat or town */
export interface ConsumableDefinition {
  id: string;
  name: string;
  description: string;
  /** Buy price in gold */
  buyPrice: number;
  /** Effect when used */
  effect: ConsumableEffect;
}

/** Consumable effect types */
export type ConsumableEffect =
  | { type: 'heal-hp'; amount: number }
  | { type: 'heal-tp'; amount: number }
  | { type: 'cure-ailments' };

// ============================================================================
// Shop Recipes (Material Unlock System)
// ============================================================================

/** A recipe that unlocks when enough materials have been sold */
export interface ShopRecipe {
  /** Equipment ID that gets unlocked for purchase */
  unlocksItemId: string;
  /** Materials required (cumulative sold count) */
  requirements: Array<{ materialId: string; quantity: number }>;
}

// ============================================================================
// Quests
// ============================================================================

/** Quest objective types */
export type QuestObjective =
  | { type: 'kill'; enemyId: string; count: number }
  | { type: 'gather'; materialId: string; count: number }
  | { type: 'explore'; floorId: string };

/** Quest reward definition */
export interface QuestReward {
  gold: number;
  xp: number;
  /** Optional equipment reward (quest-exclusive) */
  equipmentId?: string;
}

/** A quest available at the guild */
export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  objective: QuestObjective;
  reward: QuestReward;
  /** Floor required to unlock this quest (if any) */
  requiredFloor?: string;
}

/** Active quest with progress tracking */
export interface ActiveQuest {
  definitionId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}
