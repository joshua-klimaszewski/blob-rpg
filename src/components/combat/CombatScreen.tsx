import { useGameStore } from '../../stores/gameStore'

export function CombatScreen() {
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-bold border-b-2 border-ink pb-2">Combat</h1>

      <div className="w-full max-w-xs border-2 border-ink p-4 flex flex-col gap-2">
        <div className="flex justify-between">
          <span>Enemy Blob</span>
          <span>HP: ???</span>
        </div>
        <div className="h-px bg-gray-300" />
        <div className="flex justify-between">
          <span>Your Blob</span>
          <span>HP: ???</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        <button
          disabled
          className="min-h-touch border-2 border-gray-300 px-4 py-3 text-gray-400"
        >
          Attack
        </button>
        <button
          disabled
          className="min-h-touch border-2 border-gray-300 px-4 py-3 text-gray-400"
        >
          Defend
        </button>
        <button
          disabled
          className="min-h-touch border-2 border-gray-300 px-4 py-3 text-gray-400"
        >
          Skill
        </button>
        <button
          onClick={() => setScreen('dungeon')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Flee
        </button>
      </div>
    </div>
  )
}
