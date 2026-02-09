/**
 * Equipment Definitions
 *
 * Tier 1 (starter) + Tier 2 (F2/F3 material unlocks).
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

  // Tier 2 — Unlocked via F2/F3 materials
  {
    id: 'fungal-staff',
    name: 'Fungal Staff',
    slot: 'weapon',
    bonuses: { int: 5, wis: 2 },
    classRestriction: null,
    description: 'A staff grown from living fungi. +5 INT, +2 WIS.',
    buyPrice: 120,
  },
  {
    id: 'bone-club',
    name: 'Bone Club',
    slot: 'weapon',
    bonuses: { str: 6 },
    classRestriction: null,
    description: 'A crude but devastating club made from bat bones. +6 STR.',
    buyPrice: 110,
  },
  {
    id: 'crystal-blade',
    name: 'Crystal Blade',
    slot: 'weapon',
    bonuses: { str: 4, int: 3 },
    classRestriction: null,
    description: 'A sword edged with crystalline shards. +4 STR, +3 INT.',
    buyPrice: 180,
  },
  {
    id: 'shell-armor',
    name: 'Shell Armor',
    slot: 'armor',
    bonuses: { vit: 4, hp: 15 },
    classRestriction: null,
    description: 'Heavy armor forged from carapace segments. +4 VIT, +15 HP.',
    buyPrice: 160,
  },
  {
    id: 'fungal-robe',
    name: 'Fungal Robe',
    slot: 'armor',
    bonuses: { wis: 3, tp: 8 },
    classRestriction: null,
    description: 'Robes interlaced with fungal fibers. +3 WIS, +8 TP.',
    buyPrice: 140,
  },
  {
    id: 'bat-earring',
    name: 'Bat Earring',
    slot: 'accessory1',
    bonuses: { agi: 4, luc: 2 },
    classRestriction: null,
    description: 'An earring carved from bat wing bone. +4 AGI, +2 LUC.',
    buyPrice: 100,
  },
  {
    id: 'crystal-pendant',
    name: 'Crystal Pendant',
    slot: 'accessory1',
    bonuses: { int: 3, wis: 3 },
    classRestriction: null,
    description: 'A pendant housing a brilliant crystal shard. +3 INT, +3 WIS.',
    buyPrice: 150,
  },
  {
    id: 'carapace-ring',
    name: 'Carapace Ring',
    slot: 'accessory1',
    bonuses: { vit: 4 },
    classRestriction: null,
    description: 'A ring carved from tough carapace. +4 VIT.',
    buyPrice: 90,
  },
];
