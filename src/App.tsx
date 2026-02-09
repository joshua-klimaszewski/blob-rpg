import { useGameStore } from './stores/gameStore'
import { TownScreen } from './components/town/TownScreen'
import { DungeonScreen } from './components/dungeon/DungeonScreen'
import { CombatScreen } from './components/combat/CombatScreen'
import { CharacterSheet } from './components/character/CharacterSheet'
import { PartyFormation } from './components/character/PartyFormation'
import { InnScreen } from './components/town/InnScreen'
import { ShopScreen } from './components/town/ShopScreen'
import { GuildScreen } from './components/town/GuildScreen'
import { TitleScreen } from './components/ui/TitleScreen'
import { HowToPlayScreen } from './components/help/HowToPlayScreen'
import { HelpOverlay } from './components/help/HelpOverlay'

const screens = {
  title: TitleScreen,
  town: TownScreen,
  dungeon: DungeonScreen,
  combat: CombatScreen,
  character: CharacterSheet,
  'party-formation': PartyFormation,
  inn: InnScreen,
  shop: ShopScreen,
  guild: GuildScreen,
  'how-to-play': HowToPlayScreen,
} as const

export function App() {
  const screen = useGameStore((s) => s.screen)
  const helpOpen = useGameStore((s) => s.helpOpen)
  const Screen = screens[screen as keyof typeof screens]

  if (!Screen) {
    return (
      <div className="min-h-dvh bg-paper text-ink font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold">Screen not found: {screen}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh bg-paper text-ink font-mono">
      <Screen />
      {helpOpen && <HelpOverlay />}
    </div>
  )
}
