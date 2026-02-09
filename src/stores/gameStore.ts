import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameScreen } from '../types/game'

interface GameState {
  screen: GameScreen
  setScreen: (screen: GameScreen) => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      screen: 'title',
      setScreen: (screen) => set({ screen }),
    }),
    {
      name: 'blob-rpg-game',
      partialize: (state) => ({
        screen: state.screen,
      }),
    },
  ),
)
