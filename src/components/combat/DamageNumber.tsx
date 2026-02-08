import { useEffect, useState } from 'react';

interface DamageNumberProps {
  damage: number;
  isCrit: boolean;
  onComplete: () => void;
}

export function DamageNumber({ damage, isCrit, onComplete }: DamageNumberProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`
        absolute pointer-events-none font-bold
        animate-[fadeUp_0.8s_ease-out_forwards]
        ${isCrit ? 'text-gauge-danger text-lg' : 'text-ink text-sm'}
      `}
      style={{ top: '-8px', left: '50%', transform: 'translateX(-50%)' }}
    >
      {isCrit && <span className="text-xs block text-center">CRIT</span>}
      {damage}
    </div>
  );
}
