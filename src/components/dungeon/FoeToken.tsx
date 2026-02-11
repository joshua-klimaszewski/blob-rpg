import type { FoeAggroState } from '../../types/dungeon'

interface FoeTokenProps {
  cellSize: number
  gridX: number
  gridY: number
  aggroState: FoeAggroState
  color: 'red' | 'yellow' | 'green' // Difficulty color based on player power
}

const COLOR_MAP = {
  red: { fill: '#dc2626', stroke: '#991b1b', text: '#fca5a5' },
  yellow: { fill: '#eab308', stroke: '#a16207', text: '#fef08a' },
  green: { fill: '#22c55e', stroke: '#15803d', text: '#86efac' },
}

export function FoeToken({ cellSize, gridX, gridY, aggroState, color }: FoeTokenProps) {
  const half = cellSize / 2
  const pad = cellSize * 0.2

  // Triangle (spiky enemy shape)
  const points = [
    `${half},${pad}`,
    `${cellSize - pad},${cellSize - pad}`,
    `${pad},${cellSize - pad}`,
  ].join(' ')

  const isAggro = aggroState === 'aggro'
  const colors = COLOR_MAP[color]

  return (
    <svg
      className={`absolute pointer-events-none ${isAggro ? 'animate-pulse' : ''}`}
      style={{
        left: gridX * cellSize,
        top: gridY * cellSize,
        width: cellSize,
        height: cellSize,
      }}
    >
      <polygon
        points={points}
        fill={colors.fill}
        stroke={colors.stroke}
        strokeWidth={isAggro ? 2 : 1.5}
      />
      {isAggro && (
        <text
          x={half}
          y={pad / 2}
          textAnchor="middle"
          fontSize={cellSize * 0.3}
          fill={colors.text}
        >
          !
        </text>
      )}
    </svg>
  )
}
