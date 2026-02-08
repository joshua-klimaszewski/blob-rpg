import type { BindState, AilmentState } from '../../types/combat';

interface StatusIconProps {
  binds: BindState;
  ailments: AilmentState;
}

const BIND_ICONS: Record<string, string> = {
  head: 'H',
  arm: 'A',
  leg: 'L',
};

const AILMENT_ICONS: Record<string, string> = {
  poison: 'P',
  paralyze: 'Z',
  sleep: 'S',
  blind: 'B',
};

export function StatusIcon({ binds, ailments }: StatusIconProps) {
  const activeBinds = Object.entries(binds).filter(([, turns]) => turns > 0);
  const activeAilments = Object.entries(ailments).filter(([, data]) => data !== null);

  if (activeBinds.length === 0 && activeAilments.length === 0) return null;

  return (
    <div className="flex gap-0.5 flex-wrap justify-center">
      {activeBinds.map(([type]) => (
        <span
          key={type}
          className="inline-block w-4 h-4 text-[9px] leading-4 text-center bg-ink text-paper rounded-sm"
          title={`${type} bind`}
        >
          {BIND_ICONS[type]}
        </span>
      ))}
      {activeAilments.map(([type]) => (
        <span
          key={type}
          className="inline-block w-4 h-4 text-[9px] leading-4 text-center border border-ink rounded-sm"
          title={type}
        >
          {AILMENT_ICONS[type]}
        </span>
      ))}
    </div>
  );
}
