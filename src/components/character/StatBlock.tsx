import type { EntityStats } from '../../types/combat';

interface StatBlockProps {
  stats: EntityStats;
  baseStats?: EntityStats;
}

const STAT_LABELS: Array<{ key: keyof EntityStats; label: string }> = [
  { key: 'str', label: 'STR' },
  { key: 'vit', label: 'VIT' },
  { key: 'int', label: 'INT' },
  { key: 'wis', label: 'WIS' },
  { key: 'agi', label: 'AGI' },
  { key: 'luc', label: 'LUC' },
];

export function StatBlock({ stats, baseStats }: StatBlockProps) {
  return (
    <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm">
      {STAT_LABELS.map(({ key, label }) => {
        const value = stats[key];
        const base = baseStats?.[key];
        const bonus = base !== undefined ? value - base : 0;

        return (
          <div key={key} className="flex justify-between tabular-nums">
            <span className="font-bold">{label}</span>
            <span>
              {value}
              {bonus > 0 && (
                <span className="text-xs text-gray-500"> (+{bonus})</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
