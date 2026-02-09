import type { SkillDefinition } from '../../types/character';
import type { CombatEntity } from '../../types/combat';
import { canUseSkill } from '../../systems/combat';

interface SkillListProps {
  actor: CombatEntity;
  skills: SkillDefinition[];
  onSelect: (skill: SkillDefinition) => void;
  onCancel: () => void;
}

export function SkillList({ actor, skills, onSelect, onCancel }: SkillListProps) {
  return (
    <div className="px-4 py-3 border-t-2 border-ink bg-paper">
      <div className="text-center text-sm font-bold mb-2">Skills</div>
      <div className="flex flex-col gap-1 max-w-xs mx-auto max-h-40 overflow-y-auto">
        {skills.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-2">No skills learned</div>
        )}
        {skills.map((skill) => {
          const check = canUseSkill(actor, skill);
          const disabled = !check.canUse;

          return (
            <button
              key={skill.id}
              type="button"
              className={`min-h-touch border-2 px-3 py-2 text-left text-sm
                ${disabled ? 'border-gray-300 text-gray-400' : 'border-ink active:bg-ink active:text-paper'}
              `}
              disabled={disabled}
              onClick={() => onSelect(skill)}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold">{skill.name}</span>
                <span className="text-xs tabular-nums">{skill.tpCost} TP</span>
              </div>
              <div className="text-xs text-gray-500 truncate">{skill.description}</div>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="w-full min-h-touch border-2 border-ink font-bold text-sm mt-2 active:bg-ink active:text-paper"
        onClick={onCancel}
      >
        Back
      </button>
    </div>
  );
}
