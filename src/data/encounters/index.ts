/**
 * Encounter Factory
 *
 * Creates encounters using the party store's active party
 * and floor-specific encounter tables for enemy selection.
 */

import type { EncounterData, EnemyDefinition } from '../../types/combat';
import type { FloorData, FloorEncounterTable } from '../../types/dungeon';
import { ENEMY_SLIME } from '../enemies/slime';
import { getEnemy } from '../enemies/index';
import { DEFAULT_PARTY } from '../party/defaults';
import { usePartyStore } from '../../stores/partyStore';

let encounterIdCounter = 0;

function getParty() {
  const activeParty = usePartyStore.getState().getActiveParty();
  return activeParty.length > 0 ? activeParty : DEFAULT_PARTY;
}

/**
 * Pick a random enemy from a weighted encounter table.
 * Falls back to slime if lookup fails.
 */
function pickWeightedEnemy(
  entries: FloorEncounterTable['random']
): EnemyDefinition {
  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) {
      return getEnemy(entry.enemyId) ?? ENEMY_SLIME;
    }
  }

  return ENEMY_SLIME;
}

/**
 * Create a random encounter using floor-specific enemy pools.
 */
export function createRandomEncounter(floor?: FloorData): EncounterData {
  const table = floor?.encounterTable;

  const [minSize, maxSize] = table?.randomSize ?? [1, 2];
  const numEnemies = minSize + Math.floor(Math.random() * (maxSize - minSize + 1));

  const enemies = [];
  for (let i = 0; i < numEnemies; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;

    const definition = table
      ? pickWeightedEnemy(table.random)
      : ENEMY_SLIME;

    enemies.push({
      definition,
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
 * Create an FOE encounter using floor-specific enemy pools.
 */
export function createFOEEncounter(floor?: FloorData): EncounterData {
  const table = floor?.encounterTable;

  const [minSize, maxSize] = table?.foeSize ?? [2, 3];
  const numEnemies = minSize + Math.floor(Math.random() * (maxSize - minSize + 1));

  const enemies = [];
  for (let i = 0; i < numEnemies; i++) {
    const row = Math.floor(i / 3);
    const col = i % 3;

    const definition = table
      ? pickWeightedEnemy(table.foe)
      : ENEMY_SLIME;

    enemies.push({
      definition,
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
