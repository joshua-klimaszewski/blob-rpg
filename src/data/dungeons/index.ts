import type { FloorData } from '../../types/dungeon'
import { FLOOR_1 } from './floor-1'

/** Registry of all dungeon floors by ID */
const FLOOR_REGISTRY = new Map<string, FloorData>([
  [FLOOR_1.id, FLOOR_1],
])

/** Look up a floor by its ID. Returns undefined if not found. */
export function getFloor(id: string): FloorData | undefined {
  return FLOOR_REGISTRY.get(id)
}

export { FLOOR_1 }
