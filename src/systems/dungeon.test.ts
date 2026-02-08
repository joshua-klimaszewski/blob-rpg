import { describe, it, expect } from 'vitest'
import type { DungeonState, FloorData, FoeState, Position } from '../types/dungeon'
import {
  movePosition,
  positionsEqual,
  oppositeDirection,
  distance,
  getTile,
  isWalkable,
  isWallBlocked,
  canMove,
  movePlayer,
  movePatrolFoe,
  moveChaseFoe,
  moveFoes,
  checkFoeCollision,
  tickEncounterGauge,
  getGaugeZone,
  resetEncounterGauge,
  processTurn,
  initializeDungeonState,
} from './dungeon'

// ---- Test helpers ----

/** Minimal 3x3 floor for testing */
function makeFloor(overrides?: Partial<FloorData>): FloorData {
  // . . .
  // . . .
  // . . W
  return {
    id: 'test-floor',
    dungeonId: 'test',
    floorNumber: 1,
    width: 3,
    height: 3,
    tiles: [
      [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
      [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
      [{ type: 'floor' }, { type: 'floor' }, { type: 'wall' }],
    ],
    playerStart: { x: 0, y: 0 },
    foeSpawns: [],
    encounterRate: 10,
    encounterVariance: [0, 0],
    ...overrides,
  }
}

function makeState(overrides?: Partial<DungeonState>): DungeonState {
  return {
    floorId: 'test-floor',
    floorNumber: 1,
    playerPosition: { x: 0, y: 0 },
    foes: [],
    encounterGauge: { value: 0, threshold: 100 },
    facing: 'north',
    processing: false,
    ...overrides,
  }
}

// ---- Position utilities ----

describe('movePosition', () => {
  it('moves north (y-1)', () => {
    expect(movePosition({ x: 1, y: 1 }, 'north')).toEqual({ x: 1, y: 0 })
  })

  it('moves south (y+1)', () => {
    expect(movePosition({ x: 1, y: 1 }, 'south')).toEqual({ x: 1, y: 2 })
  })

  it('moves east (x+1)', () => {
    expect(movePosition({ x: 1, y: 1 }, 'east')).toEqual({ x: 2, y: 1 })
  })

  it('moves west (x-1)', () => {
    expect(movePosition({ x: 1, y: 1 }, 'west')).toEqual({ x: 0, y: 1 })
  })
})

describe('positionsEqual', () => {
  it('returns true for identical positions', () => {
    expect(positionsEqual({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true)
  })

  it('returns false for different positions', () => {
    expect(positionsEqual({ x: 1, y: 2 }, { x: 2, y: 1 })).toBe(false)
  })
})

describe('oppositeDirection', () => {
  it('north <-> south', () => {
    expect(oppositeDirection('north')).toBe('south')
    expect(oppositeDirection('south')).toBe('north')
  })

  it('east <-> west', () => {
    expect(oppositeDirection('east')).toBe('west')
    expect(oppositeDirection('west')).toBe('east')
  })
})

describe('distance', () => {
  it('returns 0 for same position', () => {
    expect(distance({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0)
  })

  it('returns manhattan distance', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7)
  })
})

// ---- Floor queries ----

describe('getTile', () => {
  const floor = makeFloor()

  it('returns tile at valid position', () => {
    expect(getTile(floor, { x: 0, y: 0 })).toEqual({ type: 'floor' })
  })

  it('returns wall tile', () => {
    expect(getTile(floor, { x: 2, y: 2 })).toEqual({ type: 'wall' })
  })

  it('returns undefined for out-of-bounds', () => {
    expect(getTile(floor, { x: -1, y: 0 })).toBeUndefined()
    expect(getTile(floor, { x: 0, y: 3 })).toBeUndefined()
    expect(getTile(floor, { x: 3, y: 0 })).toBeUndefined()
  })
})

describe('isWalkable', () => {
  const floor = makeFloor()

  it('returns true for floor tiles', () => {
    expect(isWalkable(floor, { x: 0, y: 0 })).toBe(true)
  })

  it('returns false for wall tiles', () => {
    expect(isWalkable(floor, { x: 2, y: 2 })).toBe(false)
  })

  it('returns false for out-of-bounds', () => {
    expect(isWalkable(floor, { x: -1, y: 0 })).toBe(false)
  })

  it('returns true for exit tiles', () => {
    const floor = makeFloor({
      tiles: [
        [{ type: 'exit' }, { type: 'floor' }, { type: 'floor' }],
        [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
        [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
      ],
    })
    expect(isWalkable(floor, { x: 0, y: 0 })).toBe(true)
  })

  it('returns true for checkpoint and shortcut tiles', () => {
    const floor = makeFloor({
      tiles: [
        [{ type: 'checkpoint' }, { type: 'shortcut' }, { type: 'floor' }],
        [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
        [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
      ],
    })
    expect(isWalkable(floor, { x: 0, y: 0 })).toBe(true)
    expect(isWalkable(floor, { x: 1, y: 0 })).toBe(true)
  })
})

describe('isWallBlocked', () => {
  it('returns false when tile has no walls', () => {
    const floor = makeFloor()
    expect(isWallBlocked(floor, { x: 0, y: 0 }, 'east')).toBe(false)
  })

  it('returns true when tile has a wall in that direction', () => {
    const floor = makeFloor({
      tiles: [
        [{ type: 'floor', walls: ['east'] }, { type: 'floor' }, { type: 'floor' }],
        [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
        [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
      ],
    })
    expect(isWallBlocked(floor, { x: 0, y: 0 }, 'east')).toBe(true)
    expect(isWallBlocked(floor, { x: 0, y: 0 }, 'south')).toBe(false)
  })

  it('returns true for out-of-bounds', () => {
    const floor = makeFloor()
    expect(isWallBlocked(floor, { x: -1, y: 0 }, 'east')).toBe(true)
  })
})

describe('canMove', () => {
  it('allows movement to an open floor tile', () => {
    const floor = makeFloor()
    expect(canMove(floor, { x: 0, y: 0 }, 'east')).toBe(true)
    expect(canMove(floor, { x: 0, y: 0 }, 'south')).toBe(true)
  })

  it('blocks movement into a wall tile', () => {
    const floor = makeFloor()
    expect(canMove(floor, { x: 1, y: 2 }, 'east')).toBe(false)
  })

  it('blocks movement out of bounds', () => {
    const floor = makeFloor()
    expect(canMove(floor, { x: 0, y: 0 }, 'north')).toBe(false)
    expect(canMove(floor, { x: 0, y: 0 }, 'west')).toBe(false)
  })

  it('blocks movement through a directional wall', () => {
    const floor = makeFloor({
      tiles: [
        [{ type: 'floor', walls: ['east'] }, { type: 'floor' }, { type: 'floor' }],
        [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
        [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
      ],
    })
    expect(canMove(floor, { x: 0, y: 0 }, 'east')).toBe(false)
  })

  it('blocks entry from a direction blocked by target tile wall', () => {
    const floor = makeFloor({
      tiles: [
        [{ type: 'floor' }, { type: 'floor', walls: ['west'] }, { type: 'floor' }],
        [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
        [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
      ],
    })
    expect(canMove(floor, { x: 0, y: 0 }, 'east')).toBe(false)
  })
})

// ---- Player movement ----

describe('movePlayer', () => {
  it('moves player to an open tile and updates facing', () => {
    const floor = makeFloor()
    const state = makeState({ playerPosition: { x: 0, y: 0 } })
    const { state: result, moved } = movePlayer(state, floor, 'east')
    expect(moved).toBe(true)
    expect(result.playerPosition).toEqual({ x: 1, y: 0 })
    expect(result.facing).toBe('east')
  })

  it('does not move into a wall but updates facing', () => {
    const floor = makeFloor()
    const state = makeState({ playerPosition: { x: 0, y: 0 } })
    const { state: result, moved } = movePlayer(state, floor, 'north')
    expect(moved).toBe(false)
    expect(result.playerPosition).toEqual({ x: 0, y: 0 })
    expect(result.facing).toBe('north')
  })
})

// ---- FOE movement ----

describe('movePatrolFoe', () => {
  const path: Position[] = [
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
  ]

  it('advances along patrol path', () => {
    const foe: FoeState = {
      id: 'foe-1',
      position: path[0],
      pattern: 'patrol',
      patrolPath: path,
      patrolIndex: 0,
      patrolDirection: 1,
      name: 'Test FOE',
    }
    const result = movePatrolFoe(foe)
    expect(result.position).toEqual({ x: 1, y: 1 })
    expect(result.patrolIndex).toBe(1)
  })

  it('reverses at the end of the path', () => {
    const foe: FoeState = {
      id: 'foe-1',
      position: path[2],
      pattern: 'patrol',
      patrolPath: path,
      patrolIndex: 2,
      patrolDirection: 1,
      name: 'Test FOE',
    }
    const result = movePatrolFoe(foe)
    expect(result.position).toEqual({ x: 1, y: 1 })
    expect(result.patrolIndex).toBe(1)
    expect(result.patrolDirection).toBe(-1)
  })

  it('reverses at the start of the path', () => {
    const foe: FoeState = {
      id: 'foe-1',
      position: path[0],
      pattern: 'patrol',
      patrolPath: path,
      patrolIndex: 0,
      patrolDirection: -1,
      name: 'Test FOE',
    }
    const result = movePatrolFoe(foe)
    expect(result.position).toEqual({ x: 1, y: 1 })
    expect(result.patrolIndex).toBe(1)
    expect(result.patrolDirection).toBe(1)
  })

  it('returns unchanged foe if no patrol path', () => {
    const foe: FoeState = {
      id: 'foe-1',
      position: { x: 0, y: 0 },
      pattern: 'patrol',
      patrolIndex: 0,
      patrolDirection: 1,
      name: 'Test FOE',
    }
    expect(movePatrolFoe(foe)).toEqual(foe)
  })
})

describe('moveChaseFoe', () => {
  it('moves toward the player on the primary axis', () => {
    const floor = makeFloor()
    const foe: FoeState = {
      id: 'foe-1',
      position: { x: 0, y: 0 },
      pattern: 'chase',
      patrolIndex: 0,
      patrolDirection: 1,
      name: 'Chaser',
    }
    const result = moveChaseFoe(foe, { x: 2, y: 2 }, floor)
    // Larger or equal dx, so moves east
    expect(result.position).toEqual({ x: 1, y: 0 })
  })

  it('does not move if already on the player', () => {
    const floor = makeFloor()
    const foe: FoeState = {
      id: 'foe-1',
      position: { x: 1, y: 1 },
      pattern: 'chase',
      patrolIndex: 0,
      patrolDirection: 1,
      name: 'Chaser',
    }
    const result = moveChaseFoe(foe, { x: 1, y: 1 }, floor)
    expect(result.position).toEqual({ x: 1, y: 1 })
  })

  it('tries secondary axis if primary is blocked', () => {
    // Foe at (1,2), player at (2,0). Primary axis is y (dy=2), but north is
    // blocked by wall at (1, 1) in this custom floor.
    const floor = makeFloor({
      tiles: [
        [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
        [{ type: 'floor' }, { type: 'wall' }, { type: 'floor' }],
        [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
      ],
    })
    const foe: FoeState = {
      id: 'foe-1',
      position: { x: 1, y: 2 },
      pattern: 'chase',
      patrolIndex: 0,
      patrolDirection: 1,
      name: 'Chaser',
    }
    const result = moveChaseFoe(foe, { x: 2, y: 0 }, floor)
    // Can't go north (wall), tries east
    expect(result.position).toEqual({ x: 2, y: 2 })
  })
})

describe('moveFoes', () => {
  it('moves patrol foes and leaves stationary foes', () => {
    const floor = makeFloor()
    const state = makeState({
      playerPosition: { x: 0, y: 0 },
      foes: [
        {
          id: 'patrol',
          position: { x: 1, y: 0 },
          pattern: 'patrol',
          patrolPath: [{ x: 1, y: 0 }, { x: 1, y: 1 }],
          patrolIndex: 0,
          patrolDirection: 1,
          name: 'Patrol',
        },
        {
          id: 'stationary',
          position: { x: 2, y: 0 },
          pattern: 'stationary',
          patrolIndex: 0,
          patrolDirection: 1,
          name: 'Guard',
        },
      ],
    })
    const result = moveFoes(state, floor)
    expect(result.foes[0].position).toEqual({ x: 1, y: 1 })
    expect(result.foes[1].position).toEqual({ x: 2, y: 0 })
  })
})

// ---- FOE collision ----

describe('checkFoeCollision', () => {
  it('returns foe id when on same tile as player', () => {
    const state = makeState({
      playerPosition: { x: 1, y: 1 },
      foes: [{
        id: 'foe-1',
        position: { x: 1, y: 1 },
        pattern: 'stationary',
        patrolIndex: 0,
        patrolDirection: 1,
        name: 'Guard',
      }],
    })
    expect(checkFoeCollision(state)).toBe('foe-1')
  })

  it('returns null when no collision', () => {
    const state = makeState({
      playerPosition: { x: 0, y: 0 },
      foes: [{
        id: 'foe-1',
        position: { x: 2, y: 2 },
        pattern: 'stationary',
        patrolIndex: 0,
        patrolDirection: 1,
        name: 'Guard',
      }],
    })
    expect(checkFoeCollision(state)).toBeNull()
  })
})

// ---- Encounter gauge ----

describe('tickEncounterGauge', () => {
  const floor = makeFloor({ encounterRate: 10, encounterVariance: [0, 0] })

  it('fills the gauge by the encounter rate', () => {
    const gauge = { value: 0, threshold: 100 }
    const result = tickEncounterGauge(gauge, floor)
    expect(result.gauge.value).toBe(10)
    expect(result.triggered).toBe(false)
  })

  it('triggers at threshold and resets to 0', () => {
    const gauge = { value: 91, threshold: 100 }
    const result = tickEncounterGauge(gauge, floor)
    expect(result.triggered).toBe(true)
    expect(result.gauge.value).toBe(0)
  })

  it('uses variance from rng', () => {
    const floorWithVar = makeFloor({
      encounterRate: 10,
      encounterVariance: [5, 15],
    })
    const gauge = { value: 0, threshold: 100 }
    // rng returns 0.5 → variance = 5 + 0.5 * 10 = 10 → total = 20
    const result = tickEncounterGauge(gauge, floorWithVar, () => 0.5)
    expect(result.gauge.value).toBe(20)
  })

  it('caps value at threshold', () => {
    const gauge = { value: 95, threshold: 100 }
    const result = tickEncounterGauge(gauge, floor)
    expect(result.gauge.value).toBe(0) // triggered and reset
    expect(result.triggered).toBe(true)
  })
})

describe('getGaugeZone', () => {
  it('returns safe for 0-49', () => {
    expect(getGaugeZone(0)).toBe('safe')
    expect(getGaugeZone(49)).toBe('safe')
  })

  it('returns warn for 50-79', () => {
    expect(getGaugeZone(50)).toBe('warn')
    expect(getGaugeZone(79)).toBe('warn')
  })

  it('returns danger for 80+', () => {
    expect(getGaugeZone(80)).toBe('danger')
    expect(getGaugeZone(100)).toBe('danger')
  })
})

describe('resetEncounterGauge', () => {
  it('returns a fresh gauge at 0/100', () => {
    const gauge = resetEncounterGauge()
    expect(gauge.value).toBe(0)
    expect(gauge.threshold).toBe(100)
  })
})

// ---- Turn resolution ----

describe('processTurn', () => {
  it('moves player and ticks gauge on a successful move', () => {
    const floor = makeFloor({ encounterRate: 10, encounterVariance: [0, 0] })
    const state = makeState({ playerPosition: { x: 0, y: 0 } })
    const result = processTurn(state, floor, 'east', () => 0)
    expect(result.state.playerPosition).toEqual({ x: 1, y: 0 })
    expect(result.state.encounterGauge.value).toBe(10)
    expect(result.events).toEqual([])
  })

  it('does not tick gauge when movement is blocked', () => {
    const floor = makeFloor()
    const state = makeState({ playerPosition: { x: 0, y: 0 } })
    const result = processTurn(state, floor, 'north', () => 0)
    expect(result.state.playerPosition).toEqual({ x: 0, y: 0 })
    expect(result.state.encounterGauge.value).toBe(0)
    expect(result.events).toEqual([])
  })

  it('fires random-encounter event when gauge triggers', () => {
    const floor = makeFloor({ encounterRate: 10, encounterVariance: [0, 0] })
    const state = makeState({
      playerPosition: { x: 0, y: 0 },
      encounterGauge: { value: 91, threshold: 100 },
    })
    const result = processTurn(state, floor, 'east', () => 0)
    expect(result.events).toContainEqual({ type: 'random-encounter' })
    expect(result.state.encounterGauge.value).toBe(0)
  })

  it('fires foe-collision event when player walks into a FOE', () => {
    const floor = makeFloor()
    const state = makeState({
      playerPosition: { x: 0, y: 0 },
      foes: [{
        id: 'foe-1',
        position: { x: 1, y: 0 },
        pattern: 'stationary',
        patrolIndex: 0,
        patrolDirection: 1,
        name: 'Guard',
      }],
    })
    const result = processTurn(state, floor, 'east', () => 0)
    expect(result.events).toContainEqual({ type: 'foe-collision', foeId: 'foe-1' })
  })

  it('fires reached-exit event on exit tile', () => {
    const floor = makeFloor({
      tiles: [
        [{ type: 'floor' }, { type: 'exit' }, { type: 'floor' }],
        [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
        [{ type: 'floor' }, { type: 'floor' }, { type: 'floor' }],
      ],
    })
    const state = makeState({ playerPosition: { x: 0, y: 0 } })
    const result = processTurn(state, floor, 'east', () => 0)
    expect(result.events).toContainEqual({ type: 'reached-exit' })
  })

  it('moves FOEs after player moves', () => {
    const floor = makeFloor()
    const state = makeState({
      playerPosition: { x: 0, y: 0 },
      foes: [{
        id: 'patrol',
        position: { x: 2, y: 0 },
        pattern: 'patrol',
        patrolPath: [{ x: 2, y: 0 }, { x: 2, y: 1 }],
        patrolIndex: 0,
        patrolDirection: 1,
        name: 'Patrol',
      }],
    })
    const result = processTurn(state, floor, 'south', () => 0)
    expect(result.state.foes[0].position).toEqual({ x: 2, y: 1 })
  })
})

// ---- Initialization ----

describe('initializeDungeonState', () => {
  it('creates state from floor data', () => {
    const floor = makeFloor({
      id: 'test-f1',
      floorNumber: 1,
      playerStart: { x: 1, y: 2 },
      foeSpawns: [{
        id: 'foe-1',
        position: { x: 2, y: 0 },
        pattern: 'patrol',
        patrolPath: [{ x: 2, y: 0 }, { x: 2, y: 1 }],
        name: 'Patrol FOE',
      }],
    })

    const state = initializeDungeonState(floor)
    expect(state.floorId).toBe('test-f1')
    expect(state.floorNumber).toBe(1)
    expect(state.playerPosition).toEqual({ x: 1, y: 2 })
    expect(state.foes).toHaveLength(1)
    expect(state.foes[0].id).toBe('foe-1')
    expect(state.foes[0].patrolIndex).toBe(0)
    expect(state.encounterGauge.value).toBe(0)
    expect(state.facing).toBe('north')
    expect(state.processing).toBe(false)
  })
})
