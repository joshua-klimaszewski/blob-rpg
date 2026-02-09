import { useEffect, useState } from 'react';
import { useAutoSaveEvent } from '../../hooks/useAutoSave';

export function AutoSaveIndicator() {
  const [visible, setVisible] = useState(false);
  const saveEvent = useAutoSaveEvent();

  useEffect(() => {
    if (saveEvent === 0) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [saveEvent]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-3 right-3 text-xs font-bold text-ink border border-ink bg-paper px-2 py-1 pointer-events-none">
      Saved
    </div>
  );
}
