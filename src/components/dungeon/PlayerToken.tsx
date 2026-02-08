interface PlayerTokenProps {
  cellSize: number
  gridX: number
  gridY: number
}

export function PlayerToken({ cellSize, gridX, gridY }: PlayerTokenProps) {
  const r = cellSize * 0.3

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
      <circle
        cx={cellSize / 2}
        cy={cellSize / 2}
        r={r}
        fill="black"
        stroke="white"
        strokeWidth={2}
      />
    </svg>
  )
}
