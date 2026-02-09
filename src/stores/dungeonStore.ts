import { create } from 'zustand';
import type { Direction, DungeonEvent, DungeonState, FloorData, Position } from '../types/dungeon';
import type { SuspendSaveData } from '../types/save';
import { initializeDungeonState, processTurn, positionKey, getTile } from '../systems/dungeon';
import { getFloor } from '../data/dungeons';
import { useGameStore } from './gameStore';
import { useCombatStore } from './combatStore';
import { useQuestStore } from './questStore';
import { useGuildStore } from './guildStore';
import { usePartyStore } from './partyStore';
import { useInventoryStore } from './inventoryStore';
import { useDungeonProgressStore } from './dungeonProgressStore';
import { createRandomEncounter, createFOEEncounter } from '../data/encounters';
import { saveSuspend } from '../systems/save';

interface DungeonStore {
  dungeon: DungeonState | null
  floor: FloorData | null
  /** Most recent events from the last turn (for UI consumption) */
  lastEvents: DungeonEvent[]

  enterDungeon: (floorId: string, spawnPosition?: Position) => void
  move: (dir: Direction) => void
  warpToTown: () => void
  saveAndQuit: () => void
  clearEvents: () => void
  canWarpToTown: () => boolean
}

export const useDungeonStore = create<DungeonStore>((set, get) => ({
  dungeon: null,
  floor: null,
  lastEvents: [],

  enterDungeon: (floorId: string, spawnPosition?: Position) => {
    const floor = getFloor(floorId)
    if (!floor) return

    const spawn = spawnPosition ?? floor.playerStart
    const dungeon = initializeDungeonState(floor, spawn)

    // Merge persistent explored tiles into initial state
    const progress = useDungeonProgressStore.getState().getFloorProgress(floorId)
    let mergedExplored = dungeon.exploredTiles
    if (progress && progress.exploredTiles.length > 0) {
      const currentSet = new Set(mergedExplored)
      const toAdd: string[] = []
      for (const t of progress.exploredTiles) {
        if (!currentSet.has(t)) toAdd.push(t)
      }
      if (toAdd.length > 0) {
        mergedExplored = [...mergedExplored, ...toAdd]
      }
    }

    set({
      dungeon: { ...dungeon, exploredTiles: mergedExplored },
      floor,
      lastEvents: [],
    })

    // Auto-unlock floor + discover entrance warp point
    useDungeonProgressStore.getState().unlockFloor(floorId)
    useDungeonProgressStore.getState().discoverWarpPoint(floorId, positionKey(floor.playerStart))

    useGameStore.getState().setScreen('dungeon')
    useQuestStore.getState().completeExploreQuest(floorId)
  },

  move: (dir: Direction) => {
    const { dungeon, floor } = get()
    if (!dungeon || !floor) return
    if (dungeon.processing) return

    const result = processTurn(dungeon, floor, dir);
    set({ dungeon: result.state, lastEvents: result.events });

    // Handle events that trigger combat or transitions
    for (const event of result.events) {
      if (event.type === 'random-encounter') {
        const encounter = createRandomEncounter(floor);
        useCombatStore.getState().startCombat(encounter);
        return;
      }

      if (event.type === 'foe-collision') {
        const encounter = createFOEEncounter(floor);
        useCombatStore.getState().startCombat(encounter);
        return;
      }

      if (event.type === 'reached-checkpoint' || event.type === 'reached-shortcut') {
        // Discover warp point
        useDungeonProgressStore.getState().discoverWarpPoint(
          floor.id,
          positionKey(result.state.playerPosition),
        )
      }

      if (event.type === 'reached-exit') {
        // Persist explored tiles and unlock next floor
        useDungeonProgressStore.getState().mergeExploredTiles(
          floor.id,
          result.state.exploredTiles,
        )
        if (floor.nextFloorId) {
          useDungeonProgressStore.getState().unlockFloor(floor.nextFloorId)
        }

        // Transition to next floor or return to town
        const nextFloorId = floor.nextFloorId;
        setTimeout(() => {
          if (nextFloorId) {
            get().enterDungeon(nextFloorId);
          } else {
            get().warpToTown();
          }
        }, 2000); // Wait for "Floor complete!" notification
        return;
      }
    }
  },

  warpToTown: () => {
    const { dungeon, floor } = get()

    // Persist explored tiles before leaving
    if (dungeon && floor) {
      useDungeonProgressStore.getState().mergeExploredTiles(
        floor.id,
        dungeon.exploredTiles,
      )
    }

    set({ dungeon: null, floor: null, lastEvents: [] })
    useGameStore.getState().setScreen('town')
  },

  canWarpToTown: () => {
    const { dungeon, floor } = get()
    if (!dungeon || !floor) return false

    const playerKey = positionKey(dungeon.playerPosition)
    const tile = getTile(floor, dungeon.playerPosition)
    if (!tile) return false

    // Can warp from entrance, checkpoint, or shortcut tiles
    if (tile.type === 'checkpoint' || tile.type === 'shortcut') return true

    // Can warp from the floor entrance position
    if (positionKey(floor.playerStart) === playerKey) return true

    return false
  },

  saveAndQuit: () => {
    const { dungeon, floor } = get();
    if (!dungeon) return;

    // Persist explored tiles before saving
    if (floor) {
      useDungeonProgressStore.getState().mergeExploredTiles(
        floor.id,
        dungeon.exploredTiles,
      )
    }

    const guildId = useGuildStore.getState().currentGuildId;
    const guildName = useGuildStore.getState().currentGuildName;
    if (!guildId) return;

    const { roster, activePartyIds } = usePartyStore.getState();
    const { gold, materials, soldMaterials, consumables, ownedEquipment } = useInventoryStore.getState();
    const { activeQuests } = useQuestStore.getState();
    const { dungeonProgress } = useDungeonProgressStore.getState();

    const suspendData: Omit<SuspendSaveData, 'version' | 'guildId' | 'savedAt'> = {
      guildName: guildName ?? '',
      party: { roster, activePartyIds },
      inventory: { gold, materials, soldMaterials, consumables, ownedEquipment },
      quests: { activeQuests },
      dungeonProgress,
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

    saveSuspend(guildId, suspendData);

    set({ dungeon: null, floor: null, lastEvents: [] });
    useGuildStore.getState().clearActiveGuild();
    useGameStore.getState().setScreen('title');
  },

  clearEvents: () => {
    set({ lastEvents: [] })
  },
}))
