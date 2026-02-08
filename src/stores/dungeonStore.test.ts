import { describe, it, expect, beforeEach } from 'vitest'
import { useDungeonStore } from './dungeonStore'
import { useGameStore } from './gameStore'

describe('dungeonStore', () => {
  beforeEach(() => {
    useDungeonStore.setState({
      dungeon: null,
      floor: null,
      lastEvents: [],
    })
    useGameStore.setState({ screen: 'town' })
  })

  describe('enterDungeon', () => {
    it('initializes dungeon state from floor data', () => {
      useDungeonStore.getState().enterDungeon('verdant-depths-f1')

      const { dungeon, floor } = useDungeonStore.getState()
      expect(dungeon).not.toBeNull()
      expect(floor).not.toBeNull()
      expect(dungeon!.floorId).toBe('verdant-depths-f1')
      expect(dungeon!.playerPosition).toEqual({ x: 2, y: 12 })
    })

    it('switches to dungeon screen', () => {
      useDungeonStore.getState().enterDungeon('verdant-depths-f1')
      expect(useGameStore.getState().screen).toBe('dungeon')
    })

    it('does nothing for unknown floor ID', () => {
      useDungeonStore.getState().enterDungeon('nonexistent')
      expect(useDungeonStore.getState().dungeon).toBeNull()
      expect(useGameStore.getState().screen).toBe('town')
    })
  })

  describe('move', () => {
    beforeEach(() => {
      useDungeonStore.getState().enterDungeon('verdant-depths-f1')
    })

    it('moves player in a valid direction', () => {
      const before = useDungeonStore.getState().dungeon!.playerPosition
      useDungeonStore.getState().move('north')
      const after = useDungeonStore.getState().dungeon!.playerPosition

      expect(after.y).toBe(before.y - 1)
      expect(after.x).toBe(before.x)
    })

    it('does not move into walls', () => {
      // Player starts at (2, 12). Moving west goes to (1, 12) which is floor.
      // But moving south from (2, 12) goes to (2, 13) which is floor too.
      // Let's move to a wall edge. Start at (2, 12), go south to (2, 13), then south again should hit wall at (2, 14).
      useDungeonStore.getState().move('south') // (2, 13)
      useDungeonStore.getState().move('south') // blocked by wall at row 14

      const pos = useDungeonStore.getState().dungeon!.playerPosition
      expect(pos).toEqual({ x: 2, y: 13 })
    })

    it('does nothing when no dungeon is loaded', () => {
      useDungeonStore.setState({ dungeon: null, floor: null })
      useDungeonStore.getState().move('north')
      expect(useDungeonStore.getState().dungeon).toBeNull()
    })

    it('updates encounter gauge on successful move', () => {
      const before = useDungeonStore.getState().dungeon!.encounterGauge.value
      useDungeonStore.getState().move('north')
      const after = useDungeonStore.getState().dungeon!.encounterGauge.value

      expect(after).toBeGreaterThan(before)
    })
  })

  describe('warpToTown', () => {
    it('clears dungeon state and returns to town', () => {
      useDungeonStore.getState().enterDungeon('verdant-depths-f1')
      useDungeonStore.getState().warpToTown()

      expect(useDungeonStore.getState().dungeon).toBeNull()
      expect(useDungeonStore.getState().floor).toBeNull()
      expect(useGameStore.getState().screen).toBe('town')
    })
  })
})
