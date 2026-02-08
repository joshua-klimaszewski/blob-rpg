/**
 * Combat System Tests
 */

import { describe, it, expect } from 'vitest';
import type {
  GridPosition,
  BattleTile,
  CombatEntity,
  CombatState,
  EntityStats,
  BindState,
  AilmentState,
  ResistanceState,
  TurnEntry,
} from '../types/combat';
import {
  isValidPosition,
  getTile,
  getEntitiesAtTile,
  addEntityToTile,
  removeEntityFromTile,
  getEntityPosition,
  moveEntity,
  findEntity,
  isAlive,
  getAliveParty,
  getAliveEnemies,
  isPartyWiped,
  isAllEnemiesDefeated,
  hasBind,
  isHeadBound,
  isArmBound,
  isLegBound,
  canUsePhysicalAttack,
  canUseSpell,
  canFlee,
  calculateSpeed,
  sortBySpeed,
  getCurrentActor,
  getNextAliveActor,
  advanceTurn,
  calculateDamage,
  applyDamage,
  executeAttack,
  type RNG,
} from './combat';

// ============================================================================
// Test Fixtures
// ============================================================================

function createEmptyGrid(): BattleTile[][] {
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
  return grid;
}

function createDefaultStats(): EntityStats {
  return {
    str: 10,
    vit: 10,
    int: 10,
    wis: 10,
    agi: 10,
    luc: 10,
  };
}

function createDefaultBinds(): BindState {
  return { head: 0, arm: 0, leg: 0 };
}

function createDefaultAilments(): AilmentState {
  return {
    poison: null,
    paralyze: null,
    sleep: null,
    blind: null,
  };
}

function createDefaultResistances(): ResistanceState {
  return {
    head: 0,
    arm: 0,
    leg: 0,
    poison: 0,
    paralyze: 0,
    sleep: 0,
    blind: 0,
  };
}

function createTestEntity(overrides?: Partial<CombatEntity>): CombatEntity {
  return {
    id: 'test-entity',
    name: 'Test Entity',
    hp: 50,
    maxHp: 50,
    tp: 20,
    maxTp: 20,
    stats: createDefaultStats(),
    position: [0, 0],
    binds: createDefaultBinds(),
    ailments: createDefaultAilments(),
    resistances: createDefaultResistances(),
    isParty: false,
    ...overrides,
  };
}

function createTestState(overrides?: Partial<CombatState>): CombatState {
  return {
    phase: 'active',
    turnOrder: [],
    currentActorIndex: 0,
    party: [],
    enemies: [],
    grid: createEmptyGrid(),
    comboCounter: 0,
    canFlee: true,
    ...overrides,
  };
}

// ============================================================================
// Grid Utilities Tests
// ============================================================================

describe('isValidPosition', () => {
  it('should return true for valid positions', () => {
    expect(isValidPosition([0, 0])).toBe(true);
    expect(isValidPosition([1, 1])).toBe(true);
    expect(isValidPosition([2, 2])).toBe(true);
    expect(isValidPosition([0, 2])).toBe(true);
    expect(isValidPosition([2, 0])).toBe(true);
  });

  it('should return false for out-of-bounds positions', () => {
    expect(isValidPosition([-1, 0])).toBe(false);
    expect(isValidPosition([0, -1])).toBe(false);
    expect(isValidPosition([3, 0])).toBe(false);
    expect(isValidPosition([0, 3])).toBe(false);
    expect(isValidPosition([5, 5])).toBe(false);
  });
});

describe('getTile', () => {
  it('should return tile at valid position', () => {
    const grid = createEmptyGrid();
    const tile = getTile(grid, [1, 1]);
    expect(tile).toBeDefined();
    expect(tile?.position).toEqual([1, 1]);
  });

  it('should return undefined for out-of-bounds position', () => {
    const grid = createEmptyGrid();
    expect(getTile(grid, [-1, 0])).toBeUndefined();
    expect(getTile(grid, [3, 3])).toBeUndefined();
  });
});

describe('getEntitiesAtTile', () => {
  it('should return entities at tile', () => {
    const grid = createEmptyGrid();
    grid[1][1].entities = ['entity-1', 'entity-2'];

    const entities = getEntitiesAtTile(grid, [1, 1]);
    expect(entities).toEqual(['entity-1', 'entity-2']);
  });

  it('should return empty array for empty tile', () => {
    const grid = createEmptyGrid();
    expect(getEntitiesAtTile(grid, [0, 0])).toEqual([]);
  });

  it('should return empty array for out-of-bounds', () => {
    const grid = createEmptyGrid();
    expect(getEntitiesAtTile(grid, [5, 5])).toEqual([]);
  });
});

describe('addEntityToTile', () => {
  it('should add entity to tile', () => {
    const grid = createEmptyGrid();
    const newGrid = addEntityToTile(grid, 'entity-1', [1, 1]);

    expect(getEntitiesAtTile(newGrid, [1, 1])).toEqual(['entity-1']);
    // Original grid unchanged
    expect(getEntitiesAtTile(grid, [1, 1])).toEqual([]);
  });

  it('should stack multiple entities on same tile', () => {
    const grid = createEmptyGrid();
    let newGrid = addEntityToTile(grid, 'entity-1', [1, 1]);
    newGrid = addEntityToTile(newGrid, 'entity-2', [1, 1]);

    expect(getEntitiesAtTile(newGrid, [1, 1])).toEqual(['entity-1', 'entity-2']);
  });

  it('should not modify grid for out-of-bounds position', () => {
    const grid = createEmptyGrid();
    const newGrid = addEntityToTile(grid, 'entity-1', [5, 5]);

    expect(newGrid).toBe(grid);
  });
});

describe('removeEntityFromTile', () => {
  it('should remove entity from tile', () => {
    const grid = createEmptyGrid();
    grid[1][1].entities = ['entity-1', 'entity-2'];

    const newGrid = removeEntityFromTile(grid, 'entity-1');
    expect(getEntitiesAtTile(newGrid, [1, 1])).toEqual(['entity-2']);
  });

  it('should handle entity not present', () => {
    const grid = createEmptyGrid();
    const newGrid = removeEntityFromTile(grid, 'nonexistent');

    expect(newGrid).not.toBe(grid); // New grid returned
    expect(getEntitiesAtTile(newGrid, [0, 0])).toEqual([]);
  });
});

describe('getEntityPosition', () => {
  it('should find entity position on grid', () => {
    const grid = createEmptyGrid();
    grid[1][2].entities = ['entity-1'];

    const pos = getEntityPosition(grid, 'entity-1');
    expect(pos).toEqual([1, 2]);
  });

  it('should return null if entity not found', () => {
    const grid = createEmptyGrid();
    expect(getEntityPosition(grid, 'nonexistent')).toBeNull();
  });
});

describe('moveEntity', () => {
  it('should move entity from one tile to another', () => {
    const grid = createEmptyGrid();
    grid[0][0].entities = ['entity-1'];

    const newGrid = moveEntity(grid, 'entity-1', [2, 2]);

    expect(getEntitiesAtTile(newGrid, [0, 0])).toEqual([]);
    expect(getEntitiesAtTile(newGrid, [2, 2])).toEqual(['entity-1']);
  });

  it('should not modify grid for out-of-bounds target', () => {
    const grid = createEmptyGrid();
    grid[0][0].entities = ['entity-1'];

    const newGrid = moveEntity(grid, 'entity-1', [5, 5]);

    expect(newGrid).toBe(grid);
  });
});

// ============================================================================
// Entity Utilities Tests
// ============================================================================

describe('findEntity', () => {
  it('should find entity in party', () => {
    const party1 = createTestEntity({ id: 'party-1', isParty: true });
    const state = createTestState({ party: [party1] });

    expect(findEntity(state, 'party-1')).toBe(party1);
  });

  it('should find entity in enemies', () => {
    const enemy1 = createTestEntity({ id: 'enemy-1', isParty: false });
    const state = createTestState({ enemies: [enemy1] });

    expect(findEntity(state, 'enemy-1')).toBe(enemy1);
  });

  it('should return undefined if not found', () => {
    const state = createTestState();
    expect(findEntity(state, 'nonexistent')).toBeUndefined();
  });
});

describe('isAlive', () => {
  it('should return true if HP > 0', () => {
    const entity = createTestEntity({ hp: 10 });
    expect(isAlive(entity)).toBe(true);
  });

  it('should return false if HP = 0', () => {
    const entity = createTestEntity({ hp: 0 });
    expect(isAlive(entity)).toBe(false);
  });

  it('should return false if HP < 0', () => {
    const entity = createTestEntity({ hp: -5 });
    expect(isAlive(entity)).toBe(false);
  });
});

describe('getAliveParty', () => {
  it('should return only alive party members', () => {
    const alive1 = createTestEntity({ id: 'party-1', hp: 50, isParty: true });
    const dead1 = createTestEntity({ id: 'party-2', hp: 0, isParty: true });
    const alive2 = createTestEntity({ id: 'party-3', hp: 10, isParty: true });

    const state = createTestState({ party: [alive1, dead1, alive2] });
    const result = getAliveParty(state);

    expect(result).toHaveLength(2);
    expect(result).toContain(alive1);
    expect(result).toContain(alive2);
  });
});

describe('getAliveEnemies', () => {
  it('should return only alive enemies', () => {
    const alive1 = createTestEntity({ id: 'enemy-1', hp: 30 });
    const dead1 = createTestEntity({ id: 'enemy-2', hp: 0 });
    const alive2 = createTestEntity({ id: 'enemy-3', hp: 20 });

    const state = createTestState({ enemies: [alive1, dead1, alive2] });
    const result = getAliveEnemies(state);

    expect(result).toHaveLength(2);
    expect(result).toContain(alive1);
    expect(result).toContain(alive2);
  });
});

describe('isPartyWiped', () => {
  it('should return true if all party members dead', () => {
    const dead1 = createTestEntity({ id: 'party-1', hp: 0, isParty: true });
    const dead2 = createTestEntity({ id: 'party-2', hp: 0, isParty: true });

    const state = createTestState({ party: [dead1, dead2] });
    expect(isPartyWiped(state)).toBe(true);
  });

  it('should return false if any party member alive', () => {
    const alive1 = createTestEntity({ id: 'party-1', hp: 1, isParty: true });
    const dead1 = createTestEntity({ id: 'party-2', hp: 0, isParty: true });

    const state = createTestState({ party: [alive1, dead1] });
    expect(isPartyWiped(state)).toBe(false);
  });
});

describe('isAllEnemiesDefeated', () => {
  it('should return true if all enemies dead', () => {
    const dead1 = createTestEntity({ id: 'enemy-1', hp: 0 });
    const dead2 = createTestEntity({ id: 'enemy-2', hp: 0 });

    const state = createTestState({ enemies: [dead1, dead2] });
    expect(isAllEnemiesDefeated(state)).toBe(true);
  });

  it('should return false if any enemy alive', () => {
    const alive1 = createTestEntity({ id: 'enemy-1', hp: 5 });
    const dead1 = createTestEntity({ id: 'enemy-2', hp: 0 });

    const state = createTestState({ enemies: [alive1, dead1] });
    expect(isAllEnemiesDefeated(state)).toBe(false);
  });
});

// ============================================================================
// Bind Utilities Tests
// ============================================================================

describe('bind utilities', () => {
  it('should detect head bind', () => {
    const entity = createTestEntity({ binds: { head: 2, arm: 0, leg: 0 } });
    expect(isHeadBound(entity)).toBe(true);
    expect(hasBind(entity, 'head')).toBe(true);
  });

  it('should detect arm bind', () => {
    const entity = createTestEntity({ binds: { head: 0, arm: 3, leg: 0 } });
    expect(isArmBound(entity)).toBe(true);
    expect(hasBind(entity, 'arm')).toBe(true);
  });

  it('should detect leg bind', () => {
    const entity = createTestEntity({ binds: { head: 0, arm: 0, leg: 1 } });
    expect(isLegBound(entity)).toBe(true);
    expect(hasBind(entity, 'leg')).toBe(true);
  });

  it('should return false when bind counter is 0', () => {
    const entity = createTestEntity({ binds: { head: 0, arm: 0, leg: 0 } });
    expect(isHeadBound(entity)).toBe(false);
    expect(isArmBound(entity)).toBe(false);
    expect(isLegBound(entity)).toBe(false);
  });
});

describe('canUsePhysicalAttack', () => {
  it('should return true if alive and not arm bound', () => {
    const entity = createTestEntity({ hp: 50 });
    expect(canUsePhysicalAttack(entity)).toBe(true);
  });

  it('should return false if arm bound', () => {
    const entity = createTestEntity({ hp: 50, binds: { head: 0, arm: 2, leg: 0 } });
    expect(canUsePhysicalAttack(entity)).toBe(false);
  });

  it('should return false if dead', () => {
    const entity = createTestEntity({ hp: 0 });
    expect(canUsePhysicalAttack(entity)).toBe(false);
  });
});

describe('canUseSpell', () => {
  it('should return true if alive and not head bound', () => {
    const entity = createTestEntity({ hp: 50 });
    expect(canUseSpell(entity)).toBe(true);
  });

  it('should return false if head bound', () => {
    const entity = createTestEntity({ hp: 50, binds: { head: 2, arm: 0, leg: 0 } });
    expect(canUseSpell(entity)).toBe(false);
  });

  it('should return false if dead', () => {
    const entity = createTestEntity({ hp: 0 });
    expect(canUseSpell(entity)).toBe(false);
  });
});

describe('canFlee', () => {
  it('should return true if alive, not leg bound, and flee allowed', () => {
    const entity = createTestEntity({ id: 'party-1', hp: 50, isParty: true });
    const state = createTestState({ party: [entity], canFlee: true });

    expect(canFlee(state, 'party-1')).toBe(true);
  });

  it('should return false if leg bound', () => {
    const entity = createTestEntity({
      id: 'party-1',
      hp: 50,
      isParty: true,
      binds: { head: 0, arm: 0, leg: 2 },
    });
    const state = createTestState({ party: [entity], canFlee: true });

    expect(canFlee(state, 'party-1')).toBe(false);
  });

  it('should return false if flee not allowed in state', () => {
    const entity = createTestEntity({ id: 'party-1', hp: 50, isParty: true });
    const state = createTestState({ party: [entity], canFlee: false });

    expect(canFlee(state, 'party-1')).toBe(false);
  });

  it('should return false if entity dead', () => {
    const entity = createTestEntity({ id: 'party-1', hp: 0, isParty: true });
    const state = createTestState({ party: [entity], canFlee: true });

    expect(canFlee(state, 'party-1')).toBe(false);
  });
});

// ============================================================================
// Turn Order Utilities Tests
// ============================================================================

describe('calculateSpeed', () => {
  it('should return AGI value', () => {
    const entity = createTestEntity({ stats: { ...createDefaultStats(), agi: 15 } });
    expect(calculateSpeed(entity)).toBe(15);
  });
});

describe('sortBySpeed', () => {
  it('should sort entities by speed descending', () => {
    const slow = createTestEntity({ id: 'slow', stats: { ...createDefaultStats(), agi: 5 } });
    const medium = createTestEntity({ id: 'medium', stats: { ...createDefaultStats(), agi: 10 } });
    const fast = createTestEntity({ id: 'fast', stats: { ...createDefaultStats(), agi: 20 } });

    const sorted = sortBySpeed([slow, medium, fast]);
    expect(sorted.map((e) => e.id)).toEqual(['fast', 'medium', 'slow']);
  });

  it('should not mutate original array', () => {
    const entities = [
      createTestEntity({ id: 'a', stats: { ...createDefaultStats(), agi: 5 } }),
      createTestEntity({ id: 'b', stats: { ...createDefaultStats(), agi: 10 } }),
    ];
    const original = [...entities];

    sortBySpeed(entities);
    expect(entities).toEqual(original);
  });
});

describe('getCurrentActor', () => {
  it('should return current actor entity', () => {
    const entity1 = createTestEntity({ id: 'entity-1' });
    const entity2 = createTestEntity({ id: 'entity-2' });

    const turnOrder: TurnEntry[] = [
      { entityId: 'entity-1', speed: 10, hasActed: false, isDefending: false },
      { entityId: 'entity-2', speed: 8, hasActed: false, isDefending: false },
    ];

    const state = createTestState({
      party: [entity1],
      enemies: [entity2],
      turnOrder,
      currentActorIndex: 1,
    });

    expect(getCurrentActor(state)).toBe(entity2);
  });

  it('should return undefined if index out of bounds', () => {
    const state = createTestState({ turnOrder: [], currentActorIndex: 0 });
    expect(getCurrentActor(state)).toBeUndefined();
  });
});

describe('getNextAliveActor', () => {
  it('should return first alive actor starting from current index', () => {
    const alive1 = createTestEntity({ id: 'alive-1', hp: 50 });
    const dead1 = createTestEntity({ id: 'dead-1', hp: 0 });
    const alive2 = createTestEntity({ id: 'alive-2', hp: 30 });

    const turnOrder: TurnEntry[] = [
      { entityId: 'dead-1', speed: 10, hasActed: false, isDefending: false },
      { entityId: 'alive-2', speed: 8, hasActed: false, isDefending: false },
      { entityId: 'alive-1', speed: 6, hasActed: false, isDefending: false },
    ];

    const state = createTestState({
      party: [alive1],
      enemies: [dead1, alive2],
      turnOrder,
      currentActorIndex: 0,
    });

    expect(getNextAliveActor(state)).toBe(alive2);
  });

  it('should wrap around to find alive actor', () => {
    const alive1 = createTestEntity({ id: 'alive-1', hp: 50 });
    const dead1 = createTestEntity({ id: 'dead-1', hp: 0 });

    const turnOrder: TurnEntry[] = [
      { entityId: 'alive-1', speed: 10, hasActed: false, isDefending: false },
      { entityId: 'dead-1', speed: 8, hasActed: false, isDefending: false },
    ];

    const state = createTestState({
      party: [alive1],
      enemies: [dead1],
      turnOrder,
      currentActorIndex: 1,
    });

    expect(getNextAliveActor(state)).toBe(alive1);
  });

  it('should return null if no alive actors', () => {
    const dead1 = createTestEntity({ id: 'dead-1', hp: 0 });
    const dead2 = createTestEntity({ id: 'dead-2', hp: 0 });

    const turnOrder: TurnEntry[] = [
      { entityId: 'dead-1', speed: 10, hasActed: false, isDefending: false },
      { entityId: 'dead-2', speed: 8, hasActed: false, isDefending: false },
    ];

    const state = createTestState({
      enemies: [dead1, dead2],
      turnOrder,
      currentActorIndex: 0,
    });

    expect(getNextAliveActor(state)).toBeNull();
  });
});

describe('advanceTurn', () => {
  it('should increment currentActorIndex', () => {
    const turnOrder: TurnEntry[] = [
      { entityId: 'entity-1', speed: 10, hasActed: false, isDefending: false },
      { entityId: 'entity-2', speed: 8, hasActed: false, isDefending: false },
    ];

    const state = createTestState({ turnOrder, currentActorIndex: 0 });
    const newState = advanceTurn(state);

    expect(newState.currentActorIndex).toBe(1);
  });

  it('should wrap around at end of turn order', () => {
    const turnOrder: TurnEntry[] = [
      { entityId: 'entity-1', speed: 10, hasActed: false, isDefending: false },
      { entityId: 'entity-2', speed: 8, hasActed: false, isDefending: false },
    ];

    const state = createTestState({ turnOrder, currentActorIndex: 1 });
    const newState = advanceTurn(state);

    expect(newState.currentActorIndex).toBe(0);
  });

  it('should reset hasActed for new actor', () => {
    const turnOrder: TurnEntry[] = [
      { entityId: 'entity-1', speed: 10, hasActed: true, isDefending: false },
      { entityId: 'entity-2', speed: 8, hasActed: false, isDefending: false },
    ];

    const state = createTestState({ turnOrder, currentActorIndex: 0 });
    const newState = advanceTurn(state);

    expect(newState.turnOrder[1].hasActed).toBe(false);
  });
});

// ============================================================================
// Damage Calculation Tests
// ============================================================================

describe('calculateDamage', () => {
  // Deterministic RNG for testing
  const fixedRNG = (value: number): RNG => () => value;

  it('should calculate basic damage', () => {
    const attacker = createTestEntity({
      stats: { str: 20, vit: 10, int: 10, wis: 10, agi: 10, luc: 0 },
    });
    const defender = createTestEntity({
      stats: { str: 10, vit: 10, int: 10, wis: 10, agi: 10, luc: 10 },
    });

    // Fixed RNG: variance = 0.9, no crit
    const result = calculateDamage(attacker, defender, 1.0, 0, fixedRNG(0.0));

    // baseDmg = 20 * 1.0 - 10 / 2 = 15
    // variance = 0.9 → 15 * 0.9 = 13.5 → floor = 13
    expect(result.damage).toBe(13);
    expect(result.isCrit).toBe(false);
  });

  it('should apply variance correctly', () => {
    const attacker = createTestEntity({
      stats: { str: 20, vit: 10, int: 10, wis: 10, agi: 10, luc: 0 },
    });
    const defender = createTestEntity({
      stats: { str: 10, vit: 10, int: 10, wis: 10, agi: 10, luc: 10 },
    });

    // Fixed RNG: variance = 1.1 (rng = 1.0 → 0.9 + 1.0 * 0.2 = 1.1)
    const result = calculateDamage(attacker, defender, 1.0, 0, fixedRNG(1.0));

    // baseDmg = 15, variance = 1.1 → 15 * 1.1 = 16.5 → floor = 16
    expect(result.damage).toBe(16);
  });

  it('should apply critical hit multiplier', () => {
    const attacker = createTestEntity({
      stats: { str: 20, vit: 10, int: 10, wis: 10, agi: 10, luc: 100 }, // 100% crit
    });
    const defender = createTestEntity({
      stats: { str: 10, vit: 10, int: 10, wis: 10, agi: 10, luc: 10 },
    });

    // rng() returns 0.0 → always crit
    const result = calculateDamage(attacker, defender, 1.0, 0, fixedRNG(0.0));

    // baseDmg = 15, variance = 0.9, crit × 1.5 → 13.5 * 1.5 = 20.25 → floor = 20
    expect(result.damage).toBe(20);
    expect(result.isCrit).toBe(true);
  });

  it('should reduce damage when attacker is arm bound', () => {
    const attacker = createTestEntity({
      stats: { str: 20, vit: 10, int: 10, wis: 10, agi: 10, luc: 0 },
      binds: { head: 0, arm: 2, leg: 0 }, // arm bound
    });
    const defender = createTestEntity({
      stats: { str: 10, vit: 10, int: 10, wis: 10, agi: 10, luc: 10 },
    });

    const result = calculateDamage(attacker, defender, 1.0, 0, fixedRNG(0.0));

    // baseDmg = 15, variance = 0.9, arm bind × 0.5 → 13.5 * 0.5 = 6.75 → floor = 6
    expect(result.damage).toBe(6);
  });

  it('should apply combo multiplier', () => {
    const attacker = createTestEntity({
      stats: { str: 20, vit: 10, int: 10, wis: 10, agi: 10, luc: 0 },
    });
    const defender = createTestEntity({
      stats: { str: 10, vit: 10, int: 10, wis: 10, agi: 10, luc: 10 },
    });

    // Combo counter = 3 → multiplier = 1 + 3 * 0.1 = 1.3
    const result = calculateDamage(attacker, defender, 1.0, 3, fixedRNG(0.5));

    // baseDmg = 15, variance = 1.0, combo × 1.3 → 15 * 1.3 = 19.5 → floor = 19
    expect(result.damage).toBe(19);
  });

  it('should apply skill multiplier', () => {
    const attacker = createTestEntity({
      stats: { str: 20, vit: 10, int: 10, wis: 10, agi: 10, luc: 0 },
    });
    const defender = createTestEntity({
      stats: { str: 10, vit: 10, int: 10, wis: 10, agi: 10, luc: 10 },
    });

    // Multiplier = 2.0 (strong skill)
    const result = calculateDamage(attacker, defender, 2.0, 0, fixedRNG(0.5));

    // baseDmg = 20 * 2.0 - 10/2 = 35, variance = 1.0 → 35
    expect(result.damage).toBe(35);
  });

  it('should return minimum 1 damage', () => {
    const attacker = createTestEntity({
      stats: { str: 1, vit: 10, int: 10, wis: 10, agi: 10, luc: 0 },
    });
    const defender = createTestEntity({
      stats: { str: 10, vit: 100, int: 10, wis: 10, agi: 10, luc: 10 },
    });

    const result = calculateDamage(attacker, defender, 1.0, 0, fixedRNG(0.0));

    expect(result.damage).toBeGreaterThanOrEqual(1);
  });

  it('should detect when damage kills defender', () => {
    const attacker = createTestEntity({
      stats: { str: 50, vit: 10, int: 10, wis: 10, agi: 10, luc: 0 },
    });
    const defender = createTestEntity({
      hp: 10, // Low HP
      stats: { str: 10, vit: 5, int: 10, wis: 10, agi: 10, luc: 10 },
    });

    const result = calculateDamage(attacker, defender, 1.0, 0, fixedRNG(0.5));

    expect(result.killed).toBe(true);
    expect(result.damage).toBeGreaterThanOrEqual(defender.hp);
  });
});

describe('applyDamage', () => {
  it('should reduce HP by damage amount', () => {
    const entity = createTestEntity({ hp: 50, maxHp: 50 });
    const damaged = applyDamage(entity, 15);

    expect(damaged.hp).toBe(35);
  });

  it('should not reduce HP below 0', () => {
    const entity = createTestEntity({ hp: 10, maxHp: 50 });
    const damaged = applyDamage(entity, 20);

    expect(damaged.hp).toBe(0);
  });

  it('should not mutate original entity', () => {
    const entity = createTestEntity({ hp: 50, maxHp: 50 });
    const damaged = applyDamage(entity, 15);

    expect(entity.hp).toBe(50);
    expect(damaged).not.toBe(entity);
  });
});

// ============================================================================
// Attack Action Tests
// ============================================================================

describe('executeAttack', () => {
  it('should damage single enemy at target tile', () => {
    const attacker = createTestEntity({
      id: 'party-1',
      isParty: true,
      stats: { str: 20, vit: 10, int: 10, wis: 10, agi: 10, luc: 0 },
    });
    const defender = createTestEntity({
      id: 'enemy-1',
      hp: 50,
      stats: { str: 10, vit: 10, int: 10, wis: 10, agi: 10, luc: 10 },
    });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'enemy-1', [1, 1]);

    const state = createTestState({
      party: [attacker],
      enemies: [defender],
      grid,
      comboCounter: 0,
    });

    const result = executeAttack(state, 'party-1', [1, 1]);

    expect(result.events).toHaveLength(1);
    expect(result.events[0].type).toBe('damage');

    const damageEvent = result.events[0] as any;
    expect(damageEvent.targetId).toBe('enemy-1');
    expect(damageEvent.damage).toBeGreaterThan(0);

    // Enemy should take damage
    const updatedEnemy = findEntity(result.state, 'enemy-1')!;
    expect(updatedEnemy.hp).toBeLessThan(50);

    // Combo counter should increment
    expect(result.state.comboCounter).toBe(1);
  });

  it('should hit all stacked enemies at target tile (AOE)', () => {
    const attacker = createTestEntity({
      id: 'party-1',
      isParty: true,
      stats: { str: 20, vit: 10, int: 10, wis: 10, agi: 10, luc: 0 },
    });
    const enemy1 = createTestEntity({ id: 'enemy-1', hp: 50 });
    const enemy2 = createTestEntity({ id: 'enemy-2', hp: 50 });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'enemy-1', [1, 1]);
    grid = addEntityToTile(grid, 'enemy-2', [1, 1]); // Stacked

    const state = createTestState({
      party: [attacker],
      enemies: [enemy1, enemy2],
      grid,
      comboCounter: 0,
    });

    const result = executeAttack(state, 'party-1', [1, 1]);

    expect(result.events).toHaveLength(2); // Two damage events
    expect(result.state.comboCounter).toBe(2); // Combo increments twice

    // Both enemies should take damage
    const updatedEnemy1 = findEntity(result.state, 'enemy-1')!;
    const updatedEnemy2 = findEntity(result.state, 'enemy-2')!;
    expect(updatedEnemy1.hp).toBeLessThan(50);
    expect(updatedEnemy2.hp).toBeLessThan(50);
  });

  it('should increment combo counter for each hit', () => {
    const attacker = createTestEntity({
      id: 'party-1',
      isParty: true,
      stats: { str: 20, vit: 10, int: 10, wis: 10, agi: 10, luc: 0 },
    });
    const enemy1 = createTestEntity({ id: 'enemy-1', hp: 50 });
    const enemy2 = createTestEntity({ id: 'enemy-2', hp: 50 });
    const enemy3 = createTestEntity({ id: 'enemy-3', hp: 50 });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'enemy-1', [0, 0]);
    grid = addEntityToTile(grid, 'enemy-2', [0, 0]);
    grid = addEntityToTile(grid, 'enemy-3', [0, 0]);

    const state = createTestState({
      party: [attacker],
      enemies: [enemy1, enemy2, enemy3],
      grid,
      comboCounter: 0,
    });

    const result = executeAttack(state, 'party-1', [0, 0]);

    expect(result.state.comboCounter).toBe(3);
  });

  it('should return no events if target tile is empty', () => {
    const attacker = createTestEntity({ id: 'party-1', isParty: true });
    const grid = createEmptyGrid();

    const state = createTestState({
      party: [attacker],
      grid,
    });

    const result = executeAttack(state, 'party-1', [1, 1]);

    expect(result.events).toHaveLength(0);
    expect(result.state.comboCounter).toBe(0);
  });

  it('should return no events if attacker is dead', () => {
    const attacker = createTestEntity({ id: 'party-1', hp: 0, isParty: true });
    const defender = createTestEntity({ id: 'enemy-1', hp: 50 });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'enemy-1', [1, 1]);

    const state = createTestState({
      party: [attacker],
      enemies: [defender],
      grid,
    });

    const result = executeAttack(state, 'party-1', [1, 1]);

    expect(result.events).toHaveLength(0);
  });

  it('should set killed flag in event when damage kills target', () => {
    const attacker = createTestEntity({
      id: 'party-1',
      isParty: true,
      stats: { str: 100, vit: 10, int: 10, wis: 10, agi: 10, luc: 0 }, // High damage
    });
    const defender = createTestEntity({
      id: 'enemy-1',
      hp: 10, // Low HP
      stats: { str: 10, vit: 5, int: 10, wis: 10, agi: 10, luc: 10 },
    });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'enemy-1', [1, 1]);

    const state = createTestState({
      party: [attacker],
      enemies: [defender],
      grid,
    });

    const result = executeAttack(state, 'party-1', [1, 1]);

    const damageEvent = result.events[0] as any;
    expect(damageEvent.killed).toBe(true);

    const updatedEnemy = findEntity(result.state, 'enemy-1')!;
    expect(updatedEnemy.hp).toBe(0);
  });
});
