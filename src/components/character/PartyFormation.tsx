import { usePartyStore } from '../../stores/partyStore';
import { useGameStore } from '../../stores/gameStore';
import { getClass } from '../../data/classes/index';

export function PartyFormation() {
  const roster = usePartyStore((s) => s.roster);
  const activePartyIds = usePartyStore((s) => s.activePartyIds);
  const setActiveParty = usePartyStore((s) => s.setActiveParty);
  const setScreen = useGameStore((s) => s.setScreen);

  const toggleMember = (memberId: string) => {
    if (activePartyIds.includes(memberId)) {
      // Remove from active (minimum 1)
      if (activePartyIds.length <= 1) return;
      setActiveParty(activePartyIds.filter((id) => id !== memberId));
    } else {
      // Add to active (maximum 4)
      if (activePartyIds.length >= 4) return;
      setActiveParty([...activePartyIds, memberId]);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-paper max-w-half mx-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b-2 border-ink flex justify-between items-center">
        <h1 className="text-lg font-bold">Party Formation</h1>
        <button
          type="button"
          className="min-h-touch px-3 border-2 border-ink font-bold text-sm active:bg-ink active:text-paper"
          onClick={() => setScreen('town')}
        >
          Back
        </button>
      </div>

      {/* Instructions */}
      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-200">
        Tap to toggle. {activePartyIds.length}/4 active members.
      </div>

      {/* Member list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {roster.map((member) => {
          const isActive = activePartyIds.includes(member.id);
          const classData = getClass(member.classId);

          return (
            <button
              key={member.id}
              type="button"
              className={`w-full min-h-touch border-2 px-3 py-3 text-left
                ${isActive ? 'border-ink bg-ink text-paper' : 'border-ink'}
              `}
              onClick={() => toggleMember(member.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">{member.name}</div>
                  <div className={`text-xs ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                    {classData.name} — {classData.role} — Lv.{member.level}
                  </div>
                </div>
                <div className={`text-sm tabular-nums ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                  {member.hp}/{member.maxHp} HP
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
