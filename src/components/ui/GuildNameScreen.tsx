import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useGuildStore } from '../../stores/guildStore';
import { usePartyStore } from '../../stores/partyStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import { useQuestStore } from '../../stores/questStore';
import { createGuild } from '../../systems/save';
import { resetAllStores } from '../../stores/saveActions';

export function GuildNameScreen() {
  const [name, setName] = useState('');
  const setScreen = useGameStore((s) => s.setScreen);

  const handleBegin = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    resetAllStores();

    const guild = createGuild(trimmed);
    useGuildStore.getState().setActiveGuild(guild.id, guild.name);
    usePartyStore.getState().initializeRoster();
    useInventoryStore.setState({
      gold: 0,
      materials: {},
      soldMaterials: {},
      consumables: {},
      ownedEquipment: [],
    });
    useQuestStore.setState({ activeQuests: [] });

    setScreen('town');
  };

  return (
    <div className="flex flex-col min-h-dvh p-6">
      {/* Header with back button */}
      <div className="flex justify-between items-center w-full max-w-half mx-auto">
        <h1 className="text-2xl font-bold">Name Your Guild</h1>
        <button
          onClick={() => setScreen('title')}
          className="min-h-touch px-3 border-2 border-ink font-bold text-sm active:bg-ink active:text-paper"
        >
          Back
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        <div className="w-full max-w-half">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBegin()}
            maxLength={20}
            placeholder="Guild name..."
            autoFocus
            className="w-full min-h-touch border-2 border-ink px-4 py-3 font-mono text-center bg-paper text-ink focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>

        <div className="w-full max-w-half">
          <button
            onClick={handleBegin}
            disabled={!name.trim()}
            className={`w-full min-h-touch border-2 px-4 py-3 font-bold
              ${name.trim()
                ? 'border-ink active:bg-ink active:text-paper'
                : 'border-gray-300 text-gray-400'}
            `}
          >
            Begin
          </button>
        </div>
      </div>
    </div>
  );
}
