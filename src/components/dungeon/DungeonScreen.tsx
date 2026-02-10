import { useMemo, useEffect } from 'react'
import { useDungeonStore } from '../../stores/dungeonStore'
import { DungeonViewport } from './DungeonViewport'
import { DungeonHUD } from './DungeonHUD'
import { EncounterGauge } from './EncounterGauge'
import { EventNotification } from './EventNotification'
import { NavigationPrompt } from './NavigationPrompt'
import { useDirectionInput } from '../../hooks/useDirectionInput'

// Simple audio notification for FOE aggro
function playAggroSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const audioContext = new AudioContextClass()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800 // High-pitched alert tone
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch {
    // Silently fail if audio context not available
  }
}

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

  // Play audio notification when FOE aggros
  useEffect(() => {
    const hasAggroEvent = lastEvents.some((e) => e.type === 'foe-aggro')
    if (hasAggroEvent) {
      playAggroSound()
    }
  }, [lastEvents])

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
