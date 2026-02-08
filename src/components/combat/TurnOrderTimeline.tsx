import type { CombatState, CombatEntity } from '../../types/combat';
import { findEntity } from '../../systems/combat';

interface TurnOrderTimelineProps {
  combat: CombatState;
}

export function TurnOrderTimeline({ combat }: TurnOrderTimelineProps) {
  return (
    <div className="flex gap-1 overflow-x-auto px-4 py-2 border-b border-gray-200">
      {combat.turnOrder.map((entry, idx) => {
        const entity = findEntity(combat, entry.entityId);
        if (!entity) return null;

        const isCurrent = idx === combat.currentActorIndex;
        const isDead = entity.hp <= 0;

        return (
          <div
            key={entry.entityId}
            className={`
              flex-shrink-0 px-2 py-1 text-xs border rounded
              ${isCurrent ? 'bg-ink text-paper border-ink font-bold' : ''}
              ${!isCurrent && !isDead ? 'bg-paper text-ink border-gray-300' : ''}
              ${isDead ? 'bg-gray-100 text-gray-400 border-gray-200 line-through' : ''}
              ${!isCurrent && !isDead && entry.hasActed ? 'text-gray-500' : ''}
            `}
          >
            <span>{truncateName(entity)}</span>
            {entry.hasActed && !isDead && !isCurrent && (
              <span className="ml-1 text-gray-400">✓</span>
            )}
            {entry.isDefending && !isDead && (
              <span className="ml-1">⊡</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function truncateName(entity: CombatEntity): string {
  const name = entity.name;
  return name.length > 6 ? name.slice(0, 5) + '.' : name;
}
