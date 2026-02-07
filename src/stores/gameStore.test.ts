import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from './gameStore'

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.setState({ screen: 'town' })
  })

  it('starts on the town screen', () => {
    expect(useGameStore.getState().screen).toBe('town')
  })

  it('switches to dungeon screen', () => {
    useGameStore.getState().setScreen('dungeon')
    expect(useGameStore.getState().screen).toBe('dungeon')
  })

  it('switches to combat screen', () => {
    useGameStore.getState().setScreen('combat')
    expect(useGameStore.getState().screen).toBe('combat')
  })
})
