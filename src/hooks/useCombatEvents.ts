import { useEffect, useState, useCallback } from 'react';
import { useCombatStore } from '../stores/combatStore';
import type { CombatEventUnion, DamageEvent } from '../types/combat';

interface DamageDisplay {
  id: string;
  targetId: string;
  damage: number;
  isCrit: boolean;
}

interface LogEntry {
  id: number;
  message: string;
}

interface EventFeedback {
  /** Active damage number displays */
  damageDisplays: DamageDisplay[];
  /** Combat log entries (most recent last) */
  log: LogEntry[];
  /** Remove a damage display by id */
  removeDamage: (id: string) => void;
}

let damageIdCounter = 0;
let logIdCounter = 0;
const MAX_LOG_ENTRIES = 20;

function eventToMessage(event: CombatEventUnion): string | null {
  switch (event.type) {
    case 'damage':
      return `${event.targetId} took ${event.damage} damage${event.isCrit ? ' (CRIT!)' : ''}${event.killed ? ' - KO!' : ''}`;
    case 'flee-success':
      return 'Escaped successfully!';
    case 'flee-failed':
      return 'Failed to escape!';
    case 'bind-applied':
      return event.resisted
        ? `${event.targetId} resisted ${event.bindType} bind`
        : `${event.targetId} - ${event.bindType} bound!`;
    case 'ailment-applied':
      return event.resisted
        ? `${event.targetId} resisted ${event.ailment}`
        : `${event.targetId} afflicted with ${event.ailment}!`;
    case 'displacement':
      return `${event.entityId} displaced!`;
    case 'hazard-triggered':
      return `${event.entityId} triggered ${event.hazard} trap!`;
    case 'turn-skip':
      return `${event.entityId} can't move (${event.reason})!`;
    case 'victory':
      return 'All enemies defeated!';
    case 'defeat':
      return 'Party wiped out...';
    default:
      return null;
  }
}

export function useCombatEvents(): EventFeedback {
  const lastEvents = useCombatStore((s) => s.lastEvents);
  const clearEvents = useCombatStore((s) => s.clearEvents);

  const [damageDisplays, setDamageDisplays] = useState<DamageDisplay[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (lastEvents.length === 0) return;

    // Process damage events into displays
    const newDamages: DamageDisplay[] = lastEvents
      .filter((e): e is DamageEvent => e.type === 'damage')
      .map((e) => ({
        id: `dmg-${damageIdCounter++}`,
        targetId: e.targetId,
        damage: e.damage,
        isCrit: e.isCrit,
      }));

    if (newDamages.length > 0) {
      setDamageDisplays((prev) => [...prev, ...newDamages]);
    }

    // Accumulate all meaningful messages into the log
    const newEntries: LogEntry[] = [];
    for (const event of lastEvents) {
      const msg = eventToMessage(event);
      if (msg) {
        newEntries.push({ id: logIdCounter++, message: msg });
      }
    }

    if (newEntries.length > 0) {
      setLog((prev) => [...prev, ...newEntries].slice(-MAX_LOG_ENTRIES));
    }

    // Clear store events after processing
    clearEvents();
  }, [lastEvents, clearEvents]);

  const removeDamage = useCallback((id: string) => {
    setDamageDisplays((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return { damageDisplays, log, removeDamage };
}
