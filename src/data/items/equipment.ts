/**
 * MVP Equipment Definitions
 *
 * Starter equipment set — 8 items covering all slot types.
 */

import type { EquipmentDefinition } from '../../types/character';

export const EQUIPMENT: EquipmentDefinition[] = [
  // Weapons
  {
    id: 'rusty-sword',
    name: 'Rusty Sword',
    slot: 'weapon',
    bonuses: { str: 3 },
    classRestriction: null,
    description: 'A dull but serviceable blade. +3 STR.',
    buyPrice: 50,
  },
  {
    id: 'gnarled-staff',
    name: 'Gnarled Staff',
    slot: 'weapon',
    bonuses: { int: 3 },
    classRestriction: null,
    description: 'A twisted wooden staff humming with faint energy. +3 INT.',
    buyPrice: 50,
  },
  {
    id: 'iron-mace',
    name: 'Iron Mace',
    slot: 'weapon',
    bonuses: { str: 2, vit: 1 },
    classRestriction: null,
    description: 'A heavy mace that hits hard and takes hits. +2 STR, +1 VIT.',
    buyPrice: 80,
  },

  // Armor
  {
    id: 'leather-vest',
    name: 'Leather Vest',
    slot: 'armor',
    bonuses: { vit: 2, hp: 10 },
    classRestriction: null,
    description: 'Tough but flexible leather protection. +2 VIT, +10 HP.',
    buyPrice: 100,
  },
  {
    id: 'cloth-robe',
    name: 'Cloth Robe',
    slot: 'armor',
    bonuses: { wis: 2, tp: 5 },
    classRestriction: null,
    description: 'Light robes woven with faint magic. +2 WIS, +5 TP.',
    buyPrice: 100,
  },

  // Accessories
  {
    id: 'speed-charm',
    name: 'Speed Charm',
    slot: 'accessory1',
    bonuses: { agi: 3 },
    classRestriction: null,
    description: 'A small charm that quickens its holder. +3 AGI.',
    buyPrice: 120,
  },
  {
    id: 'lucky-coin',
    name: 'Lucky Coin',
    slot: 'accessory1',
    bonuses: { luc: 5 },
    classRestriction: null,
    description: 'A coin that always lands on the right side. +5 LUC.',
    buyPrice: 75,
  },
  {
    id: 'iron-ring',
    name: 'Iron Ring',
    slot: 'accessory1',
    bonuses: { vit: 2 },
    classRestriction: null,
    description: 'A sturdy iron band. +2 VIT.',
    buyPrice: 60,
  },
];
