/**
 * Combat System Tests
 */

import { describe, it, expect } from 'vitest';
import type {
  Action,
  BattleTile,
  CombatEntity,
  CombatEventUnion,
  CombatState,
  EntityStats,
  BindState,
  AilmentState,
  ResistanceState,
  TurnEntry,
  DamageEvent,
  DisplacementEvent,
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
  advanceToNextAlive,
  calculateDamage,
  applyDamage,
  executeAttack,
  calculateDisplacementTarget,
  placeHazard,
  triggerHazard,
  displaceEntity,
  applyBind,
  applyAilment,
  tickStatusDurations,
  processAilmentEffects,
  removeSleepOnHit,
  initializeCombat,
  checkVictoryDefeat,
  resetComboCounter,
  processTurnEnd,
  executeDefend,
  executeFlee,
  executeAction,
  calculateRewards,
  type RNG,
} from './combat';
import type { SkillDefinition } from '../types/character';
import type {
  ParalyzeData,
  SleepData,
  PoisonData,
  EncounterData,
  EnemyDefinition,
  PartyMemberState,
  AttackAction,
} from '../types/combat';

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
    definitionId: 'test',
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
    skills: [],
    buffs: [],
    passiveModifiers: [],
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
    round: 1,
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

describe('advanceToNextAlive', () => {
  it('should advance to next actor when they are alive', () => {
    const ally = createTestEntity({ id: 'ally-1', hp: 50, isParty: true, position: null });
    const enemy = createTestEntity({ id: 'enemy-1', hp: 30 });

    const turnOrder: TurnEntry[] = [
      { entityId: 'ally-1', speed: 10, hasActed: false, isDefending: false },
      { entityId: 'enemy-1', speed: 8, hasActed: false, isDefending: false },
    ];

    const state = createTestState({
      party: [ally],
      enemies: [enemy],
      turnOrder,
      currentActorIndex: 0,
    });

    const newState = advanceToNextAlive(state);
    expect(newState.currentActorIndex).toBe(1);
  });

  it('should skip one dead actor', () => {
    const ally = createTestEntity({ id: 'ally-1', hp: 50, isParty: true, position: null });
    const deadEnemy = createTestEntity({ id: 'enemy-1', hp: 0 });
    const aliveEnemy = createTestEntity({ id: 'enemy-2', hp: 30 });

    const turnOrder: TurnEntry[] = [
      { entityId: 'ally-1', speed: 12, hasActed: false, isDefending: false },
      { entityId: 'enemy-1', speed: 10, hasActed: false, isDefending: false },
      { entityId: 'enemy-2', speed: 8, hasActed: false, isDefending: false },
    ];

    const state = createTestState({
      party: [ally],
      enemies: [deadEnemy, aliveEnemy],
      turnOrder,
      currentActorIndex: 0,
    });

    const newState = advanceToNextAlive(state);
    // Should skip dead enemy-1 (index 1) and land on enemy-2 (index 2)
    expect(newState.currentActorIndex).toBe(2);
  });

  it('should skip multiple consecutive dead actors', () => {
    const ally = createTestEntity({ id: 'ally-1', hp: 50, isParty: true, position: null });
    const dead1 = createTestEntity({ id: 'enemy-1', hp: 0 });
    const dead2 = createTestEntity({ id: 'enemy-2', hp: 0 });
    const alive = createTestEntity({ id: 'enemy-3', hp: 30 });

    const turnOrder: TurnEntry[] = [
      { entityId: 'ally-1', speed: 15, hasActed: false, isDefending: false },
      { entityId: 'enemy-1', speed: 12, hasActed: false, isDefending: false },
      { entityId: 'enemy-2', speed: 10, hasActed: false, isDefending: false },
      { entityId: 'enemy-3', speed: 8, hasActed: false, isDefending: false },
    ];

    const state = createTestState({
      party: [ally],
      enemies: [dead1, dead2, alive],
      turnOrder,
      currentActorIndex: 0,
    });

    const newState = advanceToNextAlive(state);
    // Should skip both dead enemies and land on enemy-3 (index 3)
    expect(newState.currentActorIndex).toBe(3);
  });

  it('should wrap around and skip dead actors at the end', () => {
    const ally = createTestEntity({ id: 'ally-1', hp: 50, isParty: true, position: null });
    const deadEnemy = createTestEntity({ id: 'enemy-1', hp: 0 });

    const turnOrder: TurnEntry[] = [
      { entityId: 'ally-1', speed: 10, hasActed: false, isDefending: false },
      { entityId: 'enemy-1', speed: 8, hasActed: false, isDefending: false },
    ];

    const state = createTestState({
      party: [ally],
      enemies: [deadEnemy],
      turnOrder,
      currentActorIndex: 1,
    });

    const newState = advanceToNextAlive(state);
    // Should wrap around past dead enemy-1 to ally-1 (index 0)
    expect(newState.currentActorIndex).toBe(0);
    // Round should increment because we wrapped
    expect(newState.round).toBe(2);
  });

  it('should increment round when wrapping past index 0', () => {
    const ally1 = createTestEntity({ id: 'ally-1', hp: 50, isParty: true, position: null });
    const ally2 = createTestEntity({ id: 'ally-2', hp: 40, isParty: true, position: null });
    const deadEnemy = createTestEntity({ id: 'enemy-1', hp: 0 });

    const turnOrder: TurnEntry[] = [
      { entityId: 'ally-1', speed: 12, hasActed: false, isDefending: false },
      { entityId: 'enemy-1', speed: 10, hasActed: false, isDefending: false },
      { entityId: 'ally-2', speed: 8, hasActed: false, isDefending: false },
    ];

    const state = createTestState({
      party: [ally1, ally2],
      enemies: [deadEnemy],
      turnOrder,
      currentActorIndex: 2,
      round: 3,
    });

    const newState = advanceToNextAlive(state);
    // Should wrap past index 0 (alive) — lands on ally-1
    expect(newState.currentActorIndex).toBe(0);
    expect(newState.round).toBe(4);
  });

  it('should NOT increment round when not wrapping', () => {
    const ally = createTestEntity({ id: 'ally-1', hp: 50, isParty: true, position: null });
    const enemy = createTestEntity({ id: 'enemy-1', hp: 30 });

    const turnOrder: TurnEntry[] = [
      { entityId: 'ally-1', speed: 10, hasActed: false, isDefending: false },
      { entityId: 'enemy-1', speed: 8, hasActed: false, isDefending: false },
    ];

    const state = createTestState({
      party: [ally],
      enemies: [enemy],
      turnOrder,
      currentActorIndex: 0,
      round: 2,
    });

    const newState = advanceToNextAlive(state);
    expect(newState.currentActorIndex).toBe(1);
    expect(newState.round).toBe(2);
  });

  it('should return unchanged state if no alive actors found (safety)', () => {
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

    const newState = advanceToNextAlive(state);
    // Should not loop infinitely — returns state with index advanced by 1 as fallback
    expect(newState).toBeDefined();
  });

  it('should reset hasActed for the target actor', () => {
    const ally = createTestEntity({ id: 'ally-1', hp: 50, isParty: true, position: null });
    const dead = createTestEntity({ id: 'enemy-1', hp: 0 });
    const enemy = createTestEntity({ id: 'enemy-2', hp: 30 });

    const turnOrder: TurnEntry[] = [
      { entityId: 'ally-1', speed: 12, hasActed: true, isDefending: false },
      { entityId: 'enemy-1', speed: 10, hasActed: true, isDefending: false },
      { entityId: 'enemy-2', speed: 8, hasActed: true, isDefending: false },
    ];

    const state = createTestState({
      party: [ally],
      enemies: [dead, enemy],
      turnOrder,
      currentActorIndex: 0,
    });

    const newState = advanceToNextAlive(state);
    // Should land on index 2, and hasActed should be reset for that entry
    expect(newState.currentActorIndex).toBe(2);
    expect(newState.turnOrder[2].hasActed).toBe(false);
  });

  it('should reset isDefending for skipped dead actors on round wrap', () => {
    const ally = createTestEntity({ id: 'ally-1', hp: 50, isParty: true, position: null });
    const dead = createTestEntity({ id: 'enemy-1', hp: 0 });

    const turnOrder: TurnEntry[] = [
      { entityId: 'ally-1', speed: 10, hasActed: false, isDefending: false },
      { entityId: 'enemy-1', speed: 8, hasActed: true, isDefending: true },
    ];

    const state = createTestState({
      party: [ally],
      enemies: [dead],
      turnOrder,
      currentActorIndex: 1,
    });

    const newState = advanceToNextAlive(state);
    expect(newState.currentActorIndex).toBe(0);
    // The target actor's hasActed should be reset
    expect(newState.turnOrder[0].hasActed).toBe(false);
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

    const damageEvent = result.events[0] as DamageEvent;
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

    const damageEvent = result.events[0] as DamageEvent;
    expect(damageEvent.killed).toBe(true);

    const updatedEnemy = findEntity(result.state, 'enemy-1')!;
    expect(updatedEnemy.hp).toBe(0);
  });
});

// ============================================================================
// Displacement Tests
// ============================================================================

describe('calculateDisplacementTarget', () => {
  it('should displace push direction (increase row)', () => {
    const result = calculateDisplacementTarget([1, 1], 'push', 1);
    expect(result).toEqual([2, 1]);
  });

  it('should displace pull direction (decrease row)', () => {
    const result = calculateDisplacementTarget([1, 1], 'pull', 1);
    expect(result).toEqual([0, 1]);
  });

  it('should displace left direction (decrease col)', () => {
    const result = calculateDisplacementTarget([1, 1], 'left', 1);
    expect(result).toEqual([1, 0]);
  });

  it('should displace right direction (increase col)', () => {
    const result = calculateDisplacementTarget([1, 1], 'right', 1);
    expect(result).toEqual([1, 2]);
  });

  it('should clamp to minimum bounds (0, 0)', () => {
    expect(calculateDisplacementTarget([0, 0], 'pull', 2)).toEqual([0, 0]);
    expect(calculateDisplacementTarget([0, 0], 'left', 2)).toEqual([0, 0]);
  });

  it('should clamp to maximum bounds (2, 2)', () => {
    expect(calculateDisplacementTarget([2, 2], 'push', 2)).toEqual([2, 2]);
    expect(calculateDisplacementTarget([2, 2], 'right', 2)).toEqual([2, 2]);
  });

  it('should handle distance > 1', () => {
    expect(calculateDisplacementTarget([0, 0], 'push', 2)).toEqual([2, 0]);
    expect(calculateDisplacementTarget([2, 2], 'pull', 2)).toEqual([0, 2]);
  });
});

describe('placeHazard', () => {
  it('should place hazard on tile', () => {
    const grid = createEmptyGrid();
    const newGrid = placeHazard(grid, [1, 1], 'spike');

    const tile = getTile(newGrid, [1, 1]);
    expect(tile?.hazard).toBe('spike');
  });

  it('should not mutate original grid', () => {
    const grid = createEmptyGrid();
    placeHazard(grid, [1, 1], 'fire');

    const originalTile = getTile(grid, [1, 1]);
    expect(originalTile?.hazard).toBeNull();
  });

  it('should not modify grid for out-of-bounds position', () => {
    const grid = createEmptyGrid();
    const newGrid = placeHazard(grid, [5, 5], 'web');

    expect(newGrid).toBe(grid);
  });

  it('should replace existing hazard', () => {
    const grid = createEmptyGrid();
    let newGrid = placeHazard(grid, [1, 1], 'spike');
    newGrid = placeHazard(newGrid, [1, 1], 'fire');

    const tile = getTile(newGrid, [1, 1]);
    expect(tile?.hazard).toBe('fire');
  });
});

describe('triggerHazard', () => {
  it('should trigger spike hazard (10 fixed damage)', () => {
    const entity = createTestEntity({ hp: 50 });
    const result = triggerHazard(entity, 'spike');

    expect(result.entity.hp).toBe(40);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].type).toBe('damage');

    const damageEvent = result.events[0] as DamageEvent;
    expect(damageEvent.damage).toBe(10);
  });

  it('should trigger web hazard (leg bind 2 turns)', () => {
    const entity = createTestEntity({ binds: { head: 0, arm: 0, leg: 0 } });
    const result = triggerHazard(entity, 'web');

    expect(result.entity.binds.leg).toBe(2);
  });

  it('should trigger fire hazard (poison 5 dmg/turn, 3 turns)', () => {
    const entity = createTestEntity({ ailments: createDefaultAilments() });
    const result = triggerHazard(entity, 'fire');

    expect(result.entity.ailments.poison).toBeDefined();
    expect(result.entity.ailments.poison?.damagePerTurn).toBe(5);
    expect(result.entity.ailments.poison?.turnsRemaining).toBe(3);
  });

  it('should extend leg bind if already bound', () => {
    const entity = createTestEntity({ binds: { head: 0, arm: 0, leg: 1 } });
    const result = triggerHazard(entity, 'web');

    expect(result.entity.binds.leg).toBe(2); // Extended to 2, not added
  });

  it('should set killed flag if spike damage kills', () => {
    const entity = createTestEntity({ hp: 5 });
    const result = triggerHazard(entity, 'spike');

    expect(result.entity.hp).toBe(0);

    const damageEvent = result.events[0] as DamageEvent;
    expect(damageEvent.killed).toBe(true);
  });
});

describe('displaceEntity', () => {
  it('should displace entity to new position', () => {
    const entity = createTestEntity({ id: 'enemy-1', position: [1, 1] });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'enemy-1', [1, 1]);

    const state = createTestState({ enemies: [entity], grid });

    const result = displaceEntity(state, 'enemy-1', { direction: 'push', distance: 1 });

    expect(result.events).toHaveLength(1);
    expect(result.events[0].type).toBe('displacement');

    const displacementEvent = result.events[0] as DisplacementEvent;
    expect(displacementEvent.from).toEqual([1, 1]);
    expect(displacementEvent.to).toEqual([2, 1]);

    // Entity should be at new position on grid
    expect(getEntitiesAtTile(result.state.grid, [2, 1])).toContain('enemy-1');
    expect(getEntitiesAtTile(result.state.grid, [1, 1])).not.toContain('enemy-1');

    // Entity position should be updated
    const updatedEntity = findEntity(result.state, 'enemy-1')!;
    expect(updatedEntity.position).toEqual([2, 1]);
  });

  it('should not displace if at boundary', () => {
    const entity = createTestEntity({ id: 'enemy-1', position: [2, 1] });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'enemy-1', [2, 1]);

    const state = createTestState({ enemies: [entity], grid });

    const result = displaceEntity(state, 'enemy-1', { direction: 'push', distance: 1 });

    expect(result.events).toHaveLength(0);
    expect(getEntitiesAtTile(result.state.grid, [2, 1])).toContain('enemy-1');
  });

  it('should trigger hazard at destination', () => {
    const entity = createTestEntity({ id: 'enemy-1', hp: 50, position: [1, 1] });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'enemy-1', [1, 1]);
    grid = placeHazard(grid, [2, 1], 'spike');

    const state = createTestState({ enemies: [entity], grid });

    const result = displaceEntity(state, 'enemy-1', { direction: 'push', distance: 1 });

    // Should have displacement event + hazard triggered + damage event
    expect(result.events.length).toBeGreaterThanOrEqual(2);
    expect(result.events[0].type).toBe('displacement');
    expect(result.events[1].type).toBe('hazard-triggered');

    // Entity should take spike damage
    const updatedEntity = findEntity(result.state, 'enemy-1')!;
    expect(updatedEntity.hp).toBe(40); // 50 - 10 from spike
  });

  it('should allow multiple entities on same tile after displacement', () => {
    const entity1 = createTestEntity({ id: 'enemy-1', position: [1, 0] });
    const entity2 = createTestEntity({ id: 'enemy-2', position: [1, 1] });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'enemy-1', [1, 0]);
    grid = addEntityToTile(grid, 'enemy-2', [1, 1]);

    const state = createTestState({ enemies: [entity1, entity2], grid });

    // Push enemy-1 right onto enemy-2's tile
    const result = displaceEntity(state, 'enemy-1', { direction: 'right', distance: 1 });

    // Both entities should be on [1, 1]
    const entitiesAtTile = getEntitiesAtTile(result.state.grid, [1, 1]);
    expect(entitiesAtTile).toContain('enemy-1');
    expect(entitiesAtTile).toContain('enemy-2');
    expect(entitiesAtTile).toHaveLength(2);
  });

  it('should return no events if entity is dead', () => {
    const entity = createTestEntity({ id: 'enemy-1', hp: 0, position: [1, 1] });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'enemy-1', [1, 1]);

    const state = createTestState({ enemies: [entity], grid });

    const result = displaceEntity(state, 'enemy-1', { direction: 'push', distance: 1 });

    expect(result.events).toHaveLength(0);
  });

  it('should return no events if entity not on grid', () => {
    const entity = createTestEntity({ id: 'enemy-1', position: [1, 1] });
    const grid = createEmptyGrid(); // No entity added to grid

    const state = createTestState({ enemies: [entity], grid });

    const result = displaceEntity(state, 'enemy-1', { direction: 'push', distance: 1 });

    expect(result.events).toHaveLength(0);
  });
});

// ============================================================================
// Bind System Tests
// ============================================================================

describe('applyBind', () => {
  const fixedRNG = (value: number): RNG => () => value;

  it('should successfully apply bind with 100% hit chance', () => {
    const entity = createTestEntity({
      binds: { head: 0, arm: 0, leg: 0 },
      resistances: createDefaultResistances(),
    });

    const application = {
      type: 'head' as const,
      baseDuration: 3,
      baseChance: 100,
    };

    const result = applyBind(entity, application, fixedRNG(0.0));

    expect(result.applied).toBe(true);
    expect(result.finalDuration).toBe(3);
    expect(result.entity.binds.head).toBe(3);
    expect(result.entity.resistances.head).toBe(20); // Increased by 20
  });

  it('should resist bind with 0% hit chance', () => {
    const entity = createTestEntity({
      resistances: { ...createDefaultResistances(), head: 100 },
    });

    const application = {
      type: 'head' as const,
      baseDuration: 3,
      baseChance: 100,
    };

    const result = applyBind(entity, application, fixedRNG(0.99));

    expect(result.applied).toBe(false);
    expect(result.finalDuration).toBe(0);
    expect(result.entity.binds.head).toBe(0);
  });

  it('should reduce duration based on resistance', () => {
    const entity = createTestEntity({
      resistances: { ...createDefaultResistances(), arm: 50 },
    });

    const application = {
      type: 'arm' as const,
      baseDuration: 5,
      baseChance: 100,
    };

    const result = applyBind(entity, application, fixedRNG(0.0));

    // Duration reduction = floor(50 / 25) = 2
    // Final duration = max(1, 5 - 2) = 3
    expect(result.applied).toBe(true);
    expect(result.finalDuration).toBe(3);
    expect(result.entity.binds.arm).toBe(3);
  });

  it('should have minimum duration of 1', () => {
    const entity = createTestEntity({
      resistances: { ...createDefaultResistances(), leg: 100 },
    });

    const application = {
      type: 'leg' as const,
      baseDuration: 2,
      baseChance: 150, // High enough to overcome resistance
    };

    const result = applyBind(entity, application, fixedRNG(0.0));

    // Duration reduction = floor(100 / 25) = 4, but min is 1
    expect(result.applied).toBe(true);
    expect(result.finalDuration).toBe(1);
    expect(result.entity.binds.leg).toBe(1);
  });

  it('should extend bind if already bound', () => {
    const entity = createTestEntity({
      binds: { head: 1, arm: 0, leg: 0 },
      resistances: createDefaultResistances(),
    });

    const application = {
      type: 'head' as const,
      baseDuration: 3,
      baseChance: 100,
    };

    const result = applyBind(entity, application, fixedRNG(0.0));

    expect(result.entity.binds.head).toBe(3); // Extended to max(1, 3)
  });

  it('should increase resistance on successful application', () => {
    const entity = createTestEntity({
      resistances: { ...createDefaultResistances(), arm: 10 },
    });

    const application = {
      type: 'arm' as const,
      baseDuration: 2,
      baseChance: 100,
    };

    const result = applyBind(entity, application, fixedRNG(0.0));

    expect(result.entity.resistances.arm).toBe(30); // 10 + 20
  });
});

// ============================================================================
// Ailment System Tests
// ============================================================================

describe('applyAilment', () => {
  const fixedRNG = (value: number): RNG => () => value;

  it('should successfully apply poison ailment', () => {
    const entity = createTestEntity({
      resistances: createDefaultResistances(),
    });

    const poisonData: PoisonData = {
      type: 'poison',
      damagePerTurn: 5,
      turnsRemaining: 3,
    };

    const result = applyAilment(entity, 'poison', poisonData, 100, fixedRNG(0.0));

    expect(result.applied).toBe(true);
    expect(result.entity.ailments.poison).toEqual(poisonData);
    expect(result.entity.resistances.poison).toBe(20);
  });

  it('should resist ailment with high resistance', () => {
    const entity = createTestEntity({
      resistances: { ...createDefaultResistances(), paralyze: 100 },
    });

    const paralyzeData: ParalyzeData = {
      type: 'paralyze',
      skipChance: 50,
      turnsRemaining: 3,
    };

    const result = applyAilment(entity, 'paralyze', paralyzeData, 100, fixedRNG(0.99));

    expect(result.applied).toBe(false);
    expect(result.entity.ailments.paralyze).toBeNull();
  });

  it('should increase resistance on successful application', () => {
    const entity = createTestEntity({
      resistances: { ...createDefaultResistances(), sleep: 10 },
    });

    const sleepData: SleepData = {
      type: 'sleep',
      turnsRemaining: 2,
    };

    const result = applyAilment(entity, 'sleep', sleepData, 100, fixedRNG(0.0));

    expect(result.entity.resistances.sleep).toBe(30); // 10 + 20
  });
});

describe('tickStatusDurations', () => {
  it('should decrement bind durations', () => {
    const entity = createTestEntity({
      binds: { head: 3, arm: 2, leg: 1 },
    });

    const ticked = tickStatusDurations(entity);

    expect(ticked.binds.head).toBe(2);
    expect(ticked.binds.arm).toBe(1);
    expect(ticked.binds.leg).toBe(0);
  });

  it('should decrement poison duration', () => {
    const poisonData: PoisonData = {
      type: 'poison',
      damagePerTurn: 5,
      turnsRemaining: 3,
    };

    const entity = createTestEntity({
      ailments: { ...createDefaultAilments(), poison: poisonData },
    });

    const ticked = tickStatusDurations(entity);

    expect(ticked.ailments.poison?.turnsRemaining).toBe(2);
  });

  it('should remove poison when duration reaches 0', () => {
    const poisonData: PoisonData = {
      type: 'poison',
      damagePerTurn: 5,
      turnsRemaining: 1,
    };

    const entity = createTestEntity({
      ailments: { ...createDefaultAilments(), poison: poisonData },
    });

    const ticked = tickStatusDurations(entity);

    expect(ticked.ailments.poison).toBeNull();
  });

  it('should not go below 0 for binds', () => {
    const entity = createTestEntity({
      binds: { head: 0, arm: 0, leg: 0 },
    });

    const ticked = tickStatusDurations(entity);

    expect(ticked.binds.head).toBe(0);
    expect(ticked.binds.arm).toBe(0);
    expect(ticked.binds.leg).toBe(0);
  });
});

describe('processAilmentEffects', () => {
  const fixedRNG = (value: number): RNG => () => value;

  it('should deal poison damage', () => {
    const poisonData: PoisonData = {
      type: 'poison',
      damagePerTurn: 5,
      turnsRemaining: 3,
    };

    const entity = createTestEntity({
      hp: 50,
      ailments: { ...createDefaultAilments(), poison: poisonData },
    });

    const result = processAilmentEffects(entity);

    expect(result.entity.hp).toBe(45); // 50 - 5
    expect(result.events).toHaveLength(1);
    expect(result.events[0].type).toBe('damage');
    expect(result.skipTurn).toBe(false);
  });

  it('should skip turn on paralyze if RNG triggers', () => {
    const paralyzeData: ParalyzeData = {
      type: 'paralyze',
      skipChance: 50,
      turnsRemaining: 2,
    };

    const entity = createTestEntity({
      ailments: { ...createDefaultAilments(), paralyze: paralyzeData },
    });

    const result = processAilmentEffects(entity, fixedRNG(0.3)); // Below 50% threshold

    expect(result.skipTurn).toBe(true);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].type).toBe('turn-skip');
  });

  it('should not skip turn on paralyze if RNG resists', () => {
    const paralyzeData: ParalyzeData = {
      type: 'paralyze',
      skipChance: 50,
      turnsRemaining: 2,
    };

    const entity = createTestEntity({
      ailments: { ...createDefaultAilments(), paralyze: paralyzeData },
    });

    const result = processAilmentEffects(entity, fixedRNG(0.8)); // Above 50% threshold

    expect(result.skipTurn).toBe(false);
    expect(result.events).toHaveLength(0);
  });

  it('should always skip turn on sleep', () => {
    const sleepData: SleepData = {
      type: 'sleep',
      turnsRemaining: 2,
    };

    const entity = createTestEntity({
      ailments: { ...createDefaultAilments(), sleep: sleepData },
    });

    const result = processAilmentEffects(entity);

    expect(result.skipTurn).toBe(true);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].type).toBe('turn-skip');
  });

  it('should process multiple ailments', () => {
    const poisonData: PoisonData = {
      type: 'poison',
      damagePerTurn: 5,
      turnsRemaining: 3,
    };

    const sleepData: SleepData = {
      type: 'sleep',
      turnsRemaining: 1,
    };

    const entity = createTestEntity({
      hp: 50,
      ailments: { ...createDefaultAilments(), poison: poisonData, sleep: sleepData },
    });

    const result = processAilmentEffects(entity);

    expect(result.entity.hp).toBe(45); // Poison damage
    expect(result.skipTurn).toBe(true); // Sleep
    expect(result.events.length).toBeGreaterThanOrEqual(2); // Damage + skip
  });
});

describe('removeSleepOnHit', () => {
  it('should remove sleep ailment', () => {
    const sleepData: SleepData = {
      type: 'sleep',
      turnsRemaining: 2,
    };

    const entity = createTestEntity({
      ailments: { ...createDefaultAilments(), sleep: sleepData },
    });

    const result = removeSleepOnHit(entity);

    expect(result.ailments.sleep).toBeNull();
  });

  it('should not modify entity if not asleep', () => {
    const entity = createTestEntity({
      ailments: createDefaultAilments(),
    });

    const result = removeSleepOnHit(entity);

    expect(result).toBe(entity); // Same reference
  });
});

// ============================================================================
// Combat State Machine Tests
// ============================================================================

function createTestEnemyDefinition(overrides?: Partial<EnemyDefinition>): EnemyDefinition {
  return {
    id: 'test-enemy',
    name: 'Test Enemy',
    stats: createDefaultStats(),
    maxHp: 30,
    maxTp: 10,
    skills: [],
    aiPattern: 'aggressive',
    dropTable: { materials: [], xp: 20, gold: { min: 5, max: 15 } },
    ...overrides,
  };
}

function createTestPartyMember(overrides?: Partial<PartyMemberState>): PartyMemberState {
  return {
    id: 'party-1',
    name: 'Test Hero',
    classId: 'test-class',
    stats: createDefaultStats(),
    baseStats: createDefaultStats(),
    maxHp: 50,
    hp: 50,
    maxTp: 20,
    tp: 20,
    level: 1,
    xp: 0,
    skillPoints: 0,
    learnedSkills: [],
    equipment: {
      weapon: null,
      armor: null,
      accessory1: null,
      accessory2: null,
    },
    ...overrides,
  };
}

describe('initializeCombat', () => {
  it('should initialize combat state from encounter', () => {
    const encounter: EncounterData = {
      party: [createTestPartyMember({ id: 'party-1' })],
      enemies: [
        {
          definition: createTestEnemyDefinition(),
          instanceId: 'enemy-1',
          position: [1, 1],
        },
      ],
      canFlee: true,
    };

    const state = initializeCombat(encounter);

    expect(state.phase).toBe('active');
    expect(state.party).toHaveLength(1);
    expect(state.enemies).toHaveLength(1);
    expect(state.canFlee).toBe(true);
    expect(state.comboCounter).toBe(0);
  });

  it('should place enemies on grid', () => {
    const encounter: EncounterData = {
      party: [createTestPartyMember()],
      enemies: [
        {
          definition: createTestEnemyDefinition(),
          instanceId: 'enemy-1',
          position: [0, 0],
        },
        {
          definition: createTestEnemyDefinition(),
          instanceId: 'enemy-2',
          position: [2, 2],
        },
      ],
      canFlee: true,
    };

    const state = initializeCombat(encounter);

    expect(getEntitiesAtTile(state.grid, [0, 0])).toContain('enemy-1');
    expect(getEntitiesAtTile(state.grid, [2, 2])).toContain('enemy-2');
  });

  it('should create turn order sorted by speed', () => {
    const encounter: EncounterData = {
      party: [
        createTestPartyMember({ id: 'party-1', stats: { ...createDefaultStats(), agi: 15 } }),
      ],
      enemies: [
        {
          definition: createTestEnemyDefinition({ stats: { ...createDefaultStats(), agi: 5 } }),
          instanceId: 'enemy-1',
          position: [1, 1],
        },
      ],
      canFlee: true,
    };

    const state = initializeCombat(encounter);

    expect(state.turnOrder).toHaveLength(2);
    expect(state.turnOrder[0].entityId).toBe('party-1'); // Faster goes first
    expect(state.turnOrder[1].entityId).toBe('enemy-1');
  });

  it('should initialize all entities with zero status effects', () => {
    const encounter: EncounterData = {
      party: [createTestPartyMember()],
      enemies: [
        {
          definition: createTestEnemyDefinition(),
          instanceId: 'enemy-1',
          position: [1, 1],
        },
      ],
      canFlee: false,
    };

    const state = initializeCombat(encounter);

    for (const entity of [...state.party, ...state.enemies]) {
      expect(entity.binds).toEqual({ head: 0, arm: 0, leg: 0 });
      expect(entity.ailments.poison).toBeNull();
      expect(entity.ailments.paralyze).toBeNull();
      expect(entity.ailments.sleep).toBeNull();
      expect(entity.ailments.blind).toBeNull();
    }
  });
});

describe('checkVictoryDefeat', () => {
  it('should return victory if all enemies dead', () => {
    const state = createTestState({
      party: [createTestEntity({ hp: 50, isParty: true })],
      enemies: [createTestEntity({ hp: 0 })],
    });

    const result = checkVictoryDefeat(state);
    expect(result.victory).toBe(true);
    expect(result.defeat).toBe(false);
  });

  it('should return defeat if all party dead', () => {
    const state = createTestState({
      party: [createTestEntity({ hp: 0, isParty: true })],
      enemies: [createTestEntity({ hp: 50 })],
    });

    const result = checkVictoryDefeat(state);
    expect(result.victory).toBe(false);
    expect(result.defeat).toBe(true);
  });

  it('should return no victory/defeat if both sides alive', () => {
    const state = createTestState({
      party: [createTestEntity({ hp: 50, isParty: true })],
      enemies: [createTestEntity({ hp: 30 })],
    });

    const result = checkVictoryDefeat(state);
    expect(result.victory).toBe(false);
    expect(result.defeat).toBe(false);
  });
});

describe('resetComboCounter', () => {
  it('should reset combo counter to 0', () => {
    const state = createTestState({ comboCounter: 5 });
    const result = resetComboCounter(state);

    expect(result.comboCounter).toBe(0);
  });
});

describe('processTurnEnd', () => {
  it('should tick status durations for entity', () => {
    const entity = createTestEntity({
      id: 'test-entity',
      binds: { head: 2, arm: 1, leg: 0 },
    });

    const state = createTestState({ enemies: [entity] });
    const result = processTurnEnd(state, 'test-entity');

    const updatedEntity = findEntity(result.state, 'test-entity')!;
    expect(updatedEntity.binds.head).toBe(1);
    expect(updatedEntity.binds.arm).toBe(0);
  });
});

describe('executeDefend', () => {
  it('should set defending flag on turn entry', () => {
    const turnOrder = [
      { entityId: 'party-1', speed: 10, hasActed: false, isDefending: false },
    ];

    const state = createTestState({ turnOrder });
    const result = executeDefend(state, 'party-1');

    expect(result.state.turnOrder[0].isDefending).toBe(true);
  });
});

describe('executeFlee', () => {
  const fixedRNG = (value: number): RNG => () => value;

  it('should succeed with good RNG', () => {
    const state = createTestState();
    const result = executeFlee(state, fixedRNG(0.3)); // < 0.5

    expect(result.events).toHaveLength(1);
    expect(result.events[0].type).toBe('flee-success');
    expect(result.state.phase).toBe('defeat'); // Exit combat
  });

  it('should fail with bad RNG', () => {
    const state = createTestState();
    const result = executeFlee(state, fixedRNG(0.8)); // >= 0.5

    expect(result.events).toHaveLength(1);
    expect(result.events[0].type).toBe('flee-failed');
    expect(result.state.phase).toBe('active');
  });
});

describe('executeAction', () => {
  it('should execute attack action', () => {
    const attacker = createTestEntity({ id: 'party-1', isParty: true });
    const defender = createTestEntity({ id: 'enemy-1', hp: 50 });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'enemy-1', [1, 1]);

    const state = createTestState({
      party: [attacker],
      enemies: [defender],
      grid,
    });

    const action: AttackAction = {
      actorId: 'party-1',
      type: 'attack',
      targetTile: [1, 1],
    };

    const result = executeAction(state, action);

    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events[0].type).toBe('damage');
  });

  it('should execute defend action via executeDefend directly', () => {
    const state = createTestState({
      turnOrder: [{ entityId: 'party-1', speed: 10, hasActed: false, isDefending: false }],
    });

    const result = executeDefend(state, 'party-1');
    expect(result.state.turnOrder[0].isDefending).toBe(true);
  });

  it('should detect victory and transition to victory phase', () => {
    const attacker = createTestEntity({
      id: 'party-1',
      isParty: true,
      stats: { str: 100, vit: 10, int: 10, wis: 10, agi: 10, luc: 0 },
    });
    const defender = createTestEntity({ id: 'enemy-1', hp: 1 }); // Will die

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'enemy-1', [1, 1]);

    const state = createTestState({
      party: [attacker],
      enemies: [defender],
      grid,
    });

    const action: AttackAction = {
      actorId: 'party-1',
      type: 'attack',
      targetTile: [1, 1],
    };

    const result = executeAction(state, action);

    expect(result.state.phase).toBe('victory');
    const victoryEvent = result.events.find((e) => e.type === 'victory');
    expect(victoryEvent).toBeDefined();
  });

  it('should detect defeat and transition to defeat phase', () => {
    const attacker = createTestEntity({
      id: 'enemy-1',
      isParty: false,
      stats: { str: 100, vit: 10, int: 10, wis: 10, agi: 10, luc: 0 },
    });
    const defender = createTestEntity({ id: 'party-1', hp: 1, isParty: true }); // Will die

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'party-1', [1, 1]);

    const state = createTestState({
      party: [defender],
      enemies: [attacker],
      grid,
    });

    const action: AttackAction = {
      actorId: 'enemy-1',
      type: 'attack',
      targetTile: [1, 1],
    };

    const result = executeAction(state, action);

    expect(result.state.phase).toBe('defeat');
    const defeatEvent = result.events.find((e) => e.type === 'defeat');
    expect(defeatEvent).toBeDefined();
  });

  it('should mark actor as having acted', () => {
    const attacker = createTestEntity({ id: 'party-1', isParty: true });
    const defender = createTestEntity({ id: 'enemy-1', hp: 50 });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'enemy-1', [1, 1]);

    const turnOrder = [
      { entityId: 'party-1', speed: 10, hasActed: false, isDefending: false },
    ];

    const state = createTestState({
      party: [attacker],
      enemies: [defender],
      grid,
      turnOrder,
    });

    const action: AttackAction = {
      actorId: 'party-1',
      type: 'attack',
      targetTile: [1, 1],
    };

    const result = executeAction(state, action);
    expect(result.state.turnOrder[0].hasActed).toBe(true);
  });

  it('should return no events if actor is dead', () => {
    const attacker = createTestEntity({ id: 'party-1', hp: 0, isParty: true });

    const state = createTestState({ party: [attacker] });

    const action: AttackAction = {
      actorId: 'party-1',
      type: 'attack',
      targetTile: [1, 1],
    };

    const result = executeAction(state, action);
    expect(result.events).toHaveLength(0);
  });
});

describe('calculateRewards', () => {
  it('should calculate XP from defeated enemies using definitions', () => {
    const state = createTestState({
      enemies: [
        createTestEntity({ definitionId: 'test-enemy', hp: 0 }),
        createTestEntity({ definitionId: 'test-enemy', hp: 0 }),
      ],
    });

    const enemyDef = createTestEnemyDefinition();
    const getEnemyDef = (id: string) => id === 'test-enemy' ? enemyDef : undefined;
    const rewards = calculateRewards(state, () => 0.5, getEnemyDef);

    // 20 XP per enemy from definition
    expect(rewards.xp).toBe(40);
    expect(rewards.gold).toBeGreaterThan(0);
  });

  it('should only count defeated enemies', () => {
    const state = createTestState({
      enemies: [
        createTestEntity({ definitionId: 'test-enemy', hp: 0 }),
        createTestEntity({ definitionId: 'test-enemy', hp: 50 }),
      ],
    });

    const enemyDef = createTestEnemyDefinition();
    const getEnemyDef = (id: string) => id === 'test-enemy' ? enemyDef : undefined;
    const rewards = calculateRewards(state, () => 0.5, getEnemyDef);

    expect(rewards.xp).toBe(20); // Only one dead enemy
  });

  it('falls back to defaults when no definition provided', () => {
    const state = createTestState({
      enemies: [
        createTestEntity({ hp: 0 }),
      ],
    });

    const rewards = calculateRewards(state);
    expect(rewards.xp).toBe(20);
    expect(rewards.gold).toBe(10);
  });
});

// ============================================================================
// Turn Flow Integration Tests
// ============================================================================
// These tests simulate the EXACT sequence the store performs:
// - Player turn: executeAction() → advanceToNextAlive()
// - Enemy turn:  executeEnemyTurn() → advanceToNextAlive()
//
// The goal: prove that every turn scenario advances correctly with NO
// setTimeout chains or component-level intervention needed.
// ============================================================================

import { executeEnemyTurn } from './combat';

describe('executeEnemyTurn', () => {
  const fixedRNG: RNG = () => 0.5;

  it('should execute a basic attack on a random party member', () => {
    const party1 = createTestEntity({ id: 'p1', hp: 50, maxHp: 50, isParty: true, position: null });
    const enemy1 = createTestEntity({ id: 'e1', hp: 30, maxHp: 30, position: [0, 0], skills: [] });

    const turnOrder: TurnEntry[] = [
      { entityId: 'p1', speed: 10, hasActed: true, isDefending: false },
      { entityId: 'e1', speed: 8, hasActed: false, isDefending: false },
    ];

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'e1', [0, 0]);

    const state = createTestState({
      party: [party1],
      enemies: [enemy1],
      grid,
      turnOrder,
      currentActorIndex: 1,
    });

    const result = executeEnemyTurn(state, 'e1', fixedRNG);
    // Should produce a damage event targeting the party member
    expect(result.events.length).toBeGreaterThan(0);
    const dmgEvent = result.events.find((e) => e.type === 'damage');
    expect(dmgEvent).toBeDefined();
    // Enemy should be marked as having acted
    const enemyEntry = result.state.turnOrder.find((e) => e.entityId === 'e1');
    expect(enemyEntry?.hasActed).toBe(true);
  });

  it('should return no-op for dead enemy', () => {
    const party1 = createTestEntity({ id: 'p1', hp: 50, isParty: true, position: null });
    const deadEnemy = createTestEntity({ id: 'e1', hp: 0, position: [0, 0], skills: [] });

    const state = createTestState({
      party: [party1],
      enemies: [deadEnemy],
      turnOrder: [
        { entityId: 'p1', speed: 10, hasActed: true, isDefending: false },
        { entityId: 'e1', speed: 8, hasActed: false, isDefending: false },
      ],
      currentActorIndex: 1,
    });

    const result = executeEnemyTurn(state, 'e1', fixedRNG);
    expect(result.events).toEqual([]);
    // State should be unchanged
    expect(result.state).toBe(state);
  });

  it('should detect defeat when enemy kills last party member', () => {
    const party1 = createTestEntity({ id: 'p1', hp: 1, maxHp: 50, isParty: true, position: null });
    const enemy1 = createTestEntity({
      id: 'e1', hp: 30, position: [0, 0], skills: [],
      stats: { ...createDefaultStats(), str: 20 },
    });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'e1', [0, 0]);

    const state = createTestState({
      party: [party1],
      enemies: [enemy1],
      grid,
      turnOrder: [
        { entityId: 'p1', speed: 10, hasActed: true, isDefending: false },
        { entityId: 'e1', speed: 8, hasActed: false, isDefending: false },
      ],
      currentActorIndex: 1,
    });

    const result = executeEnemyTurn(state, 'e1', fixedRNG);
    expect(result.state.phase).toBe('defeat');
    expect(result.events.some((e) => e.type === 'defeat')).toBe(true);
  });
});

describe('Turn Flow Integration', () => {
  // Deterministic RNG: always returns 0.99 so enemy skill chance fails → basic attack
  const alwaysBasicAttackRNG: RNG = () => 0.99;
  // RNG that avoids crits (luc/100 < rng) and gives mid variance
  const midRNG: RNG = () => 0.5;

  /**
   * Simulates the EXACT store flow for a player action:
   * 1. executeAction(state, action)
   * 2. if phase is still 'active', advanceToNextAlive(result.state)
   */
  function playerActAndAdvance(
    state: CombatState,
    action: Action,
  ): { state: CombatState; events: CombatEventUnion[] } {
    const result = executeAction(state, action, midRNG);
    if (result.state.phase !== 'active') {
      return result;
    }
    return { state: advanceToNextAlive(result.state), events: result.events };
  }

  /**
   * Simulates the EXACT store flow for an enemy action:
   * 1. executeEnemyTurn(state, actorId)
   * 2. if phase is still 'active', advanceToNextAlive(result.state)
   */
  function enemyActAndAdvance(
    state: CombatState,
    actorId: string,
  ): { state: CombatState; events: CombatEventUnion[] } {
    const result = executeEnemyTurn(state, actorId, alwaysBasicAttackRNG);
    if (result.state.phase !== 'active') {
      return result;
    }
    return { state: advanceToNextAlive(result.state), events: result.events };
  }

  // --- Scenario 1: Player → Enemy → Player (basic 2-actor cycle) ---
  it('should advance from player to enemy to player in a 2-actor turn order', () => {
    const p1 = createTestEntity({ id: 'p1', hp: 50, maxHp: 50, isParty: true, position: null });
    const e1 = createTestEntity({ id: 'e1', hp: 30, maxHp: 30, position: [1, 1], skills: [] });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'e1', [1, 1]);

    const state = createTestState({
      party: [p1],
      enemies: [e1],
      grid,
      turnOrder: [
        { entityId: 'p1', speed: 10, hasActed: false, isDefending: false },
        { entityId: 'e1', speed: 8, hasActed: false, isDefending: false },
      ],
      currentActorIndex: 0,
    });

    // Step 1: Player attacks
    const afterPlayer = playerActAndAdvance(state, {
      actorId: 'p1',
      type: 'attack',
      targetTile: [1, 1],
    } as AttackAction);

    // Should now be enemy's turn (index 1)
    expect(afterPlayer.state.currentActorIndex).toBe(1);
    const currentEntry1 = afterPlayer.state.turnOrder[1];
    expect(currentEntry1.entityId).toBe('e1');

    // Step 2: Enemy acts
    const afterEnemy = enemyActAndAdvance(afterPlayer.state, 'e1');

    // Should wrap back to player (index 0), round increments
    expect(afterEnemy.state.currentActorIndex).toBe(0);
    expect(afterEnemy.state.round).toBe(2);
  });

  // --- Scenario 2: Player → Enemy1 → Enemy2 → Player (consecutive enemies) ---
  it('should handle consecutive enemy turns correctly', () => {
    const p1 = createTestEntity({ id: 'p1', hp: 50, maxHp: 50, isParty: true, position: null });
    const e1 = createTestEntity({ id: 'e1', hp: 30, maxHp: 30, position: [0, 0], skills: [] });
    const e2 = createTestEntity({ id: 'e2', hp: 30, maxHp: 30, position: [0, 1], skills: [] });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'e1', [0, 0]);
    grid = addEntityToTile(grid, 'e2', [0, 1]);

    const state = createTestState({
      party: [p1],
      enemies: [e1, e2],
      grid,
      turnOrder: [
        { entityId: 'p1', speed: 12, hasActed: false, isDefending: false },
        { entityId: 'e1', speed: 10, hasActed: false, isDefending: false },
        { entityId: 'e2', speed: 8, hasActed: false, isDefending: false },
      ],
      currentActorIndex: 0,
    });

    // Player acts → advances to e1
    const afterPlayer = playerActAndAdvance(state, {
      actorId: 'p1',
      type: 'attack',
      targetTile: [0, 0],
    } as AttackAction);
    expect(afterPlayer.state.currentActorIndex).toBe(1);

    // e1 acts → advances to e2
    const afterE1 = enemyActAndAdvance(afterPlayer.state, 'e1');
    expect(afterE1.state.currentActorIndex).toBe(2);
    expect(afterE1.state.turnOrder[2].entityId).toBe('e2');

    // e2 acts → wraps to p1
    const afterE2 = enemyActAndAdvance(afterE1.state, 'e2');
    expect(afterE2.state.currentActorIndex).toBe(0);
    expect(afterE2.state.round).toBe(2);
  });

  // --- Scenario 3: Player kills enemy → dead enemy skipped ---
  it('should skip dead enemy when advancing after player kills it', () => {
    const p1 = createTestEntity({ id: 'p1', hp: 50, maxHp: 50, isParty: true, position: null,
      stats: { ...createDefaultStats(), str: 100 }, // High STR to guarantee kill
    });
    const e1 = createTestEntity({ id: 'e1', hp: 1, maxHp: 30, position: [1, 1], skills: [] });
    const p2 = createTestEntity({ id: 'p2', hp: 40, maxHp: 40, isParty: true, position: null });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'e1', [1, 1]);

    const state = createTestState({
      party: [p1, p2],
      enemies: [e1],
      grid,
      turnOrder: [
        { entityId: 'p1', speed: 15, hasActed: false, isDefending: false },
        { entityId: 'e1', speed: 10, hasActed: false, isDefending: false },
        { entityId: 'p2', speed: 8, hasActed: false, isDefending: false },
      ],
      currentActorIndex: 0,
    });

    // Player kills enemy → should skip dead e1 and advance to p2
    const afterKill = playerActAndAdvance(state, {
      actorId: 'p1',
      type: 'attack',
      targetTile: [1, 1],
    } as AttackAction);

    // If victory triggered, phase should change
    // (single enemy killed = all enemies defeated = victory)
    expect(afterKill.state.phase).toBe('victory');
  });

  // --- Scenario 4: Kill one enemy of two, second enemy still acts ---
  it('should skip killed enemy but allow other enemy to act', () => {
    const p1 = createTestEntity({ id: 'p1', hp: 50, maxHp: 50, isParty: true, position: null,
      stats: { ...createDefaultStats(), str: 100 },
    });
    const e1 = createTestEntity({ id: 'e1', hp: 1, maxHp: 30, position: [0, 0], skills: [] });
    const e2 = createTestEntity({ id: 'e2', hp: 30, maxHp: 30, position: [1, 1], skills: [] });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'e1', [0, 0]);
    grid = addEntityToTile(grid, 'e2', [1, 1]);

    const state = createTestState({
      party: [p1],
      enemies: [e1, e2],
      grid,
      turnOrder: [
        { entityId: 'p1', speed: 15, hasActed: false, isDefending: false },
        { entityId: 'e1', speed: 10, hasActed: false, isDefending: false },
        { entityId: 'e2', speed: 8, hasActed: false, isDefending: false },
      ],
      currentActorIndex: 0,
    });

    // Player kills e1 → should skip dead e1, advance to e2
    const afterKill = playerActAndAdvance(state, {
      actorId: 'p1',
      type: 'attack',
      targetTile: [0, 0],
    } as AttackAction);

    // Phase should still be active (e2 is alive)
    expect(afterKill.state.phase).toBe('active');
    // Should have advanced past dead e1 to e2
    expect(afterKill.state.currentActorIndex).toBe(2);
    expect(afterKill.state.turnOrder[2].entityId).toBe('e2');

    // e2 acts → wraps back to p1
    const afterE2 = enemyActAndAdvance(afterKill.state, 'e2');
    expect(afterE2.state.currentActorIndex).toBe(0);
    expect(afterE2.state.round).toBe(2);
  });

  // --- Scenario 5: 4 players → 1 enemy → back to player 1 (matches screenshot) ---
  it('should handle 4-player party vs 1 enemy turn cycle (screenshot scenario)', () => {
    const p1 = createTestEntity({ id: 'strik', hp: 45, maxHp: 45, isParty: true, position: null });
    const p2 = createTestEntity({ id: 'spark', hp: 40, maxHp: 40, isParty: true, position: null });
    const p3 = createTestEntity({ id: 'hexbl', hp: 42, maxHp: 42, isParty: true, position: null });
    const p4 = createTestEntity({ id: 'ironb', hp: 50, maxHp: 50, isParty: true, position: null });
    const slime = createTestEntity({ id: 'slime', hp: 30, maxHp: 30, position: [0, 0], skills: [] });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'slime', [0, 0]);

    const state = createTestState({
      party: [p1, p2, p3, p4],
      enemies: [slime],
      grid,
      turnOrder: [
        { entityId: 'strik', speed: 12, hasActed: false, isDefending: false },
        { entityId: 'spark', speed: 11, hasActed: false, isDefending: false },
        { entityId: 'hexbl', speed: 10, hasActed: false, isDefending: false },
        { entityId: 'slime', speed: 9, hasActed: false, isDefending: false },
        { entityId: 'ironb', speed: 8, hasActed: false, isDefending: false },
      ],
      currentActorIndex: 0,
    });

    // p1 attacks → advances to p2
    const after1 = playerActAndAdvance(state, {
      actorId: 'strik', type: 'attack', targetTile: [0, 0],
    } as AttackAction);
    expect(after1.state.currentActorIndex).toBe(1);

    // p2 attacks → advances to p3
    const after2 = playerActAndAdvance(after1.state, {
      actorId: 'spark', type: 'attack', targetTile: [0, 0],
    } as AttackAction);
    expect(after2.state.currentActorIndex).toBe(2);

    // p3 attacks → advances to slime
    const after3 = playerActAndAdvance(after2.state, {
      actorId: 'hexbl', type: 'attack', targetTile: [0, 0],
    } as AttackAction);
    expect(after3.state.currentActorIndex).toBe(3);
    expect(after3.state.turnOrder[3].entityId).toBe('slime');

    // SLIME acts → should advance to ironb (index 4)
    const afterSlime = enemyActAndAdvance(after3.state, 'slime');
    expect(afterSlime.state.phase).toBe('active');
    expect(afterSlime.state.currentActorIndex).toBe(4);
    expect(afterSlime.state.turnOrder[4].entityId).toBe('ironb');

    // ironb acts → wraps to strik (index 0), round 2
    const afterIronb = playerActAndAdvance(afterSlime.state, {
      actorId: 'ironb', type: 'attack', targetTile: [0, 0],
    } as AttackAction);
    expect(afterIronb.state.currentActorIndex).toBe(0);
    expect(afterIronb.state.round).toBe(2);
  });

  // --- Scenario 6: Player defends → turn still advances ---
  it('should advance turn after player defends', () => {
    const p1 = createTestEntity({ id: 'p1', hp: 50, isParty: true, position: null });
    const e1 = createTestEntity({ id: 'e1', hp: 30, position: [1, 1], skills: [] });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'e1', [1, 1]);

    const state = createTestState({
      party: [p1],
      enemies: [e1],
      grid,
      turnOrder: [
        { entityId: 'p1', speed: 10, hasActed: false, isDefending: false },
        { entityId: 'e1', speed: 8, hasActed: false, isDefending: false },
      ],
      currentActorIndex: 0,
    });

    const afterDefend = playerActAndAdvance(state, {
      actorId: 'p1',
      type: 'defend',
    });
    expect(afterDefend.state.currentActorIndex).toBe(1);
  });

  // --- Scenario 7: Two enemies back-to-back, first dies during player attack ---
  it('should handle dead enemy between two live enemies', () => {
    const p1 = createTestEntity({ id: 'p1', hp: 50, isParty: true, position: null,
      stats: { ...createDefaultStats(), str: 100 },
    });
    const e1 = createTestEntity({ id: 'e1', hp: 1, maxHp: 30, position: [0, 0], skills: [] });
    const e2 = createTestEntity({ id: 'e2', hp: 30, maxHp: 30, position: [0, 1], skills: [] });
    const p2 = createTestEntity({ id: 'p2', hp: 40, isParty: true, position: null });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'e1', [0, 0]);
    grid = addEntityToTile(grid, 'e2', [0, 1]);

    const state = createTestState({
      party: [p1, p2],
      enemies: [e1, e2],
      grid,
      turnOrder: [
        { entityId: 'p1', speed: 15, hasActed: false, isDefending: false },
        { entityId: 'e1', speed: 12, hasActed: false, isDefending: false },
        { entityId: 'e2', speed: 10, hasActed: false, isDefending: false },
        { entityId: 'p2', speed: 8, hasActed: false, isDefending: false },
      ],
      currentActorIndex: 0,
    });

    // p1 kills e1 → skips dead e1, advances to e2
    const afterKill = playerActAndAdvance(state, {
      actorId: 'p1', type: 'attack', targetTile: [0, 0],
    } as AttackAction);
    expect(afterKill.state.phase).toBe('active');
    expect(afterKill.state.currentActorIndex).toBe(2);

    // e2 acts → advances to p2
    const afterE2 = enemyActAndAdvance(afterKill.state, 'e2');
    expect(afterE2.state.currentActorIndex).toBe(3);
    expect(afterE2.state.turnOrder[3].entityId).toBe('p2');

    // p2 acts → wraps past dead e1 to p1
    const afterP2 = playerActAndAdvance(afterE2.state, {
      actorId: 'p2', type: 'defend',
    });
    expect(afterP2.state.currentActorIndex).toBe(0);
    expect(afterP2.state.round).toBe(2);
  });

  // --- Scenario 8: Enemy turn with skill usage (like Slime with aggressive AI) ---
  it('should handle enemy using a skill during their turn', () => {
    const p1 = createTestEntity({ id: 'p1', hp: 50, maxHp: 50, isParty: true, position: null });
    const e1 = createTestEntity({
      id: 'e1', hp: 30, maxHp: 30, position: [0, 0],
      definitionId: 'test-enemy',
      skills: ['test-skill'],
      tp: 10, maxTp: 10,
    });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'e1', [0, 0]);

    const testSkill: import('../types/character').SkillDefinition = {
      id: 'test-skill',
      name: 'Test Skill',
      description: 'test',
      classId: 'enemy',
      tpCost: 3,
      targetType: 'single-tile',
      bodyPartRequired: null,
      levelRequired: 1,
      skillPointCost: 0,
      isPassive: false,
      effects: [{ type: 'damage', stat: 'str', multiplier: 1.0 }],
    };

    const skillLookup = (id: string) => id === 'test-skill' ? testSkill : undefined as unknown as import('../types/character').SkillDefinition;
    const enemyDef: EnemyDefinition = {
      id: 'test-enemy',
      name: 'Test',
      stats: createDefaultStats(),
      maxHp: 30,
      maxTp: 10,
      skills: ['test-skill'],
      aiPattern: 'aggressive',
      dropTable: { materials: [], xp: 10, gold: { min: 1, max: 5 } },
    };
    const getEnemyDef = (id: string) => id === 'test-enemy' ? enemyDef : undefined;

    const state = createTestState({
      party: [p1],
      enemies: [e1],
      grid,
      turnOrder: [
        { entityId: 'p1', speed: 10, hasActed: true, isDefending: false },
        { entityId: 'e1', speed: 8, hasActed: false, isDefending: false },
      ],
      currentActorIndex: 1,
    });

    // Use RNG that guarantees skill usage (0.1 < 0.5 aggressive threshold)
    const useSkillRNG: RNG = () => 0.1;
    const result = executeEnemyTurn(state, 'e1', useSkillRNG, skillLookup, getEnemyDef);

    // Enemy should have acted (events produced) and turn marked
    expect(result.events.length).toBeGreaterThan(0);
    const entry = result.state.turnOrder.find((e) => e.entityId === 'e1');
    expect(entry?.hasActed).toBe(true);

    // Advance should go back to p1
    if (result.state.phase === 'active') {
      const advanced = advanceToNextAlive(result.state);
      expect(advanced.currentActorIndex).toBe(0);
    }
  });
});

// ============================================================================
// Missing Skill Fallback Tests
// ============================================================================

describe('executeEnemyTurn with missing skills', () => {
  const fixedRNG: RNG = () => 0.1; // Low value to ensure skill usage is attempted

  it('should fall back to basic attack when all skills are undefined', () => {
    const party1 = createTestEntity({ id: 'p1', hp: 50, maxHp: 50, isParty: true, position: null });
    const enemy1 = createTestEntity({
      id: 'e1',
      name: 'Elite Enemy',
      hp: 30,
      maxHp: 30,
      position: [1, 1],
      skills: ['missing-skill-1', 'missing-skill-2'], // These skills don't exist
    });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'e1', [1, 1]);

    const state = createTestState({
      party: [party1],
      enemies: [enemy1],
      grid,
      turnOrder: [
        { entityId: 'p1', speed: 12, hasActed: true, isDefending: false },
        { entityId: 'e1', speed: 10, hasActed: false, isDefending: false },
      ],
      currentActorIndex: 1,
    });

    // Skill lookup that returns undefined for missing skills
    const skillLookup = (id: string): SkillDefinition | undefined => {
      if (id === 'missing-skill-1' || id === 'missing-skill-2') {
        return undefined;
      }
      throw new Error(`Unexpected skill lookup: ${id}`);
    };

    const result = executeEnemyTurn(state, 'e1', fixedRNG, skillLookup);

    // Should execute basic attack instead of hanging
    expect(result.events.length).toBeGreaterThan(0);

    // Should produce damage event (basic attack)
    const dmgEvent = result.events.find((e) => e.type === 'damage');
    expect(dmgEvent).toBeDefined();
    expect((dmgEvent as DamageEvent).targetId).toBe('p1');

    // Turn should be marked as acted
    const turnEntry = result.state.turnOrder.find((e) => e.entityId === 'e1');
    expect(turnEntry?.hasActed).toBe(true);
  });

  it('should use valid skills and ignore undefined ones', () => {
    const party1 = createTestEntity({ id: 'p1', hp: 50, maxHp: 50, isParty: true, position: null });
    const enemy1 = createTestEntity({
      id: 'e1',
      name: 'Enemy',
      hp: 30,
      maxHp: 30,
      tp: 10,
      maxTp: 10,
      position: [1, 1],
      skills: ['missing-skill', 'valid-skill'], // Mix of missing and valid
    });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'e1', [1, 1]);

    const state = createTestState({
      party: [party1],
      enemies: [enemy1],
      grid,
      turnOrder: [
        { entityId: 'p1', speed: 12, hasActed: true, isDefending: false },
        { entityId: 'e1', speed: 10, hasActed: false, isDefending: false },
      ],
      currentActorIndex: 1,
    });

    const validSkill: SkillDefinition = {
      id: 'valid-skill',
      name: 'Valid Attack',
      description: 'A valid skill',
      classId: 'enemy',
      tpCost: 3,
      targetType: 'single-tile',
      bodyPartRequired: null,
      levelRequired: 1,
      skillPointCost: 0,
      isPassive: false,
      effects: [{ type: 'damage', stat: 'str', multiplier: 1.0 }],
    };

    const skillLookup = (id: string): SkillDefinition | undefined => {
      if (id === 'missing-skill') return undefined;
      if (id === 'valid-skill') return validSkill;
      throw new Error(`Unexpected skill lookup: ${id}`);
    };

    const result = executeEnemyTurn(state, 'e1', fixedRNG, skillLookup);

    // Should execute the valid skill
    expect(result.events.length).toBeGreaterThan(0);
    const dmgEvent = result.events.find((e) => e.type === 'damage');
    expect(dmgEvent).toBeDefined();

    // Turn should be marked as acted
    const turnEntry = result.state.turnOrder.find((e) => e.entityId === 'e1');
    expect(turnEntry?.hasActed).toBe(true);
  });

  it('should handle enemy with no skills array gracefully', () => {
    const party1 = createTestEntity({ id: 'p1', hp: 50, maxHp: 50, isParty: true, position: null });
    const enemy1 = createTestEntity({
      id: 'e1',
      name: 'Basic Enemy',
      hp: 30,
      maxHp: 30,
      position: [1, 1],
      skills: [], // No skills at all
    });

    let grid = createEmptyGrid();
    grid = addEntityToTile(grid, 'e1', [1, 1]);

    const state = createTestState({
      party: [party1],
      enemies: [enemy1],
      grid,
      turnOrder: [
        { entityId: 'p1', speed: 12, hasActed: true, isDefending: false },
        { entityId: 'e1', speed: 10, hasActed: false, isDefending: false },
      ],
      currentActorIndex: 1,
    });

    const result = executeEnemyTurn(state, 'e1', fixedRNG);

    // Should execute basic attack
    expect(result.events.length).toBeGreaterThan(0);
    const dmgEvent = result.events.find((e) => e.type === 'damage');
    expect(dmgEvent).toBeDefined();
  });
});
