import { create } from 'zustand'
import type { GameScreen } from '../types/game'

interface GameState {
  screen: GameScreen
  setScreen: (screen: GameScreen) => void
  helpOpen: boolean
  toggleHelp: () => void
}

export const useGameStore = create<GameState>((set) => ({
  screen: 'title',
  setScreen: (screen) => set({ screen }),
  helpOpen: false,
  toggleHelp: () => set((s) => ({ helpOpen: !s.helpOpen })),
}))
