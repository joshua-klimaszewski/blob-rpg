import { useRef, useState, useEffect, useCallback } from 'react'
import type { DungeonState, FloorData } from '../../types/dungeon'
import { DungeonGrid } from './DungeonGrid'

interface DungeonViewportProps {
  floor: FloorData
  dungeon: DungeonState
}

export function DungeonViewport({ floor, dungeon }: DungeonViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      setViewportSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      })
    }
  }, [])

  useEffect(() => {
    updateSize()
    const observer = new ResizeObserver(updateSize)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => observer.disconnect()
  }, [updateSize])

  // Cell size: show ~7 tiles across the viewport width
  const cellSize = viewportSize.width > 0
    ? Math.floor(viewportSize.width / 7)
    : 48

  // Camera: center the grid so the player tile is in the middle of the viewport
  const gridWidth = floor.width * cellSize
  const gridHeight = floor.height * cellSize

  const targetX = -(dungeon.playerPosition.x * cellSize + cellSize / 2 - viewportSize.width / 2)
  const targetY = -(dungeon.playerPosition.y * cellSize + cellSize / 2 - viewportSize.height / 2)

  // Clamp so the grid doesn't scroll past its edges
  const clampedX = Math.max(Math.min(targetX, 0), viewportSize.width - gridWidth)
  const clampedY = Math.max(Math.min(targetY, 0), viewportSize.height - gridHeight)

  return (
    <div
      ref={containerRef}
      className="overflow-hidden flex-1 relative"
      style={{ touchAction: 'none' }}
    >
      <div
        className="absolute"
        style={{
          transform: `translate(${clampedX}px, ${clampedY}px)`,
          transition: 'transform 150ms ease-out',
        }}
      >
        <DungeonGrid floor={floor} dungeon={dungeon} cellSize={cellSize} />
      </div>
    </div>
  )
}
