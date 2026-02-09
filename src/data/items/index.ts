/**
 * Equipment Registry
 */

import type { EquipmentDefinition } from '../../types/character';
import { EQUIPMENT } from './equipment';

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

export { EQUIPMENT };
