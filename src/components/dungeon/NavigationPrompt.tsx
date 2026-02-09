interface NavigationPromptProps {
  type: 'entrance' | 'exit'
  onReturnToTown: () => void
  onNextFloor?: () => void
  onCancel: () => void
}

/**
 * Modal prompt for dungeon navigation tiles (entrance/exit).
 * - Entrance: "Return to Town" / "Cancel"
 * - Exit: "Next Floor" / "Return to Town" / "Cancel"
 */
export function NavigationPrompt({
  type,
  onReturnToTown,
  onNextFloor,
  onCancel,
}: NavigationPromptProps) {
  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
      <div className="bg-paper border-2 border-ink max-w-sm w-full">
        {/* Header */}
        <div className="border-b-2 border-ink px-4 py-3">
          <h2 className="font-bold text-lg">
            {type === 'entrance' ? 'Floor Entrance' : 'Floor Exit'}
          </h2>
        </div>

        {/* Content */}
        <div className="px-4 py-3 text-sm">
          {type === 'entrance'
            ? 'Return to town or continue exploring?'
            : 'Proceed to the next floor or return to town?'}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 p-4">
          {type === 'exit' && onNextFloor && (
            <button
              onClick={onNextFloor}
              className="min-h-touch border-2 border-ink px-4 py-3 font-bold bg-ink text-paper active:bg-paper active:text-ink"
            >
              Next Floor
            </button>
          )}
          <button
            onClick={onReturnToTown}
            className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
          >
            Return to Town
          </button>
          <button
            onClick={onCancel}
            className="min-h-touch border-2 border-gray-400 px-4 py-3 font-bold text-gray-600 active:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
