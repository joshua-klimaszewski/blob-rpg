/**
 * Combat Store
 *
 * Zustand store that bridges combat system to React components.
 * Manages combat state, action execution, and event streaming.
 */

import { create } from 'zustand';
import type {
  CombatState,
  EncounterData,
  CombatEventUnion,
  Action,
  CombatRewards,
} from '../types/combat';
import {
  initializeCombat,
  executeAction,
  executeEnemyTurn,
  advanceTurn,
  calculateRewards,
  defaultRNG,
} from '../systems/combat';
import { useGameStore } from './gameStore';
import { usePartyStore } from './partyStore';
import { getSkill } from '../data/classes/index';

interface CombatStore {
  /** Current combat state (null = not in combat) */
  combat: CombatState | null;

  /** Encounter data that started this combat */
  encounter: EncounterData | null;

  /** Events from last action (for UI animations/notifications) */
  lastEvents: CombatEventUnion[];

  /** Rewards from victory (calculated at end) */
  rewards: CombatRewards | null;

  /** Start a new combat encounter */
  startCombat: (encounter: EncounterData) => void;

  /** Execute a combat action */
  selectAction: (action: Action) => void;

  /** Process an enemy's turn automatically */
  processEnemyTurn: () => void;

  /** Advance to the next actor in turn order */
  advanceToNext: () => void;

  /** End combat and return to previous screen */
  endCombat: () => void;

  /** Clear last events (after UI has processed them) */
  clearEvents: () => void;
}

function handlePhaseTransition(get: () => CombatStore, state: CombatState) {
  if (state.phase === 'victory') {
    const rewards = calculateRewards(state);
    useCombatStore.setState({ rewards });

    // Award XP and sync HP/TP to party store
    usePartyStore.getState().awardXp(rewards.xp);
    usePartyStore.getState().syncHpTpFromCombat(state.party);

    setTimeout(() => {
      get().endCombat();
    }, 2000);
  }

  if (state.phase === 'defeat') {
    setTimeout(() => {
      get().endCombat();
      useGameStore.getState().setScreen('town');
    }, 2000);
  }
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  combat: null,
  encounter: null,
  lastEvents: [],
  rewards: null,

  startCombat: (encounter) => {
    const combat = initializeCombat(encounter);

    set({
      combat,
      encounter,
      lastEvents: [],
      rewards: null,
    });

    // Transition game screen to combat
    useGameStore.getState().setScreen('combat');
  },

  selectAction: (action) => {
    const { combat } = get();
    if (!combat) return;

    const result = executeAction(combat, action, defaultRNG, getSkill);

    set({
      combat: result.state,
      lastEvents: result.events,
    });

    handlePhaseTransition(get, result.state);
  },

  processEnemyTurn: () => {
    const { combat } = get();
    if (!combat || combat.phase !== 'active') return;

    const currentEntry = combat.turnOrder[combat.currentActorIndex];
    if (!currentEntry) return;

    const result = executeEnemyTurn(combat, currentEntry.entityId, defaultRNG);

    set({
      combat: result.state,
      lastEvents: result.events,
    });

    handlePhaseTransition(get, result.state);
  },

  advanceToNext: () => {
    const { combat } = get();
    if (!combat || combat.phase !== 'active') return;

    const newState = advanceTurn(combat);
    set({ combat: newState });
  },

  endCombat: () => {
    const { combat } = get();

    set({
      combat: null,
      encounter: null,
      lastEvents: [],
      rewards: null,
    });

    // Return to dungeon (unless defeat sent us to town)
    if (combat?.phase !== 'defeat') {
      useGameStore.getState().setScreen('dungeon');
    }
  },

  clearEvents: () => {
    set({ lastEvents: [] });
  },
}));
