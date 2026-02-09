/**
 * Combat Store Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCombatStore } from './combatStore';
import { useGameStore } from './gameStore';
import type { EncounterData, EnemyDefinition, PartyMemberState, AttackAction } from '../types/combat';

function createTestEnemyDefinition(overrides?: Partial<EnemyDefinition>): EnemyDefinition {
  return {
    id: 'test-enemy',
    name: 'Test Enemy',
    stats: { str: 10, vit: 10, int: 10, wis: 10, agi: 10, luc: 10 },
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
    stats: { str: 20, vit: 10, int: 10, wis: 10, agi: 15, luc: 10 },
    baseStats: { str: 20, vit: 10, int: 10, wis: 10, agi: 15, luc: 10 },
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

function createTestEncounter(): EncounterData {
  return {
    party: [createTestPartyMember()],
    enemies: [
      {
        definition: createTestEnemyDefinition(),
        instanceId: 'enemy-1',
        position: [1, 1],
      },
    ],
    canFlee: true,
  };
}

describe('CombatStore', () => {
  beforeEach(() => {
    // Reset stores before each test
    useCombatStore.setState({
      combat: null,
      encounter: null,
      lastEvents: [],
      rewards: null,
    });

    useGameStore.setState({
      screen: 'town',
    });
  });

  describe('startCombat', () => {
    it('should initialize combat from encounter', () => {
      const encounter = createTestEncounter();
      const store = useCombatStore.getState();

      store.startCombat(encounter);

      const state = useCombatStore.getState();
      expect(state.combat).not.toBeNull();
      expect(state.encounter).toBe(encounter);
      expect(state.combat?.phase).toBe('active');
    });

    it('should transition game screen to combat', () => {
      const encounter = createTestEncounter();
      const store = useCombatStore.getState();

      store.startCombat(encounter);

      const gameState = useGameStore.getState();
      expect(gameState.screen).toBe('combat');
    });

    it('should initialize party and enemies', () => {
      const encounter = createTestEncounter();
      const store = useCombatStore.getState();

      store.startCombat(encounter);

      const state = useCombatStore.getState();
      expect(state.combat?.party).toHaveLength(1);
      expect(state.combat?.enemies).toHaveLength(1);
    });

    it('should place enemies on grid', () => {
      const encounter = createTestEncounter();
      const store = useCombatStore.getState();

      store.startCombat(encounter);

      const state = useCombatStore.getState();
      const grid = state.combat?.grid;
      expect(grid?.[1][1].entities).toContain('enemy-1');
    });

    it('should clear previous combat state', () => {
      const encounter = createTestEncounter();
      const store = useCombatStore.getState();

      // Start first combat
      store.startCombat(encounter);

      // Start second combat
      store.startCombat(createTestEncounter());

      const state = useCombatStore.getState();
      expect(state.lastEvents).toEqual([]);
      expect(state.rewards).toBeNull();
    });
  });

  describe('selectAction', () => {
    it('should execute attack action and update combat state', () => {
      const encounter = createTestEncounter();
      const store = useCombatStore.getState();

      store.startCombat(encounter);

      const action: AttackAction = {
        actorId: 'party-1',
        type: 'attack',
        targetTile: [1, 1],
      };

      store.selectAction(action);

      const state = useCombatStore.getState();
      expect(state.lastEvents.length).toBeGreaterThan(0);
      expect(state.lastEvents[0].type).toBe('damage');
    });

    it('should update combo counter on attack', () => {
      const encounter = createTestEncounter();
      const store = useCombatStore.getState();

      store.startCombat(encounter);

      const initialCombo = useCombatStore.getState().combat?.comboCounter;
      expect(initialCombo).toBe(0);

      const action: AttackAction = {
        actorId: 'party-1',
        type: 'attack',
        targetTile: [1, 1],
      };

      store.selectAction(action);

      const state = useCombatStore.getState();
      expect(state.combat?.comboCounter).toBeGreaterThan(0);
    });

    it('should do nothing if not in combat', () => {
      const store = useCombatStore.getState();

      const action: AttackAction = {
        actorId: 'party-1',
        type: 'attack',
        targetTile: [1, 1],
      };

      store.selectAction(action);

      const state = useCombatStore.getState();
      expect(state.combat).toBeNull();
      expect(state.lastEvents).toEqual([]);
    });

    it('should handle victory phase transition', () => {
      vi.useFakeTimers();

      const encounter: EncounterData = {
        party: [
          createTestPartyMember({
            stats: { str: 100, vit: 10, int: 10, wis: 10, agi: 15, luc: 100 },
          }),
        ],
        enemies: [
          {
            definition: createTestEnemyDefinition({ maxHp: 1 }), // Easy kill
            instanceId: 'enemy-1',
            position: [1, 1],
          },
        ],
        canFlee: true,
      };

      const store = useCombatStore.getState();
      store.startCombat(encounter);

      const action: AttackAction = {
        actorId: 'party-1',
        type: 'attack',
        targetTile: [1, 1],
      };

      store.selectAction(action);

      const state = useCombatStore.getState();
      expect(state.combat?.phase).toBe('victory');
      expect(state.rewards).not.toBeNull();
      expect(state.rewards?.xp).toBeGreaterThan(0);

      // Victory should end combat after timeout
      vi.advanceTimersByTime(2000);

      const finalState = useCombatStore.getState();
      expect(finalState.combat).toBeNull();

      vi.useRealTimers();
    });
  });

  describe('endCombat', () => {
    it('should clear combat state', () => {
      const encounter = createTestEncounter();
      const store = useCombatStore.getState();

      store.startCombat(encounter);
      store.endCombat();

      const state = useCombatStore.getState();
      expect(state.combat).toBeNull();
      expect(state.encounter).toBeNull();
      expect(state.lastEvents).toEqual([]);
      expect(state.rewards).toBeNull();
    });

    it('should return to dungeon screen', () => {
      const encounter = createTestEncounter();
      const store = useCombatStore.getState();

      store.startCombat(encounter);
      store.endCombat();

      const gameState = useGameStore.getState();
      expect(gameState.screen).toBe('dungeon');
    });
  });

  describe('clearEvents', () => {
    it('should clear last events', () => {
      const encounter = createTestEncounter();
      const store = useCombatStore.getState();

      store.startCombat(encounter);

      const action: AttackAction = {
        actorId: 'party-1',
        type: 'attack',
        targetTile: [1, 1],
      };

      store.selectAction(action);

      // Events should be present
      expect(useCombatStore.getState().lastEvents.length).toBeGreaterThan(0);

      store.clearEvents();

      // Events should be cleared
      expect(useCombatStore.getState().lastEvents).toEqual([]);
    });
  });
});
