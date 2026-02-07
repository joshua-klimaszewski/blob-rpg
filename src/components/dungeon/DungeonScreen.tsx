import { useGameStore } from '../../stores/gameStore'

export function DungeonScreen() {
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-bold border-b-2 border-ink pb-2">
        Dungeon — F1
      </h1>

      <div className="w-full max-w-xs aspect-square border-2 border-ink flex items-center justify-center">
        <span className="text-gray-400">[ Grid will render here ]</span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setScreen('combat')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Fight!
        </button>
        <button
          onClick={() => setScreen('town')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Return to Town
        </button>
      </div>
    </div>
  )
}
