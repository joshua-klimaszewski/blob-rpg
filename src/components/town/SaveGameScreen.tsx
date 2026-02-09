import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useGuildStore } from '../../stores/guildStore';
import { collectGameState } from '../../stores/saveActions';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { getSlotIndex, saveToSlot, deleteSlot } from '../../systems/save';
import { MAX_SLOTS_PER_GUILD } from '../../types/save';

export function SaveGameScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const guildId = useGuildStore((s) => s.currentGuildId);
  const lastLoadedSlotId = useGuildStore((s) => s.lastLoadedSlotId);
  const setLastLoadedSlot = useGuildStore((s) => s.setLastLoadedSlot);

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(lastLoadedSlotId);
  const [isNewSlot, setIsNewSlot] = useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDeleteSlotId, setConfirmDeleteSlotId] = useState<string | null>(null);

  if (!guildId) {
    setScreen('town');
    return null;
  }

  const slotIndex = getSlotIndex(guildId);
  const slots = [...(slotIndex?.slots ?? [])].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
  const canCreateNew = slots.length < MAX_SLOTS_PER_GUILD;

  const handleSave = () => {
    if (!isNewSlot && selectedSlotId) {
      // Overwriting existing slot — confirm
      setConfirmOverwrite(true);
      return;
    }
    executeSave();
  };

  const executeSave = () => {
    const gameState = collectGameState();
    const slotId = isNewSlot ? null : selectedSlotId;
    const meta = saveToSlot(guildId, slotId, gameState);
    setLastLoadedSlot(meta.slotId);
    setConfirmOverwrite(false);
    setSaved(true);
    setTimeout(() => setScreen('inn'), 1200);
  };

  const handleDeleteSlot = (slotId: string) => {
    setConfirmDeleteSlotId(slotId);
  };

  const confirmDeleteSlot = () => {
    if (confirmDeleteSlotId && guildId) {
      deleteSlot(guildId, confirmDeleteSlotId);
      if (selectedSlotId === confirmDeleteSlotId) {
        setSelectedSlotId(null);
      }
      setConfirmDeleteSlotId(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (saved) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="text-2xl font-bold">Saved!</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-dvh">
      {/* Header with back button */}
      <div className="flex justify-between items-center w-full max-w-xs pt-6 px-6 pb-2">
        <h1 className="text-2xl font-bold">Save Game</h1>
        <button
          onClick={() => setScreen('inn')}
          className="min-h-touch px-3 border-2 border-ink font-bold text-sm active:bg-ink active:text-paper"
        >
          Back
        </button>
      </div>
      <div className="w-full border-b-2 border-ink" />

      <div className="flex-1 overflow-y-auto w-full flex justify-center py-6 px-6">
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {slots.map((slot) => (
            <div key={slot.slotId} className="flex gap-2">
              <button
                onClick={() => { setSelectedSlotId(slot.slotId); setIsNewSlot(false); }}
                className={`flex-1 min-h-touch border-2 px-4 py-3 text-left
                  ${selectedSlotId === slot.slotId && !isNewSlot
                    ? 'bg-ink text-paper border-ink'
                    : 'border-ink active:bg-ink active:text-paper'}
                `}
              >
                <div className="flex justify-between">
                  <span className="font-bold">Lv.{slot.summary.partyLevel}</span>
                  <span className="text-sm">{slot.summary.gold}G</span>
                </div>
                <div className="text-xs mt-1">{formatDate(slot.savedAt)}</div>
              </button>
              <button
                onClick={() => handleDeleteSlot(slot.slotId)}
                className="border-2 border-ink px-3 text-sm active:bg-ink active:text-paper"
                title="Delete slot"
              >
                X
              </button>
            </div>
          ))}

          {canCreateNew && (
            <button
              onClick={() => { setSelectedSlotId(null); setIsNewSlot(true); }}
              className={`min-h-touch border-2 px-4 py-3 font-bold border-dashed
                ${isNewSlot
                  ? 'bg-ink text-paper border-ink'
                  : 'border-ink active:bg-ink active:text-paper'}
              `}
            >
              + New Slot
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs px-6 pb-6 pt-3 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={!selectedSlotId && !isNewSlot}
          className={`min-h-touch border-2 px-4 py-3 font-bold
            ${selectedSlotId || isNewSlot
              ? 'border-ink active:bg-ink active:text-paper'
              : 'border-gray-300 text-gray-400'}
          `}
        >
          Save
        </button>
      </div>

      {confirmOverwrite && (
        <ConfirmDialog
          message="Overwrite this save slot?"
          confirmLabel="Overwrite"
          onConfirm={executeSave}
          onCancel={() => setConfirmOverwrite(false)}
        />
      )}

      {confirmDeleteSlotId && (
        <ConfirmDialog
          message="Delete this save slot? This cannot be undone."
          confirmLabel="Delete"
          onConfirm={confirmDeleteSlot}
          onCancel={() => setConfirmDeleteSlotId(null)}
        />
      )}
    </div>
  );
}
