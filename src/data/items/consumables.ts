/**
 * Consumable Definitions
 *
 * Usable items that can be purchased at the shop
 * and used during combat or in town.
 */

import type { ConsumableDefinition } from '../../types/economy';

export const CONSUMABLES: ConsumableDefinition[] = [
  {
    id: 'medica',
    name: 'Medica',
    description: 'Restores 50 HP to one ally.',
    buyPrice: 30,
    effect: { type: 'heal-hp', amount: 50 },
  },
  {
    id: 'amrita',
    name: 'Amrita',
    description: 'Restores 20 TP to one ally.',
    buyPrice: 50,
    effect: { type: 'heal-tp', amount: 20 },
  },
  {
    id: 'theriaca',
    name: 'Theriaca',
    description: 'Cures all ailments on one ally.',
    buyPrice: 40,
    effect: { type: 'cure-ailments' },
  },
];
