import type { PartyMemberState } from '../../types/combat';
import type { SkillDefinition, SkillCategory } from '../../types/character';
import { getSkill } from '../../data/classes/index';
import { getClass } from '../../data/classes/index';
import { canLearnSkill } from '../../systems/character';

interface SkillTreeProps {
  member: PartyMemberState;
  onInvest: (skillId: string) => void;
}

/** Category display order and labels */
const CATEGORY_ORDER: SkillCategory[] = ['core', 'active', 'passive', 'synergy', 'ultimate'];
const CATEGORY_LABELS: Record<SkillCategory, string> = {
  core: 'CORE',
  active: 'ACTIVE',
  passive: 'PASSIVE',
  synergy: 'SYNERGY',
  ultimate: 'ULTIMATE',
};

function SkillCard({
  skill,
  learned,
  canLearn: canLearnResult,
  isCore,
  onInvest,
}: {
  skill: SkillDefinition;
  learned: boolean;
  canLearn: { canLearn: boolean; reason?: string };
  isCore: boolean;
  onInvest: (id: string) => void;
}) {
  return (
    <div
      className={`border-2 px-3 py-2 text-sm ${
        isCore ? 'border-4' : ''
      } ${
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
                ${canLearnResult.canLearn
                  ? 'border-current active:bg-paper active:text-ink'
                  : 'border-gray-300 text-gray-400'}
              `}
              disabled={!canLearnResult.canLearn}
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
}

export function SkillTree({ member, onInvest }: SkillTreeProps) {
  const classData = getClass(member.classId);
  const allSkills = classData.skillIds
    .map((id) => getSkill(id))
    .filter((s): s is SkillDefinition => s !== undefined);

  // Check if skills have category data — fallback to flat list if not
  const hasCategories = allSkills.some((s) => s.category !== undefined);

  if (!hasCategories) {
    // Flat list fallback
    return (
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-bold">Skills</span>
          <span className="tabular-nums">SP: {member.skillPoints}</span>
        </div>
        {allSkills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            learned={member.learnedSkills.includes(skill.id)}
            canLearn={canLearnSkill(member, skill)}
            isCore={false}
            onInvest={onInvest}
          />
        ))}
      </div>
    );
  }

  // Group skills by category
  const grouped = new Map<SkillCategory, SkillDefinition[]>();
  for (const cat of CATEGORY_ORDER) {
    grouped.set(cat, []);
  }
  for (const skill of allSkills) {
    const cat = skill.category ?? 'active';
    grouped.get(cat)!.push(skill);
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-bold">Skills</span>
        <span className="tabular-nums">SP: {member.skillPoints}</span>
      </div>

      {CATEGORY_ORDER.map((cat, catIdx) => {
        const skills = grouped.get(cat)!;
        if (skills.length === 0) return null;
        const isLast = catIdx === CATEGORY_ORDER.length - 1 ||
          CATEGORY_ORDER.slice(catIdx + 1).every((c) => (grouped.get(c)?.length ?? 0) === 0);

        return (
          <div key={cat}>
            {/* Category label */}
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1 mt-1">
              {CATEGORY_LABELS[cat]}
            </div>

            {/* Skills in this category */}
            <div className="flex flex-col gap-1">
              {skills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  learned={member.learnedSkills.includes(skill.id)}
                  canLearn={canLearnSkill(member, skill)}
                  isCore={cat === 'core'}
                  onInvest={onInvest}
                />
              ))}
            </div>

            {/* Connector line between sections */}
            {!isLast && (
              <div className="flex justify-center py-1">
                <div className="w-px h-3 bg-gray-300" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
