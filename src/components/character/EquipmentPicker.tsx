import type { EquipmentSlot, EquipmentDefinition } from '../../types/character';
import { useInventoryStore } from '../../stores/inventoryStore';
import { usePartyStore } from '../../stores/partyStore';
import { getEquipment } from '../../data/items/index';

interface EquipmentPickerProps {
  memberId: string;
  slot: EquipmentSlot;
  currentItemId: string | null;
  onClose: () => void;
}

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  weapon: 'Weapon',
  armor: 'Armor',
  accessory1: 'Accessory 1',
  accessory2: 'Accessory 2',
};

/** Accessory slots are interchangeable — an accessory1-typed item fits accessory2 too */
function slotMatchesItem(slot: EquipmentSlot, item: EquipmentDefinition): boolean {
  if (slot === 'accessory1' || slot === 'accessory2') {
    return item.slot === 'accessory1' || item.slot === 'accessory2';
  }
  return item.slot === slot;
}

export function EquipmentPicker({ memberId, slot, currentItemId, onClose }: EquipmentPickerProps) {
  const ownedEquipment = useInventoryStore((s) => s.ownedEquipment);
  const roster = usePartyStore((s) => s.roster);
  const equipItem = usePartyStore((s) => s.equipItem);

  // Collect all equipped item IDs across all party members (except current member's current slot)
  const equippedElsewhere: string[] = [];
  for (const member of roster) {
    for (const [eqSlot, eqId] of Object.entries(member.equipment)) {
      if (eqId === null) continue;
      // Skip the current member's current slot (we're replacing it)
      if (member.id === memberId && eqSlot === slot) continue;
      equippedElsewhere.push(eqId);
    }
  }

  // Build available items: owned items that match the slot, minus those equipped elsewhere.
  // Handle duplicates: if you own 2 rusty-swords and 1 is equipped elsewhere, 1 is still available.
  const availableCounts: Record<string, number> = {};
  for (const id of ownedEquipment) {
    const def = getEquipment(id);
    if (!def || !slotMatchesItem(slot, def)) continue;
    availableCounts[id] = (availableCounts[id] ?? 0) + 1;
  }

  // Subtract equipped-elsewhere counts
  for (const id of equippedElsewhere) {
    if (id in availableCounts) {
      availableCounts[id] -= 1;
      if (availableCounts[id] <= 0) delete availableCounts[id];
    }
  }

  const availableItems: Array<{ def: EquipmentDefinition; count: number }> = [];
  for (const [id, count] of Object.entries(availableCounts)) {
    const def = getEquipment(id);
    if (def) availableItems.push({ def, count });
  }

  const handleEquip = (itemId: string) => {
    equipItem(memberId, slot, itemId);
    onClose();
  };

  const handleUnequip = () => {
    equipItem(memberId, slot, null);
    onClose();
  };

  return (
    <div className="border-2 border-ink bg-paper">
      <div className="flex justify-between items-center px-3 py-2 border-b border-gray-200">
        <span className="text-sm font-bold">{SLOT_LABELS[slot]}</span>
        <button
          type="button"
          className="min-h-touch px-3 text-sm font-bold active:bg-ink active:text-paper"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>

      <div className="flex flex-col">
        {/* Unequip option (only if something is equipped) */}
        {currentItemId && (
          <button
            type="button"
            className="min-h-touch px-3 py-2 text-left text-sm border-b border-gray-200 active:bg-ink active:text-paper"
            onClick={handleUnequip}
          >
            <span className="text-gray-500">— unequip —</span>
          </button>
        )}

        {availableItems.length === 0 && (
          <div className="px-3 py-4 text-sm text-gray-400 text-center">
            No items available for this slot
          </div>
        )}

        {availableItems.map(({ def, count }) => {
          const isCurrentItem = def.id === currentItemId;
          return (
            <button
              key={def.id}
              type="button"
              className={`min-h-touch px-3 py-2 text-left text-sm border-b border-gray-200 active:bg-ink active:text-paper ${
                isCurrentItem ? 'bg-gray-100' : ''
              }`}
              onClick={() => handleEquip(def.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold">{def.name}</span>
                  {count > 1 && <span className="text-gray-500 ml-1">x{count}</span>}
                  {isCurrentItem && <span className="text-gray-400 ml-1">(equipped)</span>}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{def.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
