import { useState, useMemo } from 'react'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useGuildStore } from '../../stores/guildStore'
import { useDungeonStore } from '../../stores/dungeonStore'
import { positionKey, getTile } from '../../systems/dungeon'
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
  const dungeon = useDungeonStore((s) => s.dungeon)
  const floor = useDungeonStore((s) => s.floor)
  const [confirmSave, setConfirmSave] = useState(false)

  const canWarp = useMemo(() => {
    if (!dungeon || !floor) return false
    const tile = getTile(floor, dungeon.playerPosition)
    if (!tile) return false
    if (tile.type === 'checkpoint' || tile.type === 'shortcut') return true
    if (positionKey(floor.playerStart) === positionKey(dungeon.playerPosition)) return true
    return false
  }, [dungeon, floor])

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
          disabled={!canWarp}
          className={`border px-3 py-1 text-sm ${
            canWarp
              ? 'border-ink active:bg-ink active:text-paper'
              : 'border-gray-300 text-gray-400'
          }`}
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
