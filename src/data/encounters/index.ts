/**
 * Encounter Factory
 *
 * Creates encounters using the party store's active party.
 * Falls back to DEFAULT_PARTY if the store hasn't been initialized.
 */

import type { EncounterData } from '../../types/combat';
import { ENEMY_SLIME } from '../enemies/slime';
import { DEFAULT_PARTY } from '../party/defaults';
import { usePartyStore } from '../../stores/partyStore';

let encounterIdCounter = 0;

function getParty() {
  const activeParty = usePartyStore.getState().getActiveParty();
  return activeParty.length > 0 ? activeParty : DEFAULT_PARTY;
}

/**
 * Create a simple random encounter (MVP)
 * - 1-2 enemies
 * - Party from store (or default fallback)
 * - Can flee from random encounters
 */
export function createRandomEncounter(): EncounterData {
  const numEnemies = Math.random() < 0.5 ? 1 : 2;

  const enemies = [];
  for (let i = 0; i < numEnemies; i++) {
    const row = i === 0 ? 0 : 1;
    const col = i === 0 ? 1 : 1;

    enemies.push({
      definition: ENEMY_SLIME,
      instanceId: `enemy-${encounterIdCounter++}`,
      position: [row, col] as [number, number],
    });
  }

  return {
    party: getParty(),
    enemies,
    canFlee: true,
  };
}

/**
 * Create an FOE encounter (MVP)
 * - 2-3 enemies
 * - Cannot flee easily
 */
export function createFOEEncounter(): EncounterData {
  const numEnemies = 2 + Math.floor(Math.random() * 2); // 2 or 3

  const enemies = [];
  for (let i = 0; i < numEnemies; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;

    enemies.push({
      definition: ENEMY_SLIME,
      instanceId: `enemy-${encounterIdCounter++}`,
      position: [row, col] as [number, number],
    });
  }

  return {
    party: getParty(),
    enemies,
    canFlee: false,
  };
}
