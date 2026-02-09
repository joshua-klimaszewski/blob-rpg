import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { loadGameState, loadSuspendState } from '../../stores/saveActions';
import { ConfirmDialog } from './ConfirmDialog';
import {
  getRegistry,
  getSlotIndex,
  loadSlot,
  loadAndDeleteSuspend,
  deleteGuild,
} from '../../systems/save';
import type { GuildEntry, SlotMeta } from '../../types/save';

export function LoadGameScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const [selectedGuild, setSelectedGuild] = useState<GuildEntry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<GuildEntry | null>(null);

  const registry = getRegistry();

  const handleSelectGuild = (guild: GuildEntry) => {
    setSelectedGuild(guild);
  };

  const handleLoadSlot = (guild: GuildEntry, slot: SlotMeta) => {
    const save = loadSlot(guild.id, slot.slotId);
    if (save) {
      loadGameState(save);
    }
  };

  const handleLoadSuspend = (guild: GuildEntry) => {
    const save = loadAndDeleteSuspend(guild.id);
    if (save) {
      loadSuspendState(save);
    }
  };

  const handleDeleteGuild = (guild: GuildEntry) => {
    setConfirmDelete(guild);
  };

  const confirmDeleteGuild = () => {
    if (confirmDelete) {
      deleteGuild(confirmDelete.id);
      setConfirmDelete(null);
      setSelectedGuild(null);
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

  // Guild detail view
  if (selectedGuild) {
    const slotIndex = getSlotIndex(selectedGuild.id);
    const slots = [...(slotIndex?.slots ?? [])].sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );

    return (
      <div className="flex flex-col items-center h-dvh">
        <h1 className="text-2xl font-bold border-b-2 border-ink pb-2 pt-6 px-6">
          {selectedGuild.name}
        </h1>

        <div className="flex-1 overflow-y-auto w-full flex justify-center py-6 px-6">
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {/* Suspend save (if exists) */}
            {selectedGuild.hasSuspendSave && (
              <button
                onClick={() => handleLoadSuspend(selectedGuild)}
                className="min-h-touch border-2 border-ink px-4 py-3 text-left active:bg-ink active:text-paper"
              >
                <div className="font-bold">[!] Resume Dungeon</div>
                <div className="text-xs mt-1">
                  Suspended save — will be deleted on load
                </div>
              </button>
            )}

            {/* Save slots */}
            {slots.map((slot) => (
              <button
                key={slot.slotId}
                onClick={() => handleLoadSlot(selectedGuild, slot)}
                className="min-h-touch border-2 border-ink px-4 py-3 text-left active:bg-ink active:text-paper"
              >
                <div className="flex justify-between">
                  <span className="font-bold">Lv.{slot.summary.partyLevel}</span>
                  <span className="text-sm">{slot.summary.gold}G</span>
                </div>
                <div className="text-xs mt-1">{formatDate(slot.savedAt)}</div>
              </button>
            ))}

            {slots.length === 0 && !selectedGuild.hasSuspendSave && (
              <div className="text-sm text-gray-500 text-center py-4">
                No save slots found.
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs px-6 pb-6 pt-3 border-t border-gray-200">
          <button
            onClick={() => handleDeleteGuild(selectedGuild)}
            className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
          >
            Delete Guild
          </button>
          <button
            onClick={() => setSelectedGuild(null)}
            className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
          >
            Back
          </button>
        </div>

        {confirmDelete && (
          <ConfirmDialog
            message={`Delete "${confirmDelete.name}" and all save data? This cannot be undone.`}
            confirmLabel="Delete"
            onConfirm={confirmDeleteGuild}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </div>
    );
  }

  // Guild list view
  return (
    <div className="flex flex-col items-center h-dvh">
      <h1 className="text-2xl font-bold border-b-2 border-ink pb-2 pt-6 px-6">Load Game</h1>

      <div className="flex-1 overflow-y-auto w-full flex justify-center py-6 px-6">
        <div className="flex flex-col gap-3 w-full max-w-xs">
          {registry.guilds.map((guild) => (
            <button
              key={guild.id}
              onClick={() => handleSelectGuild(guild)}
              className="min-h-touch border-2 border-ink px-4 py-3 text-left active:bg-ink active:text-paper"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold">{guild.name}</span>
                {guild.hasSuspendSave && (
                  <span className="text-xs border border-ink px-1">[!]</span>
                )}
              </div>
              <div className="text-xs mt-1">
                {guild.slotCount} save{guild.slotCount !== 1 ? 's' : ''} · Last played {formatDate(guild.lastPlayedAt)}
              </div>
            </button>
          ))}

          {registry.guilds.length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4">
              No saved games found.
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-xs px-6 pb-6 pt-3 border-t border-gray-200">
        <button
          onClick={() => setScreen('title')}
          className="w-full min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Back
        </button>
      </div>
    </div>
  );
}
