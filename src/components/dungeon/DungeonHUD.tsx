import { useState } from 'react'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useGuildStore } from '../../stores/guildStore'
import { HelpButton } from '../help/HelpButton'
import { ConfirmDialog } from '../ui/ConfirmDialog'

interface DungeonHUDProps {
  floorNumber: number
  onReturnToTown: () => void
  onSaveAndQuit: () => void
}

export function DungeonHUD({ floorNumber, onReturnToTown, onSaveAndQuit }: DungeonHUDProps) {
  const gold = useInventoryStore((s) => s.gold)
  const guildId = useGuildStore((s) => s.currentGuildId)
  const [confirmSave, setConfirmSave] = useState(false)

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b-2 border-ink bg-paper">
      <div className="flex items-center gap-4">
        <span className="font-bold">F{floorNumber}</span>
        <span className="text-sm tabular-nums">{gold}G</span>
      </div>
      <div className="flex items-center gap-2">
        <HelpButton />
        {guildId && (
          <button
            onClick={() => setConfirmSave(true)}
            className="border border-ink px-3 py-1 text-sm active:bg-ink active:text-paper"
          >
            Save
          </button>
        )}
        <button
          onClick={onReturnToTown}
          className="border border-ink px-3 py-1 text-sm active:bg-ink active:text-paper"
        >
          Town
        </button>
      </div>
      {confirmSave && (
        <ConfirmDialog
          message="Save and quit to title? Your dungeon progress will be preserved."
          confirmLabel="Save & Quit"
          onConfirm={() => {
            setConfirmSave(false)
            onSaveAndQuit()
          }}
          onCancel={() => setConfirmSave(false)}
        />
      )}
    </div>
  )
}
