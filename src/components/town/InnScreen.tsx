import { usePartyStore } from '../../stores/partyStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import { useGameStore } from '../../stores/gameStore';
import { calculateInnCost } from '../../systems/economy';

export function InnScreen() {
  const roster = usePartyStore((s) => s.roster);
  const restParty = usePartyStore((s) => s.restParty);
  const gold = useInventoryStore((s) => s.gold);
  const spendGold = useInventoryStore((s) => s.spendGold);
  const setScreen = useGameStore((s) => s.setScreen);

  const avgLevel = roster.length > 0
    ? Math.floor(roster.reduce((sum, m) => sum + m.level, 0) / roster.length)
    : 1;

  const fullCost = calculateInnCost(avgLevel, 1.0);
  const halfCost = calculateInnCost(avgLevel, 0.5);

  const allFull = roster.every((m) => m.hp === m.maxHp && m.tp === m.maxTp);

  const handleRest = (fraction: number, cost: number) => {
    if (spendGold(cost)) {
      restParty(fraction);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Header with back button */}
      <div className="flex justify-between items-center w-full max-w-half">
        <h1 className="text-2xl font-bold">Inn</h1>
        <button
          onClick={() => setScreen('town')}
          className="min-h-touch px-3 border-2 border-ink font-bold text-sm active:bg-ink active:text-paper"
        >
          Back
        </button>
      </div>

      <div className="text-sm font-bold">Gold: {gold}G</div>

      {/* Party HP/TP summary */}
      <div className="w-full max-w-half flex flex-col gap-2">
        {roster.map((member) => (
          <div key={member.id} className="flex items-center justify-between text-sm">
            <span className="font-bold truncate mr-2">{member.name}</span>
            <div className="flex items-center gap-3 text-xs tabular-nums">
              <span>
                HP {member.hp}/{member.maxHp}
              </span>
              <span>
                TP {member.tp}/{member.maxTp}
              </span>
            </div>
          </div>
        ))}
      </div>

      {allFull && (
        <div className="text-sm text-gray-500">Everyone is fully rested.</div>
      )}

      {/* Rest options */}
      <div className="flex flex-col gap-3 w-full max-w-half">
        <button
          onClick={() => handleRest(1.0, fullCost)}
          disabled={gold < fullCost || allFull}
          className={`min-h-touch border-2 px-4 py-3 font-bold text-left
            ${gold >= fullCost && !allFull
              ? 'border-ink active:bg-ink active:text-paper'
              : 'border-gray-300 text-gray-400'}
          `}
        >
          <div className="flex justify-between">
            <span>Full Rest</span>
            <span>{fullCost}G</span>
          </div>
          <div className="text-xs mt-1 font-normal">Restore all HP and TP</div>
        </button>

        <button
          onClick={() => handleRest(0.5, halfCost)}
          disabled={gold < halfCost || allFull}
          className={`min-h-touch border-2 px-4 py-3 font-bold text-left
            ${gold >= halfCost && !allFull
              ? 'border-ink active:bg-ink active:text-paper'
              : 'border-gray-300 text-gray-400'}
          `}
        >
          <div className="flex justify-between">
            <span>Quick Rest</span>
            <span>{halfCost}G</span>
          </div>
          <div className="text-xs mt-1 font-normal">Restore 50% HP and TP</div>
        </button>

      </div>
    </div>
  );
}
