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
import { useInventoryStore } from './inventoryStore';
import { useQuestStore } from './questStore';
import { getEnemy } from '../data/enemies/index';
import { getSkill } from '../data/classes/index';
import { getEnemySkill } from '../data/enemies/skills';
import type { SkillDefinition } from '../types/character';
import { getPassiveModifiers } from '../systems/character';

/** Combined skill lookup: checks player skills first, then enemy skills */
function lookupSkill(id: string): SkillDefinition {
  const playerSkill = getSkill(id);
  if (playerSkill) return playerSkill;
  const enemySkill = getEnemySkill(id);
  if (enemySkill) return enemySkill;
  // Fallback — should not happen if data is consistent
  throw new Error(`Unknown skill ID: ${id}`);
}

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

  /** Process an enemy's turn and advance to the next actor atomically */
  processEnemyTurnAndAdvance: () => void;

  /** Advance to the next actor in turn order */
  advanceToNext: () => void;

  /** End combat and return to previous screen */
  endCombat: () => void;

  /** Clear last events (after UI has processed them) */
  clearEvents: () => void;
}

function handlePhaseTransition(get: () => CombatStore, state: CombatState) {
  if (state.phase === 'victory') {
    const rewards = calculateRewards(state, defaultRNG, getEnemy);
    useCombatStore.setState({ rewards });

    // Award XP and sync HP/TP to party store
    usePartyStore.getState().awardXp(rewards.xp);
    usePartyStore.getState().syncHpTpFromCombat(state.party);

    // Award gold and materials to inventory
    const inventory = useInventoryStore.getState();
    inventory.addGold(rewards.gold);
    for (const mat of rewards.materials) {
      inventory.addMaterial(mat.id, mat.quantity);
    }

    // Track kill quest progress (count defeated enemies by type)
    const questStore = useQuestStore.getState();
    const killCounts: Record<string, number> = {};
    for (const enemy of state.enemies) {
      if (enemy.hp <= 0) {
        killCounts[enemy.definitionId] = (killCounts[enemy.definitionId] ?? 0) + 1;
      }
    }
    for (const [enemyId, count] of Object.entries(killCounts)) {
      questStore.incrementKillProgress(enemyId, count);
    }

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

    // Inject passive modifiers from learned skills into party combat entities
    const partyWithPassives = combat.party.map((entity) => {
      const member = encounter.party.find((m) => m.id === entity.id);
      if (!member) return entity;
      const modifiers = getPassiveModifiers(member.learnedSkills, lookupSkill);
      return { ...entity, passiveModifiers: modifiers };
    });

    set({
      combat: { ...combat, party: partyWithPassives },
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

    const result = executeAction(combat, action, defaultRNG, lookupSkill);

    set({
      combat: result.state,
      lastEvents: result.events,
    });

    handlePhaseTransition(get, result.state);
  },

  processEnemyTurnAndAdvance: () => {
    const { combat } = get();
    if (!combat || combat.phase !== 'active') return;

    const currentEntry = combat.turnOrder[combat.currentActorIndex];
    if (!currentEntry) return;

    const result = executeEnemyTurn(combat, currentEntry.entityId, defaultRNG, lookupSkill, getEnemy);

    // If phase changed (victory/defeat), don't advance turn
    if (result.state.phase !== 'active') {
      set({
        combat: result.state,
        lastEvents: result.events,
      });
      handlePhaseTransition(get, result.state);
      return;
    }

    // Atomically apply enemy action AND advance turn in one set() call
    const advanced = advanceTurn(result.state);
    set({
      combat: advanced,
      lastEvents: result.events,
    });
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
