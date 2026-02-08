/**
 * Encounter Factory
 *
 * MVP: Creates simple random encounters for Phase 3 testing.
 * Full encounter tables per floor come later.
 */

import type { EncounterData } from '../../types/combat';
import { ENEMY_SLIME } from '../enemies/slime';
import { DEFAULT_PARTY } from '../party/defaults';

let encounterIdCounter = 0;

/**
 * Create a simple random encounter (MVP)
 * - 1-2 enemies
 * - Default party
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
    party: DEFAULT_PARTY,
    enemies,
    canFlee: true,
  };
}

/**
 * Create an FOE encounter (MVP)
 * - 2-3 enemies
 * - Cannot flee easily (MVP: still 50% but flagged as FOE)
 */
export function createFOEEncounter(): EncounterData {
  const numEnemies = 2 + Math.floor(Math.random() * 2); // 2 or 3

  const enemies = [];
  for (let i = 0; i < numEnemies; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;

    enemies.push({
      definition: ENEMY_SLIME, // MVP: Still slimes, just more of them
      instanceId: `enemy-${encounterIdCounter++}`,
      position: [row, col] as [number, number],
    });
  }

  return {
    party: DEFAULT_PARTY,
    enemies,
    canFlee: false, // FOE battles harder to flee
  };
}
