import type { EquipmentSlot } from '../../types/character';
import { getEquipment } from '../../data/items/index';

interface EquipmentSlotsProps {
  equipment: Record<EquipmentSlot, string | null>;
  onSlotTap: (slot: EquipmentSlot) => void;
}

const SLOT_LABELS: Array<{ slot: EquipmentSlot; label: string }> = [
  { slot: 'weapon', label: 'Weapon' },
  { slot: 'armor', label: 'Armor' },
  { slot: 'accessory1', label: 'Acc. 1' },
  { slot: 'accessory2', label: 'Acc. 2' },
];

export function EquipmentSlots({ equipment, onSlotTap }: EquipmentSlotsProps) {
  return (
    <div className="flex flex-col gap-1">
      {SLOT_LABELS.map(({ slot, label }) => {
        const itemId = equipment[slot];
        const item = itemId ? getEquipment(itemId) : null;

        return (
          <button
            key={slot}
            type="button"
            className="min-h-touch border-2 border-ink px-3 py-2 text-left text-sm active:bg-ink active:text-paper"
            onClick={() => onSlotTap(slot)}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{label}</span>
              <span className="font-bold">{item ? item.name : '— empty —'}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
