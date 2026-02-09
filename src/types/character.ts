/**
 * Character & Class System Types
 *
 * Type definitions for the Phase 4 character progression system:
 * classes, skills, equipment, leveling, and stat growth.
 * All types are JSON-serializable for save system compatibility.
 */

import type { EntityStats, HazardType, BindType, AilmentType } from './combat';

// ============================================================================
// Stat Growth & Leveling
// ============================================================================

/** Per-level stat growth rates (fractional, floored each level) */
export interface StatGrowth {
  str: number;
  vit: number;
  int: number;
  wis: number;
  agi: number;
  luc: number;
}

/** Result of a level-up computation */
export interface LevelUpResult {
  newLevel: number;
  statGains: EntityStats;
  hpGain: number;
  tpGain: number;
  skillPointGain: number;
}

// ============================================================================
// Class Definitions
// ============================================================================

/** Role descriptor for a class */
export type ClassRole = 'tank' | 'dps' | 'binder' | 'mage' | 'healer' | 'debuffer';

/** Full class definition (static data) */
export interface ClassDefinition {
  id: string;
  name: string;
  role: ClassRole;
  description: string;
  baseStats: EntityStats;
  baseHp: number;
  baseTp: number;
  /** HP gained per level */
  hpGrowth: number;
  /** TP gained per level */
  tpGrowth: number;
  /** Stat growth rates per level */
  growth: StatGrowth;
  /** Ordered skill IDs available to this class */
  skillIds: string[];
}

// ============================================================================
// Skill Definitions
// ============================================================================

/** How a skill selects its targets */
export type SkillTargetType =
  | 'single-tile'
  | 'adjacent-tiles'
  | 'all-enemies'
  | 'single-ally'
  | 'all-allies'
  | 'self';

/** Which body part a skill requires (null = no restriction) */
export type BodyPartRequired = 'head' | 'arm' | null;

/** Condition types for conditional skills */
export type ConditionalType =
  | 'has-any-bind'
  | 'has-all-binds'
  | 'has-leg-bind'
  | 'has-ailment'
  | 'on-hazard'
  | 'below-hp-percent';

/** Conditional check descriptor */
export interface SkillCondition {
  type: ConditionalType;
  /** For below-hp-percent: the threshold (e.g. 25 for 25%) */
  threshold?: number;
}

// ============================================================================
// Skill Effects (discriminated union)
// ============================================================================

export interface DamageEffect {
  type: 'damage';
  /** Which stat to scale off: 'str' for physical, 'int' for magical */
  stat: 'str' | 'int';
  multiplier: number;
}

export interface DisplacementSkillEffect {
  type: 'displacement';
  direction: 'push' | 'pull' | 'left' | 'right';
  distance: number;
}

export interface BindEffect {
  type: 'bind';
  bindType: BindType;
  chance: number;
  duration: number;
}

export interface AilmentEffect {
  type: 'ailment';
  ailmentType: AilmentType;
  chance: number;
  /** For poison: damage per turn */
  damagePerTurn?: number;
  /** Duration in turns */
  duration: number;
}

export interface HazardEffect {
  type: 'hazard';
  hazardType: HazardType;
}

export interface HealEffect {
  type: 'heal';
  /** Scales off WIS */
  multiplier: number;
}

export interface ConditionalDamageEffect {
  type: 'conditional-damage';
  stat: 'str' | 'int';
  multiplier: number;
  condition: SkillCondition;
  /** For has-any-bind: multiply by active bind count */
  perBindMultiplier?: boolean;
}

export interface MultiHitEffect {
  type: 'multi-hit';
  stat: 'str' | 'int';
  hits: number;
  multiplierPerHit: number;
}

export interface AoeSplashEffect {
  type: 'aoe-splash';
  stat: 'str' | 'int';
  multiplier: number;
}

export interface SelfBuffEffect {
  type: 'self-buff';
  /** Which stat to buff */
  buffStat: keyof EntityStats;
  /** Flat bonus amount */
  amount: number;
  /** Duration in turns */
  duration: number;
}

/** Union of all skill effect types */
export type SkillEffect =
  | DamageEffect
  | DisplacementSkillEffect
  | BindEffect
  | AilmentEffect
  | HazardEffect
  | HealEffect
  | ConditionalDamageEffect
  | MultiHitEffect
  | AoeSplashEffect
  | SelfBuffEffect;

/** Full skill definition (static data) */
export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  classId: string;
  tpCost: number;
  targetType: SkillTargetType;
  /** Which body part must be free to use this skill (null = no restriction) */
  bodyPartRequired: BodyPartRequired;
  /** Minimum character level to learn */
  levelRequired: number;
  /** Skill points needed to learn */
  skillPointCost: number;
  /** Ordered list of effects to apply */
  effects: SkillEffect[];
  /** Is this a passive skill? (always active, no TP cost) */
  isPassive: boolean;
}

// ============================================================================
// Equipment
// ============================================================================

/** Equipment slot types */
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory1' | 'accessory2';

/** Equipment stat bonuses (all optional, 0 if absent) */
export interface EquipmentBonuses {
  str?: number;
  vit?: number;
  int?: number;
  wis?: number;
  agi?: number;
  luc?: number;
  hp?: number;
  tp?: number;
}

/** Full equipment item definition (static data) */
export interface EquipmentDefinition {
  id: string;
  name: string;
  slot: EquipmentSlot;
  bonuses: EquipmentBonuses;
  /** If set, only this class can equip it (null = any class) */
  classRestriction: string | null;
  description: string;
}
