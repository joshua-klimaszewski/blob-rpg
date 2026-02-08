import { useDungeonStore } from '../../stores/dungeonStore'
import { DungeonViewport } from './DungeonViewport'

export function DungeonScreen() {
  const dungeon = useDungeonStore((s) => s.dungeon)
  const floor = useDungeonStore((s) => s.floor)
  const warpToTown = useDungeonStore((s) => s.warpToTown)

  if (!dungeon || !floor) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <span className="text-gray-400">No dungeon loaded</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-dvh">
      {/* Viewport takes remaining space */}
      <DungeonViewport floor={floor} dungeon={dungeon} />

      {/* Temporary controls (will be replaced by HUD in commit 6) */}
      <div className="flex gap-3 p-3 border-t-2 border-ink justify-center">
        <button
          onClick={() => warpToTown()}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Return to Town
        </button>
      </div>
    </div>
  )
}
