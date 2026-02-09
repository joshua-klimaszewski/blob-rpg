/**
 * Combat System - Pure TypeScript Logic
 *
 * Core combat mechanics with no React dependencies.
 * All functions are pure (deterministic with injectable RNG).
 * Returns new state + events (never mutates input).
 */

import type {
  GridPosition,
  BattleTile,
  CombatEntity,
  CombatState,
  BindType,
  CombatEventUnion,
  DamageEvent,
  HealEvent,
  DisplacementDirection,
  DisplacementEffect,
  HazardType,
  DisplacementEvent,
  HazardTriggeredEvent,
  HazardPlacedEvent,
  PoisonData,
  BindApplication,
  BindAppliedEvent,
  AilmentType,
  AilmentData,
  AilmentAppliedEvent,
  TurnSkipEvent,
  EncounterData,
  TurnEntry,
  Action,
  AttackAction,
  SkillAction,
  BuffState,
  VictoryEvent,
  DefeatEvent,
  FleeSuccessEvent,
  FleeFailedEvent,
  CombatRewards,
} from '../types/combat';

import type { SkillDefinition, SkillEffect } from '../types/character';

// ============================================================================
// Random Number Generator (Injectable for Testing)
// ============================================================================

/** RNG function signature - returns number [0, 1) */
export type RNG = () => number;

/** Default RNG using Math.random */
export const defaultRNG: RNG = () => Math.random();

// ============================================================================
// Grid Utilities
// ============================================================================

/**
 * Check if a grid position is valid (within 3x3 bounds)
 */
export function isValidPosition(pos: GridPosition): boolean {
  const [row, col] = pos;
  return row >= 0 && row <= 2 && col >= 0 && col <= 2;
}

/**
 * Get tile at position (returns undefined if out of bounds)
 */
export function getTile(grid: BattleTile[][], pos: GridPosition): BattleTile | undefined {
  if (!isValidPosition(pos)) return undefined;
  const [row, col] = pos;
  return grid[row]?.[col];
}

/**
 * Get all entity IDs at a tile position
 */
export function getEntitiesAtTile(grid: BattleTile[][], pos: GridPosition): string[] {
  const tile = getTile(grid, pos);
  return tile?.entities ?? [];
}

/**
 * Add an entity to a tile (returns new grid)
 */
export function addEntityToTile(
  grid: BattleTile[][],
  entityId: string,
  pos: GridPosition
): BattleTile[][] {
  if (!isValidPosition(pos)) return grid;

  const [row, col] = pos;
  return grid.map((r, rowIdx) =>
    r.map((tile, colIdx) => {
      if (rowIdx === row && colIdx === col) {
        return {
          ...tile,
          entities: [...tile.entities, entityId],
        };
      }
      return tile;
    })
  );
}

/**
 * Remove an entity from the grid (searches all tiles, returns new grid)
 */
export function removeEntityFromTile(grid: BattleTile[][], entityId: string): BattleTile[][] {
  return grid.map((row) =>
    row.map((tile) => ({
      ...tile,
      entities: tile.entities.filter((id) => id !== entityId),
    }))
  );
}

/**
 * Find the position of an entity on the grid
 */
export function getEntityPosition(grid: BattleTile[][], entityId: string): GridPosition | null {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const tile = grid[row][col];
      if (tile.entities.includes(entityId)) {
        return [row, col];
      }
    }
  }
  return null;
}

/**
 * Move an entity to a new position (removes from old, adds to new)
 */
export function moveEntity(
  grid: BattleTile[][],
  entityId: string,
  newPos: GridPosition
): BattleTile[][] {
  if (!isValidPosition(newPos)) return grid;

  // Remove from current position
  let newGrid = removeEntityFromTile(grid, entityId);
  // Add to new position
  newGrid = addEntityToTile(newGrid, entityId, newPos);

  return newGrid;
}

// ============================================================================
// Entity Utilities
// ============================================================================

/**
 * Find an entity in the combat state (searches party and enemies)
 */
export function findEntity(state: CombatState, entityId: string): CombatEntity | undefined {
  return (
    state.party.find((e) => e.id === entityId) || state.enemies.find((e) => e.id === entityId)
  );
}

/**
 * Check if an entity is alive
 */
export function isAlive(entity: CombatEntity): boolean {
  return entity.hp > 0;
}

/**
 * Get all alive party members
 */
export function getAliveParty(state: CombatState): CombatEntity[] {
  return state.party.filter(isAlive);
}

/**
 * Get all alive enemies
 */
export function getAliveEnemies(state: CombatState): CombatEntity[] {
  return state.enemies.filter(isAlive);
}

/**
 * Check if the entire party is wiped (all dead)
 */
export function isPartyWiped(state: CombatState): boolean {
  return getAliveParty(state).length === 0;
}

/**
 * Check if all enemies are defeated
 */
export function isAllEnemiesDefeated(state: CombatState): boolean {
  return getAliveEnemies(state).length === 0;
}

// ============================================================================
// Bind Utilities
// ============================================================================

/**
 * Check if an entity has a specific bind active
 */
export function hasBind(entity: CombatEntity, bindType: BindType): boolean {
  return entity.binds[bindType] > 0;
}

/**
 * Check if entity has head bind (disables INT attacks/spells)
 */
export function isHeadBound(entity: CombatEntity): boolean {
  return hasBind(entity, 'head');
}

/**
 * Check if entity has arm bind (reduces physical damage by 50%)
 */
export function isArmBound(entity: CombatEntity): boolean {
  return hasBind(entity, 'arm');
}

/**
 * Check if entity has leg bind (prevents flee, reduces evasion)
 */
export function isLegBound(entity: CombatEntity): boolean {
  return hasBind(entity, 'leg');
}

/**
 * Check if entity can use physical attacks (not arm bound)
 */
export function canUsePhysicalAttack(entity: CombatEntity): boolean {
  return isAlive(entity) && !isArmBound(entity);
}

/**
 * Check if entity can use spells (not head bound)
 */
export function canUseSpell(entity: CombatEntity): boolean {
  return isAlive(entity) && !isHeadBound(entity);
}

/**
 * Check if entity can flee (alive, not leg bound, and flee allowed in state)
 */
export function canFlee(state: CombatState, entityId: string): boolean {
  const entity = findEntity(state, entityId);
  if (!entity || !isAlive(entity)) return false;
  if (isLegBound(entity)) return false;
  return state.canFlee;
}

// ============================================================================
// Turn Order Utilities
// ============================================================================

/**
 * Calculate effective speed for turn order (AGI + modifiers)
 * MVP: Just base AGI, no modifiers yet
 */
export function calculateSpeed(entity: CombatEntity): number {
  return entity.stats.agi;
}

/**
 * Sort entities by speed (descending) for turn order
 */
export function sortBySpeed(entities: CombatEntity[]): CombatEntity[] {
  return [...entities].sort((a, b) => calculateSpeed(b) - calculateSpeed(a));
}

/**
 * Get the current actor entity from state
 */
export function getCurrentActor(state: CombatState): CombatEntity | undefined {
  const currentEntry = state.turnOrder[state.currentActorIndex];
  if (!currentEntry) return undefined;
  return findEntity(state, currentEntry.entityId);
}

/**
 * Get the next alive actor in turn order
 * Returns null if no alive actors remain (shouldn't happen if victory/defeat checked)
 */
export function getNextAliveActor(state: CombatState): CombatEntity | null {
  const startIndex = state.currentActorIndex;
  let checkIndex = startIndex;

  do {
    const entry = state.turnOrder[checkIndex];
    const entity = findEntity(state, entry.entityId);
    if (entity && isAlive(entity)) {
      return entity;
    }
    checkIndex = (checkIndex + 1) % state.turnOrder.length;
  } while (checkIndex !== startIndex);

  return null;
}

/**
 * Advance to the next turn entry (wraps around at end)
 * Returns new state with updated currentActorIndex
 */
export function advanceTurn(state: CombatState): CombatState {
  const newIndex = (state.currentActorIndex + 1) % state.turnOrder.length;

  return {
    ...state,
    currentActorIndex: newIndex,
    turnOrder: state.turnOrder.map((entry, idx) => ({
      ...entry,
      hasActed: idx === newIndex ? false : entry.hasActed,
    })),
  };
}

// ============================================================================
// Damage Calculation
// ============================================================================

/** Result of damage calculation */
export interface DamageResult {
  damage: number;
  isCrit: boolean;
  killed: boolean;
}

/**
 * Calculate damage dealt from attacker to defender
 *
 * Formula:
 * - Physical (stat='str'): baseDmg = attacker.str * multiplier - defender.vit / 2
 * - Magical (stat='int'): baseDmg = attacker.int * multiplier - defender.wis / 2
 * - Variance: 0.9-1.1 via RNG
 * - Crit: rng() < (attacker.luc / 100) → dmg * 1.5
 * - Arm bind on attacker → dmg * 0.5 (physical only)
 * - Head bind on attacker → dmg * 0.5 (magical only)
 * - Combo multiplier → dmg * (1 + comboCounter * 0.1)
 * - Defend → dmg * 0.5
 */
export function calculateDamage(
  attacker: CombatEntity,
  defender: CombatEntity,
  multiplier: number,
  comboCounter: number,
  rng: RNG = defaultRNG,
  stat: 'str' | 'int' = 'str',
  isDefending: boolean = false
): DamageResult {
  // Base damage calculation (physical vs magical)
  const atkStat = stat === 'str' ? attacker.stats.str : attacker.stats.int;
  const defStat = stat === 'str' ? defender.stats.vit : defender.stats.wis;
  const baseDmg = Math.max(1, atkStat * multiplier - defStat / 2);

  // Variance (0.9 to 1.1)
  const variance = 0.9 + rng() * 0.2;
  let damage = baseDmg * variance;

  // Critical hit check
  const critChance = attacker.stats.luc / 100;
  const isCrit = rng() < critChance;
  if (isCrit) {
    damage *= 1.5;
  }

  // Bind penalty on attacker (arm for physical, head for magical)
  if (stat === 'str' && isArmBound(attacker)) {
    damage *= 0.5;
  }
  if (stat === 'int' && isHeadBound(attacker)) {
    damage *= 0.5;
  }

  // Combo multiplier
  const comboMultiplier = 1 + comboCounter * 0.1;
  damage *= comboMultiplier;

  // Defend multiplier
  if (isDefending) {
    damage *= 0.5;
  }

  // Round and clamp to minimum 1
  damage = Math.max(1, Math.floor(damage));

  // Check if this kills the defender
  const killed = damage >= defender.hp;

  return { damage, isCrit, killed };
}

/**
 * Apply damage to an entity (returns new entity)
 */
export function applyDamage(entity: CombatEntity, amount: number): CombatEntity {
  return {
    ...entity,
    hp: Math.max(0, entity.hp - amount),
  };
}

/**
 * Update an entity in the combat state
 */
function updateEntity(state: CombatState, entityId: string, entity: CombatEntity): CombatState {
  return {
    ...state,
    party: state.party.map((e) => (e.id === entityId ? entity : e)),
    enemies: state.enemies.map((e) => (e.id === entityId ? entity : e)),
  };
}

// ============================================================================
// Attack Action
// ============================================================================

/** Result of executing an attack action */
export interface AttackResult {
  state: CombatState;
  events: CombatEventUnion[];
}

/**
 * Execute an attack action
 * Hits ALL entities at the target tile (AOE on stacks)
 * Increments combo counter per hit
 */
export function executeAttack(
  state: CombatState,
  actorId: string,
  targetTile: GridPosition,
  rng: RNG = defaultRNG
): AttackResult {
  const attacker = findEntity(state, actorId);
  if (!attacker || !isAlive(attacker)) {
    return { state, events: [] };
  }

  // Get all entities at target tile
  const targetIds = getEntitiesAtTile(state.grid, targetTile);
  if (targetIds.length === 0) {
    return { state, events: [] };
  }

  const events: CombatEventUnion[] = [];
  let newState = { ...state };

  // Attack each entity at the tile
  for (const targetId of targetIds) {
    const defender = findEntity(newState, targetId);
    if (!defender || !isAlive(defender)) continue;

    // Check if defender is defending
    const defenderTurnEntry = newState.turnOrder.find((e) => e.entityId === targetId);
    const defenderIsDefending = defenderTurnEntry?.isDefending ?? false;

    // Calculate damage (MVP: multiplier = 1.0 for basic attack)
    const result = calculateDamage(attacker, defender, 1.0, newState.comboCounter, rng, 'str', defenderIsDefending);

    // Apply damage
    const damagedEntity = applyDamage(defender, result.damage);
    newState = updateEntity(newState, targetId, damagedEntity);

    // Increment combo counter
    newState = {
      ...newState,
      comboCounter: newState.comboCounter + 1,
    };

    // Create damage event
    const damageEvent: DamageEvent = {
      type: 'damage',
      timestamp: Date.now(),
      targetId,
      damage: result.damage,
      isCrit: result.isCrit,
      killed: result.killed,
    };
    events.push(damageEvent);
  }

  return { state: newState, events };
}

// ============================================================================
// Displacement & Trap Tiles
// ============================================================================

/**
 * Calculate the target position after displacement
 * Clamps to grid bounds (0-2, 0-2)
 */
export function calculateDisplacementTarget(
  from: GridPosition,
  direction: DisplacementDirection,
  distance: number
): GridPosition {
  const [row, col] = from;
  let newRow = row;
  let newCol = col;

  switch (direction) {
    case 'push': // Push back (increase row)
      newRow = row + distance;
      break;
    case 'pull': // Pull forward (decrease row)
      newRow = row - distance;
      break;
    case 'left': // Move left (decrease col)
      newCol = col - distance;
      break;
    case 'right': // Move right (increase col)
      newCol = col + distance;
      break;
  }

  // Clamp to grid bounds
  newRow = Math.max(0, Math.min(2, newRow));
  newCol = Math.max(0, Math.min(2, newCol));

  return [newRow, newCol];
}

/**
 * Place a hazard on a tile (returns new grid)
 */
export function placeHazard(
  grid: BattleTile[][],
  position: GridPosition,
  hazard: HazardType
): BattleTile[][] {
  if (!isValidPosition(position)) return grid;

  const [row, col] = position;
  return grid.map((r, rowIdx) =>
    r.map((tile, colIdx) => {
      if (rowIdx === row && colIdx === col) {
        return { ...tile, hazard };
      }
      return tile;
    })
  );
}

/**
 * Trigger hazard effects on an entity
 * Returns updated entity + events
 */
export function triggerHazard(
  entity: CombatEntity,
  hazard: HazardType
): { entity: CombatEntity; events: CombatEventUnion[] } {
  const events: CombatEventUnion[] = [];

  switch (hazard) {
    case 'spike': {
      // Fixed 10 damage
      const damagedEntity = applyDamage(entity, 10);
      const damageEvent: DamageEvent = {
        type: 'damage',
        timestamp: Date.now(),
        targetId: entity.id,
        damage: 10,
        isCrit: false,
        killed: damagedEntity.hp === 0,
      };
      events.push(damageEvent);
      return { entity: damagedEntity, events };
    }

    case 'web': {
      // Apply leg bind (2 turns)
      const boundEntity: CombatEntity = {
        ...entity,
        binds: {
          ...entity.binds,
          leg: Math.max(entity.binds.leg, 2), // Extend if already bound
        },
      };
      // Bind event will be added by applyBind in future commits
      return { entity: boundEntity, events };
    }

    case 'fire': {
      // Apply poison (5 dmg/turn, 3 turns)
      const poisonData: PoisonData = {
        type: 'poison',
        damagePerTurn: 5,
        turnsRemaining: 3,
      };
      const poisonedEntity: CombatEntity = {
        ...entity,
        ailments: {
          ...entity.ailments,
          poison: poisonData,
        },
      };
      // Ailment event will be added by applyAilment in future commits
      return { entity: poisonedEntity, events };
    }

    default:
      return { entity, events };
  }
}

/** Result of displacement */
export interface DisplacementResult {
  state: CombatState;
  events: CombatEventUnion[];
}

/**
 * Displace an entity in a direction
 * Moves entity, triggers hazard if present at destination
 */
export function displaceEntity(
  state: CombatState,
  entityId: string,
  effect: DisplacementEffect
): DisplacementResult {
  const entity = findEntity(state, entityId);
  if (!entity || !isAlive(entity)) {
    return { state, events: [] };
  }

  const currentPos = getEntityPosition(state.grid, entityId);
  if (!currentPos) {
    return { state, events: [] };
  }

  // Calculate new position
  const newPos = calculateDisplacementTarget(currentPos, effect.direction, effect.distance);

  // If position doesn't change (hit boundary), no displacement
  if (currentPos[0] === newPos[0] && currentPos[1] === newPos[1]) {
    return { state, events: [] };
  }

  const events: CombatEventUnion[] = [];

  // Move entity on grid
  const newGrid = moveEntity(state.grid, entityId, newPos);

  // Update entity position
  const movedEntity: CombatEntity = {
    ...entity,
    position: newPos,
  };

  let newState: CombatState = {
    ...state,
    grid: newGrid,
  };
  newState = updateEntity(newState, entityId, movedEntity);

  // Create displacement event
  const displacementEvent: DisplacementEvent = {
    type: 'displacement',
    timestamp: Date.now(),
    entityId,
    from: currentPos,
    to: newPos,
  };
  events.push(displacementEvent);

  // Check for hazard at new position
  const tile = getTile(newGrid, newPos);
  if (tile?.hazard) {
    const hazardResult = triggerHazard(movedEntity, tile.hazard);
    newState = updateEntity(newState, entityId, hazardResult.entity);

    const hazardEvent: HazardTriggeredEvent = {
      type: 'hazard-triggered',
      timestamp: Date.now(),
      entityId,
      hazard: tile.hazard,
      position: newPos,
    };
    events.push(hazardEvent);
    events.push(...hazardResult.events);
  }

  return { state: newState, events };
}

// ============================================================================
// Bind System
// ============================================================================

/** Result of bind application attempt */
export interface BindApplicationResult {
  entity: CombatEntity;
  applied: boolean;
  finalDuration: number;
}

/**
 * Attempt to apply a bind to an entity
 *
 * Formula:
 * - hitChance = baseChance - resistance
 * - If hit: duration = max(1, baseDuration - floor(resistance / 25))
 * - Increase resistance by 20 on successful application
 */
export function applyBind(
  entity: CombatEntity,
  application: BindApplication,
  rng: RNG = defaultRNG
): BindApplicationResult {
  const resistance = entity.resistances[application.type];
  const hitChance = Math.max(0, application.baseChance - resistance);

  // Roll for application
  const roll = rng() * 100;
  if (roll >= hitChance) {
    // Resisted
    return {
      entity,
      applied: false,
      finalDuration: 0,
    };
  }

  // Calculate duration with resistance scaling
  const durationReduction = Math.floor(resistance / 25);
  const finalDuration = Math.max(1, application.baseDuration - durationReduction);

  // Apply bind
  const boundEntity: CombatEntity = {
    ...entity,
    binds: {
      ...entity.binds,
      [application.type]: Math.max(entity.binds[application.type], finalDuration),
    },
    resistances: {
      ...entity.resistances,
      [application.type]: resistance + 20,
    },
  };

  return {
    entity: boundEntity,
    applied: true,
    finalDuration,
  };
}

// ============================================================================
// Ailment System
// ============================================================================

/** Result of ailment application attempt */
export interface AilmentApplicationResult {
  entity: CombatEntity;
  applied: boolean;
}

/**
 * Attempt to apply an ailment to an entity
 */
export function applyAilment(
  entity: CombatEntity,
  ailmentType: AilmentType,
  ailmentData: AilmentData,
  baseChance: number,
  rng: RNG = defaultRNG
): AilmentApplicationResult {
  const resistance = entity.resistances[ailmentType];
  const hitChance = Math.max(0, baseChance - resistance);

  // Roll for application
  const roll = rng() * 100;
  if (roll >= hitChance) {
    // Resisted
    return {
      entity,
      applied: false,
    };
  }

  // Apply ailment
  const ailmentedEntity: CombatEntity = {
    ...entity,
    ailments: {
      ...entity.ailments,
      [ailmentType]: ailmentData,
    },
    resistances: {
      ...entity.resistances,
      [ailmentType]: resistance + 20,
    },
  };

  return {
    entity: ailmentedEntity,
    applied: true,
  };
}

/**
 * Tick status durations at end of turn
 * Decrements bind and ailment counters
 */
export function tickStatusDurations(entity: CombatEntity): CombatEntity {
  // Tick bind durations
  const newBinds = {
    head: Math.max(0, entity.binds.head - 1),
    arm: Math.max(0, entity.binds.arm - 1),
    leg: Math.max(0, entity.binds.leg - 1),
  };

  // Tick ailment durations
  const newAilments = { ...entity.ailments };

  if (newAilments.poison) {
    const newTurns = newAilments.poison.turnsRemaining - 1;
    newAilments.poison =
      newTurns > 0
        ? {
            ...newAilments.poison,
            turnsRemaining: newTurns,
          }
        : null;
  }

  if (newAilments.paralyze) {
    const newTurns = newAilments.paralyze.turnsRemaining - 1;
    newAilments.paralyze =
      newTurns > 0
        ? {
            ...newAilments.paralyze,
            turnsRemaining: newTurns,
          }
        : null;
  }

  if (newAilments.sleep) {
    const newTurns = newAilments.sleep.turnsRemaining - 1;
    newAilments.sleep =
      newTurns > 0
        ? {
            ...newAilments.sleep,
            turnsRemaining: newTurns,
          }
        : null;
  }

  if (newAilments.blind) {
    const newTurns = newAilments.blind.turnsRemaining - 1;
    newAilments.blind =
      newTurns > 0
        ? {
            ...newAilments.blind,
            turnsRemaining: newTurns,
          }
        : null;
  }

  return {
    ...entity,
    binds: newBinds,
    ailments: newAilments,
  };
}

/** Result of processing ailment effects */
export interface AilmentEffectsResult {
  entity: CombatEntity;
  events: CombatEventUnion[];
  skipTurn: boolean;
}

/**
 * Process ailment effects at start of turn
 * - Poison: deal damage
 * - Paralyze: chance to skip turn
 * - Sleep: skip turn (removed on damage)
 * - Blind: accuracy penalty (applied in damage calc, not here)
 */
export function processAilmentEffects(
  entity: CombatEntity,
  rng: RNG = defaultRNG
): AilmentEffectsResult {
  const events: CombatEventUnion[] = [];
  let newEntity = { ...entity };
  let skipTurn = false;

  // Process poison damage
  if (newEntity.ailments.poison) {
    const poisonDamage = newEntity.ailments.poison.damagePerTurn;
    newEntity = applyDamage(newEntity, poisonDamage);

    const damageEvent: DamageEvent = {
      type: 'damage',
      timestamp: Date.now(),
      targetId: entity.id,
      damage: poisonDamage,
      isCrit: false,
      killed: newEntity.hp === 0,
    };
    events.push(damageEvent);
  }

  // Process paralyze turn skip
  if (newEntity.ailments.paralyze) {
    const skipChance = newEntity.ailments.paralyze.skipChance / 100;
    if (rng() < skipChance) {
      skipTurn = true;
      const skipEvent: TurnSkipEvent = {
        type: 'turn-skip',
        timestamp: Date.now(),
        entityId: entity.id,
        reason: 'paralyze',
      };
      events.push(skipEvent);
    }
  }

  // Process sleep turn skip
  if (newEntity.ailments.sleep) {
    skipTurn = true;
    const skipEvent: TurnSkipEvent = {
      type: 'turn-skip',
      timestamp: Date.now(),
      entityId: entity.id,
      reason: 'sleep',
    };
    events.push(skipEvent);
  }

  return {
    entity: newEntity,
    events,
    skipTurn,
  };
}

/**
 * Remove sleep ailment when entity takes damage
 */
export function removeSleepOnHit(entity: CombatEntity): CombatEntity {
  if (!entity.ailments.sleep) return entity;

  return {
    ...entity,
    ailments: {
      ...entity.ailments,
      sleep: null,
    },
  };
}

// ============================================================================
// Combat State Machine
// ============================================================================

/**
 * Initialize combat state from encounter data
 */
export function initializeCombat(encounter: EncounterData): CombatState {
  // Create empty 3x3 grid
  const grid: BattleTile[][] = [];
  for (let row = 0; row < 3; row++) {
    grid[row] = [];
    for (let col = 0; col < 3; col++) {
      grid[row][col] = {
        position: [row, col],
        entities: [],
        hazard: null,
      };
    }
  }

  // Create party entities
  const party: CombatEntity[] = encounter.party.map((member) => ({
    id: member.id,
    name: member.name,
    hp: member.hp,
    maxHp: member.maxHp,
    tp: member.tp,
    maxTp: member.maxTp,
    stats: { ...member.stats },
    position: null, // Party members not on grid
    binds: { head: 0, arm: 0, leg: 0 },
    ailments: {
      poison: null,
      paralyze: null,
      sleep: null,
      blind: null,
    },
    resistances: {
      head: 0,
      arm: 0,
      leg: 0,
      poison: 0,
      paralyze: 0,
      sleep: 0,
      blind: 0,
    },
    isParty: true,
    skills: member.learnedSkills,
    buffs: [],
  }));

  // Create enemy entities and place on grid
  const enemies: CombatEntity[] = [];
  let gridWithEnemies = grid;

  for (const placement of encounter.enemies) {
    const enemy: CombatEntity = {
      id: placement.instanceId,
      name: placement.definition.name,
      hp: placement.definition.maxHp,
      maxHp: placement.definition.maxHp,
      tp: placement.definition.maxTp,
      maxTp: placement.definition.maxTp,
      stats: { ...placement.definition.stats },
      position: placement.position,
      binds: { head: 0, arm: 0, leg: 0 },
      ailments: {
        poison: null,
        paralyze: null,
        sleep: null,
        blind: null,
      },
      resistances: {
        head: 0,
        arm: 0,
        leg: 0,
        poison: 0,
        paralyze: 0,
        sleep: 0,
        blind: 0,
      },
      isParty: false,
      skills: placement.definition.skills,
      buffs: [],
    };

    enemies.push(enemy);
    gridWithEnemies = addEntityToTile(gridWithEnemies, enemy.id, placement.position);
  }

  // Create turn order sorted by speed
  const allEntities = [...party, ...enemies];
  const sortedEntities = sortBySpeed(allEntities);

  const turnOrder: TurnEntry[] = sortedEntities.map((entity) => ({
    entityId: entity.id,
    speed: calculateSpeed(entity),
    hasActed: false,
    isDefending: false,
  }));

  return {
    phase: 'active',
    turnOrder,
    currentActorIndex: 0,
    party,
    enemies,
    grid: gridWithEnemies,
    comboCounter: 0,
    canFlee: encounter.canFlee,
  };
}

/**
 * Check victory/defeat conditions
 */
export function checkVictoryDefeat(state: CombatState): {
  victory: boolean;
  defeat: boolean;
} {
  return {
    victory: isAllEnemiesDefeated(state),
    defeat: isPartyWiped(state),
  };
}

/**
 * Reset combo counter (call at end of turn)
 */
export function resetComboCounter(state: CombatState): CombatState {
  return {
    ...state,
    comboCounter: 0,
  };
}

/**
 * Process turn end for an entity
 * Ticks status durations
 */
export function processTurnEnd(
  state: CombatState,
  entityId: string
): { state: CombatState; events: CombatEventUnion[] } {
  const entity = findEntity(state, entityId);
  if (!entity) {
    return { state, events: [] };
  }

  const tickedEntity = tickStatusDurations(entity);
  const newState = updateEntity(state, entityId, tickedEntity);

  return { state: newState, events: [] };
}

/** Result of action execution */
export interface ActionResult {
  state: CombatState;
  events: CombatEventUnion[];
}

/**
 * Execute defend action
 * Sets defending flag for damage reduction (applied in future damage calc)
 */
export function executeDefend(state: CombatState, actorId: string): ActionResult {
  // Set defending flag on turn entry
  const newTurnOrder = state.turnOrder.map((entry) =>
    entry.entityId === actorId ? { ...entry, isDefending: true } : entry
  );

  return {
    state: { ...state, turnOrder: newTurnOrder },
    events: [],
  };
}

/**
 * Execute flee action
 * MVP: 50% chance, modified by leg bind check already done in canFlee
 */
export function executeFlee(state: CombatState, rng: RNG = defaultRNG): ActionResult {
  // Simple 50% chance
  const success = rng() < 0.5;

  if (success) {
    const event: FleeSuccessEvent = {
      type: 'flee-success',
      timestamp: Date.now(),
    };
    return {
      state: { ...state, phase: 'defeat' }, // Treat as "defeat" to exit combat
      events: [event],
    };
  } else {
    const event: FleeFailedEvent = {
      type: 'flee-failed',
      timestamp: Date.now(),
    };
    return {
      state,
      events: [event],
    };
  }
}

/**
 * Execute a combat action
 * Routes to specific action handlers, checks victory/defeat, advances turn
 */
export function executeAction(
  state: CombatState,
  action: Action,
  rng: RNG = defaultRNG,
  skillLookup?: (id: string) => SkillDefinition
): ActionResult {
  // Validate actor is alive
  const actor = findEntity(state, action.actorId);
  if (!actor || !isAlive(actor)) {
    return { state, events: [] };
  }

  let result: ActionResult = { state, events: [] };

  // Route to action handler
  switch (action.type) {
    case 'attack': {
      const attackAction = action as AttackAction;
      result = executeAttack(state, action.actorId, attackAction.targetTile, rng);
      break;
    }

    case 'defend': {
      result = executeDefend(state, action.actorId);
      break;
    }

    case 'flee': {
      result = executeFlee(state, rng);
      break;
    }

    case 'skill': {
      const skillAction = action as SkillAction;
      result = executeSkillAction(state, action.actorId, skillAction.skillId, skillAction.targetTile, rng, skillLookup);
      break;
    }

    case 'item':
      // MVP: Not implemented yet
      return { state, events: [] };

    default:
      return { state, events: [] };
  }

  // Check victory/defeat
  const { victory, defeat } = checkVictoryDefeat(result.state);

  if (victory) {
    const victoryEvent: VictoryEvent = {
      type: 'victory',
      timestamp: Date.now(),
    };
    return {
      state: { ...result.state, phase: 'victory' },
      events: [...result.events, victoryEvent],
    };
  }

  if (defeat) {
    const defeatEvent: DefeatEvent = {
      type: 'defeat',
      timestamp: Date.now(),
    };
    return {
      state: { ...result.state, phase: 'defeat' },
      events: [...result.events, defeatEvent],
    };
  }

  // Mark actor as having acted
  const newTurnOrder = result.state.turnOrder.map((entry) =>
    entry.entityId === action.actorId ? { ...entry, hasActed: true } : entry
  );

  return {
    state: { ...result.state, turnOrder: newTurnOrder },
    events: result.events,
  };
}

/**
 * Execute an enemy's turn.
 * 60% basic attack, 40% random available skill.
 * Party members aren't on the grid, so enemies attack them directly.
 */
export function executeEnemyTurn(
  state: CombatState,
  actorId: string,
  rng: RNG = defaultRNG,
  skillLookup?: (id: string) => SkillDefinition
): ActionResult {
  const actor = findEntity(state, actorId);
  if (!actor || !isAlive(actor) || actor.isParty) {
    return { state, events: [] };
  }

  // Try to use a skill (40% chance if skills available)
  if (skillLookup && actor.skills.length > 0 && rng() < 0.4) {
    const usableSkills = actor.skills
      .map((id) => skillLookup(id))
      .filter((s): s is SkillDefinition => s !== undefined && !s.isPassive)
      .filter((s) => canUseSkill(actor, s).canUse);

    if (usableSkills.length > 0) {
      const skill = usableSkills[Math.floor(rng() * usableSkills.length)];

      // Pick a target tile — for enemy skills targeting tiles, pick a random
      // occupied tile or just [0,0] for party-targeting skills
      const targetTile: GridPosition = actor.position ?? [1, 1];

      const skillResult = executeSkillAction(state, actorId, skill.id, targetTile, rng, skillLookup);

      // Mark actor as having acted
      const newTurnOrder = skillResult.state.turnOrder.map((entry) =>
        entry.entityId === actorId ? { ...entry, hasActed: true } : entry
      );

      return {
        state: { ...skillResult.state, turnOrder: newTurnOrder },
        events: skillResult.events,
      };
    }
  }

  // Basic attack fallback
  const aliveParty = getAliveParty(state);
  if (aliveParty.length === 0) {
    return { state, events: [] };
  }

  const targetIndex = Math.floor(rng() * aliveParty.length);
  const target = aliveParty[targetIndex];

  // Check if defender is defending
  const targetTurnEntry = state.turnOrder.find((e) => e.entityId === target.id);
  const targetIsDefending = targetTurnEntry?.isDefending ?? false;

  // Calculate damage (multiplier 1.0 for basic attack)
  const result = calculateDamage(actor, target, 1.0, 0, rng, 'str', targetIsDefending);

  // Apply damage
  const damagedTarget = applyDamage(target, result.damage);
  let newState = updateEntity(state, target.id, damagedTarget);

  const events: CombatEventUnion[] = [];

  const damageEvent: DamageEvent = {
    type: 'damage',
    timestamp: Date.now(),
    targetId: target.id,
    damage: result.damage,
    isCrit: result.isCrit,
    killed: result.killed,
  };
  events.push(damageEvent);

  // Mark actor as having acted
  const newTurnOrder = newState.turnOrder.map((entry) =>
    entry.entityId === actorId ? { ...entry, hasActed: true } : entry
  );
  newState = { ...newState, turnOrder: newTurnOrder };

  // Check victory/defeat
  const { victory, defeat } = checkVictoryDefeat(newState);

  if (defeat) {
    const defeatEvent: DefeatEvent = {
      type: 'defeat',
      timestamp: Date.now(),
    };
    return {
      state: { ...newState, phase: 'defeat' },
      events: [...events, defeatEvent],
    };
  }

  if (victory) {
    const victoryEvent: VictoryEvent = {
      type: 'victory',
      timestamp: Date.now(),
    };
    return {
      state: { ...newState, phase: 'victory' },
      events: [...events, victoryEvent],
    };
  }

  return { state: newState, events };
}

// ============================================================================
// Skill Execution Engine
// ============================================================================

/**
 * Check if an entity can use a skill.
 * Validates: alive, enough TP, not blocked by binds.
 */
export function canUseSkill(
  entity: CombatEntity,
  skill: SkillDefinition
): { canUse: boolean; reason?: string } {
  if (!isAlive(entity)) {
    return { canUse: false, reason: 'Dead' };
  }
  if (entity.tp < skill.tpCost) {
    return { canUse: false, reason: 'Not enough TP' };
  }
  if (skill.bodyPartRequired === 'arm' && isArmBound(entity)) {
    return { canUse: false, reason: 'Arm is bound' };
  }
  if (skill.bodyPartRequired === 'head' && isHeadBound(entity)) {
    return { canUse: false, reason: 'Head is bound' };
  }
  return { canUse: true };
}

/**
 * Resolve target tiles from a skill's target type.
 * Expands single-tile → adjacent-tiles, all-enemies, etc.
 */
export function resolveTargetTiles(
  state: CombatState,
  targetTile: GridPosition,
  targetType: SkillDefinition['targetType']
): GridPosition[] {
  switch (targetType) {
    case 'single-tile':
      return [targetTile];

    case 'adjacent-tiles': {
      const tiles: GridPosition[] = [targetTile];
      const [row, col] = targetTile;
      const adjacents: GridPosition[] = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ];
      for (const pos of adjacents) {
        if (isValidPosition(pos)) {
          tiles.push(pos);
        }
      }
      return tiles;
    }

    case 'all-enemies': {
      const tiles: GridPosition[] = [];
      for (const enemy of getAliveEnemies(state)) {
        if (enemy.position) {
          // Avoid duplicate tiles
          if (!tiles.some(([r, c]) => r === enemy.position![0] && c === enemy.position![1])) {
            tiles.push(enemy.position);
          }
        }
      }
      return tiles;
    }

    case 'single-ally':
    case 'all-allies':
    case 'self':
      // These don't use grid tiles, handled separately
      return [];
  }
}

/**
 * Get the number of active binds on an entity.
 */
export function countActiveBinds(entity: CombatEntity): number {
  let count = 0;
  if (entity.binds.head > 0) count++;
  if (entity.binds.arm > 0) count++;
  if (entity.binds.leg > 0) count++;
  return count;
}

/**
 * Check if an entity has any active ailment.
 */
export function hasAnyAilment(entity: CombatEntity): boolean {
  return !!(
    entity.ailments.poison ||
    entity.ailments.paralyze ||
    entity.ailments.sleep ||
    entity.ailments.blind
  );
}

/**
 * Evaluate a conditional skill's predicate against a target.
 */
export function evaluateCondition(
  condition: import('../types/character').SkillCondition,
  target: CombatEntity,
  state: CombatState
): boolean {
  const cond = condition;
  switch (cond.type) {
    case 'has-any-bind':
      return countActiveBinds(target) > 0;
    case 'has-all-binds':
      return target.binds.head > 0 && target.binds.arm > 0 && target.binds.leg > 0;
    case 'has-leg-bind':
      return target.binds.leg > 0;
    case 'has-ailment':
      return hasAnyAilment(target);
    case 'on-hazard': {
      if (!target.position) return false;
      const tile = getTile(state.grid, target.position);
      return tile?.hazard != null;
    }
    case 'below-hp-percent': {
      const threshold = cond.threshold ?? 25;
      return (target.hp / target.maxHp) * 100 < threshold;
    }
  }
}

/**
 * Check if defender is currently defending (from turn order).
 */
function isEntityDefending(state: CombatState, entityId: string): boolean {
  const entry = state.turnOrder.find((e) => e.entityId === entityId);
  return entry?.isDefending ?? false;
}

/**
 * Apply a single heal to an entity.
 */
function applyHeal(entity: CombatEntity, amount: number): CombatEntity {
  return {
    ...entity,
    hp: Math.min(entity.maxHp, entity.hp + amount),
  };
}

/**
 * Process a single skill effect on the state.
 * Returns updated state and events.
 */
function processSkillEffect(
  state: CombatState,
  actor: CombatEntity,
  effect: SkillEffect,
  targetTiles: GridPosition[],
  targetAllyId: string | null,
  rng: RNG
): ActionResult {
  const events: CombatEventUnion[] = [];
  let newState = state;

  switch (effect.type) {
    case 'damage': {
      for (const tile of targetTiles) {
        const entityIds = getEntitiesAtTile(newState.grid, tile);
        for (const id of entityIds) {
          const target = findEntity(newState, id);
          if (!target || !isAlive(target)) continue;
          const defending = isEntityDefending(newState, id);
          const result = calculateDamage(actor, target, effect.multiplier, newState.comboCounter, rng, effect.stat, defending);
          const damaged = applyDamage(target, result.damage);
          newState = updateEntity(newState, id, damaged);
          newState = { ...newState, comboCounter: newState.comboCounter + 1 };
          events.push({
            type: 'damage', timestamp: Date.now(), targetId: id,
            damage: result.damage, isCrit: result.isCrit, killed: result.killed,
          });
        }
      }
      break;
    }

    case 'displacement': {
      for (const tile of targetTiles) {
        const entityIds = getEntitiesAtTile(newState.grid, tile);
        for (const id of entityIds) {
          const displacementResult = displaceEntity(newState, id, {
            direction: effect.direction as DisplacementDirection,
            distance: effect.distance,
          });
          newState = displacementResult.state;
          events.push(...displacementResult.events);
        }
      }
      break;
    }

    case 'bind': {
      // For ally targeting (cure binds), duration 0 means remove
      if (targetAllyId && effect.duration === 0) {
        const ally = findEntity(newState, targetAllyId);
        if (ally) {
          const cured: CombatEntity = {
            ...ally,
            binds: { ...ally.binds, [effect.bindType]: 0 },
          };
          newState = updateEntity(newState, targetAllyId, cured);
        }
        break;
      }

      // Enemy targeting: apply bind
      for (const tile of targetTiles) {
        const entityIds = getEntitiesAtTile(newState.grid, tile);
        for (const id of entityIds) {
          const target = findEntity(newState, id);
          if (!target || !isAlive(target)) continue;
          const bindApp: BindApplication = {
            type: effect.bindType,
            baseDuration: effect.duration,
            baseChance: effect.chance,
          };
          const bindResult = applyBind(target, bindApp, rng);
          newState = updateEntity(newState, id, bindResult.entity);
          events.push({
            type: 'bind-applied', timestamp: Date.now(), targetId: id,
            bindType: effect.bindType, duration: bindResult.finalDuration,
            resisted: !bindResult.applied,
          } as BindAppliedEvent);
        }
      }
      break;
    }

    case 'ailment': {
      // For ally targeting (purify), duration 0 means remove
      if (targetAllyId && effect.duration === 0) {
        const ally = findEntity(newState, targetAllyId);
        if (ally) {
          const cured: CombatEntity = {
            ...ally,
            ailments: {
              ...ally.ailments,
              poison: null,
              paralyze: null,
              sleep: null,
              blind: null,
            },
          };
          newState = updateEntity(newState, targetAllyId, cured);
        }
        break;
      }

      // Enemy targeting: apply ailment
      for (const tile of targetTiles) {
        const entityIds = getEntitiesAtTile(newState.grid, tile);
        for (const id of entityIds) {
          const target = findEntity(newState, id);
          if (!target || !isAlive(target)) continue;

          let ailmentData: AilmentData;
          switch (effect.ailmentType) {
            case 'poison':
              ailmentData = { type: 'poison', damagePerTurn: effect.damagePerTurn ?? 3, turnsRemaining: effect.duration };
              break;
            case 'paralyze':
              ailmentData = { type: 'paralyze', skipChance: 50, turnsRemaining: effect.duration };
              break;
            case 'sleep':
              ailmentData = { type: 'sleep', turnsRemaining: effect.duration };
              break;
            case 'blind':
              ailmentData = { type: 'blind', accuracyPenalty: 30, turnsRemaining: effect.duration };
              break;
          }
          const ailmentResult = applyAilment(target, effect.ailmentType, ailmentData, effect.chance, rng);
          newState = updateEntity(newState, id, ailmentResult.entity);
          events.push({
            type: 'ailment-applied', timestamp: Date.now(), targetId: id,
            ailment: effect.ailmentType, resisted: !ailmentResult.applied,
          } as AilmentAppliedEvent);
        }
      }
      break;
    }

    case 'hazard': {
      for (const tile of targetTiles) {
        newState = {
          ...newState,
          grid: placeHazard(newState.grid, tile, effect.hazardType),
        };
        events.push({
          type: 'hazard-placed', timestamp: Date.now(),
          hazard: effect.hazardType, position: tile,
        } as HazardPlacedEvent);
      }
      break;
    }

    case 'heal': {
      if (targetAllyId) {
        // Single ally heal
        const ally = findEntity(newState, targetAllyId);
        if (ally && isAlive(ally)) {
          const amount = Math.floor(actor.stats.wis * effect.multiplier);
          const healed = applyHeal(ally, amount);
          newState = updateEntity(newState, targetAllyId, healed);
          events.push({
            type: 'heal', timestamp: Date.now(), targetId: targetAllyId, amount,
          } as HealEvent);
        }
      } else {
        // All allies heal
        for (const member of getAliveParty(newState)) {
          const amount = Math.floor(actor.stats.wis * effect.multiplier);
          const healed = applyHeal(member, amount);
          newState = updateEntity(newState, member.id, healed);
          events.push({
            type: 'heal', timestamp: Date.now(), targetId: member.id, amount,
          } as HealEvent);
        }
      }
      break;
    }

    case 'conditional-damage': {
      for (const tile of targetTiles) {
        const entityIds = getEntitiesAtTile(newState.grid, tile);
        for (const id of entityIds) {
          const target = findEntity(newState, id);
          if (!target || !isAlive(target)) continue;

          let conditionMet = evaluateCondition(effect.condition, target, newState);

          // For ally healing conditions (below-hp-percent on revitalize)
          if (effect.condition.type === 'below-hp-percent' && targetAllyId) {
            const ally = findEntity(newState, targetAllyId);
            if (!ally) continue;
            conditionMet = (ally.hp / ally.maxHp) * 100 < (effect.condition.threshold ?? 25);
            if (conditionMet) {
              const amount = Math.floor(actor.stats.wis * effect.multiplier);
              const healed = applyHeal(ally, amount);
              newState = updateEntity(newState, targetAllyId, healed);
              events.push({
                type: 'heal', timestamp: Date.now(), targetId: targetAllyId, amount,
              } as HealEvent);
            }
            break;
          }

          if (!conditionMet) {
            // Fall back to 1.0x damage if condition not met
            const defending = isEntityDefending(newState, id);
            const result = calculateDamage(actor, target, 1.0, newState.comboCounter, rng, effect.stat, defending);
            const damaged = applyDamage(target, result.damage);
            newState = updateEntity(newState, id, damaged);
            newState = { ...newState, comboCounter: newState.comboCounter + 1 };
            events.push({
              type: 'damage', timestamp: Date.now(), targetId: id,
              damage: result.damage, isCrit: result.isCrit, killed: result.killed,
            });
          } else {
            let mult = effect.multiplier;
            if (effect.perBindMultiplier) {
              mult = effect.multiplier * countActiveBinds(target);
            }
            const defending = isEntityDefending(newState, id);
            const result = calculateDamage(actor, target, mult, newState.comboCounter, rng, effect.stat, defending);
            const damaged = applyDamage(target, result.damage);
            newState = updateEntity(newState, id, damaged);
            newState = { ...newState, comboCounter: newState.comboCounter + 1 };
            events.push({
              type: 'damage', timestamp: Date.now(), targetId: id,
              damage: result.damage, isCrit: result.isCrit, killed: result.killed,
            });
          }
        }
      }
      break;
    }

    case 'multi-hit': {
      for (const tile of targetTiles) {
        const entityIds = getEntitiesAtTile(newState.grid, tile);
        for (const id of entityIds) {
          for (let hit = 0; hit < effect.hits; hit++) {
            const target = findEntity(newState, id);
            if (!target || !isAlive(target)) break;
            const defending = isEntityDefending(newState, id);
            const result = calculateDamage(actor, target, effect.multiplierPerHit, newState.comboCounter, rng, effect.stat, defending);
            const damaged = applyDamage(target, result.damage);
            newState = updateEntity(newState, id, damaged);
            newState = { ...newState, comboCounter: newState.comboCounter + 1 };
            events.push({
              type: 'damage', timestamp: Date.now(), targetId: id,
              damage: result.damage, isCrit: result.isCrit, killed: result.killed,
            });
          }
        }
      }
      break;
    }

    case 'aoe-splash': {
      // Target tile + orthogonal adjacent tiles
      const allTiles = resolveTargetTiles(state, targetTiles[0] ?? [1, 1], 'adjacent-tiles');
      for (const tile of allTiles) {
        const entityIds = getEntitiesAtTile(newState.grid, tile);
        for (const id of entityIds) {
          const target = findEntity(newState, id);
          if (!target || !isAlive(target)) continue;
          const defending = isEntityDefending(newState, id);
          const result = calculateDamage(actor, target, effect.multiplier, newState.comboCounter, rng, effect.stat, defending);
          const damaged = applyDamage(target, result.damage);
          newState = updateEntity(newState, id, damaged);
          newState = { ...newState, comboCounter: newState.comboCounter + 1 };
          events.push({
            type: 'damage', timestamp: Date.now(), targetId: id,
            damage: result.damage, isCrit: result.isCrit, killed: result.killed,
          });
        }
      }
      break;
    }

    case 'self-buff': {
      if (effect.duration > 0) {
        const buff: BuffState = {
          skillId: 'skill-buff',
          buffStat: effect.buffStat,
          amount: effect.amount,
          turnsRemaining: effect.duration,
        };
        const buffedActor: CombatEntity = {
          ...actor,
          buffs: [...actor.buffs, buff],
          stats: {
            ...actor.stats,
            [effect.buffStat]: actor.stats[effect.buffStat] + effect.amount,
          },
        };
        newState = updateEntity(newState, actor.id, buffedActor);
      }
      break;
    }
  }

  return { state: newState, events };
}

/**
 * Execute a skill action. Main entry point for skill usage.
 *
 * Flow:
 * 1. Validate: alive, enough TP, not blocked by binds
 * 2. Deduct TP
 * 3. Resolve target tiles from skill.targetType
 * 4. Process each effect in skill.effects order
 * 5. Return new state + events
 */
export function executeSkillAction(
  state: CombatState,
  actorId: string,
  skillId: string,
  targetTile: GridPosition,
  rng: RNG = defaultRNG,
  skillLookup?: (id: string) => SkillDefinition
): ActionResult {
  const actor = findEntity(state, actorId);
  if (!actor || !isAlive(actor)) {
    return { state, events: [] };
  }

  // Look up skill (use provided lookup or lazy import)
  let skill: SkillDefinition;
  if (skillLookup) {
    skill = skillLookup(skillId);
  } else {
    // Dynamic import alternative: caller should provide lookup
    // For now, this is a fallback that allows test injection
    return { state, events: [] };
  }

  // Validate skill usage
  const check = canUseSkill(actor, skill);
  if (!check.canUse) {
    return { state, events: [] };
  }

  // Deduct TP
  const actorWithTpDeducted: CombatEntity = {
    ...actor,
    tp: actor.tp - skill.tpCost,
  };
  let newState = updateEntity(state, actorId, actorWithTpDeducted);

  // Resolve target tiles
  const targetTiles = resolveTargetTiles(newState, targetTile, skill.targetType);

  // Determine ally target for healing/cure skills
  // targetTile is repurposed: for ally-targeting skills, targetTile[0] is used as an index
  // into the party array. But we'll use the actorId's party context instead.
  // For single-ally, the targetTile is passed but we use a separate mechanism.
  // Actually, for ally targeting we encode the target member's index in the targetTile.
  let targetAllyId: string | null = null;
  if (skill.targetType === 'single-ally') {
    // Use targetTile[0] as party member index
    const idx = targetTile[0];
    const ally = newState.party[idx];
    if (ally) {
      targetAllyId = ally.id;
    }
  }

  const allEvents: CombatEventUnion[] = [];

  // Get the current actor with updated TP
  const currentActor = findEntity(newState, actorId)!;

  // Process each effect in order
  for (const effect of skill.effects) {
    const effectResult = processSkillEffect(
      newState, currentActor, effect, targetTiles, targetAllyId, rng
    );
    newState = effectResult.state;
    allEvents.push(...effectResult.events);
  }

  return { state: newState, events: allEvents };
}

/**
 * Tick buff durations at end of turn.
 * Decrements buff counters, removes expired, reverts stat bonuses.
 */
export function tickBuffs(entity: CombatEntity): CombatEntity {
  const newBuffs: BuffState[] = [];
  let stats = { ...entity.stats };

  for (const buff of entity.buffs) {
    const remaining = buff.turnsRemaining - 1;
    if (remaining > 0) {
      newBuffs.push({ ...buff, turnsRemaining: remaining });
    } else {
      // Revert stat bonus
      stats = { ...stats, [buff.buffStat]: stats[buff.buffStat] - buff.amount };
    }
  }

  return { ...entity, buffs: newBuffs, stats };
}

/**
 * Calculate combat rewards after victory
 */
export function calculateRewards(state: CombatState): CombatRewards {
  // MVP: Fixed 100 XP, no material drops
  let totalXp = 100;

  // Add XP from defeated enemies
  for (const enemy of state.enemies) {
    if (!isAlive(enemy)) {
      totalXp += 20; // MVP: fixed 20 XP per enemy
    }
  }

  return {
    xp: totalXp,
    materials: [],
  };
}
