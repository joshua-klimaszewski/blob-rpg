/**
 * Auto-Save Hook
 *
 * Transparently saves game state on store changes:
 * - Town: debounced save to autosave slot when on a town screen
 * - Dungeon: suspend save when dungeon state changes
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useGuildStore } from '../stores/guildStore';
import { usePartyStore } from '../stores/partyStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { useQuestStore } from '../stores/questStore';
import { useDungeonProgressStore } from '../stores/dungeonProgressStore';
import { useDungeonStore } from '../stores/dungeonStore';
import { autoSaveTown, autoSaveDungeon } from '../stores/saveActions';

const TOWN_SCREENS = new Set([
  'town', 'inn', 'shop', 'guild', 'character',
  'party-formation', 'inventory', 'how-to-play', 'dungeon-select',
]);

const DEBOUNCE_MS = 500;

export function useAutoSave(): void {
  const townTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dungeonTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Town auto-save: subscribe to relevant store changes
  useEffect(() => {
    const unsubscribers = [
      usePartyStore.subscribe(() => scheduleTownSave()),
      useInventoryStore.subscribe(() => scheduleTownSave()),
      useQuestStore.subscribe(() => scheduleTownSave()),
      useDungeonProgressStore.subscribe(() => scheduleTownSave()),
    ];

    function scheduleTownSave() {
      const screen = useGameStore.getState().screen;
      const guildId = useGuildStore.getState().currentGuildId;
      if (!guildId || !TOWN_SCREENS.has(screen)) return;

      if (townTimerRef.current) clearTimeout(townTimerRef.current);
      townTimerRef.current = setTimeout(() => {
        // Re-check conditions at save time
        const currentScreen = useGameStore.getState().screen;
        const currentGuildId = useGuildStore.getState().currentGuildId;
        if (currentGuildId && TOWN_SCREENS.has(currentScreen)) {
          autoSaveTown();
        }
      }, DEBOUNCE_MS);
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
      if (townTimerRef.current) clearTimeout(townTimerRef.current);
    };
  }, []);

  // Save immediately on transition to a town screen (e.g. warp from dungeon)
  const prevScreenRef = useRef(useGameStore.getState().screen);
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state) => {
      const prev = prevScreenRef.current;
      const next = state.screen;
      prevScreenRef.current = next;
      if (prev === next) return;

      const guildId = useGuildStore.getState().currentGuildId;
      if (guildId && TOWN_SCREENS.has(next)) {
        autoSaveTown();
      }
    });
    return () => unsubscribe();
  }, []);

  // Dungeon auto-save: subscribe to dungeon store changes
  useEffect(() => {
    const unsubscribe = useDungeonStore.subscribe(() => {
      const screen = useGameStore.getState().screen;
      const guildId = useGuildStore.getState().currentGuildId;
      const dungeon = useDungeonStore.getState().dungeon;
      if (!guildId || screen !== 'dungeon' || !dungeon) return;

      if (dungeonTimerRef.current) clearTimeout(dungeonTimerRef.current);
      dungeonTimerRef.current = setTimeout(() => {
        // Re-check conditions at save time
        const currentScreen = useGameStore.getState().screen;
        const currentGuildId = useGuildStore.getState().currentGuildId;
        const currentDungeon = useDungeonStore.getState().dungeon;
        if (currentGuildId && currentScreen === 'dungeon' && currentDungeon) {
          autoSaveDungeon();
        }
      }, DEBOUNCE_MS);
    });

    return () => {
      unsubscribe();
      if (dungeonTimerRef.current) clearTimeout(dungeonTimerRef.current);
    };
  }, []);
}
