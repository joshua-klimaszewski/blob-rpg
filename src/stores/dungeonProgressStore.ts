import { create } from 'zustand';
import type { DungeonProgress, FloorProgress } from '../types/save';

interface DungeonProgressStore {
  dungeonProgress: DungeonProgress;

  unlockFloor: (floorId: string) => void;
  mergeExploredTiles: (floorId: string, tiles: readonly string[]) => void;
  discoverWarpPoint: (floorId: string, position: string) => void;
  getFloorProgress: (floorId: string) => FloorProgress | undefined;
  isWarpPointDiscovered: (floorId: string, position: string) => boolean;
  reset: () => void;
}

export const useDungeonProgressStore = create<DungeonProgressStore>((set, get) => ({
  dungeonProgress: { floors: {} },

  unlockFloor: (floorId: string) => {
    set((state) => {
      const floors = { ...state.dungeonProgress.floors };
      const floor = { ...(floors[floorId] ?? { floorId, exploredTiles: [], discoveredWarpPoints: [], unlocked: false }) };
      floor.unlocked = true;
      floors[floorId] = floor;
      return { dungeonProgress: { floors } };
    });
  },

  mergeExploredTiles: (floorId: string, tiles: readonly string[]) => {
    set((state) => {
      const floors = { ...state.dungeonProgress.floors };
      const floor = { ...(floors[floorId] ?? { floorId, exploredTiles: [], discoveredWarpPoints: [], unlocked: false }) };
      const existing = new Set(floor.exploredTiles);
      const toAdd: string[] = [];
      for (const t of tiles) {
        if (!existing.has(t)) toAdd.push(t);
      }
      if (toAdd.length === 0) return state;
      floor.exploredTiles = [...floor.exploredTiles, ...toAdd];
      floors[floorId] = floor;
      return { dungeonProgress: { floors } };
    });
  },

  discoverWarpPoint: (floorId: string, position: string) => {
    set((state) => {
      const floors = { ...state.dungeonProgress.floors };
      const floor = { ...(floors[floorId] ?? { floorId, exploredTiles: [], discoveredWarpPoints: [], unlocked: false }) };
      if (floor.discoveredWarpPoints.includes(position)) return state;
      floor.discoveredWarpPoints = [...floor.discoveredWarpPoints, position];
      floors[floorId] = floor;
      return { dungeonProgress: { floors } };
    });
  },

  getFloorProgress: (floorId: string) => {
    return get().dungeonProgress.floors[floorId];
  },

  isWarpPointDiscovered: (floorId: string, position: string) => {
    const floor = get().dungeonProgress.floors[floorId];
    if (!floor) return false;
    return floor.discoveredWarpPoints.includes(position);
  },

  reset: () => {
    set({ dungeonProgress: { floors: {} } });
  },
}));
