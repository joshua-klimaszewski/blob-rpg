import { useState } from 'react';
import type { EquipmentSlot } from '../../types/character';
import { usePartyStore } from '../../stores/partyStore';
import { useGameStore } from '../../stores/gameStore';
import { getClass } from '../../data/classes/index';
import { xpForLevel } from '../../systems/character';
import { StatBlock } from './StatBlock';
import { EquipmentSlots } from './EquipmentSlots';
import { EquipmentPicker } from './EquipmentPicker';
import { SkillTree } from './SkillTree';


export function CharacterSheet() {
  const roster = usePartyStore((s) => s.roster);
  const investSkillPoint = usePartyStore((s) => s.investSkillPoint);
  const setScreen = useGameStore((s) => s.setScreen);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [pickerSlot, setPickerSlot] = useState<EquipmentSlot | null>(null);
  const member = roster[selectedIdx];

  if (!member) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <p className="text-gray-600">No roster initialized</p>
        <button
          type="button"
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
          onClick={() => setScreen('town')}
        >
          Back to Town
        </button>
      </div>
    );
  }

  const classData = getClass(member.classId);
  const nextLevelXp = xpForLevel(member.level + 1);

  return (
    <div className="flex flex-col min-h-dvh bg-paper">
      {/* Header */}
      <div className="px-4 py-3 border-b-2 border-ink flex justify-between items-center">
        <h1 className="text-lg font-bold">Character</h1>
        <button
          type="button"
          className="min-h-touch px-3 border-2 border-ink font-bold text-sm active:bg-ink active:text-paper"
          onClick={() => setScreen('town')}
        >
          Back
        </button>
      </div>

      {/* Character selector tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {roster.map((m, idx) => (
          <button
            key={m.id}
            type="button"
            className={`flex-shrink-0 px-3 py-2 text-sm font-bold border-b-2
              ${idx === selectedIdx ? 'border-ink' : 'border-transparent text-gray-400'}
            `}
            onClick={() => setSelectedIdx(idx)}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Name, class, level */}
        <div>
          <div className="text-lg font-bold">{member.name}</div>
          <div className="text-sm text-gray-500">
            {classData.name} — {classData.role}
          </div>
          <div className="text-sm mt-1">
            <span className="font-bold">Lv. {member.level}</span>
            <span className="text-gray-500 ml-2 tabular-nums">
              XP: {member.xp} / {nextLevelXp}
            </span>
          </div>
          <div className="flex gap-4 mt-1 text-sm tabular-nums">
            <span>
              HP: {member.hp}/{member.maxHp}
            </span>
            <span>
              TP: {member.tp}/{member.maxTp}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div>
          <div className="text-sm font-bold mb-1">Stats</div>
          <StatBlock stats={member.stats} baseStats={member.baseStats} />
        </div>

        {/* Equipment */}
        <div>
          <div className="text-sm font-bold mb-1">Equipment</div>
          <EquipmentSlots
            equipment={member.equipment}
            onSlotTap={(slot) => setPickerSlot(pickerSlot === slot ? null : slot)}
          />
          {pickerSlot && (
            <div className="mt-1">
              <EquipmentPicker
                memberId={member.id}
                slot={pickerSlot}
                currentItemId={member.equipment[pickerSlot]}
                onClose={() => setPickerSlot(null)}
              />
            </div>
          )}
        </div>

        {/* Skills */}
        <SkillTree
          member={member}
          onInvest={(skillId) => investSkillPoint(member.id, skillId)}
        />
      </div>
    </div>
  );
}
