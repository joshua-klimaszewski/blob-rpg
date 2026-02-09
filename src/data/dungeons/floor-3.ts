import type { FloorData, TileData } from '../../types/dungeon'

// Shorthand constructors
const W: TileData = { type: 'wall' }
const F: TileData = { type: 'floor' }
const N: TileData = { type: 'entrance' }
const E: TileData = { type: 'exit' }
const C: TileData = { type: 'checkpoint' }
const S: TileData = { type: 'shortcut' }

/**
 * Verdant Depths — Floor 3: Crystal Depths
 *
 * 19x19 grid. Complex layout with dead ends and a boss-like stationary FOE.
 *
 * Layout (W=wall, .=floor, N=entrance, E=exit, C=checkpoint, S=shortcut):
 *
 *   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8
 * 0 W W W W W W W W W W W W W W W W W W W
 * 1 W . . . . W W W W W W W W W . . . . W
 * 2 W . . . . W W W W W W W W W . . . . W
 * 3 W . . C . . . W W W W W W W . . E . W
 * 4 W . . . . W . W W W W W W W . . . . W
 * 5 W W W . W W . W W W W W . . . . W W W
 * 6 W W W . W W . . . . . . . W W W W W W
 * 7 W W W . . . . W W W W . W W W W W W W
 * 8 W W W W W W . W W W W . W W W W W W W
 * 9 W W W W W W . . . . . . . W W W W W W
 *10 W W W W W . . W W W W W . . W W W W W
 *11 W . . . . . W W W W W W W . . . . . W
 *12 W . . . . . . . . W W W W . . . . . W
 *13 W . . . . W W . . W W W W W . . . . W
 *14 W . . S . W W . W W W W W W W . . . W
 *15 W W W W W W W . W W W W . . . . . . W
 *16 W W W W W W W . . . . . . W . . . . W
 *17 W . N . . . . . W W W W W W . . . . W
 *18 W W W W W W W W W W W W W W W W W W W
 */
const tiles: TileData[][] = [
  // Row 0
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
  // Row 1: top-left room + top-right room
  [W, F, F, F, F, W, W, W, W, W, W, W, W, W, F, F, F, F, W],
  // Row 2
  [W, F, F, F, F, W, W, W, W, W, W, W, W, W, F, F, F, F, W],
  // Row 3: checkpoint + exit
  [W, F, F, C, F, F, F, W, W, W, W, W, W, W, F, F, E, F, W],
  // Row 4
  [W, F, F, F, F, W, F, W, W, W, W, W, W, W, F, F, F, F, W],
  // Row 5
  [W, W, W, F, W, W, F, W, W, W, W, W, F, F, F, F, W, W, W],
  // Row 6: corridor
  [W, W, W, F, W, W, F, F, F, F, F, F, F, W, W, W, W, W, W],
  // Row 7
  [W, W, W, F, F, F, F, W, W, W, W, F, W, W, W, W, W, W, W],
  // Row 8
  [W, W, W, W, W, W, F, W, W, W, W, F, W, W, W, W, W, W, W],
  // Row 9: horizontal corridor
  [W, W, W, W, W, W, F, F, F, F, F, F, F, W, W, W, W, W, W],
  // Row 10
  [W, W, W, W, W, F, F, W, W, W, W, W, F, F, W, W, W, W, W],
  // Row 11: bottom-left room
  [W, F, F, F, F, F, W, W, W, W, W, W, W, F, F, F, F, F, W],
  // Row 12
  [W, F, F, F, F, F, F, F, F, W, W, W, W, F, F, F, F, F, W],
  // Row 13
  [W, F, F, F, F, W, W, F, F, W, W, W, W, W, F, F, F, F, W],
  // Row 14: shortcut
  [W, F, F, S, F, W, W, F, W, W, W, W, W, W, W, F, F, F, W],
  // Row 15
  [W, W, W, W, W, W, W, F, W, W, W, W, F, F, F, F, F, F, W],
  // Row 16
  [W, W, W, W, W, W, W, F, F, F, F, F, F, W, F, F, F, F, W],
  // Row 17: entrance
  [W, F, N, F, F, F, F, F, W, W, W, W, W, W, F, F, F, F, W],
  // Row 18
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
]

export const FLOOR_3: FloorData = {
  id: 'verdant-depths-f3',
  dungeonId: 'verdant-depths',
  floorNumber: 3,
  width: 19,
  height: 19,
  tiles,
  playerStart: { x: 2, y: 17 },
  foeSpawns: [
    {
      id: 'foe-f3-elder',
      position: { x: 8, y: 9 },
      pattern: 'stationary',
      name: 'Elder Slime',
    },
  ],
  encounterRate: 5,
  encounterVariance: [2, 5],
  encounterTable: {
    random: [
      { enemyId: 'crystal-beetle', weight: 2 },
      { enemyId: 'caveworm', weight: 2 },
      { enemyId: 'sporebat', weight: 1 },
    ],
    foe: [
      { enemyId: 'crystal-beetle', weight: 2 },
      { enemyId: 'caveworm', weight: 2 },
    ],
    randomSize: [2, 4],
    foeSize: [3, 4],
  },
  nextFloorId: null, // Dungeon complete — return to town
}
