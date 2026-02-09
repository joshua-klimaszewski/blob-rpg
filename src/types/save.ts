import type { PartyMemberState } from './combat';
import type { ActiveQuest } from './economy';
import type {
  Direction,
  EncounterGaugeState,
  FoeState,
  Position,
} from './dungeon';

// ============================================================================
// Registry — top-level index of all guilds
// ============================================================================

export interface SaveRegistry {
  version: number;
  guilds: GuildEntry[];
}

export interface GuildEntry {
  id: string;
  name: string;
  createdAt: string;
  lastPlayedAt: string;
  slotCount: number;
  hasSuspendSave: boolean;
}

// ============================================================================
// Slot index — per-guild metadata about save slots
// ============================================================================

export interface GuildSlotIndex {
  guildId: string;
  guildName: string;
  slots: SlotMeta[];
}

export interface SlotMeta {
  slotId: string;
  savedAt: string;
  summary: {
    gold: number;
    partyLevel: number;
  };
}

// ============================================================================
// Save data — full game snapshot stored in a slot
// ============================================================================

export interface SaveData {
  version: number;
  guildId: string;
  slotId: string;
  savedAt: string;
  guildName: string;
  party: {
    roster: PartyMemberState[];
    activePartyIds: string[];
  };
  inventory: {
    gold: number;
    materials: Record<string, number>;
    soldMaterials: Record<string, number>;
    consumables: Record<string, number>;
    ownedEquipment: string[];
  };
  quests: {
    activeQuests: ActiveQuest[];
    floorsReached?: string[]; // Optional for backward compatibility
  };
}

// ============================================================================
// Suspend save — dungeon "save & quit" snapshot (deleted on load)
// ============================================================================

export interface SuspendSaveData {
  version: number;
  guildId: string;
  savedAt: string;
  guildName: string;
  party: SaveData['party'];
  inventory: SaveData['inventory'];
  quests: SaveData['quests'];
  dungeon: {
    floorId: string;
    floorNumber: number;
    playerPosition: Position;
    foes: FoeState[];
    encounterGauge: EncounterGaugeState;
    facing: Direction;
    exploredTiles: string[];
  };
}

// ============================================================================
// Constants
// ============================================================================

export const MAX_GUILDS = 3;
export const MAX_SLOTS_PER_GUILD = 3;
export const SAVE_VERSION = 1;
