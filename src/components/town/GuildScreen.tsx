import { useGameStore } from '../../stores/gameStore';
import { useQuestStore } from '../../stores/questStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import { usePartyStore } from '../../stores/partyStore';
import { QUESTS, getQuest } from '../../data/quests/index';

export function GuildScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const activeQuests = useQuestStore((s) => s.activeQuests);
  const acceptQuest = useQuestStore((s) => s.acceptQuest);
  const claimQuest = useQuestStore((s) => s.claimQuest);
  const isQuestActive = useQuestStore((s) => s.isQuestActive);
  const addGold = useInventoryStore((s) => s.addGold);
  const awardXp = usePartyStore((s) => s.awardXp);

  const handleClaim = (definitionId: string) => {
    const reward = claimQuest(definitionId);
    if (reward) {
      addGold(reward.gold);
      awardXp(reward.xp);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold border-b-2 border-ink pb-2">Guild</h1>

      {/* Active quests */}
      {activeQuests.length > 0 && (
        <div className="w-full max-w-xs">
          <div className="text-sm font-bold border-b border-ink pb-1 mb-2">Active Quests</div>
          <div className="flex flex-col gap-2">
            {activeQuests.map((quest) => {
              const def = getQuest(quest.definitionId);
              if (!def) return null;

              const target = def.objective.type === 'explore' ? 1 : def.objective.count;

              return (
                <div
                  key={quest.definitionId}
                  className="border-2 border-ink px-3 py-2 text-sm"
                >
                  <div className="font-bold">{def.name}</div>
                  <div className="text-xs mt-1">{def.description}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs tabular-nums">
                      Progress: {Math.min(quest.progress, target)}/{target}
                    </span>
                    {quest.completed && !quest.claimed && (
                      <button
                        onClick={() => handleClaim(quest.definitionId)}
                        className="border-2 border-ink px-3 py-1 text-xs font-bold bg-ink text-paper active:bg-paper active:text-ink"
                      >
                        Claim ({def.reward.gold}G + {def.reward.xp}XP)
                      </button>
                    )}
                    {quest.claimed && (
                      <span className="text-xs text-gray-500">Claimed</span>
                    )}
                    {!quest.completed && (
                      <span className="text-xs text-gray-500">In progress</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available quests */}
      <div className="w-full max-w-xs">
        <div className="text-sm font-bold border-b border-ink pb-1 mb-2">Quest Board</div>
        <div className="flex flex-col gap-2">
          {QUESTS.map((quest) => {
            const active = isQuestActive(quest.id);

            return (
              <div
                key={quest.id}
                className={`border-2 px-3 py-2 text-sm ${active ? 'border-gray-300 text-gray-400' : 'border-ink'}`}
              >
                <div className="font-bold">{quest.name}</div>
                <div className="text-xs mt-1">{quest.description}</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs">
                    Reward: {quest.reward.gold}G + {quest.reward.xp}XP
                  </span>
                  {!active ? (
                    <button
                      onClick={() => acceptQuest(quest.id)}
                      className="border-2 border-ink px-3 py-1 text-xs font-bold active:bg-ink active:text-paper"
                    >
                      Accept
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">Accepted</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => setScreen('town')}
        className="min-h-touch border-2 border-ink px-4 py-3 font-bold w-full max-w-xs active:bg-ink active:text-paper"
      >
        Back
      </button>
    </div>
  );
}
