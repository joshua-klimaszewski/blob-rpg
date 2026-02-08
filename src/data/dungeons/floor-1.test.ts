import { describe, expect, it } from 'vitest'
import { FLOOR_1 } from './floor-1'
import { getFloor } from './index'
import { isWalkable } from '../../systems/dungeon'

describe('Floor 1 — Verdant Depths F1', () => {
  it('has correct dimensions', () => {
    expect(FLOOR_1.width).toBe(15)
    expect(FLOOR_1.height).toBe(15)
    expect(FLOOR_1.tiles.length).toBe(15)
    FLOOR_1.tiles.forEach((row, y) => {
      expect(row.length).withContext(`row ${y}`).toBe(15)
    })
  })

  it('player start is on a walkable tile', () => {
    expect(isWalkable(FLOOR_1, FLOOR_1.playerStart)).toBe(true)
  })

  it('has an exit tile', () => {
    let hasExit = false
    for (const row of FLOOR_1.tiles) {
      for (const tile of row) {
        if (tile.type === 'exit') hasExit = true
      }
    }
    expect(hasExit).toBe(true)
  })

  it('exit tile is walkable', () => {
    for (let y = 0; y < FLOOR_1.height; y++) {
      for (let x = 0; x < FLOOR_1.width; x++) {
        if (FLOOR_1.tiles[y][x].type === 'exit') {
          expect(isWalkable(FLOOR_1, { x, y })).toBe(true)
        }
      }
    }
  })

  it('has a checkpoint tile', () => {
    let found = false
    for (const row of FLOOR_1.tiles) {
      for (const tile of row) {
        if (tile.type === 'checkpoint') found = true
      }
    }
    expect(found).toBe(true)
  })

  it('has a shortcut tile', () => {
    let found = false
    for (const row of FLOOR_1.tiles) {
      for (const tile of row) {
        if (tile.type === 'shortcut') found = true
      }
    }
    expect(found).toBe(true)
  })

  it('all FOE spawns are on walkable tiles', () => {
    for (const spawn of FLOOR_1.foeSpawns) {
      expect(isWalkable(FLOOR_1, spawn.position)).withContext(
        `FOE ${spawn.id} at (${spawn.position.x}, ${spawn.position.y})`,
      ).toBe(true)
    }
  })

  it('all patrol path positions are walkable', () => {
    for (const spawn of FLOOR_1.foeSpawns) {
      if (spawn.patrolPath) {
        for (const pos of spawn.patrolPath) {
          expect(isWalkable(FLOOR_1, pos)).withContext(
            `FOE ${spawn.id} patrol at (${pos.x}, ${pos.y})`,
          ).toBe(true)
        }
      }
    }
  })

  it('has valid encounter rate config', () => {
    expect(FLOOR_1.encounterRate).toBeGreaterThan(0)
    expect(FLOOR_1.encounterVariance[0]).toBeLessThanOrEqual(
      FLOOR_1.encounterVariance[1],
    )
  })

  it('outer border is all walls', () => {
    for (let x = 0; x < FLOOR_1.width; x++) {
      expect(FLOOR_1.tiles[0][x].type).toBe('wall')
      expect(FLOOR_1.tiles[FLOOR_1.height - 1][x].type).toBe('wall')
    }
    for (let y = 0; y < FLOOR_1.height; y++) {
      expect(FLOOR_1.tiles[y][0].type).toBe('wall')
      expect(FLOOR_1.tiles[y][FLOOR_1.width - 1].type).toBe('wall')
    }
  })
})

describe('Floor Registry', () => {
  it('can look up floor-1 by ID', () => {
    const floor = getFloor('verdant-depths-f1')
    expect(floor).toBeDefined()
    expect(floor?.id).toBe('verdant-depths-f1')
  })

  it('returns undefined for unknown IDs', () => {
    expect(getFloor('nonexistent')).toBeUndefined()
  })
})
