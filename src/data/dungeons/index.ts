import type { FloorData } from '../../types/dungeon'
import { FLOOR_1 } from './floor-1'
import { FLOOR_2 } from './floor-2'
import { FLOOR_3 } from './floor-3'

/** Registry of all dungeon floors by ID */
const FLOOR_REGISTRY = new Map<string, FloorData>([
  [FLOOR_1.id, FLOOR_1],
  [FLOOR_2.id, FLOOR_2],
  [FLOOR_3.id, FLOOR_3],
])

/** Look up a floor by its ID. Returns undefined if not found. */
export function getFloor(id: string): FloorData | undefined {
  return FLOOR_REGISTRY.get(id)
}

/** Get all floors for a dungeon, sorted by floor number */
export function getDungeonFloors(dungeonId: string): FloorData[] {
  return Array.from(FLOOR_REGISTRY.values())
    .filter((f) => f.dungeonId === dungeonId)
    .sort((a, b) => a.floorNumber - b.floorNumber)
}

export { FLOOR_1, FLOOR_2, FLOOR_3 }
