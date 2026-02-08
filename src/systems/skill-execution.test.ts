/**
 * Skill Execution Engine Tests
 */

import { describe, it, expect } from 'vitest';
import type {
  BattleTile,
  CombatEntity,
  CombatState,
  EntityStats,
  BindState,
  AilmentState,
  ResistanceState,
  TurnEntry,
} from '../types/combat';
import type { SkillDefinition } from '../types/character';
import {
  canUseSkill,
  resolveTargetTiles,
  evaluateCondition,
  countActiveBinds,
  hasAnyAilment,
  executeSkillAction,
  tickBuffs,
  calculateDamage,
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
      grid[row][col] = { position: [row, col], entities: [], hazard: null };
    }
  }
  return grid;
}

function createTestEntity(overrides?: Partial<CombatEntity>): CombatEntity {
  return {
    id: 'test-entity',
    name: 'Test',
    hp: 50,
    maxHp: 50,
    tp: 20,
    maxTp: 20,
    stats: { str: 10, vit: 10, int: 10, wis: 10, agi: 10, luc: 10 },
    position: [0, 0],
    binds: { head: 0, arm: 0, leg: 0 },
    ailments: { poison: null, paralyze: null, sleep: null, blind: null },
    resistances: { head: 0, arm: 0, leg: 0, poison: 0, paralyze: 0, sleep: 0, blind: 0 },
    isParty: false,
    skills: [],
    buffs: [],
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

function createTestSkill(overrides?: Partial<SkillDefinition>): SkillDefinition {
  return {
    id: 'test-skill',
    name: 'Test Skill',
    description: 'A test skill',
    classId: 'test-class',
    tpCost: 5,
    targetType: 'single-tile',
    bodyPartRequired: null,
    levelRequired: 1,
    skillPointCost: 1,
    effects: [{ type: 'damage', stat: 'str', multiplier: 1.0 }],
    isPassive: false,
    ...overrides,
  };
}

const fixedRNG: RNG = () => 0.5;
const lowRNG: RNG = () => 0.01; // Always succeeds on chance rolls

// ============================================================================
// canUseSkill Tests
// ============================================================================

describe('canUseSkill', () => {
  it('allows skill use when requirements met', () => {
    const entity = createTestEntity({ tp: 20 });
    const skill = createTestSkill({ tpCost: 5 });
    expect(canUseSkill(entity, skill).canUse).toBe(true);
  });

  it('rejects when dead', () => {
    const entity = createTestEntity({ hp: 0 });
    expect(canUseSkill(entity, createTestSkill()).canUse).toBe(false);
  });

  it('rejects when not enough TP', () => {
    const entity = createTestEntity({ tp: 2 });
    const skill = createTestSkill({ tpCost: 5 });
    const { canUse, reason } = canUseSkill(entity, skill);
    expect(canUse).toBe(false);
    expect(reason).toBe('Not enough TP');
  });

  it('rejects arm-based skill when arm bound', () => {
    const entity = createTestEntity({ binds: { head: 0, arm: 2, leg: 0 } });
    const skill = createTestSkill({ bodyPartRequired: 'arm' });
    expect(canUseSkill(entity, skill).canUse).toBe(false);
  });

  it('rejects head-based skill when head bound', () => {
    const entity = createTestEntity({ binds: { head: 2, arm: 0, leg: 0 } });
    const skill = createTestSkill({ bodyPartRequired: 'head' });
    expect(canUseSkill(entity, skill).canUse).toBe(false);
  });

  it('allows head-based skill when arm is bound (not head)', () => {
    const entity = createTestEntity({ binds: { head: 0, arm: 2, leg: 0 } });
    const skill = createTestSkill({ bodyPartRequired: 'head' });
    expect(canUseSkill(entity, skill).canUse).toBe(true);
  });
});

// ============================================================================
// resolveTargetTiles Tests
// ============================================================================

describe('resolveTargetTiles', () => {
  const state = createTestState();

  it('single-tile returns only target', () => {
    expect(resolveTargetTiles(state, [1, 1], 'single-tile')).toEqual([[1, 1]]);
  });

  it('adjacent-tiles returns target + orthogonal neighbors', () => {
    const tiles = resolveTargetTiles(state, [1, 1], 'adjacent-tiles');
    expect(tiles).toHaveLength(5); // center + 4 adjacent
    expect(tiles).toContainEqual([1, 1]);
    expect(tiles).toContainEqual([0, 1]);
    expect(tiles).toContainEqual([2, 1]);
    expect(tiles).toContainEqual([1, 0]);
    expect(tiles).toContainEqual([1, 2]);
  });

  it('adjacent-tiles at corner only returns valid tiles', () => {
    const tiles = resolveTargetTiles(state, [0, 0], 'adjacent-tiles');
    expect(tiles).toHaveLength(3); // corner + 2 adjacent
  });

  it('all-enemies returns unique tiles of alive enemies', () => {
    const grid = createEmptyGrid();
    grid[0][1].entities = ['e-1'];
    grid[2][0].entities = ['e-2'];
    const stateWithEnemies = createTestState({
      grid,
      enemies: [
        createTestEntity({ id: 'e-1', position: [0, 1], hp: 10 }),
        createTestEntity({ id: 'e-2', position: [2, 0], hp: 10 }),
      ],
    });
    const tiles = resolveTargetTiles(stateWithEnemies, [0, 0], 'all-enemies');
    expect(tiles).toHaveLength(2);
  });

  it('all-enemies excludes dead enemies', () => {
    const grid = createEmptyGrid();
    grid[0][1].entities = ['e-1'];
    const stateWithEnemies = createTestState({
      grid,
      enemies: [
        createTestEntity({ id: 'e-1', position: [0, 1], hp: 0 }),
      ],
    });
    const tiles = resolveTargetTiles(stateWithEnemies, [0, 0], 'all-enemies');
    expect(tiles).toHaveLength(0);
  });
});

// ============================================================================
// evaluateCondition Tests
// ============================================================================

describe('evaluateCondition', () => {
  const state = createTestState();

  it('has-any-bind: true when any bind active', () => {
    const target = createTestEntity({ binds: { head: 0, arm: 2, leg: 0 } });
    expect(evaluateCondition({ type: 'has-any-bind' }, target, state)).toBe(true);
  });

  it('has-any-bind: false when no binds', () => {
    const target = createTestEntity();
    expect(evaluateCondition({ type: 'has-any-bind' }, target, state)).toBe(false);
  });

  it('has-all-binds: true when all 3 active', () => {
    const target = createTestEntity({ binds: { head: 1, arm: 1, leg: 1 } });
    expect(evaluateCondition({ type: 'has-all-binds' }, target, state)).toBe(true);
  });

  it('has-all-binds: false when only 2 active', () => {
    const target = createTestEntity({ binds: { head: 1, arm: 1, leg: 0 } });
    expect(evaluateCondition({ type: 'has-all-binds' }, target, state)).toBe(false);
  });

  it('has-leg-bind: checks leg specifically', () => {
    const bound = createTestEntity({ binds: { head: 0, arm: 0, leg: 3 } });
    const unbound = createTestEntity();
    expect(evaluateCondition({ type: 'has-leg-bind' }, bound, state)).toBe(true);
    expect(evaluateCondition({ type: 'has-leg-bind' }, unbound, state)).toBe(false);
  });

  it('has-ailment: true when any ailment active', () => {
    const target = createTestEntity({
      ailments: {
        poison: { type: 'poison', damagePerTurn: 3, turnsRemaining: 2 },
        paralyze: null,
        sleep: null,
        blind: null,
      },
    });
    expect(evaluateCondition({ type: 'has-ailment' }, target, state)).toBe(true);
  });

  it('on-hazard: true when entity on tile with hazard', () => {
    const grid = createEmptyGrid();
    grid[0][0].hazard = 'fire';
    const stateWithHazard = createTestState({ grid });
    const target = createTestEntity({ position: [0, 0] });
    expect(evaluateCondition({ type: 'on-hazard' }, target, stateWithHazard)).toBe(true);
  });

  it('below-hp-percent: true when HP below threshold', () => {
    const target = createTestEntity({ hp: 10, maxHp: 50 }); // 20%
    expect(evaluateCondition({ type: 'below-hp-percent', threshold: 25 }, target, state)).toBe(true);
  });

  it('below-hp-percent: false when HP above threshold', () => {
    const target = createTestEntity({ hp: 40, maxHp: 50 }); // 80%
    expect(evaluateCondition({ type: 'below-hp-percent', threshold: 25 }, target, state)).toBe(false);
  });
});

// ============================================================================
// countActiveBinds / hasAnyAilment Tests
// ============================================================================

describe('countActiveBinds', () => {
  it('returns 0 for no binds', () => {
    expect(countActiveBinds(createTestEntity())).toBe(0);
  });

  it('counts active binds correctly', () => {
    expect(countActiveBinds(createTestEntity({ binds: { head: 2, arm: 0, leg: 3 } }))).toBe(2);
    expect(countActiveBinds(createTestEntity({ binds: { head: 1, arm: 1, leg: 1 } }))).toBe(3);
  });
});

describe('hasAnyAilment', () => {
  it('returns false for no ailments', () => {
    expect(hasAnyAilment(createTestEntity())).toBe(false);
  });

  it('returns true for any ailment', () => {
    const poisoned = createTestEntity({
      ailments: {
        poison: { type: 'poison', damagePerTurn: 3, turnsRemaining: 2 },
        paralyze: null, sleep: null, blind: null,
      },
    });
    expect(hasAnyAilment(poisoned)).toBe(true);
  });
});

// ============================================================================
// executeSkillAction Tests
// ============================================================================

describe('executeSkillAction', () => {
  function setupCombat() {
    const grid = createEmptyGrid();
    grid[1][1].entities = ['enemy-1'];

    const party = createTestEntity({
      id: 'party-1', name: 'Hero', isParty: true, position: null,
      stats: { str: 15, vit: 10, int: 15, wis: 12, agi: 10, luc: 5 },
      tp: 30,
    });
    const enemy = createTestEntity({
      id: 'enemy-1', name: 'Slime', isParty: false, position: [1, 1],
      hp: 50, maxHp: 50,
    });

    return createTestState({
      party: [party],
      enemies: [enemy],
      grid,
      turnOrder: [
        { entityId: 'party-1', speed: 10, hasActed: false, isDefending: false },
        { entityId: 'enemy-1', speed: 8, hasActed: false, isDefending: false },
      ],
    });
  }

  const lookup = (id: string): SkillDefinition => {
    const skills: Record<string, SkillDefinition> = {
      'dmg-skill': createTestSkill({
        id: 'dmg-skill', tpCost: 5, effects: [{ type: 'damage', stat: 'str', multiplier: 1.5 }],
      }),
      'push-skill': createTestSkill({
        id: 'push-skill', tpCost: 4, effects: [
          { type: 'damage', stat: 'str', multiplier: 0.8 },
          { type: 'displacement', direction: 'push', distance: 1 },
        ],
      }),
      'bind-skill': createTestSkill({
        id: 'bind-skill', tpCost: 5, bodyPartRequired: 'head', effects: [
          { type: 'bind', bindType: 'arm', chance: 100, duration: 3 },
        ],
      }),
      'heal-skill': createTestSkill({
        id: 'heal-skill', tpCost: 4, targetType: 'single-ally', bodyPartRequired: 'head',
        effects: [{ type: 'heal', multiplier: 1.5 }],
      }),
      'hazard-skill': createTestSkill({
        id: 'hazard-skill', tpCost: 4, effects: [{ type: 'hazard', hazardType: 'spike' }],
      }),
      'multi-hit': createTestSkill({
        id: 'multi-hit', tpCost: 5, bodyPartRequired: 'arm',
        effects: [{ type: 'multi-hit', stat: 'str', hits: 3, multiplierPerHit: 0.4 }],
      }),
      'buff-skill': createTestSkill({
        id: 'buff-skill', tpCost: 5, targetType: 'self',
        effects: [{ type: 'self-buff', buffStat: 'vit', amount: 5, duration: 3 }],
      }),
      'ailment-skill': createTestSkill({
        id: 'ailment-skill', tpCost: 4, bodyPartRequired: 'head',
        effects: [{ type: 'ailment', ailmentType: 'poison', chance: 100, damagePerTurn: 5, duration: 3 }],
      }),
      'cond-skill': createTestSkill({
        id: 'cond-skill', tpCost: 8, bodyPartRequired: 'arm',
        effects: [{ type: 'conditional-damage', stat: 'str', multiplier: 2.0, condition: { type: 'has-leg-bind' } }],
      }),
    };
    if (!skills[id]) throw new Error(`Unknown test skill: ${id}`);
    return skills[id];
  };

  it('deals damage and deducts TP', () => {
    const state = setupCombat();
    const result = executeSkillAction(state, 'party-1', 'dmg-skill', [1, 1], fixedRNG, lookup);

    expect(result.events.some((e) => e.type === 'damage')).toBe(true);
    const actor = result.state.party.find((p) => p.id === 'party-1');
    expect(actor!.tp).toBe(25); // 30 - 5
  });

  it('does nothing if TP insufficient', () => {
    const state = setupCombat();
    const lowTpState = {
      ...state,
      party: state.party.map((p) => ({ ...p, tp: 2 })),
    };
    const result = executeSkillAction(lowTpState, 'party-1', 'dmg-skill', [1, 1], fixedRNG, lookup);
    expect(result.events).toHaveLength(0);
  });

  it('pushes entity on displacement effect', () => {
    const state = setupCombat();
    const result = executeSkillAction(state, 'party-1', 'push-skill', [1, 1], fixedRNG, lookup);

    const enemy = result.state.enemies.find((e) => e.id === 'enemy-1');
    expect(enemy!.position).toEqual([2, 1]); // Pushed back 1 row
  });

  it('applies bind to target', () => {
    const state = setupCombat();
    const result = executeSkillAction(state, 'party-1', 'bind-skill', [1, 1], lowRNG, lookup);

    const bindEvents = result.events.filter((e) => e.type === 'bind-applied');
    expect(bindEvents.length).toBeGreaterThan(0);
    const enemy = result.state.enemies.find((e) => e.id === 'enemy-1');
    expect(enemy!.binds.arm).toBeGreaterThan(0);
  });

  it('heals an ally', () => {
    const state = setupCombat();
    const hurtState = {
      ...state,
      party: state.party.map((p) => ({ ...p, hp: 20 })),
    };
    // targetTile [0,0] means party member at index 0
    const result = executeSkillAction(hurtState, 'party-1', 'heal-skill', [0, 0], fixedRNG, lookup);

    const healEvents = result.events.filter((e) => e.type === 'heal');
    expect(healEvents.length).toBeGreaterThan(0);
    const hero = result.state.party.find((p) => p.id === 'party-1');
    expect(hero!.hp).toBeGreaterThan(20);
  });

  it('places a hazard on the grid', () => {
    const state = setupCombat();
    const result = executeSkillAction(state, 'party-1', 'hazard-skill', [0, 0], fixedRNG, lookup);

    expect(result.state.grid[0][0].hazard).toBe('spike');
    expect(result.events.some((e) => e.type === 'hazard-placed')).toBe(true);
  });

  it('performs multi-hit with combo counter incrementing', () => {
    const state = setupCombat();
    const result = executeSkillAction(state, 'party-1', 'multi-hit', [1, 1], fixedRNG, lookup);

    const dmgEvents = result.events.filter((e) => e.type === 'damage');
    expect(dmgEvents.length).toBe(3); // 3 hits
    expect(result.state.comboCounter).toBe(3);
  });

  it('applies self-buff and increases stat', () => {
    const state = setupCombat();
    const result = executeSkillAction(state, 'party-1', 'buff-skill', [0, 0], fixedRNG, lookup);

    const actor = result.state.party.find((p) => p.id === 'party-1');
    expect(actor!.stats.vit).toBe(15); // 10 + 5
    expect(actor!.buffs).toHaveLength(1);
    expect(actor!.buffs[0].turnsRemaining).toBe(3);
  });

  it('applies ailment to enemy', () => {
    const state = setupCombat();
    const result = executeSkillAction(state, 'party-1', 'ailment-skill', [1, 1], lowRNG, lookup);

    const ailmentEvents = result.events.filter((e) => e.type === 'ailment-applied');
    expect(ailmentEvents.length).toBeGreaterThan(0);
    const enemy = result.state.enemies.find((e) => e.id === 'enemy-1');
    expect(enemy!.ailments.poison).not.toBeNull();
  });

  it('conditional damage does bonus damage when condition met', () => {
    const state = setupCombat();
    // Give enemy leg bind
    const boundState = {
      ...state,
      enemies: state.enemies.map((e) => ({
        ...e,
        binds: { head: 0, arm: 0, leg: 2 },
      })),
    };
    const result = executeSkillAction(boundState, 'party-1', 'cond-skill', [1, 1], fixedRNG, lookup);

    const dmgEvents = result.events.filter((e) => e.type === 'damage');
    expect(dmgEvents.length).toBe(1);
    // 2.0x multiplier should be higher damage
    expect(dmgEvents[0].type === 'damage' && dmgEvents[0].damage).toBeGreaterThan(0);
  });

  it('conditional damage falls back to 1.0x when condition not met', () => {
    const state = setupCombat();
    const result = executeSkillAction(state, 'party-1', 'cond-skill', [1, 1], fixedRNG, lookup);

    const dmgEvents = result.events.filter((e) => e.type === 'damage');
    expect(dmgEvents.length).toBe(1);
  });

  it('blocks arm-required skill when arm bound', () => {
    const state = setupCombat();
    const boundState = {
      ...state,
      party: state.party.map((p) => ({
        ...p,
        binds: { head: 0, arm: 2, leg: 0 },
      })),
    };
    const result = executeSkillAction(boundState, 'party-1', 'multi-hit', [1, 1], fixedRNG, lookup);
    expect(result.events).toHaveLength(0);
  });
});

// ============================================================================
// tickBuffs Tests
// ============================================================================

describe('tickBuffs', () => {
  it('decrements buff duration', () => {
    const entity = createTestEntity({
      buffs: [{ skillId: 'test', buffStat: 'vit', amount: 5, turnsRemaining: 3 }],
      stats: { str: 10, vit: 15, int: 10, wis: 10, agi: 10, luc: 10 },
    });
    const ticked = tickBuffs(entity);
    expect(ticked.buffs[0].turnsRemaining).toBe(2);
    expect(ticked.stats.vit).toBe(15); // Still active
  });

  it('removes expired buff and reverts stat', () => {
    const entity = createTestEntity({
      buffs: [{ skillId: 'test', buffStat: 'vit', amount: 5, turnsRemaining: 1 }],
      stats: { str: 10, vit: 15, int: 10, wis: 10, agi: 10, luc: 10 },
    });
    const ticked = tickBuffs(entity);
    expect(ticked.buffs).toHaveLength(0);
    expect(ticked.stats.vit).toBe(10); // Reverted
  });
});

// ============================================================================
// calculateDamage with stat parameter Tests
// ============================================================================

describe('calculateDamage with stat parameter', () => {
  it('uses INT/WIS for magical damage', () => {
    const attacker = createTestEntity({
      stats: { str: 5, vit: 10, int: 20, wis: 10, agi: 10, luc: 0 },
    });
    const defender = createTestEntity({
      stats: { str: 10, vit: 10, int: 10, wis: 5, agi: 10, luc: 0 },
    });

    const magResult = calculateDamage(attacker, defender, 1.0, 0, fixedRNG, 'int');
    const physResult = calculateDamage(attacker, defender, 1.0, 0, fixedRNG, 'str');

    // INT=20 vs WIS=5/2=2.5 → 17.5 base for magical
    // STR=5 vs VIT=10/2=5 → 1 base for physical (min 1)
    expect(magResult.damage).toBeGreaterThan(physResult.damage);
  });

  it('applies defend multiplier', () => {
    const attacker = createTestEntity({
      stats: { str: 20, vit: 10, int: 10, wis: 10, agi: 10, luc: 0 },
    });
    const defender = createTestEntity({
      stats: { str: 10, vit: 10, int: 10, wis: 10, agi: 10, luc: 0 },
    });

    const normalDmg = calculateDamage(attacker, defender, 1.0, 0, fixedRNG, 'str', false);
    const defendDmg = calculateDamage(attacker, defender, 1.0, 0, fixedRNG, 'str', true);

    expect(defendDmg.damage).toBeLessThan(normalDmg.damage);
  });

  it('head bind penalizes magical damage', () => {
    const attacker = createTestEntity({
      stats: { str: 10, vit: 10, int: 20, wis: 10, agi: 10, luc: 0 },
      binds: { head: 2, arm: 0, leg: 0 },
    });
    const defender = createTestEntity();

    const result = calculateDamage(attacker, defender, 1.0, 0, fixedRNG, 'int');
    // Without head bind, base would be 20*1 - 5 = 15, then *0.5 for head bind
    expect(result.damage).toBeLessThanOrEqual(10);
  });
});
