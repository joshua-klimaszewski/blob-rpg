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

  /** Accept a quest from the guild board */
  acceptQuest: (definitionId: string) => void;

  /** Increment progress for kill quests */
  incrementKillProgress: (enemyId: string, count: number) => void;

  /** Increment progress for gather quests (on material sell) */
  incrementGatherProgress: (materialId: string, count: number) => void;

  /** Mark explore quest complete (on entering a floor) */
  completeExploreQuest: (floorId: string) => void;

  /** Claim rewards for a completed quest (returns gold/xp, or null if not claimable) */
  claimQuest: (definitionId: string) => { gold: number; xp: number } | null;

  /** Check if a quest is already active or claimed */
  isQuestActive: (definitionId: string) => boolean;

  /** Reset quests */
  reset: () => void;
}

export const useQuestStore = create<QuestStore>((set, get) => ({
  activeQuests: [],

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

  reset: () => {
    set({ activeQuests: [] });
  },
}));
