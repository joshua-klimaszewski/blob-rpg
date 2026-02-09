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
import { GuildNameScreen } from './components/ui/GuildNameScreen'
import { LoadGameScreen } from './components/ui/LoadGameScreen'
import { HowToPlayScreen } from './components/help/HowToPlayScreen'
import { InventoryScreen } from './components/town/InventoryScreen'
import { DungeonSelectScreen } from './components/dungeon/DungeonSelectScreen'
import { HelpOverlay } from './components/help/HelpOverlay'
import { AutoSaveIndicator } from './components/ui/AutoSaveIndicator'
import { useAutoSave } from './hooks/useAutoSave'

const screens = {
  title: TitleScreen,
  town: TownScreen,
  dungeon: DungeonScreen,
  'dungeon-select': DungeonSelectScreen,
  combat: CombatScreen,
  character: CharacterSheet,
  'party-formation': PartyFormation,
  inn: InnScreen,
  shop: ShopScreen,
  guild: GuildScreen,
  'guild-name': GuildNameScreen,
  'load-game': LoadGameScreen,
  'how-to-play': HowToPlayScreen,
  inventory: InventoryScreen,
} as const

export function App() {
  const screen = useGameStore((s) => s.screen)
  const helpOpen = useGameStore((s) => s.helpOpen)
  useAutoSave()
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
      <AutoSaveIndicator />
      {helpOpen && <HelpOverlay />}
    </div>
  )
}
