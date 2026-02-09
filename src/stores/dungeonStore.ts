import { create } from 'zustand';
import type { Direction, DungeonEvent, DungeonState, FloorData } from '../types/dungeon';
import type { SuspendSaveData } from '../types/save';
import { initializeDungeonState, processTurn } from '../systems/dungeon';
import { getFloor } from '../data/dungeons';
import { useGameStore } from './gameStore';
import { useCombatStore } from './combatStore';
import { useQuestStore } from './questStore';
import { useGuildStore } from './guildStore';
import { usePartyStore } from './partyStore';
import { useInventoryStore } from './inventoryStore';
import { createRandomEncounter, createFOEEncounter } from '../data/encounters';
import { saveSuspend } from '../systems/save';

interface DungeonStore {
  dungeon: DungeonState | null
  floor: FloorData | null
  /** Most recent events from the last turn (for UI consumption) */
  lastEvents: DungeonEvent[]

  enterDungeon: (floorId: string) => void
  move: (dir: Direction) => void
  warpToTown: () => void
  saveAndQuit: () => void
  clearEvents: () => void
}

export const useDungeonStore = create<DungeonStore>((set, get) => ({
  dungeon: null,
  floor: null,
  lastEvents: [],

  enterDungeon: (floorId: string) => {
    const floor = getFloor(floorId)
    if (!floor) return

    const dungeon = initializeDungeonState(floor)
    set({ dungeon, floor, lastEvents: [] })
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

      if (event.type === 'reached-exit') {
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
    set({ dungeon: null, floor: null, lastEvents: [] })
    useGameStore.getState().setScreen('town')
  },

  saveAndQuit: () => {
    const { dungeon } = get();
    if (!dungeon) return;

    const guildId = useGuildStore.getState().currentGuildId;
    const guildName = useGuildStore.getState().currentGuildName;
    if (!guildId) return;

    const { roster, activePartyIds } = usePartyStore.getState();
    const { gold, materials, soldMaterials, consumables, ownedEquipment } = useInventoryStore.getState();
    const { activeQuests } = useQuestStore.getState();

    const suspendData: Omit<SuspendSaveData, 'version' | 'guildId' | 'savedAt'> = {
      guildName: guildName ?? '',
      party: { roster, activePartyIds },
      inventory: { gold, materials, soldMaterials, consumables, ownedEquipment },
      quests: { activeQuests },
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
