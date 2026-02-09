import { useInventoryStore } from '../../stores/inventoryStore'
import { HelpButton } from '../help/HelpButton'

interface DungeonHUDProps {
  floorNumber: number
  onReturnToTown: () => void
}

export function DungeonHUD({ floorNumber, onReturnToTown }: DungeonHUDProps) {
  const gold = useInventoryStore((s) => s.gold)

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b-2 border-ink bg-paper">
      <div className="flex items-center gap-4">
        <span className="font-bold">F{floorNumber}</span>
        <span className="text-sm tabular-nums">{gold}G</span>
      </div>
      <div className="flex items-center gap-2">
        <HelpButton />
        <button
          onClick={onReturnToTown}
          className="border border-ink px-3 py-1 text-sm active:bg-ink active:text-paper"
        >
          Town
        </button>
      </div>
    </div>
  )
}
