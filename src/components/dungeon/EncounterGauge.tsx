import { getGaugeZone } from '../../systems/dungeon'
import type { EncounterGaugeState } from '../../types/dungeon'

interface EncounterGaugeProps {
  gauge: EncounterGaugeState
}

const ZONE_COLORS = {
  safe: 'bg-gauge-safe',
  warn: 'bg-gauge-warn',
  danger: 'bg-gauge-danger',
}

export function EncounterGauge({ gauge }: EncounterGaugeProps) {
  const percentage = (gauge.value / gauge.threshold) * 100
  const zone = getGaugeZone(gauge.value)
  const colorClass = ZONE_COLORS[zone]

  return (
    <div className="h-3 w-full border border-ink bg-paper">
      <div
        className={`h-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
