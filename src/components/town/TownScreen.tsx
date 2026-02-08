import { useDungeonStore } from '../../stores/dungeonStore'

export function TownScreen() {
  const enterDungeon = useDungeonStore((s) => s.enterDungeon)

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
          disabled
          className="min-h-touch border-2 border-gray-300 px-4 py-3 text-gray-400"
        >
          Inn (coming soon)
        </button>

        <button
          disabled
          className="min-h-touch border-2 border-gray-300 px-4 py-3 text-gray-400"
        >
          Shop (coming soon)
        </button>

        <button
          disabled
          className="min-h-touch border-2 border-gray-300 px-4 py-3 text-gray-400"
        >
          Guild (coming soon)
        </button>
      </div>
    </div>
  )
}
