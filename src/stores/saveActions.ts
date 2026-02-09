/**
 * Save Actions
 *
 * Bridge functions that snapshot/hydrate game state across stores.
 * These functions connect the save system to the Zustand stores.
 */

import type { SaveData, SuspendSaveData } from '../types/save';
import { usePartyStore } from './partyStore';
import { useInventoryStore } from './inventoryStore';
import { useQuestStore } from './questStore';
import { useGameStore } from './gameStore';
import { useDungeonStore } from './dungeonStore';
import { useGuildStore } from './guildStore';
import { getFloor } from '../data/dungeons';

/** Hydrate all stores from a regular save (loads into town) */
export function loadGameState(save: SaveData): void {
  usePartyStore.setState({
    roster: save.party.roster,
    activePartyIds: save.party.activePartyIds,
  });

  useInventoryStore.setState({
    gold: save.inventory.gold,
    materials: save.inventory.materials,
    soldMaterials: save.inventory.soldMaterials,
    consumables: save.inventory.consumables,
    ownedEquipment: save.inventory.ownedEquipment,
  });

  useQuestStore.setState({
    activeQuests: save.quests?.activeQuests ?? [],
  });

  useGuildStore.getState().setActiveGuild(save.guildId, save.guildName);
  useGuildStore.getState().setLastLoadedSlot(save.slotId);

  useGameStore.getState().setScreen('town');
}

/** Hydrate all stores from a suspend save (loads into dungeon) */
export function loadSuspendState(save: SuspendSaveData): void {
  usePartyStore.setState({
    roster: save.party.roster,
    activePartyIds: save.party.activePartyIds,
  });

  useInventoryStore.setState({
    gold: save.inventory.gold,
    materials: save.inventory.materials,
    soldMaterials: save.inventory.soldMaterials,
    consumables: save.inventory.consumables,
    ownedEquipment: save.inventory.ownedEquipment,
  });

  useQuestStore.setState({
    activeQuests: save.quests?.activeQuests ?? [],
  });

  useGuildStore.getState().setActiveGuild(save.guildId, save.guildName);

  // Restore dungeon state
  const floor = getFloor(save.dungeon.floorId);
  if (floor) {
    useDungeonStore.setState({
      dungeon: {
        floorId: save.dungeon.floorId,
        floorNumber: save.dungeon.floorNumber,
        playerPosition: save.dungeon.playerPosition,
        foes: save.dungeon.foes,
        encounterGauge: save.dungeon.encounterGauge,
        facing: save.dungeon.facing,
        processing: false,
        exploredTiles: save.dungeon.exploredTiles,
      },
      floor,
      lastEvents: [],
    });
    useGameStore.getState().setScreen('dungeon');
  } else {
    // Floor data not found — fall back to town
    useGameStore.getState().setScreen('town');
  }
}

/** Snapshot current game state into SaveData shape (for town saves) */
export function collectGameState(): Omit<SaveData, 'version' | 'guildId' | 'slotId' | 'savedAt'> {
  const { currentGuildName } = useGuildStore.getState();
  const { roster, activePartyIds } = usePartyStore.getState();
  const { gold, materials, soldMaterials, consumables, ownedEquipment } = useInventoryStore.getState();
  const { activeQuests } = useQuestStore.getState();

  return {
    guildName: currentGuildName ?? '',
    party: { roster, activePartyIds },
    inventory: { gold, materials, soldMaterials, consumables, ownedEquipment },
    quests: { activeQuests },
  };
}

/** Snapshot current game state + dungeon state (for suspend saves) */
export function collectSuspendState(): Omit<SuspendSaveData, 'version' | 'guildId' | 'savedAt'> {
  const gameState = collectGameState();
  const { dungeon } = useDungeonStore.getState();

  if (!dungeon) {
    throw new Error('Cannot create suspend save: no dungeon state');
  }

  return {
    ...gameState,
    dungeon: {
      floorId: dungeon.floorId,
      floorNumber: dungeon.floorNumber,
      playerPosition: dungeon.playerPosition,
      foes: dungeon.foes as SuspendSaveData['dungeon']['foes'],
      encounterGauge: dungeon.encounterGauge as SuspendSaveData['dungeon']['encounterGauge'],
      facing: dungeon.facing,
      exploredTiles: [...dungeon.exploredTiles],
    },
  };
}

/** Reset all stores to fresh state (for New Game) */
export function resetAllStores(): void {
  usePartyStore.setState({ roster: [], activePartyIds: [] });
  useInventoryStore.getState().reset();
  useQuestStore.getState().reset();
  useDungeonStore.setState({ dungeon: null, floor: null, lastEvents: [] });
  useGuildStore.getState().clearActiveGuild();
}
