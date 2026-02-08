import { useDungeonStore } from '../../stores/dungeonStore'
import { DungeonViewport } from './DungeonViewport'
import { DungeonHUD } from './DungeonHUD'
import { EncounterGauge } from './EncounterGauge'
import { useDirectionInput } from '../../hooks/useDirectionInput'

export function DungeonScreen() {
  const dungeon = useDungeonStore((s) => s.dungeon)
  const floor = useDungeonStore((s) => s.floor)
  const warpToTown = useDungeonStore((s) => s.warpToTown)
  const move = useDungeonStore((s) => s.move)

  useDirectionInput(move)

  if (!dungeon || !floor) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <span className="text-gray-400">No dungeon loaded</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-dvh">
      <DungeonHUD floorNumber={dungeon.floorNumber} onReturnToTown={warpToTown} />
      <DungeonViewport floor={floor} dungeon={dungeon} />
      <EncounterGauge gauge={dungeon.encounterGauge} />
    </div>
  )
}
