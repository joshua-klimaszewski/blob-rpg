/**
 * Quest Store
 *
 * Zustand store managing active quests and progress tracking.
 */

import { create } from 'zustand';
import type { ActiveQuest } from '../types/economy';
import { getQuest } from '../data/quests/index';

interface QuestStore {
  /** Active quests by definition ID */
  activeQuests: ActiveQuest[];
  /** Floors the player has reached (unlocks floor-gated quests) */
  floorsReached: string[];

  /** Accept a quest from the guild board */
  acceptQuest: (definitionId: string) => void;

  /** Accept multiple quests at once (batch operation) */
  acceptAll: (definitionIds: string[]) => void;

  /** Increment progress for kill quests */
  incrementKillProgress: (enemyId: string, count: number) => void;

  /** Increment progress for gather quests (on material sell) */
  incrementGatherProgress: (materialId: string, count: number) => void;

  /** Mark explore quest complete (on entering a floor) */
  completeExploreQuest: (floorId: string) => void;

  /** Update map-floor quest progress (checks for full completion) */
  updateMapFloorProgress: (floorId: string, exploredCount: number, totalWalkable: number) => void;

  /** Claim rewards for a completed quest (returns gold/xp/equipment, or null if not claimable) */
  claimQuest: (definitionId: string) => { gold: number; xp: number; equipmentId?: string } | null;

  /** Check if a quest is already active or claimed */
  isQuestActive: (definitionId: string) => boolean;

  /** Mark a floor as reached (unlocks floor-gated quests) */
  markFloorReached: (floorId: string) => void;

  /** Reset quests */
  reset: () => void;
}

export const useQuestStore = create<QuestStore>((set, get) => ({
  activeQuests: [],
  floorsReached: [],

  acceptQuest: (definitionId) => {
    const { activeQuests } = get();
    if (activeQuests.some((q) => q.definitionId === definitionId)) return;

    set({
      activeQuests: [
        ...activeQuests,
        { definitionId, progress: 0, completed: false, claimed: false },
      ],
    });
  },

  acceptAll: (definitionIds) => {
    const { activeQuests } = get();
    const activeIds = new Set(activeQuests.map((q) => q.definitionId));
    const newQuests = definitionIds
      .filter((id) => !activeIds.has(id))
      .map((id) => ({ definitionId: id, progress: 0, completed: false, claimed: false }));

    if (newQuests.length === 0) return;

    set({ activeQuests: [...activeQuests, ...newQuests] });
  },

  incrementKillProgress: (enemyId, count) => {
    set((state) => ({
      activeQuests: state.activeQuests.map((quest) => {
        if (quest.completed || quest.claimed) return quest;
        const def = getQuest(quest.definitionId);
        if (!def || def.objective.type !== 'kill') return quest;
        if (def.objective.enemyId !== enemyId) return quest;

        const newProgress = quest.progress + count;
        return {
          ...quest,
          progress: newProgress,
          completed: newProgress >= def.objective.count,
        };
      }),
    }));
  },

  incrementGatherProgress: (materialId, count) => {
    set((state) => ({
      activeQuests: state.activeQuests.map((quest) => {
        if (quest.completed || quest.claimed) return quest;
        const def = getQuest(quest.definitionId);
        if (!def || def.objective.type !== 'gather') return quest;
        if (def.objective.materialId !== materialId) return quest;

        const newProgress = quest.progress + count;
        return {
          ...quest,
          progress: newProgress,
          completed: newProgress >= def.objective.count,
        };
      }),
    }));
  },

  completeExploreQuest: (floorId) => {
    set((state) => ({
      activeQuests: state.activeQuests.map((quest) => {
        if (quest.completed || quest.claimed) return quest;
        const def = getQuest(quest.definitionId);
        if (!def || def.objective.type !== 'explore') return quest;
        if (def.objective.floorId !== floorId) return quest;

        return { ...quest, progress: 1, completed: true };
      }),
    }));
  },

  updateMapFloorProgress: (floorId, exploredCount, totalWalkable) => {
    set((state) => ({
      activeQuests: state.activeQuests.map((quest) => {
        if (quest.completed || quest.claimed) return quest;
        const def = getQuest(quest.definitionId);
        if (!def || def.objective.type !== 'map-floor') return quest;
        if (def.objective.floorId !== floorId) return quest;

        // Check if floor is fully mapped (100% completion)
        const isComplete = exploredCount >= totalWalkable;
        return {
          ...quest,
          progress: exploredCount,
          completed: isComplete,
        };
      }),
    }));
  },

  claimQuest: (definitionId) => {
    const { activeQuests } = get();
    const quest = activeQuests.find((q) => q.definitionId === definitionId);
    if (!quest || !quest.completed || quest.claimed) return null;

    const def = getQuest(definitionId);
    if (!def) return null;

    set((state) => ({
      activeQuests: state.activeQuests.map((q) =>
        q.definitionId === definitionId ? { ...q, claimed: true } : q,
      ),
    }));

    return def.reward;
  },

  isQuestActive: (definitionId) => {
    const { activeQuests } = get();
    return activeQuests.some((q) => q.definitionId === definitionId);
  },

  markFloorReached: (floorId) => {
    set((state) => {
      if (state.floorsReached.includes(floorId)) return state;
      return { floorsReached: [...state.floorsReached, floorId] };
    });
  },

  reset: () => {
    set({ activeQuests: [], floorsReached: [] });
  },
}));
