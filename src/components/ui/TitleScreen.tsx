import { useGameStore } from '../../stores/gameStore';
import { usePartyStore } from '../../stores/partyStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import { useQuestStore } from '../../stores/questStore';
import { hasSaveData, clearAllSaves } from '../../systems/save';

export function TitleScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const initializeRoster = usePartyStore((s) => s.initializeRoster);
  const roster = usePartyStore((s) => s.roster);

  const saveExists = hasSaveData() && roster.length > 0;

  const handleContinue = () => {
    setScreen('town');
  };

  const handleNewGame = () => {
    clearAllSaves();
    usePartyStore.setState({ roster: [], activePartyIds: [] });
    useInventoryStore.getState().reset();
    useQuestStore.getState().reset();
    initializeRoster();
    setScreen('town');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh gap-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Blob RPG</h1>
        <div className="text-sm text-gray-500">A dungeon crawling adventure</div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {saveExists && (
          <button
            onClick={handleContinue}
            className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
          >
            Continue
          </button>
        )}

        <button
          onClick={handleNewGame}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
