/**
 * Save System Helpers
 *
 * Utilities for managing localStorage save data.
 */

const SAVE_KEYS = [
  'blob-rpg-party',
  'blob-rpg-inventory',
  'blob-rpg-quests',
  'blob-rpg-game',
] as const;

/** Check if any save data exists */
export function hasSaveData(): boolean {
  return SAVE_KEYS.some((key) => localStorage.getItem(key) !== null);
}

/** Clear all save data */
export function clearAllSaves(): void {
  for (const key of SAVE_KEYS) {
    localStorage.removeItem(key);
  }
}
