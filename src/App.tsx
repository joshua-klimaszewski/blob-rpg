import { useGameStore } from './stores/gameStore'
import { TownScreen } from './components/town/TownScreen'
import { DungeonScreen } from './components/dungeon/DungeonScreen'
import { CombatScreen } from './components/combat/CombatScreen'

const screens = {
  town: TownScreen,
  dungeon: DungeonScreen,
  combat: CombatScreen,
} as const

export function App() {
  const screen = useGameStore((s) => s.screen)
  const Screen = screens[screen]

  return (
    <div className="min-h-dvh bg-paper text-ink font-mono">
      <Screen />
    </div>
  )
}
