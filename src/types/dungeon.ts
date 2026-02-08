// ---- Spatial primitives ----

/** Cardinal direction for 4-directional movement */
export type Direction = 'north' | 'south' | 'east' | 'west'

/** A position on the dungeon grid. Zero-indexed. */
export interface Position {
  readonly x: number // column
  readonly y: number // row
}

// ---- Static floor data (lives in src/data/dungeons/) ----

/** What kind of tile this is */
export type TileType = 'floor' | 'wall' | 'exit' | 'checkpoint' | 'shortcut'

/** A single tile in the floor data definition */
export interface TileData {
  readonly type: TileType
  /** Directions blocked by walls on this tile. Empty/undefined = open on all walkable sides. */
  readonly walls?: Direction[]
}

/** FOE movement behavior on the field */
export type FoePatternType = 'patrol' | 'chase' | 'stationary'

/** Definition of a FOE spawn in the floor data */
export interface FoeSpawnData {
  readonly id: string // e.g. "foe-floor1-a"
  readonly position: Position
  readonly pattern: FoePatternType
  /** For patrol: ordered list of positions the FOE walks between. */
  readonly patrolPath?: Position[]
  /** Display name shown on collision */
  readonly name: string
}

/** Static definition of a dungeon floor */
export interface FloorData {
  readonly id: string // e.g. "verdant-depths-f1"
  readonly dungeonId: string // e.g. "verdant-depths"
  readonly floorNumber: number
  readonly width: number
  readonly height: number
  /** Row-major 2D grid of tile data. Access as tiles[y][x]. */
  readonly tiles: TileData[][]
  readonly playerStart: Position
  readonly foeSpawns: FoeSpawnData[]
  /** Base encounter gauge fill per step (floor difficulty) */
  readonly encounterRate: number
  /** Min/max random variance added to encounterRate per step */
  readonly encounterVariance: [number, number]
}

// ---- Runtime state ----

/** Runtime state of a single FOE on the floor */
export interface FoeState {
  readonly id: string
  readonly position: Position
  readonly pattern: FoePatternType
  readonly patrolPath?: Position[]
  /** Current index in patrolPath (for patrol FOEs) */
  readonly patrolIndex: number
  /** +1 or -1, direction of traversal along patrol path */
  readonly patrolDirection: 1 | -1
  readonly name: string
}

/** Runtime state of the encounter gauge */
export interface EncounterGaugeState {
  /** Current fill value, 0-100 */
  readonly value: number
  /** The threshold at which encounter triggers */
  readonly threshold: number
}

/** Color zone for the encounter gauge */
export type GaugeZone = 'safe' | 'warn' | 'danger'

/** The complete dungeon exploration state */
export interface DungeonState {
  readonly floorId: string
  readonly floorNumber: number
  readonly playerPosition: Position
  readonly foes: FoeState[]
  readonly encounterGauge: EncounterGaugeState
  /** Direction the player is facing */
  readonly facing: Direction
  /** Whether the dungeon is currently processing a turn */
  readonly processing: boolean
}

// ---- Events ----

/** Events that can occur during a turn */
export type DungeonEvent =
  | { readonly type: 'foe-collision'; readonly foeId: string }
  | { readonly type: 'random-encounter' }
  | { readonly type: 'reached-exit' }
  | { readonly type: 'reached-checkpoint' }
  | { readonly type: 'reached-shortcut' }

/** Result of processing a single turn */
export interface TurnResult {
  readonly state: DungeonState
  readonly events: DungeonEvent[]
}
