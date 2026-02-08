/**
 * Default Party Configuration
 *
 * MVP placeholder party for Phase 3 combat testing.
 * Full character creation comes in Phase 4.
 */

import type { PartyMemberState } from '../../types/combat';

export const DEFAULT_PARTY: PartyMemberState[] = [
  {
    id: 'party-1',
    name: 'Ironblob',
    classId: 'ironblob',
    stats: {
      str: 12,
      vit: 10,
      int: 4,
      wis: 6,
      agi: 5,
      luc: 5,
    },
    maxHp: 50,
    hp: 50,
    maxTp: 20,
    tp: 20,
    level: 1,
    equipment: {
      weapon: null,
      armor: null,
      accessory1: null,
      accessory2: null,
    },
  },
  {
    id: 'party-2',
    name: 'Strikblob',
    classId: 'strikblob',
    stats: {
      str: 14,
      vit: 8,
      int: 4,
      wis: 4,
      agi: 10,
      luc: 8,
    },
    maxHp: 45,
    hp: 45,
    maxTp: 15,
    tp: 15,
    level: 1,
    equipment: {
      weapon: null,
      armor: null,
      accessory1: null,
      accessory2: null,
    },
  },
  {
    id: 'party-3',
    name: 'Sparkblob',
    classId: 'sparkblob',
    stats: {
      str: 6,
      vit: 6,
      int: 14,
      wis: 10,
      agi: 8,
      luc: 6,
    },
    maxHp: 40,
    hp: 40,
    maxTp: 30,
    tp: 30,
    level: 1,
    equipment: {
      weapon: null,
      armor: null,
      accessory1: null,
      accessory2: null,
    },
  },
  {
    id: 'party-4',
    name: 'Mendblob',
    classId: 'mendblob',
    stats: {
      str: 5,
      vit: 8,
      int: 10,
      wis: 12,
      agi: 7,
      luc: 7,
    },
    maxHp: 42,
    hp: 42,
    maxTp: 25,
    tp: 25,
    level: 1,
    equipment: {
      weapon: null,
      armor: null,
      accessory1: null,
      accessory2: null,
    },
  },
];
