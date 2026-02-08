interface FoeTokenProps {
  cellSize: number
  gridX: number
  gridY: number
}

export function FoeToken({ cellSize, gridX, gridY }: FoeTokenProps) {
  const half = cellSize / 2
  const pad = cellSize * 0.2

  // Triangle (spiky enemy shape)
  const points = [
    `${half},${pad}`,
    `${cellSize - pad},${cellSize - pad}`,
    `${pad},${cellSize - pad}`,
  ].join(' ')

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        left: gridX * cellSize,
        top: gridY * cellSize,
        width: cellSize,
        height: cellSize,
      }}
    >
      <polygon
        points={points}
        fill="#737373"
        stroke="black"
        strokeWidth={1.5}
      />
    </svg>
  )
}
