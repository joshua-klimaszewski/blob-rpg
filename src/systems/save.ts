/**
 * Save System
 *
 * Multi-guild, multi-slot save system using localStorage.
 *
 * Key structure:
 *   blob-rpg-registry                       → SaveRegistry
 *   blob-rpg-guild-<id>-slots               → GuildSlotIndex
 *   blob-rpg-guild-<id>-slot-<slotId>       → SaveData
 *   blob-rpg-guild-<id>-suspend             → SuspendSaveData
 *
 * Legacy keys (pre-save-system Zustand persist):
 *   blob-rpg-party, blob-rpg-inventory, blob-rpg-quests, blob-rpg-game
 */

import type {
  SaveRegistry,
  GuildEntry,
  GuildSlotIndex,
  SlotMeta,
  SaveData,
  SuspendSaveData,
} from '../types/save';
import { MAX_GUILDS, MAX_SLOTS_PER_GUILD, SAVE_VERSION, AUTOSAVE_SLOT_ID } from '../types/save';

// ============================================================================
// Save data migration
// ============================================================================

/** Migrate save data from older versions to current SAVE_VERSION */
export function migrateSaveData<T extends { version?: number }>(data: T): T {
  const version = data.version ?? 1;

  if (version < 2) {
    // v1 → v2: add dungeonProgress
    (data as Record<string, unknown>).dungeonProgress ??= { floors: {} };
    (data as Record<string, unknown>).version = 2;
  }

  return data;
}

// ============================================================================
// Key helpers
// ============================================================================

const REGISTRY_KEY = 'blob-rpg-registry';

function slotIndexKey(guildId: string): string {
  return `blob-rpg-guild-${guildId}-slots`;
}

function slotDataKey(guildId: string, slotId: string): string {
  return `blob-rpg-guild-${guildId}-slot-${slotId}`;
}

function suspendKey(guildId: string): string {
  return `blob-rpg-guild-${guildId}-suspend`;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ============================================================================
// Registry
// ============================================================================

export function getRegistry(): SaveRegistry {
  const raw = localStorage.getItem(REGISTRY_KEY);
  if (!raw) return { version: SAVE_VERSION, guilds: [] };
  return JSON.parse(raw) as SaveRegistry;
}

export function saveRegistry(registry: SaveRegistry): void {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(registry));
}

export function hasAnyGuilds(): boolean {
  return getRegistry().guilds.length > 0;
}

// ============================================================================
// Guild CRUD
// ============================================================================

export function createGuild(name: string): GuildEntry {
  const registry = getRegistry();
  if (registry.guilds.length >= MAX_GUILDS) {
    throw new Error(`Cannot create more than ${MAX_GUILDS} guilds`);
  }

  const id = generateId();
  const now = new Date().toISOString();
  const entry: GuildEntry = {
    id,
    name,
    createdAt: now,
    lastPlayedAt: now,
    slotCount: 0,
    hasSuspendSave: false,
  };

  registry.guilds.push(entry);
  saveRegistry(registry);

  // Initialize empty slot index
  const slotIndex: GuildSlotIndex = { guildId: id, guildName: name, slots: [] };
  localStorage.setItem(slotIndexKey(id), JSON.stringify(slotIndex));

  return entry;
}

export function deleteGuild(guildId: string): void {
  const registry = getRegistry();
  const guild = registry.guilds.find((g) => g.id === guildId);
  if (!guild) return;

  // Delete all slot data
  const slotIndex = getSlotIndex(guildId);
  if (slotIndex) {
    for (const slot of slotIndex.slots) {
      localStorage.removeItem(slotDataKey(guildId, slot.slotId));
    }
  }

  // Delete slot index, suspend save
  localStorage.removeItem(slotIndexKey(guildId));
  localStorage.removeItem(suspendKey(guildId));

  // Remove from registry
  registry.guilds = registry.guilds.filter((g) => g.id !== guildId);
  saveRegistry(registry);
}

export function updateGuildLastPlayed(guildId: string): void {
  const registry = getRegistry();
  const guild = registry.guilds.find((g) => g.id === guildId);
  if (!guild) return;
  guild.lastPlayedAt = new Date().toISOString();
  saveRegistry(registry);
}

// ============================================================================
// Slots
// ============================================================================

export function getSlotIndex(guildId: string): GuildSlotIndex | null {
  const raw = localStorage.getItem(slotIndexKey(guildId));
  if (!raw) return null;
  return JSON.parse(raw) as GuildSlotIndex;
}

export function saveToSlot(
  guildId: string,
  slotId: string | null,
  data: Omit<SaveData, 'version' | 'guildId' | 'slotId' | 'savedAt'>
): SlotMeta {
  const slotIndex = getSlotIndex(guildId);
  if (!slotIndex) throw new Error(`No slot index for guild ${guildId}`);

  const actualSlotId = slotId ?? generateId();
  const isNewSlot = !slotId || !slotIndex.slots.some((s) => s.slotId === slotId);

  const manualSlotCount = slotIndex.slots.filter((s) => s.slotId !== AUTOSAVE_SLOT_ID).length;
  if (isNewSlot && actualSlotId !== AUTOSAVE_SLOT_ID && manualSlotCount >= MAX_SLOTS_PER_GUILD) {
    throw new Error(`Cannot create more than ${MAX_SLOTS_PER_GUILD} slots per guild`);
  }

  const now = new Date().toISOString();

  const saveData: SaveData = {
    version: SAVE_VERSION,
    guildId,
    slotId: actualSlotId,
    savedAt: now,
    ...data,
  };

  // Write save data
  localStorage.setItem(slotDataKey(guildId, actualSlotId), JSON.stringify(saveData));

  // Calculate summary
  const partyLevel = data.party.roster.length > 0
    ? Math.max(...data.party.roster.map((m) => m.level))
    : 1;

  const meta: SlotMeta = {
    slotId: actualSlotId,
    savedAt: now,
    summary: {
      gold: data.inventory.gold,
      partyLevel,
    },
  };

  // Update slot index
  if (isNewSlot) {
    slotIndex.slots.push(meta);
  } else {
    slotIndex.slots = slotIndex.slots.map((s) =>
      s.slotId === actualSlotId ? meta : s
    );
  }
  localStorage.setItem(slotIndexKey(guildId), JSON.stringify(slotIndex));

  // Update registry (don't count autosave toward slot count)
  const registry = getRegistry();
  const guild = registry.guilds.find((g) => g.id === guildId);
  if (guild) {
    guild.slotCount = slotIndex.slots.filter((s) => s.slotId !== AUTOSAVE_SLOT_ID).length;
    guild.lastPlayedAt = now;
    saveRegistry(registry);
  }

  return meta;
}

/** Save to the autosave slot (doesn't count against MAX_SLOTS_PER_GUILD) */
export function saveAutoSlot(
  guildId: string,
  data: Omit<SaveData, 'version' | 'guildId' | 'slotId' | 'savedAt'>
): SlotMeta {
  return saveToSlot(guildId, AUTOSAVE_SLOT_ID, data);
}

export function loadSlot(guildId: string, slotId: string): SaveData | null {
  const raw = localStorage.getItem(slotDataKey(guildId, slotId));
  if (!raw) return null;
  return migrateSaveData(JSON.parse(raw) as SaveData);
}

export function deleteSlot(guildId: string, slotId: string): void {
  localStorage.removeItem(slotDataKey(guildId, slotId));

  const slotIndex = getSlotIndex(guildId);
  if (slotIndex) {
    slotIndex.slots = slotIndex.slots.filter((s) => s.slotId !== slotId);
    localStorage.setItem(slotIndexKey(guildId), JSON.stringify(slotIndex));

    // Update registry slot count (don't count autosave)
    const registry = getRegistry();
    const guild = registry.guilds.find((g) => g.id === guildId);
    if (guild) {
      guild.slotCount = slotIndex.slots.filter((s) => s.slotId !== AUTOSAVE_SLOT_ID).length;
      saveRegistry(registry);
    }
  }
}

// ============================================================================
// Suspend saves (dungeon save & quit)
// ============================================================================

export function saveSuspend(
  guildId: string,
  data: Omit<SuspendSaveData, 'version' | 'guildId' | 'savedAt'>
): void {
  const now = new Date().toISOString();
  const suspendData: SuspendSaveData = {
    version: SAVE_VERSION,
    guildId,
    savedAt: now,
    ...data,
  };

  localStorage.setItem(suspendKey(guildId), JSON.stringify(suspendData));

  // Update registry
  const registry = getRegistry();
  const guild = registry.guilds.find((g) => g.id === guildId);
  if (guild) {
    guild.hasSuspendSave = true;
    guild.lastPlayedAt = now;
    saveRegistry(registry);
  }
}

export function loadAndDeleteSuspend(guildId: string): SuspendSaveData | null {
  const raw = localStorage.getItem(suspendKey(guildId));
  if (!raw) return null;

  localStorage.removeItem(suspendKey(guildId));

  // Update registry
  const registry = getRegistry();
  const guild = registry.guilds.find((g) => g.id === guildId);
  if (guild) {
    guild.hasSuspendSave = false;
    saveRegistry(registry);
  }

  return migrateSaveData(JSON.parse(raw) as SuspendSaveData);
}

export function clearSuspend(guildId: string): void {
  if (!localStorage.getItem(suspendKey(guildId))) return;

  localStorage.removeItem(suspendKey(guildId));

  const registry = getRegistry();
  const guild = registry.guilds.find((g) => g.id === guildId);
  if (guild) {
    guild.hasSuspendSave = false;
    saveRegistry(registry);
  }
}

export function hasSuspendSave(guildId: string): boolean {
  return localStorage.getItem(suspendKey(guildId)) !== null;
}

// ============================================================================
// Legacy migration
// ============================================================================

const LEGACY_KEYS = [
  'blob-rpg-party',
  'blob-rpg-inventory',
  'blob-rpg-quests',
  'blob-rpg-game',
] as const;

export function hasLegacySaveData(): boolean {
  return LEGACY_KEYS.some((key) => localStorage.getItem(key) !== null);
}

function unwrapZustandPersist<T>(raw: string): T | null {
  try {
    const parsed = JSON.parse(raw);
    // Zustand persist wraps state in { state: {...}, version: N }
    if (parsed && typeof parsed === 'object' && 'state' in parsed) {
      return parsed.state as T;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

export function migrateLegacySaves(): GuildEntry | null {
  if (!hasLegacySaveData()) return null;

  // Read legacy data
  const partyRaw = localStorage.getItem('blob-rpg-party');
  const inventoryRaw = localStorage.getItem('blob-rpg-inventory');
  const questsRaw = localStorage.getItem('blob-rpg-quests');

  const party = partyRaw
    ? unwrapZustandPersist<{ roster: unknown[]; activePartyIds: string[] }>(partyRaw)
    : null;

  const inventory = inventoryRaw
    ? unwrapZustandPersist<{
        gold: number;
        materials: Record<string, number>;
        soldMaterials: Record<string, number>;
        consumables: Record<string, number>;
        ownedEquipment: string[];
      }>(inventoryRaw)
    : null;

  const quests = questsRaw
    ? unwrapZustandPersist<{ activeQuests: unknown[] }>(questsRaw)
    : null;

  // Only migrate if there's actual party data
  if (!party || !party.roster || party.roster.length === 0) {
    clearLegacyKeys();
    return null;
  }

  // Create guild
  const guild = createGuild('Legacy Guild');

  // Build save data
  const savePayload = {
    guildName: 'Legacy Guild',
    party: {
      roster: party.roster as SaveData['party']['roster'],
      activePartyIds: party.activePartyIds ?? [],
    },
    inventory: {
      gold: inventory?.gold ?? 100,
      materials: inventory?.materials ?? {},
      soldMaterials: inventory?.soldMaterials ?? {},
      consumables: inventory?.consumables ?? {},
      ownedEquipment: inventory?.ownedEquipment ?? [],
    },
    quests: {
      activeQuests: (quests?.activeQuests ?? []) as SaveData['quests']['activeQuests'],
    },
  };

  saveToSlot(guild.id, null, savePayload);

  clearLegacyKeys();
  return guild;
}

export function clearLegacyKeys(): void {
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }
}
