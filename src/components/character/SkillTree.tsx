import type { PartyMemberState } from '../../types/combat';
import type { SkillDefinition } from '../../types/character';
import { getSkill } from '../../data/classes/index';
import { getClass } from '../../data/classes/index';
import { canLearnSkill } from '../../systems/character';

interface SkillTreeProps {
  member: PartyMemberState;
  onInvest: (skillId: string) => void;
}

export function SkillTree({ member, onInvest }: SkillTreeProps) {
  const classData = getClass(member.classId);
  const allSkills = classData.skillIds
    .map((id) => getSkill(id))
    .filter((s): s is SkillDefinition => s !== undefined);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-bold">Skills</span>
        <span className="tabular-nums">SP: {member.skillPoints}</span>
      </div>
      {allSkills.map((skill) => {
        const learned = member.learnedSkills.includes(skill.id);
        const check = canLearnSkill(member, skill);

        return (
          <div
            key={skill.id}
            className={`border-2 px-3 py-2 text-sm ${
              learned ? 'border-ink bg-ink text-paper' : 'border-ink'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold">{skill.name}</span>
                {skill.isPassive && (
                  <span className="text-xs ml-1">[P]</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!skill.isPassive && (
                  <span className="text-xs tabular-nums">{skill.tpCost} TP</span>
                )}
                {learned ? (
                  <span className="text-xs">Learned</span>
                ) : (
                  <button
                    type="button"
                    className={`px-2 py-1 border text-xs font-bold
                      ${check.canLearn
                        ? 'border-current active:bg-paper active:text-ink'
                        : 'border-gray-300 text-gray-400'}
                    `}
                    disabled={!check.canLearn}
                    onClick={() => onInvest(skill.id)}
                  >
                    Learn ({skill.skillPointCost} SP)
                  </button>
                )}
              </div>
            </div>
            <div className={`text-xs mt-1 ${learned ? 'text-gray-300' : 'text-gray-500'}`}>
              {skill.description}
              {!learned && skill.levelRequired > 1 && (
                <span className="ml-1">(Lv.{skill.levelRequired})</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
