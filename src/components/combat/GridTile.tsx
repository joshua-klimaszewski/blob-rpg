import type { GridPosition, HazardType, CombatEntity } from '../../types/combat';
import { StatusIcon } from './StatusIcon';
import { DamageNumber } from './DamageNumber';

interface DamageDisplay {
  id: string;
  damage: number;
  isCrit: boolean;
}

interface GridTileProps {
  position: GridPosition;
  entities: CombatEntity[];
  hazard: HazardType | null;
  isSelected: boolean;
  damages: DamageDisplay[];
  onSelect: (position: GridPosition) => void;
  onDamageComplete: (id: string) => void;
}

const HAZARD_LABEL: Record<HazardType, string> = {
  spike: '▲',
  web: '▽',
  fire: '~',
};

export function GridTile({
  position,
  entities,
  hazard,
  isSelected,
  damages,
  onSelect,
  onDamageComplete,
}: GridTileProps) {
  const aliveEntities = entities.filter((e) => e.hp > 0);
  const isEmpty = aliveEntities.length === 0;

  return (
    <button
      type="button"
      className={`
        relative min-h-touch min-w-touch border-2 flex flex-col items-center justify-center p-1 text-xs
        transition-colors duration-100
        ${isSelected ? 'bg-ink text-paper border-ink' : ''}
        ${!isSelected && !isEmpty ? 'bg-paper text-ink border-ink' : ''}
        ${!isSelected && isEmpty ? 'bg-gray-100 text-gray-400 border-gray-300' : ''}
      `}
      onClick={() => onSelect(position)}
      disabled={isEmpty}
    >
      {aliveEntities.length === 1 && (
        <>
          <span className="font-bold truncate max-w-full">{aliveEntities[0].name}</span>
          <span className="text-[10px]">
            {aliveEntities[0].hp}/{aliveEntities[0].maxHp}
          </span>
          <StatusIcon binds={aliveEntities[0].binds} ailments={aliveEntities[0].ailments} />
        </>
      )}
      {aliveEntities.length > 1 && (
        <>
          <span className="font-bold truncate max-w-full">
            {aliveEntities[0].name} x{aliveEntities.length}
          </span>
          <span className="text-[10px]">
            {aliveEntities.reduce((sum, e) => sum + e.hp, 0)} HP
          </span>
        </>
      )}
      {hazard && (
        <span className={`text-[10px] ${isSelected ? 'text-paper' : 'text-gray-500'}`}>
          {HAZARD_LABEL[hazard]}
        </span>
      )}

      {/* Damage number overlays */}
      {damages.map((d) => (
        <DamageNumber
          key={d.id}
          damage={d.damage}
          isCrit={d.isCrit}
          onComplete={() => onDamageComplete(d.id)}
        />
      ))}
    </button>
  );
}
