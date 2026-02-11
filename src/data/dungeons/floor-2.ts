import type { FloorData, TileData } from '../../types/dungeon'

// Shorthand constructors
const W: TileData = { type: 'wall' }
const F: TileData = { type: 'floor' }
const N: TileData = { type: 'entrance' }
const E: TileData = { type: 'exit' }
const C: TileData = { type: 'checkpoint' }
const S: TileData = { type: 'shortcut' }

/**
 * Verdant Depths — Floor 2: Fungal Passage
 *
 * 17x17 grid. Three rooms connected by winding corridors.
 * One chase-pattern FOE (Venomblob).
 *
 * Layout (W=wall, .=floor, N=entrance, E=exit, C=checkpoint, S=shortcut):
 *
 *   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6
 * 0 W W W W W W W W W W W W W W W W W
 * 1 W . . . . W W W W W W W . . . . W
 * 2 W . . . . W W W W W W W . . . . W
 * 3 W . . C . . . . W W W W . . . . W
 * 4 W . . . . W W . W W W W . . E . W
 * 5 W W W W . W W . W W W W W W W W W
 * 6 W W W W . W W . . . . . . W W W W
 * 7 W W W W . . . . W W W . . W W W W
 * 8 W W W W W W W . W W W . W W W W W
 * 9 W W W W W W W . W W W . W W W W W
 *10 W W W W . . . . . . . . . W W W W
 *11 W . . . . W W W W W W . W W W W W
 *12 W . N . . W W W W W W . . . S . W
 *13 W . . . . W W W W W W W . . . . W
 *14 W . . . . . . W W W W W . . . . W
 *15 W . . . . W W W W W W W . . . . W
 *16 W W W W W W W W W W W W W W W W W
 */
const tiles: TileData[][] = [
  // Row 0
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
  // Row 1: top-left room + top-right room
  [W, F, F, F, F, W, W, W, W, W, W, W, F, F, F, F, W],
  // Row 2
  [W, F, F, F, F, W, W, W, W, W, W, W, F, F, F, F, W],
  // Row 3: checkpoint + corridor east
  [W, F, F, C, F, F, F, F, W, W, W, W, F, F, F, F, W],
  // Row 4: corridor + exit in top-right
  [W, F, F, F, F, W, W, F, W, W, W, W, F, F, E, F, W],
  // Row 5
  [W, W, W, W, F, W, W, F, W, W, W, W, W, W, W, W, W],
  // Row 6: corridor east
  [W, W, W, W, F, W, W, F, F, F, F, F, F, W, W, W, W],
  // Row 7: corridor south
  [W, W, W, W, F, F, F, F, W, W, W, F, F, W, W, W, W],
  // Row 8
  [W, W, W, W, W, W, W, F, W, W, W, F, W, W, W, W, W],
  // Row 9
  [W, W, W, W, W, W, W, F, W, W, W, F, W, W, W, W, W],
  // Row 10: horizontal corridor
  [W, W, W, W, F, F, F, F, F, F, F, F, F, W, W, W, W],
  // Row 11: bottom-left room
  [W, F, F, F, F, W, W, W, W, W, W, F, W, W, W, W, W],
  // Row 12: entrance + shortcut on right
  [W, F, N, F, F, W, W, W, W, W, W, F, F, F, S, F, W],
  // Row 13
  [W, F, F, F, F, W, W, W, W, W, W, W, F, F, F, F, W],
  // Row 14: corridor south from bottom-left room
  [W, F, F, F, F, F, F, W, W, W, W, W, F, F, F, F, W],
  // Row 15
  [W, F, F, F, F, W, W, W, W, W, W, W, F, F, F, F, W],
  // Row 16
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
]

export const FLOOR_2: FloorData = {
  id: 'verdant-depths-f2',
  dungeonId: 'verdant-depths',
  floorNumber: 2,
  width: 17,
  height: 17,
  tiles,
  playerStart: { x: 2, y: 12 },
  foeSpawns: [
    {
      id: 'foe-f2-chase',
      position: { x: 7, y: 7 },
      pattern: 'chase',
      name: 'Venomblob',
      enemyId: 'venomblob-foe', // Unique FOE enemy (to be created)
      canPursue: true,
    },
  ],
  encounterRate: 6,
  encounterVariance: [2, 5],
  encounterTable: {
    random: [
      { enemyId: 'fungoid', weight: 3 },
      { enemyId: 'sporebat', weight: 2 },
      { enemyId: 'mossy-slime', weight: 1 },
    ],
    foe: [
      { enemyId: 'elite-fungoid', weight: 3 },
      { enemyId: 'elite-mossy-slime', weight: 1 },
      { enemyId: 'sporebat', weight: 1 },
    ],
    randomSize: [2, 3],
    foeSize: [2, 3],
  },
  nextFloorId: 'verdant-depths-f3',
}
