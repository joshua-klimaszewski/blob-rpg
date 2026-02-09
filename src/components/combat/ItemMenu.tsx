import { useState } from 'react';
import { useInventoryStore } from '../../stores/inventoryStore';
import { useCombatStore } from '../../stores/combatStore';
import { getAllConsumables } from '../../data/items/index';
import { executeItemAction } from '../../systems/combat';
import type { ConsumableDefinition } from '../../types/economy';
import type { CombatEntity } from '../../types/combat';

interface ItemMenuProps {
  actor: CombatEntity;
  party: CombatEntity[];
  onUse: () => void;
  onCancel: () => void;
}

export function ItemMenu({ actor, party, onUse, onCancel }: ItemMenuProps) {
  const consumables = useInventoryStore((s) => s.consumables);
  const useConsumable = useInventoryStore((s) => s.useConsumable);
  const [selectedItem, setSelectedItem] = useState<ConsumableDefinition | null>(null);

  const allConsumables = getAllConsumables();
  const heldItems = allConsumables
    .map((def) => ({ def, qty: consumables[def.id] ?? 0 }))
    .filter(({ qty }) => qty > 0);

  const handleAllySelect = (target: CombatEntity) => {
    if (!selectedItem) return;

    const combat = useCombatStore.getState().combat;
    if (!combat) return;

    // Deduct consumable from inventory
    useConsumable(selectedItem.id);

    // Execute item effect in combat
    const result = executeItemAction(combat, actor.id, target.id, selectedItem);
    useCombatStore.setState({
      combat: result.state,
      lastEvents: result.events,
    });

    setSelectedItem(null);
    onUse();
  };

  // Ally selection mode
  if (selectedItem) {
    return (
      <div className="px-4 py-3 border-t-2 border-ink bg-paper">
        <div className="text-center text-sm font-bold mb-2">
          {selectedItem.name} — Select Ally
        </div>
        <div className="flex flex-col gap-1 max-w-xs mx-auto">
          {party.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => handleAllySelect(member)}
              disabled={member.hp <= 0 && selectedItem.effect.type !== 'cure-ailments'}
              className={`min-h-touch border-2 px-3 py-2 text-left text-sm
                ${member.hp > 0 || selectedItem.effect.type === 'cure-ailments'
                  ? 'border-ink active:bg-ink active:text-paper'
                  : 'border-gray-300 text-gray-400'}
              `}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold">{member.name}</span>
                <span className="tabular-nums text-xs">
                  {member.hp}/{member.maxHp} HP  {member.tp}/{member.maxTp} TP
                </span>
              </div>
            </button>
          ))}
          <button
            type="button"
            className="min-h-touch border-2 border-ink font-bold text-sm mt-1 active:bg-ink active:text-paper"
            onClick={() => setSelectedItem(null)}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Item selection
  return (
    <div className="px-4 py-3 border-t-2 border-ink bg-paper">
      <div className="text-center text-sm font-bold mb-2">Items</div>
      <div className="flex flex-col gap-1 max-w-xs mx-auto">
        {heldItems.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-2">No items</div>
        ) : (
          heldItems.map(({ def, qty }) => (
            <button
              key={def.id}
              type="button"
              onClick={() => setSelectedItem(def)}
              className="min-h-touch border-2 border-ink px-3 py-2 text-left text-sm active:bg-ink active:text-paper"
            >
              <div className="flex justify-between">
                <span className="font-bold">{def.name}</span>
                <span className="text-xs">x{qty}</span>
              </div>
              <div className="text-xs mt-1">{def.description}</div>
            </button>
          ))
        )}
        <button
          type="button"
          className="min-h-touch border-2 border-ink font-bold text-sm mt-1 active:bg-ink active:text-paper"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
