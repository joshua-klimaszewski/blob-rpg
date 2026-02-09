import { useEffect } from 'react'
import type { DungeonEvent } from '../../types/dungeon'

interface EventNotificationProps {
  events: DungeonEvent[]
  onDismiss: () => void
}

const EVENT_MESSAGES: Record<string, string> = {
  'reached-checkpoint': 'Checkpoint reached',
  'reached-shortcut': 'Shortcut unlocked',
  // entrance and exit now show prompts instead of notifications
}

export function EventNotification({ events, onDismiss }: EventNotificationProps) {
  const visibleEvents = events.filter(e =>
    e.type === 'reached-checkpoint' ||
    e.type === 'reached-shortcut'
  )

  useEffect(() => {
    if (visibleEvents.length > 0) {
      const timer = setTimeout(onDismiss, 2000)
      return () => clearTimeout(timer)
    }
  }, [visibleEvents.length, onDismiss])

  if (visibleEvents.length === 0) return null

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
      <div className="bg-ink text-paper px-6 py-3 border-2 border-paper font-bold">
        {visibleEvents.map((event, i) => (
          <div key={i}>{EVENT_MESSAGES[event.type]}</div>
        ))}
      </div>
    </div>
  )
}
