import { useRef, useEffect, useState, useCallback } from 'react'
import type { DungeonState, FloorData } from '../../types/dungeon'
import { computeVisibleTiles, positionKey } from '../../systems/dungeon'

interface MinimapProps {
  floor: FloorData
  dungeon: DungeonState
}

const COLLAPSED_PX_PER_TILE = 4
const EXPANDED_PX_PER_TILE = 8

export function Minimap({ floor, dungeon }: MinimapProps) {
  const [expanded, setExpanded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const pxPerTile = expanded ? EXPANDED_PX_PER_TILE : COLLAPSED_PX_PER_TILE
  const canvasWidth = floor.width * pxPerTile
  const canvasHeight = floor.height * pxPerTile

  const toggle = useCallback(() => setExpanded((v) => !v), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const exploredSet = new Set(dungeon.exploredTiles)
    const visibleSet = computeVisibleTiles(dungeon.playerPosition, floor)

    // Clear
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw tiles
    for (let y = 0; y < floor.height; y++) {
      for (let x = 0; x < floor.width; x++) {
        const key = positionKey({ x, y })
        const tile = floor.tiles[y][x]
        const px = x * pxPerTile
        const py = y * pxPerTile

        if (tile.type === 'wall') {
          // Walls stay black
          continue
        }

        if (visibleSet.has(key)) {
          ctx.fillStyle = '#fff'
          ctx.fillRect(px, py, pxPerTile, pxPerTile)
        } else if (exploredSet.has(key)) {
          ctx.fillStyle = '#9ca3af' // gray-400
          ctx.fillRect(px, py, pxPerTile, pxPerTile)
        }
        // hidden tiles stay black (already cleared)
      }
    }

    // Draw visible FOEs as gray squares
    ctx.fillStyle = '#6b7280' // gray-500
    for (const foe of dungeon.foes) {
      if (visibleSet.has(positionKey(foe.position))) {
        const fx = foe.position.x * pxPerTile + 1
        const fy = foe.position.y * pxPerTile + 1
        ctx.fillRect(fx, fy, pxPerTile - 2, pxPerTile - 2)
      }
    }

    // Draw player as black dot on white
    const playerPx = dungeon.playerPosition.x * pxPerTile
    const playerPy = dungeon.playerPosition.y * pxPerTile
    ctx.fillStyle = '#fff'
    ctx.fillRect(playerPx, playerPy, pxPerTile, pxPerTile)
    ctx.fillStyle = '#000'
    const dotSize = Math.max(2, pxPerTile - 2)
    ctx.fillRect(
      playerPx + (pxPerTile - dotSize) / 2,
      playerPy + (pxPerTile - dotSize) / 2,
      dotSize,
      dotSize,
    )
  }, [dungeon, floor, pxPerTile, canvasWidth, canvasHeight])

  if (expanded) {
    return (
      <div
        className="fixed inset-0 z-20 bg-ink/80 flex items-center justify-center"
        onClick={toggle}
      >
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="border border-gray-600"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>
    )
  }

  return (
    <div
      className="absolute top-2 right-2 z-10 border border-gray-400 bg-ink"
      onClick={toggle}
    >
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  )
}
