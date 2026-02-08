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
  DisplacementDirection,
  DisplacementEffect,
  HazardType,
  DisplacementEvent,
  HazardTriggeredEvent,
  HazardPlacedEvent,
  PoisonData,
} from '../types/combat';

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
 * - baseDmg = attacker.str * multiplier - defender.vit / 2
 * - Variance: 0.9-1.1 via RNG
 * - Crit: rng() < (attacker.luc / 100) → dmg * 1.5
 * - Arm bind on attacker → dmg * 0.5
 * - Combo multiplier → dmg * (1 + comboCounter * 0.1)
 */
export function calculateDamage(
  attacker: CombatEntity,
  defender: CombatEntity,
  multiplier: number,
  comboCounter: number,
  rng: RNG = defaultRNG
): DamageResult {
  // Base damage calculation
  const baseDmg = Math.max(1, attacker.stats.str * multiplier - defender.stats.vit / 2);

  // Variance (0.9 to 1.1)
  const variance = 0.9 + rng() * 0.2;
  let damage = baseDmg * variance;

  // Critical hit check
  const critChance = attacker.stats.luc / 100;
  const isCrit = rng() < critChance;
  if (isCrit) {
    damage *= 1.5;
  }

  // Arm bind penalty on attacker
  if (isArmBound(attacker)) {
    damage *= 0.5;
  }

  // Combo multiplier
  const comboMultiplier = 1 + comboCounter * 0.1;
  damage *= comboMultiplier;

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

    // Calculate damage (MVP: multiplier = 1.0 for basic attack)
    const result = calculateDamage(attacker, defender, 1.0, newState.comboCounter, rng);

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
  hazard: HazardType,
  rng: RNG = defaultRNG
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
  effect: DisplacementEffect,
  rng: RNG = defaultRNG
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
    const hazardResult = triggerHazard(movedEntity, tile.hazard, rng);
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
