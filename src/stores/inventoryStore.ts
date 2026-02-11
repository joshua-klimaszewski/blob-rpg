/**
 * Inventory Store
 *
 * Zustand store managing gold, materials, consumables, and owned equipment.
 * Bridges the economy system to React components.
 */

import { create } from 'zustand';
import { useQuestStore } from './questStore';

interface InventoryStore {
  /** Current gold balance */
  gold: number;

  /** Held materials: materialId -> quantity */
  materials: Record<string, number>;

  /** Cumulative sold materials (for shop unlock tracking) */
  soldMaterials: Record<string, number>;

  /** Held consumables: consumableId -> quantity */
  consumables: Record<string, number>;

  /** Owned equipment IDs (can have duplicates) */
  ownedEquipment: string[];

  /** Add gold */
  addGold: (amount: number) => void;

  /** Spend gold (returns false if insufficient) */
  spendGold: (amount: number) => boolean;

  /** Add materials from combat drops */
  addMaterial: (materialId: string, quantity: number) => void;

  /** Sell a material: removes from held, adds to sold count, gives gold */
  sellMaterial: (materialId: string, quantity: number, pricePerUnit: number) => void;

  /** Add a consumable */
  addConsumable: (consumableId: string, quantity: number) => void;

  /** Use a consumable (returns false if none held) */
  useConsumable: (consumableId: string) => boolean;

  /** Buy a consumable (deducts gold, adds to inventory) */
  buyConsumable: (consumableId: string, price: number) => boolean;

  /** Buy equipment (deducts gold, adds to owned list) */
  buyEquipment: (equipmentId: string, price: number) => boolean;

  /** Reset inventory to initial state */
  reset: () => void;
}

const INITIAL_STATE = {
  gold: 0,
  materials: {} as Record<string, number>,
  soldMaterials: {} as Record<string, number>,
  consumables: {} as Record<string, number>,
  ownedEquipment: [] as string[],
};

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  ...INITIAL_STATE,

  addGold: (amount) => {
    set((state) => ({ gold: state.gold + amount }));
  },

  spendGold: (amount) => {
    const { gold } = get();
    if (gold < amount) return false;
    set({ gold: gold - amount });
    return true;
  },

  addMaterial: (materialId, quantity) => {
    set((state) => ({
      materials: {
        ...state.materials,
        [materialId]: (state.materials[materialId] ?? 0) + quantity,
      },
    }));
  },

  sellMaterial: (materialId, quantity, pricePerUnit) => {
    const { materials } = get();
    const held = materials[materialId] ?? 0;
    if (held < quantity) return;

    set((state) => ({
      materials: {
        ...state.materials,
        [materialId]: (state.materials[materialId] ?? 0) - quantity,
      },
      soldMaterials: {
        ...state.soldMaterials,
        [materialId]: (state.soldMaterials[materialId] ?? 0) + quantity,
      },
      gold: state.gold + quantity * pricePerUnit,
    }));

    // Track gather quest progress
    useQuestStore.getState().incrementGatherProgress(materialId, quantity);
  },

  addConsumable: (consumableId, quantity) => {
    set((state) => ({
      consumables: {
        ...state.consumables,
        [consumableId]: (state.consumables[consumableId] ?? 0) + quantity,
      },
    }));
  },

  useConsumable: (consumableId) => {
    const { consumables } = get();
    const held = consumables[consumableId] ?? 0;
    if (held <= 0) return false;

    set((state) => ({
      consumables: {
        ...state.consumables,
        [consumableId]: (state.consumables[consumableId] ?? 0) - 1,
      },
    }));
    return true;
  },

  buyConsumable: (consumableId, price) => {
    const { gold } = get();
    if (gold < price) return false;

    set((state) => ({
      gold: state.gold - price,
      consumables: {
        ...state.consumables,
        [consumableId]: (state.consumables[consumableId] ?? 0) + 1,
      },
    }));
    return true;
  },

  buyEquipment: (equipmentId, price) => {
    const { gold } = get();
    if (gold < price) return false;

    set((state) => ({
      gold: state.gold - price,
      ownedEquipment: [...state.ownedEquipment, equipmentId],
    }));
    return true;
  },

  reset: () => {
    set(INITIAL_STATE);
  },
}));
