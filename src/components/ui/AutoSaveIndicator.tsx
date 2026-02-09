import { useEffect, useRef, useState } from 'react';
import { useAutoSaveEvent } from '../../hooks/useAutoSave';

export function AutoSaveIndicator() {
  const saveEvent = useAutoSaveEvent();
  const [hiddenEvent, setHiddenEvent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Schedule hide after each new save event
  useEffect(() => {
    if (saveEvent === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setHiddenEvent(saveEvent), 2000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [saveEvent]);

  if (saveEvent === 0 || saveEvent === hiddenEvent) return null;

  return (
    <div className="fixed bottom-3 right-3 text-xs font-bold text-ink border border-ink bg-paper px-2 py-1 pointer-events-none">
      Saved
    </div>
  );
}
