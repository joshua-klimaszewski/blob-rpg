import { useRef, useEffect } from 'react'
import type { FloorData } from '../../types/dungeon'
import type { FloorProgress } from '../../types/save'
import { positionKey } from '../../systems/dungeon'

interface FloorMinimapProps {
  floor: FloorData
  progress: FloorProgress | undefined
  selectedWarpPoint?: string // "x,y" key
}

const PX_PER_TILE = 6

export function FloorMinimap({ floor, progress, selectedWarpPoint }: FloorMinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasWidth = floor.width * PX_PER_TILE
  const canvasHeight = floor.height * PX_PER_TILE

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const exploredSet = new Set(progress?.exploredTiles ?? [])
    const warpSet = new Set(progress?.discoveredWarpPoints ?? [])

    // Clear — fog/unexplored
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw tiles
    for (let y = 0; y < floor.height; y++) {
      for (let x = 0; x < floor.width; x++) {
        const key = positionKey({ x, y })
        const tile = floor.tiles[y][x]
        const px = x * PX_PER_TILE
        const py = y * PX_PER_TILE

        if (!exploredSet.has(key)) continue

        if (tile.type === 'wall') {
          ctx.fillStyle = '#404040' // gray-700
          ctx.fillRect(px, py, PX_PER_TILE, PX_PER_TILE)
        } else {
          ctx.fillStyle = '#9ca3af' // gray-400
          ctx.fillRect(px, py, PX_PER_TILE, PX_PER_TILE)
        }
      }
    }

    // Draw discovered warp points as white markers
    for (const wp of warpSet) {
      const [wx, wy] = wp.split(',').map(Number)
      const px = wx * PX_PER_TILE
      const py = wy * PX_PER_TILE
      ctx.fillStyle = '#fff'
      ctx.fillRect(px + 1, py + 1, PX_PER_TILE - 2, PX_PER_TILE - 2)
    }

    // Highlight selected warp point
    if (selectedWarpPoint) {
      const [sx, sy] = selectedWarpPoint.split(',').map(Number)
      const px = sx * PX_PER_TILE
      const py = sy * PX_PER_TILE
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 1
      ctx.strokeRect(px, py, PX_PER_TILE, PX_PER_TILE)
      ctx.fillStyle = '#fff'
      ctx.fillRect(px + 1, py + 1, PX_PER_TILE - 2, PX_PER_TILE - 2)
    }
  }, [floor, progress, selectedWarpPoint, canvasWidth, canvasHeight])

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border border-ink"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  )
}
