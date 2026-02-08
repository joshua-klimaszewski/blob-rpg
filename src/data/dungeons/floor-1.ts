import type { FloorData, TileData } from '../../types/dungeon'

// Shorthand constructors
const W: TileData = { type: 'wall' }
const F: TileData = { type: 'floor' }
const E: TileData = { type: 'exit' }
const C: TileData = { type: 'checkpoint' }
const S: TileData = { type: 'shortcut' }

/**
 * Verdant Depths — Floor 1
 *
 * 15x15 grid. Two rooms connected by corridors.
 *
 * Layout (W=wall, .=floor, E=exit, C=checkpoint, S=shortcut, P=player start):
 *
 *   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4
 * 0 W W W W W W W W W W W W W W W
 * 1 W . . . . W W W W W . . . . W
 * 2 W . . . . W W W W W . . . . W
 * 3 W . . C . W W W W W . . . . W
 * 4 W . . . . . . . . . . . . . W
 * 5 W W W W . W W W W W . W W W W
 * 6 W W W W . W W W W W . W W W W
 * 7 W W W W . . . . . . . W W W W
 * 8 W W W W . W W W W W . W W W W
 * 9 W W W W . W W W W W . W W W W
 *10 W . . . . . . . . . . . . S W
 *11 W . . . . W W W W W . . . . W
 *12 W . P . . W W W W W . . E . W
 *13 W . . . . W W W W W . . . . W
 *14 W W W W W W W W W W W W W W W
 */
const tiles: TileData[][] = [
  // Row 0: all walls
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
  // Row 1: left room top
  [W, F, F, F, F, W, W, W, W, W, F, F, F, F, W],
  // Row 2
  [W, F, F, F, F, W, W, W, W, W, F, F, F, F, W],
  // Row 3: checkpoint in left room
  [W, F, F, C, F, W, W, W, W, W, F, F, F, F, W],
  // Row 4: horizontal corridor connecting rooms
  [W, F, F, F, F, F, F, F, F, F, F, F, F, F, W],
  // Row 5
  [W, W, W, W, F, W, W, W, W, W, F, W, W, W, W],
  // Row 6
  [W, W, W, W, F, W, W, W, W, W, F, W, W, W, W],
  // Row 7: horizontal corridor mid
  [W, W, W, W, F, F, F, F, F, F, F, W, W, W, W],
  // Row 8
  [W, W, W, W, F, W, W, W, W, W, F, W, W, W, W],
  // Row 9
  [W, W, W, W, F, W, W, W, W, W, F, W, W, W, W],
  // Row 10: horizontal corridor bottom connecting rooms
  [W, F, F, F, F, F, F, F, F, F, F, F, F, S, W],
  // Row 11: bottom rooms
  [W, F, F, F, F, W, W, W, W, W, F, F, F, F, W],
  // Row 12: player start (left), exit (right)
  [W, F, F, F, F, W, W, W, W, W, F, F, E, F, W],
  // Row 13
  [W, F, F, F, F, W, W, W, W, W, F, F, F, F, W],
  // Row 14: all walls
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
]

export const FLOOR_1: FloorData = {
  id: 'verdant-depths-f1',
  dungeonId: 'verdant-depths',
  floorNumber: 1,
  width: 15,
  height: 15,
  tiles,
  playerStart: { x: 2, y: 12 },
  foeSpawns: [
    {
      id: 'foe-f1-patrol',
      position: { x: 4, y: 5 },
      pattern: 'patrol',
      patrolPath: [
        { x: 4, y: 4 },
        { x: 4, y: 5 },
        { x: 4, y: 6 },
        { x: 4, y: 7 },
        { x: 4, y: 8 },
        { x: 4, y: 9 },
        { x: 4, y: 10 },
      ],
      name: 'Thornblob',
    },
    {
      id: 'foe-f1-stationary',
      position: { x: 10, y: 7 },
      pattern: 'stationary',
      name: 'Guardblob',
    },
  ],
  encounterRate: 8,
  encounterVariance: [2, 6],
}
