import type { CombatState } from '../../types/combat';

interface CombatHUDProps {
  combat: CombatState;
}

export function CombatHUD({ combat }: CombatHUDProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b-2 border-ink text-sm">
      <span>Round {combat.round}</span>
      {combat.comboCounter > 0 && (
        <span className={`font-bold ${combat.comboCounter >= 3 ? 'text-gauge-danger' : ''}`}>
          Combo x{combat.comboCounter}
        </span>
      )}
      <span className="text-gray-500">
        {combat.canFlee ? 'Can flee' : 'No escape'}
      </span>
    </div>
  );
}
