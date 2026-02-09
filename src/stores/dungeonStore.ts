import { create } from 'zustand';
import type { Direction, DungeonEvent, DungeonState, FloorData } from '../types/dungeon';
import { initializeDungeonState, processTurn } from '../systems/dungeon';
import { getFloor } from '../data/dungeons';
import { useGameStore } from './gameStore';
import { useCombatStore } from './combatStore';
import { useQuestStore } from './questStore';
import { createRandomEncounter, createFOEEncounter } from '../data/encounters';

interface DungeonStore {
  dungeon: DungeonState | null
  floor: FloorData | null
  /** Most recent events from the last turn (for UI consumption) */
  lastEvents: DungeonEvent[]

  enterDungeon: (floorId: string) => void
  move: (dir: Direction) => void
  warpToTown: () => void
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

    // Handle events that trigger combat
    for (const event of result.events) {
      if (event.type === 'random-encounter') {
        const encounter = createRandomEncounter();
        useCombatStore.getState().startCombat(encounter);
        return;
      }

      if (event.type === 'foe-collision') {
        const encounter = createFOEEncounter();
        useCombatStore.getState().startCombat(encounter);
        return;
      }
    }
  },

  warpToTown: () => {
    set({ dungeon: null, floor: null, lastEvents: [] })
    useGameStore.getState().setScreen('town')
  },

  clearEvents: () => {
    set({ lastEvents: [] })
  },
}))
