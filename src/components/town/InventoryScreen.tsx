import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import { usePartyStore } from '../../stores/partyStore';
import { getEquipment, getConsumable, getMaterial } from '../../data/items/index';

type Tab = 'equipment' | 'consumables' | 'materials';

export function InventoryScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const ownedEquipment = useInventoryStore((s) => s.ownedEquipment);
  const consumables = useInventoryStore((s) => s.consumables);
  const materials = useInventoryStore((s) => s.materials);
  const gold = useInventoryStore((s) => s.gold);
  const roster = usePartyStore((s) => s.roster);

  const [tab, setTab] = useState<Tab>('equipment');

  // Build a map of who has what equipped
  const equippedBy: Record<string, string[]> = {};
  for (const member of roster) {
    for (const eqId of Object.values(member.equipment)) {
      if (eqId === null) continue;
      if (!equippedBy[eqId]) equippedBy[eqId] = [];
      equippedBy[eqId].push(member.name);
    }
  }

  // Dedupe owned equipment into counts
  const equipCounts: Record<string, number> = {};
  for (const id of ownedEquipment) {
    equipCounts[id] = (equipCounts[id] ?? 0) + 1;
  }

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'equipment', label: 'Equipment' },
    { id: 'consumables', label: 'Items' },
    { id: 'materials', label: 'Materials' },
  ];

  return (
    <div className="flex flex-col min-h-dvh bg-paper max-w-half mx-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b-2 border-ink flex justify-between items-center">
        <h1 className="text-lg font-bold">Inventory</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold">{gold}G</span>
          <button
            type="button"
            className="min-h-touch px-3 border-2 border-ink font-bold text-sm active:bg-ink active:text-paper"
            onClick={() => setScreen('town')}
          >
            Back
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`flex-1 px-3 py-2 text-sm font-bold border-b-2 ${
              tab === t.id ? 'border-ink' : 'border-transparent text-gray-400'
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {tab === 'equipment' && (
          <div className="flex flex-col gap-1">
            {Object.keys(equipCounts).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No equipment owned</p>
            )}
            {Object.entries(equipCounts).map(([id, count]) => {
              const def = getEquipment(id);
              if (!def) return null;
              const owners = equippedBy[id] ?? [];
              return (
                <div
                  key={id}
                  className="border-2 border-ink px-3 py-2 text-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{def.name}</span>
                    {count > 1 && <span className="text-gray-500">x{count}</span>}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{def.description}</div>
                  {owners.length > 0 && (
                    <div className="text-xs mt-1">
                      Equipped by: {owners.join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'consumables' && (
          <div className="flex flex-col gap-1">
            {Object.keys(consumables).filter((id) => consumables[id] > 0).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No consumables owned</p>
            )}
            {Object.entries(consumables)
              .filter(([, qty]) => qty > 0)
              .map(([id, qty]) => {
                const def = getConsumable(id);
                if (!def) return null;
                return (
                  <div
                    key={id}
                    className="border-2 border-ink px-3 py-2 text-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{def.name}</span>
                      <span className="text-gray-500">x{qty}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{def.description}</div>
                  </div>
                );
              })}
          </div>
        )}

        {tab === 'materials' && (
          <div className="flex flex-col gap-1">
            {Object.keys(materials).filter((id) => materials[id] > 0).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No materials owned</p>
            )}
            {Object.entries(materials)
              .filter(([, qty]) => qty > 0)
              .map(([id, qty]) => {
                const def = getMaterial(id);
                if (!def) return null;
                return (
                  <div
                    key={id}
                    className="border-2 border-ink px-3 py-2 text-sm"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{def.name}</span>
                      <span className="text-gray-500">x{qty}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{def.description}</div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
