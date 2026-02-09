import { useInventoryStore } from '../../stores/inventoryStore';
import { getMaterial } from '../../data/items/index';

export function ShopSellTab() {
  const materials = useInventoryStore((s) => s.materials);
  const sellMaterial = useInventoryStore((s) => s.sellMaterial);

  const heldMaterials = Object.entries(materials)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const def = getMaterial(id);
      return def ? { ...def, quantity: qty } : null;
    })
    .filter((m) => m !== null);

  if (heldMaterials.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        No materials to sell. Defeat enemies to gather loot.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {heldMaterials.map((mat) => (
        <div
          key={mat.id}
          className="border-2 border-ink px-3 py-2 text-sm"
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold">{mat.name}</span>
              <span className="text-xs ml-2">x{mat.quantity}</span>
            </div>
            <span className="text-xs">{mat.sellPrice}G each</span>
          </div>
          <div className="text-xs mt-1 text-gray-600">{mat.description}</div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => sellMaterial(mat.id, 1, mat.sellPrice)}
              className="flex-1 min-h-touch border-2 border-ink font-bold text-xs active:bg-ink active:text-paper"
            >
              Sell 1
            </button>
            {mat.quantity > 1 && (
              <button
                onClick={() => sellMaterial(mat.id, mat.quantity, mat.sellPrice)}
                className="flex-1 min-h-touch border-2 border-ink font-bold text-xs active:bg-ink active:text-paper"
              >
                Sell All ({mat.quantity})
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
