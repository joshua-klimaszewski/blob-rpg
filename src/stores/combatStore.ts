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
  calculateRewards,
  defaultRNG,
} from '../systems/combat';
import { useGameStore } from './gameStore';

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

  /** End combat and return to previous screen */
  endCombat: () => void;

  /** Clear last events (after UI has processed them) */
  clearEvents: () => void;
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

    // Execute action in combat system
    const result = executeAction(combat, action, defaultRNG);

    // Update combat state
    set({
      combat: result.state,
      lastEvents: result.events,
    });

    // Handle phase transitions
    if (result.state.phase === 'victory') {
      const rewards = calculateRewards(result.state);
      set({ rewards });

      // Return to dungeon after victory
      setTimeout(() => {
        get().endCombat();
        // TODO: Apply rewards to party (Phase 4)
      }, 2000); // Give UI time to show victory
    }

    if (result.state.phase === 'defeat') {
      // Return to town after defeat
      setTimeout(() => {
        get().endCombat();
        useGameStore.getState().setScreen('town');
      }, 2000); // Give UI time to show defeat
    }
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
