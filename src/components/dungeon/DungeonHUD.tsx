interface DungeonHUDProps {
  floorNumber: number
  onReturnToTown: () => void
}

export function DungeonHUD({ floorNumber, onReturnToTown }: DungeonHUDProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b-2 border-ink bg-paper">
      <div className="flex items-center gap-4">
        <span className="font-bold">F{floorNumber}</span>
        <span className="text-gray-500 text-sm">Party: OK</span>
      </div>
      <button
        onClick={onReturnToTown}
        className="border border-ink px-3 py-1 text-sm active:bg-ink active:text-paper"
      >
        Town
      </button>
    </div>
  )
}
