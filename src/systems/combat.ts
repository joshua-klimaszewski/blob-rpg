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
