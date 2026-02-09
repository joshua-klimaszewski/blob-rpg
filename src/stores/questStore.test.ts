import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useQuestStore } from './questStore';
import { usePartyStore } from './partyStore';
import { useGuildStore } from './guildStore';

// Mock localStorage for save system tests
const store: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { for (const key in store) delete store[key]; }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
});

import { collectGameState, loadGameState, resetAllStores } from './saveActions';
import { createGuild, saveToSlot, loadSlot } from '../systems/save';

describe('Quest Store', () => {
  beforeEach(() => {
    useQuestStore.getState().reset();
    for (const key in store) delete store[key];
  });

  it('tracks kill progress and completes quest', () => {
    useQuestStore.getState().acceptQuest('quest-slay-slimes');
    useQuestStore.getState().incrementKillProgress('slime', 5);
    expect(useQuestStore.getState().activeQuests[0].completed).toBe(true);
  });

  it('preserves quests through save/load', () => {
    useQuestStore.getState().acceptQuest('quest-slay-slimes');
    useQuestStore.getState().incrementKillProgress('slime', 3);
    const saved = JSON.parse(JSON.stringify({ activeQuests: useQuestStore.getState().activeQuests }));
    useQuestStore.getState().reset();
    useQuestStore.setState({ activeQuests: saved.activeQuests });
    expect(useQuestStore.getState().activeQuests[0].progress).toBe(3);
  });

  it('claim works after load', () => {
    useQuestStore.getState().acceptQuest('quest-slay-slimes');
    useQuestStore.getState().incrementKillProgress('slime', 5);
    const saved = JSON.parse(JSON.stringify({ activeQuests: useQuestStore.getState().activeQuests }));
    useQuestStore.getState().reset();
    useQuestStore.setState({ activeQuests: saved.activeQuests });
    const reward = useQuestStore.getState().claimQuest('quest-slay-slimes');
    expect(reward).toEqual({ gold: 50, xp: 100 });
  });
});

describe('Quest Integration: full save/load cycle', () => {
  beforeEach(() => {
    resetAllStores();
    for (const key in store) delete store[key];
    usePartyStore.getState().initializeRoster();
    const guild = createGuild('Test Guild');
    useGuildStore.getState().setActiveGuild(guild.id, guild.name);
  });

  it('collectGameState includes quest progress', () => {
    useQuestStore.getState().acceptQuest('quest-slay-slimes');
    useQuestStore.getState().incrementKillProgress('slime', 3);

    const gameState = collectGameState();
    expect(gameState.quests.activeQuests).toHaveLength(1);
    expect(gameState.quests.activeQuests[0].progress).toBe(3);
  });

  it('full save/load cycle preserves quest progress', () => {
    const guildId = useGuildStore.getState().currentGuildId!;

    useQuestStore.getState().acceptQuest('quest-slay-slimes');
    useQuestStore.getState().incrementKillProgress('slime', 3);

    const gameState = collectGameState();
    const meta = saveToSlot(guildId, null, gameState);

    resetAllStores();
    expect(useQuestStore.getState().activeQuests).toHaveLength(0);

    const save = loadSlot(guildId, meta.slotId);
    expect(save).not.toBeNull();
    loadGameState(save!);

    const quests = useQuestStore.getState().activeQuests;
    expect(quests).toHaveLength(1);
    expect(quests[0].definitionId).toBe('quest-slay-slimes');
    expect(quests[0].progress).toBe(3);
    expect(quests[0].completed).toBe(false);
  });

  it('can complete and claim quest after save/load', () => {
    const guildId = useGuildStore.getState().currentGuildId!;

    useQuestStore.getState().acceptQuest('quest-slay-slimes');
    useQuestStore.getState().incrementKillProgress('slime', 3);

    const gameState = collectGameState();
    const meta = saveToSlot(guildId, null, gameState);
    resetAllStores();
    const save = loadSlot(guildId, meta.slotId);
    loadGameState(save!);

    useQuestStore.getState().incrementKillProgress('slime', 2);

    const quests = useQuestStore.getState().activeQuests;
    expect(quests[0].progress).toBe(5);
    expect(quests[0].completed).toBe(true);

    const reward = useQuestStore.getState().claimQuest('quest-slay-slimes');
    expect(reward).toEqual({ gold: 50, xp: 100 });
    expect(useQuestStore.getState().activeQuests[0].claimed).toBe(true);
  });

  it('handles save data with missing quests field gracefully', () => {
    const guildId = useGuildStore.getState().currentGuildId!;

    const gameState = collectGameState();
    const meta = saveToSlot(guildId, null, gameState);

    // Simulate an old save without quests field
    const raw = localStorage.getItem(`blob-rpg-guild-${guildId}-slot-${meta.slotId}`);
    const parsed = JSON.parse(raw!);
    delete parsed.quests;
    localStorage.setItem(`blob-rpg-guild-${guildId}-slot-${meta.slotId}`, JSON.stringify(parsed));

    resetAllStores();
    const save = loadSlot(guildId, meta.slotId);
    // Should not crash even with missing quests
    loadGameState(save!);
    expect(useQuestStore.getState().activeQuests).toEqual([]);
  });
});
