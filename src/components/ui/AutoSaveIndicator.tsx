import { useEffect, useState } from 'react';
import { useAutoSaveEvent } from '../../hooks/useAutoSave';

export function AutoSaveIndicator() {
  const [visible, setVisible] = useState(false);
  const saveEvent = useAutoSaveEvent();

  useEffect(() => {
    if (saveEvent === 0) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1200);
    return () => clearTimeout(timer);
  }, [saveEvent]);

  if (!visible) return null;

  return (
    <div className="fixed top-2 right-2 text-xs text-gray-400 pointer-events-none">
      Saving...
    </div>
  );
}
