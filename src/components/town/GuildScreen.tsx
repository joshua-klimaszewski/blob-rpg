import { useGameStore } from '../../stores/gameStore';
import { useQuestStore } from '../../stores/questStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import { usePartyStore } from '../../stores/partyStore';
import { QUESTS, getQuest } from '../../data/quests/index';
import { getEquipment } from '../../data/items/index';

export function GuildScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const activeQuests = useQuestStore((s) => s.activeQuests);
  const floorsReached = useQuestStore((s) => s.floorsReached);
  const acceptQuest = useQuestStore((s) => s.acceptQuest);
  const acceptAll = useQuestStore((s) => s.acceptAll);
  const claimQuest = useQuestStore((s) => s.claimQuest);
  const isQuestActive = useQuestStore((s) => s.isQuestActive);
  const addGold = useInventoryStore((s) => s.addGold);
  const addEquipment = useInventoryStore((s) => s.buyEquipment);
  const awardXp = usePartyStore((s) => s.awardXp);

  const handleClaim = (definitionId: string) => {
    const reward = claimQuest(definitionId);
    if (reward) {
      addGold(reward.gold);
      awardXp(reward.xp);
      if (reward.equipmentId) {
        // Add equipment without spending gold (buyEquipment with 0 cost)
        addEquipment(reward.equipmentId, 0);
      }
    }
  };

  // Filter quests by floor availability
  const availableQuests = QUESTS.filter((quest) => {
    if (!quest.requiredFloor) return true; // No floor requirement
    return floorsReached.includes(quest.requiredFloor);
  });

  // Get unaccepted quests for Accept All button
  const unacceptedQuests = availableQuests.filter((quest) => !isQuestActive(quest.id));

  const handleAcceptAll = () => {
    acceptAll(unacceptedQuests.map((q) => q.id));
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {/* Header with back button */}
      <div className="flex justify-between items-center w-full max-w-xs">
        <h1 className="text-2xl font-bold">Guild</h1>
        <button
          onClick={() => setScreen('town')}
          className="min-h-touch px-3 border-2 border-ink font-bold text-sm active:bg-ink active:text-paper"
        >
          Back
        </button>
      </div>

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
                        Claim{def.reward.equipmentId && ' +Item'}
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
        <div className="flex justify-between items-center border-b border-ink pb-1 mb-2">
          <div className="text-sm font-bold">Quest Board</div>
          {unacceptedQuests.length >= 2 && (
            <button
              onClick={handleAcceptAll}
              className="border-2 border-ink px-3 py-1 text-xs font-bold active:bg-ink active:text-paper"
            >
              Accept All
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {availableQuests.map((quest) => {
            const active = isQuestActive(quest.id);

            return (
              <div
                key={quest.id}
                className={`border-2 px-3 py-2 text-sm ${active ? 'border-gray-300 text-gray-400' : 'border-ink'}`}
              >
                <div className="font-bold">{quest.name}</div>
                <div className="text-xs mt-1">{quest.description}</div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs">
                      {quest.reward.gold}G + {quest.reward.xp}XP
                    </span>
                    {quest.reward.equipmentId && (
                      <span className="text-xs font-bold">
                        + {getEquipment(quest.reward.equipmentId)?.name}
                      </span>
                    )}
                  </div>
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
    </div>
  );
}
