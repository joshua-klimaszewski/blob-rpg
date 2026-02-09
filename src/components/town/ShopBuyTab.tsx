import { useState } from 'react';
import { useInventoryStore } from '../../stores/inventoryStore';
import { getUnlockedItems } from '../../systems/economy';
import { getAllConsumables, getEquipment, getMaterial } from '../../data/items/index';
import { SHOP_RECIPES } from '../../data/items/shop-recipes';

export function ShopBuyTab() {
  const gold = useInventoryStore((s) => s.gold);
  const soldMaterials = useInventoryStore((s) => s.soldMaterials);
  const buyEquipment = useInventoryStore((s) => s.buyEquipment);
  const buyConsumable = useInventoryStore((s) => s.buyConsumable);

  // Track which item is selected for confirmation
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const unlockedIds = getUnlockedItems(soldMaterials, SHOP_RECIPES);
  const unlockedSet = new Set(unlockedIds);
  const consumables = getAllConsumables();

  // Starter gear (always available)
  const baseEquipIds = ['rusty-sword', 'gnarled-staff'];
  const baseEquip = baseEquipIds
    .map((id) => getEquipment(id))
    .filter((e) => e !== undefined);

  // Recipe equipment: unlocked first, then locked
  const unlockedRecipes = SHOP_RECIPES
    .filter((r) => unlockedSet.has(r.unlocksItemId))
    .map((r) => ({ recipe: r, equip: getEquipment(r.unlocksItemId) }))
    .filter((r) => r.equip !== undefined);

  const lockedRecipes = SHOP_RECIPES
    .filter((r) => !unlockedSet.has(r.unlocksItemId))
    .map((r) => ({ recipe: r, equip: getEquipment(r.unlocksItemId) }))
    .filter((r) => r.equip !== undefined);

  return (
    <div className="flex flex-col gap-3">
      {/* Consumables */}
      <div className="text-sm font-bold border-b border-ink pb-1">Consumables</div>
      {consumables.map((item) => {
        const affordable = gold >= item.buyPrice;
        const selected = selectedId === item.id;
        return (
          <div key={item.id}>
            <button
              onClick={() => setSelectedId(selected ? null : item.id)}
              disabled={!affordable}
              className={`w-full border-2 px-3 py-2 text-left text-sm
                ${selected ? 'border-ink bg-ink text-paper'
                  : affordable ? 'border-ink active:bg-ink active:text-paper'
                  : 'border-gray-300 text-gray-400'}
              `}
            >
              <div className="flex justify-between font-bold">
                <span>{item.name}</span>
                <span>{item.buyPrice}G</span>
              </div>
              <div className="text-xs mt-1">{item.description}</div>
            </button>
            {selected && (
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => { buyConsumable(item.id, item.buyPrice); setSelectedId(null); }}
                  className="flex-1 border-2 border-ink px-3 py-1 text-xs font-bold bg-ink text-paper active:bg-paper active:text-ink min-h-touch"
                >
                  Buy for {item.buyPrice}G
                </button>
                <button
                  onClick={() => setSelectedId(null)}
                  className="border-2 border-ink px-3 py-1 text-xs font-bold active:bg-ink active:text-paper min-h-touch"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Equipment */}
      <div className="text-sm font-bold border-b border-ink pb-1 mt-2">Equipment</div>

      {/* Starter gear */}
      {baseEquip.map((item) => {
        const affordable = gold >= item.buyPrice;
        const selected = selectedId === item.id;
        return (
          <div key={item.id}>
            <button
              onClick={() => setSelectedId(selected ? null : item.id)}
              disabled={!affordable}
              className={`w-full border-2 px-3 py-2 text-left text-sm
                ${selected ? 'border-ink bg-ink text-paper'
                  : affordable ? 'border-ink active:bg-ink active:text-paper'
                  : 'border-gray-300 text-gray-400'}
              `}
            >
              <div className="flex justify-between font-bold">
                <span>{item.name}</span>
                <span>{item.buyPrice}G</span>
              </div>
              <div className="text-xs mt-1">{item.description}</div>
            </button>
            {selected && (
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => { buyEquipment(item.id, item.buyPrice); setSelectedId(null); }}
                  className="flex-1 border-2 border-ink px-3 py-1 text-xs font-bold bg-ink text-paper active:bg-paper active:text-ink min-h-touch"
                >
                  Buy for {item.buyPrice}G
                </button>
                <button
                  onClick={() => setSelectedId(null)}
                  className="border-2 border-ink px-3 py-1 text-xs font-bold active:bg-ink active:text-paper min-h-touch"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Unlocked recipe equipment */}
      {unlockedRecipes.map(({ equip: item }) => {
        const affordable = gold >= item!.buyPrice;
        const selected = selectedId === item!.id;
        return (
          <div key={item!.id}>
            <button
              onClick={() => setSelectedId(selected ? null : item!.id)}
              disabled={!affordable}
              className={`w-full border-2 px-3 py-2 text-left text-sm
                ${selected ? 'border-ink bg-ink text-paper'
                  : affordable ? 'border-ink active:bg-ink active:text-paper'
                  : 'border-gray-300 text-gray-400'}
              `}
            >
              <div className="flex justify-between font-bold">
                <span>{item!.name}</span>
                <span>{item!.buyPrice}G</span>
              </div>
              <div className="text-xs mt-1">{item!.description}</div>
            </button>
            {selected && (
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => { buyEquipment(item!.id, item!.buyPrice); setSelectedId(null); }}
                  className="flex-1 border-2 border-ink px-3 py-1 text-xs font-bold bg-ink text-paper active:bg-paper active:text-ink min-h-touch"
                >
                  Buy for {item!.buyPrice}G
                </button>
                <button
                  onClick={() => setSelectedId(null)}
                  className="border-2 border-ink px-3 py-1 text-xs font-bold active:bg-ink active:text-paper min-h-touch"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Locked recipe equipment */}
      {lockedRecipes.map(({ recipe, equip: item }) => (
        <div
          key={item!.id}
          className="border-2 border-dashed border-gray-300 px-3 py-2 text-left text-sm text-gray-400"
        >
          <div className="flex justify-between font-bold">
            <span>{item!.name}</span>
            <span>{item!.buyPrice}G</span>
          </div>
          <div className="text-xs mt-1">{item!.description}</div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {recipe.requirements.map((req) => {
              const mat = getMaterial(req.materialId);
              const current = soldMaterials[req.materialId] ?? 0;
              const met = current >= req.quantity;
              return (
                <span
                  key={req.materialId}
                  className={`text-xs ${met ? 'text-ink font-bold' : ''}`}
                >
                  {mat?.name ?? req.materialId}: {current}/{req.quantity}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
