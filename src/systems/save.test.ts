import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SAVE_VERSION, MAX_GUILDS, MAX_SLOTS_PER_GUILD } from '../types/save';
import type { SaveData } from '../types/save';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { for (const key in store) delete store[key]; }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
};
vi.stubGlobal('localStorage', localStorageMock);

// Import after mocking
import {
  getRegistry,
  saveRegistry,
  hasAnyGuilds,
  createGuild,
  deleteGuild,
  updateGuildLastPlayed,
  getSlotIndex,
  saveToSlot,
  loadSlot,
  deleteSlot,
  saveSuspend,
  loadAndDeleteSuspend,
  hasSuspendSave,
  hasLegacySaveData,
  migrateLegacySaves,
  clearLegacyKeys,
} from './save';

function makeSavePayload(overrides?: Partial<Omit<SaveData, 'version' | 'guildId' | 'slotId' | 'savedAt'>>): Omit<SaveData, 'version' | 'guildId' | 'slotId' | 'savedAt'> {
  return {
    guildName: 'Test Guild',
    party: {
      roster: [
        {
          id: 'p1', name: 'Ironblob', classId: 'ironblob',
          stats: { str: 10, vit: 12, int: 5, wis: 6, agi: 7, luc: 8 },
          baseStats: { str: 10, vit: 12, int: 5, wis: 6, agi: 7, luc: 8 },
          maxHp: 50, hp: 50, maxTp: 20, tp: 20,
          level: 3, xp: 100, skillPoints: 1, learnedSkills: [],
          equipment: { weapon: null, armor: null, accessory1: null, accessory2: null },
        },
      ],
      activePartyIds: ['p1'],
    },
    inventory: {
      gold: 500,
      materials: { 'slime-gel': 5 },
      soldMaterials: { 'slime-gel': 2 },
      consumables: {},
      ownedEquipment: ['iron-sword'],
    },
    quests: {
      activeQuests: [],
    },
    ...overrides,
  };
}

function makeSuspendPayload() {
  return {
    ...makeSavePayload(),
    dungeon: {
      floorId: 'verdant-depths-f1',
      floorNumber: 1,
      playerPosition: { x: 3, y: 5 },
      foes: [],
      encounterGauge: { value: 42, threshold: 100 },
      facing: 'north' as const,
      exploredTiles: ['3,5', '3,4', '3,3'],
    },
  };
}

// Clear all localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
});

// ============================================================================
// Registry
// ============================================================================

describe('Registry', () => {
  it('returns empty registry when none exists', () => {
    const reg = getRegistry();
    expect(reg.version).toBe(SAVE_VERSION);
    expect(reg.guilds).toEqual([]);
  });

  it('saves and loads registry', () => {
    const reg = { version: SAVE_VERSION, guilds: [] };
    saveRegistry(reg);
    expect(getRegistry()).toEqual(reg);
  });

  it('hasAnyGuilds returns false when empty', () => {
    expect(hasAnyGuilds()).toBe(false);
  });

  it('hasAnyGuilds returns true after creating a guild', () => {
    createGuild('Test');
    expect(hasAnyGuilds()).toBe(true);
  });
});

// ============================================================================
// Guild CRUD
// ============================================================================

describe('Guild CRUD', () => {
  it('creates a guild with correct fields', () => {
    const guild = createGuild('Heroes');
    expect(guild.name).toBe('Heroes');
    expect(guild.id).toBeTruthy();
    expect(guild.slotCount).toBe(0);
    expect(guild.hasSuspendSave).toBe(false);
    expect(guild.createdAt).toBeTruthy();
    expect(guild.lastPlayedAt).toBeTruthy();
  });

  it('adds guild to registry', () => {
    createGuild('A');
    createGuild('B');
    const reg = getRegistry();
    expect(reg.guilds).toHaveLength(2);
    expect(reg.guilds[0].name).toBe('A');
    expect(reg.guilds[1].name).toBe('B');
  });

  it('initializes empty slot index for new guild', () => {
    const guild = createGuild('Test');
    const slotIndex = getSlotIndex(guild.id);
    expect(slotIndex).not.toBeNull();
    expect(slotIndex!.guildId).toBe(guild.id);
    expect(slotIndex!.slots).toEqual([]);
  });

  it('throws when creating more than MAX_GUILDS', () => {
    for (let i = 0; i < MAX_GUILDS; i++) {
      createGuild(`Guild ${i}`);
    }
    expect(() => createGuild('One Too Many')).toThrow();
  });

  it('deletes a guild and all its data', () => {
    const guild = createGuild('Doomed');
    saveToSlot(guild.id, null, makeSavePayload());

    deleteGuild(guild.id);

    expect(getRegistry().guilds).toHaveLength(0);
    expect(getSlotIndex(guild.id)).toBeNull();
  });

  it('updateGuildLastPlayed updates timestamp', () => {
    const guild = createGuild('Test');

    // Set to old timestamp
    const reg = getRegistry();
    reg.guilds[0].lastPlayedAt = '2020-01-01T00:00:00.000Z';
    saveRegistry(reg);

    updateGuildLastPlayed(guild.id);
    const updated = getRegistry().guilds[0];
    expect(updated.lastPlayedAt).not.toBe('2020-01-01T00:00:00.000Z');
  });
});

// ============================================================================
// Save Slots
// ============================================================================

describe('Save Slots', () => {
  it('saves to a new slot and returns meta', () => {
    const guild = createGuild('Test');
    const meta = saveToSlot(guild.id, null, makeSavePayload());

    expect(meta.slotId).toBeTruthy();
    expect(meta.savedAt).toBeTruthy();
    expect(meta.summary.gold).toBe(500);
    expect(meta.summary.partyLevel).toBe(3);
  });

  it('loads a saved slot', () => {
    const guild = createGuild('Test');
    const meta = saveToSlot(guild.id, null, makeSavePayload());

    const loaded = loadSlot(guild.id, meta.slotId);
    expect(loaded).not.toBeNull();
    expect(loaded!.guildId).toBe(guild.id);
    expect(loaded!.guildName).toBe('Test Guild');
    expect(loaded!.party.roster).toHaveLength(1);
    expect(loaded!.inventory.gold).toBe(500);
  });

  it('overwrites an existing slot', () => {
    const guild = createGuild('Test');
    const meta = saveToSlot(guild.id, null, makeSavePayload());

    const updatedPayload = makeSavePayload({ inventory: { ...makeSavePayload().inventory, gold: 999 } });
    saveToSlot(guild.id, meta.slotId, updatedPayload);

    const loaded = loadSlot(guild.id, meta.slotId);
    expect(loaded!.inventory.gold).toBe(999);

    // Slot count should not increase
    const slotIndex = getSlotIndex(guild.id);
    expect(slotIndex!.slots).toHaveLength(1);
  });

  it('creates multiple slots', () => {
    const guild = createGuild('Test');
    saveToSlot(guild.id, null, makeSavePayload());
    saveToSlot(guild.id, null, makeSavePayload());
    saveToSlot(guild.id, null, makeSavePayload());

    const slotIndex = getSlotIndex(guild.id);
    expect(slotIndex!.slots).toHaveLength(3);

    const reg = getRegistry();
    expect(reg.guilds[0].slotCount).toBe(3);
  });

  it('throws when exceeding MAX_SLOTS_PER_GUILD', () => {
    const guild = createGuild('Test');
    for (let i = 0; i < MAX_SLOTS_PER_GUILD; i++) {
      saveToSlot(guild.id, null, makeSavePayload());
    }
    expect(() => saveToSlot(guild.id, null, makeSavePayload())).toThrow();
  });

  it('deletes a slot', () => {
    const guild = createGuild('Test');
    const meta = saveToSlot(guild.id, null, makeSavePayload());
    saveToSlot(guild.id, null, makeSavePayload());

    deleteSlot(guild.id, meta.slotId);

    expect(loadSlot(guild.id, meta.slotId)).toBeNull();
    expect(getSlotIndex(guild.id)!.slots).toHaveLength(1);
    expect(getRegistry().guilds[0].slotCount).toBe(1);
  });

  it('returns null for non-existent slot', () => {
    const guild = createGuild('Test');
    expect(loadSlot(guild.id, 'nonexistent')).toBeNull();
  });

  it('throws when saving to non-existent guild', () => {
    expect(() => saveToSlot('bad-id', null, makeSavePayload())).toThrow();
  });
});

// ============================================================================
// Suspend Saves
// ============================================================================

describe('Suspend Saves', () => {
  it('saves and loads suspend data', () => {
    const guild = createGuild('Test');
    const payload = makeSuspendPayload();

    saveSuspend(guild.id, payload);
    expect(hasSuspendSave(guild.id)).toBe(true);

    const loaded = loadAndDeleteSuspend(guild.id);
    expect(loaded).not.toBeNull();
    expect(loaded!.dungeon.floorId).toBe('verdant-depths-f1');
    expect(loaded!.dungeon.playerPosition).toEqual({ x: 3, y: 5 });
    expect(loaded!.dungeon.exploredTiles).toEqual(['3,5', '3,4', '3,3']);
  });

  it('deletes suspend save on load', () => {
    const guild = createGuild('Test');
    saveSuspend(guild.id, makeSuspendPayload());

    loadAndDeleteSuspend(guild.id);
    expect(hasSuspendSave(guild.id)).toBe(false);

    // Registry should reflect no suspend save
    const reg = getRegistry();
    expect(reg.guilds[0].hasSuspendSave).toBe(false);
  });

  it('updates registry hasSuspendSave flag on save', () => {
    const guild = createGuild('Test');
    saveSuspend(guild.id, makeSuspendPayload());

    const reg = getRegistry();
    expect(reg.guilds[0].hasSuspendSave).toBe(true);
  });

  it('returns null for non-existent suspend save', () => {
    const guild = createGuild('Test');
    expect(loadAndDeleteSuspend(guild.id)).toBeNull();
  });

  it('hasSuspendSave returns false when none exists', () => {
    const guild = createGuild('Test');
    expect(hasSuspendSave(guild.id)).toBe(false);
  });
});

// ============================================================================
// Legacy Migration
// ============================================================================

describe('Legacy Migration', () => {
  it('detects legacy save data', () => {
    expect(hasLegacySaveData()).toBe(false);

    localStorage.setItem('blob-rpg-party', JSON.stringify({
      state: { roster: [{ id: 'p1', name: 'Test', level: 5 }], activePartyIds: ['p1'] },
      version: 0,
    }));

    expect(hasLegacySaveData()).toBe(true);
  });

  it('migrates legacy saves to a new guild', () => {
    localStorage.setItem('blob-rpg-party', JSON.stringify({
      state: {
        roster: [{
          id: 'p1', name: 'Ironblob', classId: 'ironblob',
          stats: { str: 10, vit: 12, int: 5, wis: 6, agi: 7, luc: 8 },
          baseStats: { str: 10, vit: 12, int: 5, wis: 6, agi: 7, luc: 8 },
          maxHp: 50, hp: 50, maxTp: 20, tp: 20,
          level: 5, xp: 200, skillPoints: 2, learnedSkills: [],
          equipment: { weapon: null, armor: null, accessory1: null, accessory2: null },
        }],
        activePartyIds: ['p1'],
      },
      version: 0,
    }));
    localStorage.setItem('blob-rpg-inventory', JSON.stringify({
      state: { gold: 300, materials: {}, soldMaterials: {}, consumables: {}, ownedEquipment: [] },
      version: 0,
    }));
    localStorage.setItem('blob-rpg-game', JSON.stringify({
      state: { screen: 'combat' },
      version: 0,
    }));

    const guild = migrateLegacySaves();

    expect(guild).not.toBeNull();
    expect(guild!.name).toBe('Legacy Guild');
    expect(hasAnyGuilds()).toBe(true);

    // Verify save was created
    const slotIndex = getSlotIndex(guild!.id);
    expect(slotIndex!.slots).toHaveLength(1);

    const save = loadSlot(guild!.id, slotIndex!.slots[0].slotId);
    expect(save!.inventory.gold).toBe(300);
    expect(save!.party.roster).toHaveLength(1);
    expect(save!.party.roster[0].level).toBe(5);
  });

  it('clears legacy keys after migration', () => {
    localStorage.setItem('blob-rpg-party', JSON.stringify({
      state: {
        roster: [{ id: 'p1', name: 'Test', level: 1 }],
        activePartyIds: ['p1'],
      },
      version: 0,
    }));

    migrateLegacySaves();

    expect(localStorage.getItem('blob-rpg-party')).toBeNull();
    expect(localStorage.getItem('blob-rpg-inventory')).toBeNull();
    expect(localStorage.getItem('blob-rpg-quests')).toBeNull();
    expect(localStorage.getItem('blob-rpg-game')).toBeNull();
  });

  it('returns null when no legacy data has a roster', () => {
    localStorage.setItem('blob-rpg-game', JSON.stringify({
      state: { screen: 'town' },
      version: 0,
    }));

    const result = migrateLegacySaves();
    expect(result).toBeNull();
  });

  it('returns null when no legacy data exists', () => {
    const result = migrateLegacySaves();
    expect(result).toBeNull();
  });

  it('clearLegacyKeys removes all old keys', () => {
    localStorage.setItem('blob-rpg-party', 'data');
    localStorage.setItem('blob-rpg-inventory', 'data');
    localStorage.setItem('blob-rpg-quests', 'data');
    localStorage.setItem('blob-rpg-game', 'data');

    clearLegacyKeys();

    expect(localStorage.getItem('blob-rpg-party')).toBeNull();
    expect(localStorage.getItem('blob-rpg-inventory')).toBeNull();
    expect(localStorage.getItem('blob-rpg-quests')).toBeNull();
    expect(localStorage.getItem('blob-rpg-game')).toBeNull();
  });
});

// ============================================================================
// Delete Guild cleans up everything
// ============================================================================

describe('Guild deletion cleanup', () => {
  it('removes slots, suspend save, and registry entry', () => {
    const guild = createGuild('Full Guild');
    saveToSlot(guild.id, null, makeSavePayload());
    saveToSlot(guild.id, null, makeSavePayload());
    saveSuspend(guild.id, makeSuspendPayload());

    deleteGuild(guild.id);

    expect(getRegistry().guilds).toHaveLength(0);
    expect(getSlotIndex(guild.id)).toBeNull();
    expect(hasSuspendSave(guild.id)).toBe(false);
  });
});
