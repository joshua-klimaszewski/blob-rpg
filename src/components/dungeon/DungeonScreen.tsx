import { useMemo } from 'react'
import { useDungeonStore } from '../../stores/dungeonStore'
import { DungeonViewport } from './DungeonViewport'
import { DungeonHUD } from './DungeonHUD'
import { EncounterGauge } from './EncounterGauge'
import { EventNotification } from './EventNotification'
import { NavigationPrompt } from './NavigationPrompt'
import { useDirectionInput } from '../../hooks/useDirectionInput'

export function DungeonScreen() {
  const dungeon = useDungeonStore((s) => s.dungeon)
  const floor = useDungeonStore((s) => s.floor)
  const enterDungeon = useDungeonStore((s) => s.enterDungeon)
  const warpToTown = useDungeonStore((s) => s.warpToTown)
  const saveAndQuit = useDungeonStore((s) => s.saveAndQuit)
  const move = useDungeonStore((s) => s.move)
  const lastEvents = useDungeonStore((s) => s.lastEvents)
  const clearEvents = useDungeonStore((s) => s.clearEvents)

  // Derive which navigation prompt to show from events (no useState needed)
  const showNavigationPrompt = useMemo(() => {
    const hasEntranceEvent = lastEvents.some((e) => e.type === 'reached-entrance')
    const hasExitEvent = lastEvents.some((e) => e.type === 'reached-exit')

    if (hasEntranceEvent) return 'entrance'
    if (hasExitEvent) return 'exit'
    return null
  }, [lastEvents])

  // Wrap move to prevent input when prompt is showing
  const handleMove = (dir: typeof move extends (arg: infer D) => void ? D : never) => {
    if (!showNavigationPrompt) {
      move(dir)
    }
  }

  useDirectionInput(handleMove)

  const handleNextFloor = () => {
    if (!floor?.nextFloorId) return
    clearEvents() // Clearing events will hide the prompt
    enterDungeon(floor.nextFloorId)
  }

  const handleReturnToTown = () => {
    clearEvents() // Clearing events will hide the prompt
    warpToTown()
  }

  const handleCancelNavigation = () => {
    clearEvents() // Clearing events will hide the prompt
  }

  if (!dungeon || !floor) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <span className="text-gray-400">No dungeon loaded</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-dvh relative">
      <DungeonHUD floorNumber={dungeon.floorNumber} onReturnToTown={warpToTown} onSaveAndQuit={saveAndQuit} />
      <DungeonViewport floor={floor} dungeon={dungeon} />
      <EncounterGauge gauge={dungeon.encounterGauge} />
      <EventNotification events={lastEvents} onDismiss={clearEvents} />
      {showNavigationPrompt && (
        <NavigationPrompt
          type={showNavigationPrompt}
          onReturnToTown={handleReturnToTown}
          onNextFloor={showNavigationPrompt === 'exit' ? handleNextFloor : undefined}
          onCancel={handleCancelNavigation}
        />
      )}
    </div>
  )
}
