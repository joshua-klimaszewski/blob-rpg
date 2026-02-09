import { useInventoryStore } from '../../stores/inventoryStore';
import { getUnlockedItems } from '../../systems/economy';
import { getAllConsumables, getEquipment } from '../../data/items/index';
import { SHOP_RECIPES } from '../../data/items/shop-recipes';

export function ShopBuyTab() {
  const gold = useInventoryStore((s) => s.gold);
  const soldMaterials = useInventoryStore((s) => s.soldMaterials);
  const buyEquipment = useInventoryStore((s) => s.buyEquipment);
  const buyConsumable = useInventoryStore((s) => s.buyConsumable);

  const unlockedIds = getUnlockedItems(soldMaterials, SHOP_RECIPES);
  const consumables = getAllConsumables();

  // Always-available equipment (starter gear with low price)
  // plus unlocked equipment from selling materials
  const baseEquipIds = ['rusty-sword', 'gnarled-staff'];
  const availableEquipIds = [...new Set([...baseEquipIds, ...unlockedIds])];
  const availableEquip = availableEquipIds
    .map((id) => getEquipment(id))
    .filter((e) => e !== undefined);

  return (
    <div className="flex flex-col gap-3">
      {/* Consumables */}
      <div className="text-sm font-bold border-b border-ink pb-1">Consumables</div>
      {consumables.map((item) => (
        <button
          key={item.id}
          onClick={() => buyConsumable(item.id, item.buyPrice)}
          disabled={gold < item.buyPrice}
          className={`border-2 px-3 py-2 text-left text-sm
            ${gold >= item.buyPrice
              ? 'border-ink active:bg-ink active:text-paper'
              : 'border-gray-300 text-gray-400'}
          `}
        >
          <div className="flex justify-between font-bold">
            <span>{item.name}</span>
            <span>{item.buyPrice}G</span>
          </div>
          <div className="text-xs mt-1">{item.description}</div>
        </button>
      ))}

      {/* Equipment */}
      <div className="text-sm font-bold border-b border-ink pb-1 mt-2">Equipment</div>
      {availableEquip.length === 0 ? (
        <div className="text-sm text-gray-500">Sell materials to unlock equipment.</div>
      ) : (
        availableEquip.map((item) => (
          <button
            key={item.id}
            onClick={() => buyEquipment(item.id, item.buyPrice)}
            disabled={gold < item.buyPrice}
            className={`border-2 px-3 py-2 text-left text-sm
              ${gold >= item.buyPrice
                ? 'border-ink active:bg-ink active:text-paper'
                : 'border-gray-300 text-gray-400'}
            `}
          >
            <div className="flex justify-between font-bold">
              <span>{item.name}</span>
              <span>{item.buyPrice}G</span>
            </div>
            <div className="text-xs mt-1">{item.description}</div>
          </button>
        ))
      )}
    </div>
  );
}
