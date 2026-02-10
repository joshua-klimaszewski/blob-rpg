import type { FoeAggroState } from '../../types/dungeon'

interface FoeTokenProps {
  cellSize: number
  gridX: number
  gridY: number
  aggroState: FoeAggroState
}

export function FoeToken({ cellSize, gridX, gridY, aggroState }: FoeTokenProps) {
  const half = cellSize / 2
  const pad = cellSize * 0.2

  // Triangle (spiky enemy shape)
  const points = [
    `${half},${pad}`,
    `${cellSize - pad},${cellSize - pad}`,
    `${pad},${cellSize - pad}`,
  ].join(' ')

  const isAggro = aggroState === 'aggro'

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
        fill={isAggro ? '#dc2626' : '#737373'}
        stroke={isAggro ? '#991b1b' : 'black'}
        strokeWidth={isAggro ? 2 : 1.5}
      />
      {isAggro && (
        <text
          x={half}
          y={pad / 2}
          textAnchor="middle"
          fontSize={cellSize * 0.3}
          fill="#fca5a5"
        >
          !
        </text>
      )}
    </svg>
  )
}
