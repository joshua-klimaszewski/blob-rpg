/**
 * Item Registry
 *
 * Central lookup for all item types: equipment, materials, consumables.
 */

import type { EquipmentDefinition } from '../../types/character';
import type { MaterialDefinition, ConsumableDefinition } from '../../types/economy';
import { EQUIPMENT } from './equipment';
import { MATERIALS } from './materials';
import { CONSUMABLES } from './consumables';

// Equipment registry
const EQUIPMENT_REGISTRY: Record<string, EquipmentDefinition> = {};
for (const item of EQUIPMENT) {
  EQUIPMENT_REGISTRY[item.id] = item;
}

/** Get equipment definition by ID. Returns undefined if not found. */
export function getEquipment(id: string): EquipmentDefinition | undefined {
  return EQUIPMENT_REGISTRY[id];
}

/** Get all equipment definitions */
export function getAllEquipment(): EquipmentDefinition[] {
  return EQUIPMENT;
}

// Material registry
const MATERIAL_REGISTRY: Record<string, MaterialDefinition> = {};
for (const mat of MATERIALS) {
  MATERIAL_REGISTRY[mat.id] = mat;
}

/** Get material definition by ID */
export function getMaterial(id: string): MaterialDefinition | undefined {
  return MATERIAL_REGISTRY[id];
}

/** Get all material definitions */
export function getAllMaterials(): MaterialDefinition[] {
  return MATERIALS;
}

// Consumable registry
const CONSUMABLE_REGISTRY: Record<string, ConsumableDefinition> = {};
for (const con of CONSUMABLES) {
  CONSUMABLE_REGISTRY[con.id] = con;
}

/** Get consumable definition by ID */
export function getConsumable(id: string): ConsumableDefinition | undefined {
  return CONSUMABLE_REGISTRY[id];
}

/** Get all consumable definitions */
export function getAllConsumables(): ConsumableDefinition[] {
  return CONSUMABLES;
}

export { EQUIPMENT, MATERIALS, CONSUMABLES };
