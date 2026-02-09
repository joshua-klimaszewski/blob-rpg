import type { GridPosition } from '../../types/combat';

export type SelectedAction = 'attack' | 'skill-targeting' | null;

interface ActionMenuProps {
  isPlayerTurn: boolean;
  canFlee: boolean;
  hasSkills: boolean;
  hasItems: boolean;
  selectedAction: SelectedAction;
  selectedTile: GridPosition | null;
  onAttack: () => void;
  onSkills: () => void;
  onItems: () => void;
  onDefend: () => void;
  onFlee: () => void;
  onCancel: () => void;
}

export function ActionMenu({
  isPlayerTurn,
  canFlee,
  hasSkills,
  hasItems,
  selectedAction,
  selectedTile,
  onAttack,
  onSkills,
  onItems,
  onDefend,
  onFlee,
  onCancel,
}: ActionMenuProps) {
  if (!isPlayerTurn) {
    return (
      <div className="px-4 py-3 border-t-2 border-ink bg-paper">
        <div className="text-center text-sm text-gray-500">Enemy turn...</div>
      </div>
    );
  }

  // Attack or skill targeting mode: waiting for target selection
  if (selectedAction === 'attack' || selectedAction === 'skill-targeting') {
    const label = selectedAction === 'attack' ? 'Attack' : 'Use Skill';
    return (
      <div className="px-4 py-3 border-t-2 border-ink bg-paper">
        <div className="text-center text-sm mb-2">
          {selectedTile ? `Tap ${label} to confirm` : 'Select a target'}
        </div>
        <div className="flex gap-2 justify-center max-w-half mx-auto">
          <button
            type="button"
            className={`flex-1 min-h-touch border-2 font-bold text-sm
              ${selectedTile ? 'border-ink active:bg-ink active:text-paper' : 'border-gray-300 text-gray-400'}
            `}
            disabled={!selectedTile}
            onClick={onAttack}
          >
            {label}
          </button>
          <button
            type="button"
            className="flex-1 min-h-touch border-2 border-ink font-bold text-sm active:bg-ink active:text-paper"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Default: show action choices
  return (
    <div className="px-4 py-3 border-t-2 border-ink bg-paper">
      <div className="flex flex-col gap-2 max-w-half mx-auto">
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 min-h-touch border-2 border-ink font-bold text-sm active:bg-ink active:text-paper"
            onClick={onAttack}
          >
            Attack
          </button>
          <button
            type="button"
            className={`flex-1 min-h-touch border-2 font-bold text-sm
              ${hasSkills ? 'border-ink active:bg-ink active:text-paper' : 'border-gray-300 text-gray-400'}
            `}
            disabled={!hasSkills}
            onClick={onSkills}
          >
            Skills
          </button>
          <button
            type="button"
            className={`flex-1 min-h-touch border-2 font-bold text-sm
              ${hasItems ? 'border-ink active:bg-ink active:text-paper' : 'border-gray-300 text-gray-400'}
            `}
            disabled={!hasItems}
            onClick={onItems}
          >
            Item
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 min-h-touch border-2 border-ink font-bold text-sm active:bg-ink active:text-paper"
            onClick={onDefend}
          >
            Defend
          </button>
          <button
            type="button"
            className={`flex-1 min-h-touch border-2 font-bold text-sm
              ${canFlee ? 'border-ink active:bg-ink active:text-paper' : 'border-gray-300 text-gray-400'}
            `}
            disabled={!canFlee}
            onClick={onFlee}
          >
            Flee
          </button>
        </div>
      </div>
    </div>
  );
}
