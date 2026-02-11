import type { FloorData, TileData } from '../../types/dungeon'

// Shorthand constructors
const W: TileData = { type: 'wall' }
const F: TileData = { type: 'floor' }
const N: TileData = { type: 'entrance' }
const E: TileData = { type: 'exit' }
const C: TileData = { type: 'checkpoint' }
const S: TileData = { type: 'shortcut' }

/**
 * Verdant Depths — Floor 1 (Corridor Redesign)
 *
 * 25x20 grid. Organic winding corridors inspired by Etrian Odyssey V.
 * FOEs patrol on simple tracks (no pursuit) — teaches timing and "wait & follow" strategies.
 *
 * Layout (W=wall, .=floor, N=entrance, E=exit, C=checkpoint, S=shortcut):
 *
 *     0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4
 *   0 W W W W W W W W W W W W W W W W W W W W W W W W W
 *   1 W . . . W W W W W W W W W W W W W W W W . . . . W
 *   2 W . N . . . W W W W W W W W W W W . . . . C . . W
 *   3 W . . . W . . . W W W W W W . . . . W . . . . . W
 *   4 W W W W W W W . . . W W W . . W W W W W W W W . W
 *   5 W W W W W W W W W . . . . . W W W W W W W W W . W
 *   6 W W W W W W W W W W W W . . W W W W W W W W . . W
 *   7 W W W W . . . . . . . . . W W W W W W W W W . W W
 *   8 W W W W . W W W W W W W . W W W W W W W W W . W W
 *   9 W W W . . W W W W W W W . . . . . . W W W . . . W
 *  10 W W W . W W W W W W W W W W W W W . . . . . W . W
 *  11 W . . . W W W W W W W W W W W W W W W W W . W . W
 *  12 W . W W W W W W W W W W W W W W W W W W W . W . W
 *  13 W . W W W W W W W . . . . . . W W W W W . . W . W
 *  14 W . . . . . . . . . W W W W . . . . . . . W W . W
 *  15 W W W W W W W W W . W W W W W W W W W W . W W . W
 *  16 W W W W W W W W W . . . . . . . . . . . . W W . W
 *  17 W W W W W W W W W W W W W W W W W W W . W W W . W
 *  18 W . . . . . . . . . . . S . . . . . . . . E . . W
 *  19 W W W W W W W W W W W W W W W W W W W W W W W W W
 *
 * FOE Placement:
 * - F1 (West): Thornblob at (7,7), vertical 3-tile patrol
 * - F2 (Central): Elder Slime at (13,9), horizontal 3-tile patrol
 * - F3 (East): Guardblob at (22,9), vertical 3-tile patrol
 * - F4 (South): Verdant Patrol at (10,16), horizontal 3-tile patrol
 */
const tiles: TileData[][] = [
  // Row 0: top wall
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
  // Row 1
  [W, F, F, F, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, F, F, F, F, W],
  // Row 2: entrance (2,2), checkpoint (21,2)
  [W, F, N, F, F, F, W, W, W, W, W, W, W, W, W, W, W, F, F, F, F, C, F, F, W],
  // Row 3
  [W, F, F, F, W, F, F, F, W, W, W, W, W, W, F, F, F, F, W, F, F, F, F, F, W],
  // Row 4
  [W, W, W, W, W, W, W, F, F, F, W, W, W, F, F, W, W, W, W, W, W, W, W, F, W],
  // Row 5
  [W, W, W, W, W, W, W, W, W, F, F, F, F, F, W, W, W, W, W, W, W, W, W, F, W],
  // Row 6
  [W, W, W, W, W, W, W, W, W, W, W, W, F, F, W, W, W, W, W, W, W, W, F, F, W],
  // Row 7: Thornblob patrol (7,7)→(7,8)→(7,9)
  [W, W, W, W, F, F, F, F, F, F, F, F, F, W, W, W, W, W, W, W, W, W, F, W, W],
  // Row 8
  [W, W, W, W, F, W, W, W, W, W, W, W, F, W, W, W, W, W, W, W, W, W, F, W, W],
  // Row 9: Mossblob patrol (13,9)→(14,9)→(15,9), Guardblob patrol (22,9)→(22,10)→(22,11)
  [W, W, W, F, F, W, W, W, W, W, W, W, F, F, F, F, F, F, W, W, W, F, F, F, W],
  // Row 10
  [W, W, W, F, W, W, W, W, W, W, W, W, W, W, W, W, W, F, F, F, F, F, W, F, W],
  // Row 11
  [W, F, F, F, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, F, W, F, W],
  // Row 12
  [W, F, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, F, W, F, W],
  // Row 13
  [W, F, W, W, W, W, W, W, W, F, F, F, F, F, F, W, W, W, W, W, F, F, W, F, W],
  // Row 14
  [W, F, F, F, F, F, F, F, F, F, W, W, W, W, F, F, F, F, F, F, F, W, W, F, W],
  // Row 15
  [W, W, W, W, W, W, W, W, W, F, W, W, W, W, W, W, W, W, W, W, F, W, W, F, W],
  // Row 16: Verdant Patrol (10,16)→(11,16)→(12,16)
  [W, W, W, W, W, W, W, W, W, F, F, F, F, F, F, F, F, F, F, F, F, W, W, F, W],
  // Row 17
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, F, W, W, W, F, W],
  // Row 18: shortcut (12,18), exit (21,18)
  [W, F, F, F, F, F, F, F, F, F, F, F, S, F, F, F, F, F, F, F, F, E, F, F, W],
  // Row 19: bottom wall
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
]

export const FLOOR_1: FloorData = {
  id: 'verdant-depths-f1',
  dungeonId: 'verdant-depths',
  floorNumber: 1,
  width: 25,
  height: 20,
  tiles,
  playerStart: { x: 2, y: 2 },
  foeSpawns: [
    {
      id: 'foe-f1-west-corridor',
      position: { x: 7, y: 7 },
      pattern: 'patrol',
      patrolPath: [
        { x: 7, y: 7 },
        { x: 7, y: 8 },
        { x: 7, y: 9 },
      ],
      name: 'Thornblob',
      enemyId: 'thornblob-foe',
      canPursue: false, // EO5-style: no pursuit, teaches timing
    },
    {
      id: 'foe-f1-central-junction',
      position: { x: 13, y: 9 },
      pattern: 'patrol',
      patrolPath: [
        { x: 13, y: 9 },
        { x: 14, y: 9 },
        { x: 15, y: 9 },
      ],
      name: 'Elder Slime',
      enemyId: 'elder-slime-foe',
      canPursue: false, // Horizontal corridor patrol
    },
    {
      id: 'foe-f1-east-corridor',
      position: { x: 22, y: 9 },
      pattern: 'patrol',
      patrolPath: [
        { x: 22, y: 9 },
        { x: 22, y: 10 },
        { x: 22, y: 11 },
      ],
      name: 'Guardblob',
      enemyId: 'guardblob-foe',
      canPursue: false, // Guards checkpoint approach
    },
    {
      id: 'foe-f1-south-corridor',
      position: { x: 10, y: 16 },
      pattern: 'patrol',
      patrolPath: [
        { x: 10, y: 16 },
        { x: 11, y: 16 },
        { x: 12, y: 16 },
      ],
      name: 'Verdant Patrol',
      enemyId: 'verdant-guardian-foe',
      canPursue: false, // Guards shortcut/exit area
    },
  ],
  encounterRate: 8,
  encounterVariance: [2, 6],
  encounterTable: {
    random: [
      { enemyId: 'slime', weight: 3 },
      { enemyId: 'mossy-slime', weight: 1 },
    ],
    foe: [
      { enemyId: 'elite-slime', weight: 3 },
      { enemyId: 'elite-mossy-slime', weight: 2 },
    ],
    randomSize: [1, 2],
    foeSize: [2, 3],
  },
  nextFloorId: 'verdant-depths-f2',
}
