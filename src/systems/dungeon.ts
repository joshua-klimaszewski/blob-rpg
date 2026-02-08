import type {
  Direction,
  DungeonEvent,
  DungeonState,
  EncounterGaugeState,
  FloorData,
  FoeState,
  GaugeZone,
  Position,
  TileData,
  TurnResult,
} from '../types/dungeon'

// ---- Position utilities ----

const DIRECTION_VECTORS: Record<Direction, Position> = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
}

/** Apply a direction to a position, returning the new position */
export function movePosition(pos: Position, dir: Direction): Position {
  const delta = DIRECTION_VECTORS[dir]
  return { x: pos.x + delta.x, y: pos.y + delta.y }
}

/** Check if two positions are equal */
export function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y
}

/** Get the opposite direction */
export function oppositeDirection(dir: Direction): Direction {
  const opposites: Record<Direction, Direction> = {
    north: 'south',
    south: 'north',
    east: 'west',
    west: 'east',
  }
  return opposites[dir]
}

/** Manhattan distance between two positions */
export function distance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

// ---- Floor queries ----

/** Get the tile at a position, or undefined if out of bounds */
export function getTile(
  floor: FloorData,
  pos: Position,
): TileData | undefined {
  if (pos.x < 0 || pos.x >= floor.width || pos.y < 0 || pos.y >= floor.height) {
    return undefined
  }
  return floor.tiles[pos.y][pos.x]
}

/** Check if a position is walkable (in bounds and not a wall tile) */
export function isWalkable(floor: FloorData, pos: Position): boolean {
  const tile = getTile(floor, pos)
  if (!tile) return false
  return tile.type !== 'wall'
}

/** Check if movement from `from` in `dir` is blocked by a wall edge on the source tile */
export function isWallBlocked(
  floor: FloorData,
  from: Position,
  dir: Direction,
): boolean {
  const tile = getTile(floor, from)
  if (!tile) return true
  if (!tile.walls) return false
  return tile.walls.includes(dir)
}

/** Check if movement from `from` in `dir` is valid */
export function canMove(
  floor: FloorData,
  from: Position,
  dir: Direction,
): boolean {
  // Check wall on the source tile
  if (isWallBlocked(floor, from, dir)) return false
  // Check the target tile is walkable
  const target = movePosition(from, dir)
  if (!isWalkable(floor, target)) return false
  // Check wall on the target tile blocking entry from the opposite direction
  if (isWallBlocked(floor, target, oppositeDirection(dir))) return false
  return true
}

// ---- Player movement ----

/**
 * Attempt to move the player in a direction.
 * If movement is blocked, only facing updates (no position change, no turn consumed).
 */
export function movePlayer(
  state: DungeonState,
  floor: FloorData,
  dir: Direction,
): { state: DungeonState; moved: boolean } {
  if (canMove(floor, state.playerPosition, dir)) {
    return {
      state: {
        ...state,
        playerPosition: movePosition(state.playerPosition, dir),
        facing: dir,
      },
      moved: true,
    }
  }
  return {
    state: { ...state, facing: dir },
    moved: false,
  }
}

// ---- FOE movement ----

/** Move a single patrol FOE one step along its patrol path */
export function movePatrolFoe(foe: FoeState): FoeState {
  if (!foe.patrolPath || foe.patrolPath.length === 0) return foe

  let nextIndex = foe.patrolIndex + foe.patrolDirection
  let nextDirection = foe.patrolDirection

  // Reverse at path boundaries
  if (nextIndex >= foe.patrolPath.length) {
    nextDirection = -1
    nextIndex = foe.patrolIndex + nextDirection
  } else if (nextIndex < 0) {
    nextDirection = 1
    nextIndex = foe.patrolIndex + nextDirection
  }

  // Clamp to valid range
  nextIndex = Math.max(0, Math.min(nextIndex, foe.patrolPath.length - 1))

  return {
    ...foe,
    position: foe.patrolPath[nextIndex],
    patrolIndex: nextIndex,
    patrolDirection: nextDirection as 1 | -1,
  }
}

/** Move a single chase FOE one step toward the player (simple Manhattan) */
export function moveChaseFoe(
  foe: FoeState,
  playerPos: Position,
  floor: FloorData,
): FoeState {
  const dx = playerPos.x - foe.position.x
  const dy = playerPos.y - foe.position.y

  // Already on the player
  if (dx === 0 && dy === 0) return foe

  // Try the axis with the larger delta first
  const directions: Direction[] =
    Math.abs(dx) >= Math.abs(dy)
      ? [
          dx > 0 ? 'east' : 'west',
          dy > 0 ? 'south' : 'north',
        ]
      : [
          dy > 0 ? 'south' : 'north',
          dx > 0 ? 'east' : 'west',
        ]

  for (const dir of directions) {
    if (canMove(floor, foe.position, dir)) {
      return { ...foe, position: movePosition(foe.position, dir) }
    }
  }

  // Stuck — can't move
  return foe
}

/** Advance all FOEs by one step according to their patterns */
export function moveFoes(
  state: DungeonState,
  floor: FloorData,
): DungeonState {
  const newFoes = state.foes.map((foe) => {
    switch (foe.pattern) {
      case 'patrol':
        return movePatrolFoe(foe)
      case 'chase':
        return moveChaseFoe(foe, state.playerPosition, floor)
      case 'stationary':
        return foe
    }
  })
  return { ...state, foes: newFoes }
}

// ---- FOE collision ----

/** Check if any FOE occupies the same tile as the player. Returns FOE id or null. */
export function checkFoeCollision(state: DungeonState): string | null {
  for (const foe of state.foes) {
    if (positionsEqual(foe.position, state.playerPosition)) {
      return foe.id
    }
  }
  return null
}

// ---- Encounter gauge ----

/**
 * Tick the encounter gauge by one step.
 * Returns new gauge state and whether an encounter triggered.
 */
export function tickEncounterGauge(
  gauge: EncounterGaugeState,
  floor: FloorData,
  rng: () => number = Math.random,
): { gauge: EncounterGaugeState; triggered: boolean } {
  const [minVar, maxVar] = floor.encounterVariance
  const variance = minVar + rng() * (maxVar - minVar)
  const fill = floor.encounterRate + variance
  const newValue = Math.min(gauge.value + fill, gauge.threshold)

  if (newValue >= gauge.threshold) {
    return {
      gauge: { value: 0, threshold: gauge.threshold },
      triggered: true,
    }
  }

  return {
    gauge: { ...gauge, value: newValue },
    triggered: false,
  }
}

/** Determine the color zone from a gauge value */
export function getGaugeZone(value: number): GaugeZone {
  if (value < 50) return 'safe'
  if (value < 80) return 'warn'
  return 'danger'
}

/** Create a fresh encounter gauge */
export function resetEncounterGauge(): EncounterGaugeState {
  return { value: 0, threshold: 100 }
}

// ---- Turn resolution ----

/**
 * Process a complete turn: player moves -> FOEs move -> encounter gauge ticks.
 * If the player can't move, only facing updates — no turn is consumed.
 */
export function processTurn(
  state: DungeonState,
  floor: FloorData,
  dir: Direction,
  rng?: () => number,
): TurnResult {
  const events: DungeonEvent[] = []

  // 1. Attempt player move
  const { state: afterMove, moved } = movePlayer(state, floor, dir)

  if (!moved) {
    return { state: afterMove, events }
  }

  // 2. Check tile type at new position
  const tile = getTile(floor, afterMove.playerPosition)
  if (tile) {
    if (tile.type === 'exit') events.push({ type: 'reached-exit' })
    if (tile.type === 'checkpoint') events.push({ type: 'reached-checkpoint' })
    if (tile.type === 'shortcut') events.push({ type: 'reached-shortcut' })
  }

  // 3. Move FOEs
  const afterFoes = moveFoes(afterMove, floor)

  // 4. Check FOE collision
  const collidedFoeId = checkFoeCollision(afterFoes)
  if (collidedFoeId) {
    events.push({ type: 'foe-collision', foeId: collidedFoeId })
  }

  // 5. Tick encounter gauge
  const { gauge: newGauge, triggered } = tickEncounterGauge(
    afterFoes.encounterGauge,
    floor,
    rng,
  )
  const afterGauge: DungeonState = {
    ...afterFoes,
    encounterGauge: newGauge,
  }

  if (triggered) {
    events.push({ type: 'random-encounter' })
  }

  return { state: afterGauge, events }
}

// ---- Initialization ----

/** Create initial DungeonState from a FloorData definition */
export function initializeDungeonState(floor: FloorData): DungeonState {
  return {
    floorId: floor.id,
    floorNumber: floor.floorNumber,
    playerPosition: { ...floor.playerStart },
    foes: floor.foeSpawns.map((spawn) => ({
      id: spawn.id,
      position: { ...spawn.position },
      pattern: spawn.pattern,
      patrolPath: spawn.patrolPath,
      patrolIndex: 0,
      patrolDirection: 1 as const,
      name: spawn.name,
    })),
    encounterGauge: resetEncounterGauge(),
    facing: 'north',
    processing: false,
  }
}
