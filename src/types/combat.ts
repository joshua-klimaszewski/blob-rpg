/**
 * Combat System Types
 *
 * Complete type definitions for the Phase 3 combat system.
 * All types are JSON-serializable for future save system compatibility.
 */

import type { PassiveModifier } from './character';

// ============================================================================
// Grid & Position
// ============================================================================

/** Grid position as [row, col] tuple (both 0-2 for 3x3 grid) */
export type GridPosition = [row: number, col: number];

/** Direction for displacement effects */
export type DisplacementDirection = 'push' | 'pull' | 'left' | 'right';

/** Hazard types that can be placed on tiles */
export type HazardType = 'spike' | 'web' | 'fire';

/** A single tile on the 3x3 combat grid */
export interface BattleTile {
  position: GridPosition;
  /** Entity IDs at this tile (multiple entities can stack) */
  entities: string[];
  /** Active hazard on this tile (null = none) */
  hazard: HazardType | null;
}

// ============================================================================
// Stats & Attributes
// ============================================================================

/** Core combat stats for all entities */
export interface EntityStats {
  /** Strength - physical damage */
  str: number;
  /** Vitality - physical defense, HP */
  vit: number;
  /** Intelligence - magic damage */
  int: number;
  /** Wisdom - magic defense, TP */
  wis: number;
  /** Agility - turn order, evasion */
  agi: number;
  /** Luck - crit chance, status resist */
  luc: number;
}

// ============================================================================
// Bind & Ailment Status
// ============================================================================

/** Bind types that disable capabilities */
export type BindType = 'head' | 'arm' | 'leg';

/** Bind state - turn counters (0 = not bound) */
export interface BindState {
  head: number;
  arm: number;
  leg: number;
}

/** Bind application attempt */
export interface BindApplication {
  type: BindType;
  baseDuration: number;
  baseChance: number;
}

/** Ailment types */
export type AilmentType = 'poison' | 'paralyze' | 'sleep' | 'blind';

/** Poison ailment data */
export interface PoisonData {
  type: 'poison';
  damagePerTurn: number;
  turnsRemaining: number;
}

/** Paralyze ailment data */
export interface ParalyzeData {
  type: 'paralyze';
  skipChance: number; // % chance to skip turn
  turnsRemaining: number;
}

/** Sleep ailment data */
export interface SleepData {
  type: 'sleep';
  turnsRemaining: number;
}

/** Blind ailment data */
export interface BlindData {
  type: 'blind';
  accuracyPenalty: number;
  turnsRemaining: number;
}

/** Union of all ailment data types */
export type AilmentData = PoisonData | ParalyzeData | SleepData | BlindData;

/** Ailment state per entity */
export interface AilmentState {
  poison: PoisonData | null;
  paralyze: ParalyzeData | null;
  sleep: SleepData | null;
  blind: BlindData | null;
}

/** Resistance state - increases on status application */
export interface ResistanceState {
  head: number;
  arm: number;
  leg: number;
  poison: number;
  paralyze: number;
  sleep: number;
  blind: number;
}

// ============================================================================
// Combat Entities
// ============================================================================

/** Temporary buff applied during combat */
export interface BuffState {
  skillId: string;
  buffStat: keyof EntityStats;
  amount: number;
  turnsRemaining: number;
}

/** A party member or enemy in combat */
export interface CombatEntity {
  id: string;
  name: string;
  /** Reference to the static definition (enemy ID or class ID) */
  definitionId: string;

  /** Current/max HP */
  hp: number;
  maxHp: number;

  /** Current/max TP (tech points for skills) */
  tp: number;
  maxTp: number;

  /** Combat stats */
  stats: EntityStats;

  /** Current grid position (null = defeated/removed) */
  position: GridPosition | null;

  /** Bind status */
  binds: BindState;

  /** Ailment status */
  ailments: AilmentState;

  /** Status resistances */
  resistances: ResistanceState;

  /** Is this a party member? (false = enemy) */
  isParty: boolean;

  /** Skill IDs available in combat */
  skills: string[];

  /** Active temporary buffs */
  buffs: BuffState[];

  /** Passive modifiers from learned skills (party members only) */
  passiveModifiers: PassiveModifier[];
}

// ============================================================================
// Combat Actions
// ============================================================================

/** Action types available in combat */
export type ActionType = 'attack' | 'defend' | 'skill' | 'item' | 'flee';

/** Displacement effect for skills */
export interface DisplacementEffect {
  direction: DisplacementDirection;
  distance: number;
}

/** Base combat action */
export interface CombatAction {
  actorId: string;
  type: ActionType;
}

/** Attack action - target a tile */
export interface AttackAction extends CombatAction {
  type: 'attack';
  targetTile: GridPosition;
}

/** Defend action - reduce incoming damage */
export interface DefendAction extends CombatAction {
  type: 'defend';
}

/** Skill action - use a skill on target */
export interface SkillAction extends CombatAction {
  type: 'skill';
  skillId: string;
  targetTile: GridPosition;
}

/** Item action - use an item on target */
export interface ItemAction extends CombatAction {
  type: 'item';
  itemId: string;
  targetId: string;
}

/** Flee action - attempt to escape */
export interface FleeAction extends CombatAction {
  type: 'flee';
}

/** Union of all action types */
export type Action = AttackAction | DefendAction | SkillAction | ItemAction | FleeAction;

// ============================================================================
// Turn Order
// ============================================================================

/** Turn order entry */
export interface TurnEntry {
  entityId: string;
  /** Calculated speed (AGI + modifiers) */
  speed: number;
  /** Has this entity acted this turn? */
  hasActed: boolean;
  /** Is this entity defending? (expires at turn end) */
  isDefending: boolean;
}

// ============================================================================
// Combat State
// ============================================================================

/** Combat phase */
export type CombatPhase = 'active' | 'victory' | 'defeat';

/** Main combat state */
export interface CombatState {
  phase: CombatPhase;

  /** Turn order sorted by speed */
  turnOrder: TurnEntry[];

  /** Current actor index in turn order */
  currentActorIndex: number;

  /** Party members (4 max) */
  party: CombatEntity[];

  /** Enemy entities */
  enemies: CombatEntity[];

  /** 3x3 combat grid */
  grid: BattleTile[][];

  /** Combo counter (increments on consecutive hits, resets on turn end) */
  comboCounter: number;

  /** Current round number (increments when turn order wraps) */
  round: number;

  /** Can the party flee from this encounter? */
  canFlee: boolean;
}

// ============================================================================
// Combat Events
// ============================================================================

/** Base combat event */
export interface CombatEvent {
  type: string;
  timestamp: number;
}

/** Damage dealt event */
export interface DamageEvent extends CombatEvent {
  type: 'damage';
  targetId: string;
  damage: number;
  isCrit: boolean;
  killed: boolean;
}

/** Healing event */
export interface HealEvent extends CombatEvent {
  type: 'heal';
  targetId: string;
  amount: number;
}

/** Bind applied event */
export interface BindAppliedEvent extends CombatEvent {
  type: 'bind-applied';
  targetId: string;
  bindType: BindType;
  duration: number;
  resisted: boolean;
}

/** Bind expired event */
export interface BindExpiredEvent extends CombatEvent {
  type: 'bind-expired';
  targetId: string;
  bindType: BindType;
}

/** Ailment applied event */
export interface AilmentAppliedEvent extends CombatEvent {
  type: 'ailment-applied';
  targetId: string;
  ailment: AilmentType;
  resisted: boolean;
}

/** Ailment expired event */
export interface AilmentExpiredEvent extends CombatEvent {
  type: 'ailment-expired';
  targetId: string;
  ailment: AilmentType;
}

/** Displacement event */
export interface DisplacementEvent extends CombatEvent {
  type: 'displacement';
  entityId: string;
  from: GridPosition;
  to: GridPosition;
}

/** Hazard triggered event */
export interface HazardTriggeredEvent extends CombatEvent {
  type: 'hazard-triggered';
  entityId: string;
  hazard: HazardType;
  position: GridPosition;
}

/** Hazard placed event */
export interface HazardPlacedEvent extends CombatEvent {
  type: 'hazard-placed';
  hazard: HazardType;
  position: GridPosition;
}

/** Turn skip event (from paralyze/sleep) */
export interface TurnSkipEvent extends CombatEvent {
  type: 'turn-skip';
  entityId: string;
  reason: 'paralyze' | 'sleep';
}

/** Combat victory event */
export interface VictoryEvent extends CombatEvent {
  type: 'victory';
}

/** Combat defeat event */
export interface DefeatEvent extends CombatEvent {
  type: 'defeat';
}

/** Flee success event */
export interface FleeSuccessEvent extends CombatEvent {
  type: 'flee-success';
}

/** Flee failed event */
export interface FleeFailedEvent extends CombatEvent {
  type: 'flee-failed';
}

/** Union of all combat events */
export type CombatEventUnion =
  | DamageEvent
  | HealEvent
  | BindAppliedEvent
  | BindExpiredEvent
  | AilmentAppliedEvent
  | AilmentExpiredEvent
  | DisplacementEvent
  | HazardTriggeredEvent
  | HazardPlacedEvent
  | TurnSkipEvent
  | VictoryEvent
  | DefeatEvent
  | FleeSuccessEvent
  | FleeFailedEvent;

// ============================================================================
// Combat Initialization & Rewards
// ============================================================================

/** Enemy definition from data files */
export interface EnemyDefinition {
  id: string;
  name: string;
  stats: EntityStats;
  maxHp: number;
  maxTp: number;
  skills: string[]; // skill IDs (MVP: empty array)
  aiPattern: 'aggressive' | 'defensive' | 'random';
  dropTable: {
    materials: Array<{ materialId: string; chance: number }>;
    xp: number;
    gold: { min: number; max: number };
  };
}

/** Initial enemy placement */
export interface InitialEnemyPlacement {
  definition: EnemyDefinition;
  instanceId: string;
  position: GridPosition;
}

/** Party member state */
export interface PartyMemberState {
  id: string;
  name: string;
  classId: string;
  /** Effective stats (base + equipment bonuses) */
  stats: EntityStats;
  /** Raw base stats before equipment (class base + level growth) */
  baseStats: EntityStats;
  maxHp: number;
  hp: number;
  maxTp: number;
  tp: number;
  level: number;
  xp: number;
  skillPoints: number;
  learnedSkills: string[];
  equipment: {
    weapon: string | null;
    armor: string | null;
    accessory1: string | null;
    accessory2: string | null;
  };
}

/** Encounter data to initialize combat */
export interface EncounterData {
  enemies: InitialEnemyPlacement[];
  party: PartyMemberState[];
  canFlee: boolean;
}

/** Combat rewards after victory */
export interface CombatRewards {
  xp: number;
  gold: number;
  materials: Array<{ id: string; quantity: number }>;
}
