import type { GridPosition, CombatState, CombatEntity } from '../../types/combat';
import { getEntityPosition } from '../../systems/combat';
import { GridTile } from './GridTile';

interface DamageDisplay {
  id: string;
  targetId: string;
  damage: number;
  isCrit: boolean;
}

interface CombatGridProps {
  combat: CombatState;
  selectedTile: GridPosition | null;
  damageDisplays: DamageDisplay[];
  onTileSelect: (position: GridPosition) => void;
  onDamageComplete: (id: string) => void;
}

function getEntitiesForTile(combat: CombatState, row: number, col: number): CombatEntity[] {
  const entityIds = combat.grid[row][col].entities;
  return entityIds
    .map((id) => combat.enemies.find((e) => e.id === id))
    .filter((e): e is CombatEntity => e !== undefined);
}

export function CombatGrid({
  combat,
  selectedTile,
  damageDisplays,
  onTileSelect,
  onDamageComplete,
}: CombatGridProps) {
  return (
    <div className="grid grid-cols-3 gap-1 w-full max-w-half mx-auto">
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const tile = combat.grid[row][col];
          const entities = getEntitiesForTile(combat, row, col);
          const isSelected =
            selectedTile !== null && selectedTile[0] === row && selectedTile[1] === col;

          // Find damage displays for entities on this tile
          const tileDamages = damageDisplays.filter((d) => {
            const pos = getEntityPosition(combat.grid, d.targetId);
            return pos !== null && pos[0] === row && pos[1] === col;
          });

          return (
            <GridTile
              key={`${row}-${col}`}
              position={tile.position}
              entities={entities}
              hazard={tile.hazard}
              isSelected={isSelected}
              damages={tileDamages}
              onSelect={onTileSelect}
              onDamageComplete={onDamageComplete}
            />
          );
        })
      )}
    </div>
  );
}
