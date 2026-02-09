import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useQuestStore } from '../../stores/questStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import { usePartyStore } from '../../stores/partyStore';
import { QUESTS, getQuest } from '../../data/quests/index';
import { getEquipment } from '../../data/items/index';

interface ClaimedRewardInfo {
  gold: number;
  xp: number;
  equipmentName?: string;
}

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

  const [claimedRewards, setClaimedRewards] = useState<Record<string, ClaimedRewardInfo>>({});

  const handleClaim = (definitionId: string) => {
    const reward = claimQuest(definitionId);
    if (reward) {
      addGold(reward.gold);
      awardXp(reward.xp);
      if (reward.equipmentId) {
        addEquipment(reward.equipmentId, 0);
      }
      setClaimedRewards((prev) => ({
        ...prev,
        [definitionId]: {
          gold: reward.gold,
          xp: reward.xp,
          equipmentName: reward.equipmentId
            ? getEquipment(reward.equipmentId)?.name
            : undefined,
        },
      }));
    }
  };

  // Filter quests by floor availability
  const availableQuests = QUESTS.filter((quest) => {
    if (!quest.requiredFloor) return true; // No floor requirement
    return floorsReached.includes(quest.requiredFloor);
  });

  // Get unaccepted quests for Accept All button
  const unacceptedQuests = availableQuests.filter((quest) => !isQuestActive(quest.id));

  const unclaimedQuests = activeQuests.filter((q) => !q.claimed);
  const claimedQuests = activeQuests.filter((q) => q.claimed);

  const handleAcceptAll = () => {
    acceptAll(unacceptedQuests.map((q) => q.id));
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      {/* Header with back button */}
      <div className="flex justify-between items-center w-full max-w-half">
        <h1 className="text-2xl font-bold">Quests</h1>
        <button
          onClick={() => setScreen('town')}
          className="min-h-touch px-3 border-2 border-ink font-bold text-sm active:bg-ink active:text-paper"
        >
          Back
        </button>
      </div>

      {/* Active quests (unclaimed) */}
      {unclaimedQuests.length > 0 && (
        <div className="w-full max-w-half">
          <div className="text-sm font-bold border-b border-ink pb-1 mb-2">Active Quests</div>
          <div className="flex flex-col gap-2">
            {unclaimedQuests.map((quest) => {
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
                  <div className="text-xs mt-1">
                    <span>{def.reward.gold}G + {def.reward.xp}XP</span>
                    {def.reward.equipmentId && (
                      <span className="font-bold"> + {getEquipment(def.reward.equipmentId)?.name}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs tabular-nums">
                      Progress: {Math.min(quest.progress, target)}/{target}
                    </span>
                    {quest.completed ? (
                      <button
                        onClick={() => handleClaim(quest.definitionId)}
                        className="border-2 border-ink px-3 py-1 text-xs font-bold bg-ink text-paper active:bg-paper active:text-ink"
                      >
                        Claim{def.reward.equipmentId && ' +Item'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">In progress</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Claimed quests */}
      {claimedQuests.length > 0 && (
        <div className="w-full max-w-half">
          <div className="text-sm font-bold border-b border-ink pb-1 mb-2">Claimed</div>
          <div className="flex flex-col gap-2">
            {claimedQuests.map((quest) => {
              const def = getQuest(quest.definitionId);
              if (!def) return null;

              const rewards = claimedRewards[quest.definitionId];

              return (
                <div
                  key={quest.definitionId}
                  className="border-2 border-gray-300 px-3 py-2 text-sm text-gray-400"
                >
                  <div className="font-bold">{def.name}</div>
                  {rewards ? (
                    <div className="text-xs font-bold mt-1">
                      <span>+{rewards.gold}G  +{rewards.xp}XP</span>
                      {rewards.equipmentName && (
                        <span> + {rewards.equipmentName}</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs mt-1">Claimed</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available quests */}
      <div className="w-full max-w-half">
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
