import { useEffect } from 'react'
import { useDungeonStore } from '../../stores/dungeonStore'
import { useGameStore } from '../../stores/gameStore'
import { usePartyStore } from '../../stores/partyStore'

export function TownScreen() {
  const enterDungeon = useDungeonStore((s) => s.enterDungeon)
  const setScreen = useGameStore((s) => s.setScreen)
  const roster = usePartyStore((s) => s.roster)
  const initializeRoster = usePartyStore((s) => s.initializeRoster)

  // Auto-initialize roster on first visit
  useEffect(() => {
    if (roster.length === 0) {
      initializeRoster()
    }
  }, [roster.length, initializeRoster])

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-bold border-b-2 border-ink pb-2">Town</h1>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => enterDungeon('verdant-depths-f1')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Enter Dungeon
        </button>

        <button
          onClick={() => setScreen('character')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Characters
        </button>

        <button
          onClick={() => setScreen('party-formation')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Party
        </button>

        <button
          onClick={() => setScreen('inn')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Inn
        </button>

        <button
          onClick={() => setScreen('shop')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Shop
        </button>

        <button
          onClick={() => setScreen('guild')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Guild
        </button>
      </div>
    </div>
  )
}
