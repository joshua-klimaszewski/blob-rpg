import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { hasAnyGuilds, hasLegacySaveData, migrateLegacySaves } from '../../systems/save';
import { MAX_GUILDS } from '../../types/save';
import { getRegistry } from '../../systems/save';

export function TitleScreen() {
  const setScreen = useGameStore((s) => s.setScreen);

  // Auto-migrate legacy saves once (synchronous localStorage work, safe in initializer)
  const [migrated] = useState(() => {
    if (hasLegacySaveData()) {
      migrateLegacySaves();
      return true;
    }
    return false;
  });

  const guildsExist = hasAnyGuilds();
  const registry = getRegistry();
  const canCreateNew = registry.guilds.length < MAX_GUILDS;

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Blob RPG</h1>
        <div className="text-sm text-gray-500">A dungeon crawling adventure</div>
      </div>

      {migrated && (
        <div className="text-xs text-center border border-ink px-3 py-2 max-w-xs">
          Legacy save data migrated to &quot;Legacy Guild&quot;
        </div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {canCreateNew && (
          <button
            onClick={() => setScreen('guild-name')}
            className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
          >
            New Game
          </button>
        )}

        {guildsExist && (
          <button
            onClick={() => setScreen('load-game')}
            className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
          >
            Load Game
          </button>
        )}
      </div>
    </div>
  );
}
