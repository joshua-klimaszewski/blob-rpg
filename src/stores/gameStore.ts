import { create } from 'zustand'
import type { GameScreen } from '../types/game'

interface GameState {
  screen: GameScreen
  setScreen: (screen: GameScreen) => void
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'town',
  setScreen: (screen) => set({ screen }),
}))
