import { useRef, useEffect } from 'react';

interface LogEntry {
  id: number;
  message: string;
}

interface CombatLogProps {
  entries: LogEntry[];
}

export function CombatLog({ entries }: CombatLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  if (entries.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      className="px-4 py-1 border-t border-gray-200 overflow-y-auto max-h-20 text-xs text-gray-600"
    >
      {entries.map((entry) => (
        <div key={entry.id} className="py-px">
          {entry.message}
        </div>
      ))}
    </div>
  );
}
