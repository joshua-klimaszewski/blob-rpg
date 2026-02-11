import { useMemo } from 'react'
import type { DungeonState, FloorData } from '../../types/dungeon'
import { computeVisibleTiles, getTileVisibility, positionKey, getFoeColor } from '../../systems/dungeon'
import { usePartyStore } from '../../stores/partyStore'
import { DungeonTile } from './DungeonTile'
import { PlayerToken } from './PlayerToken'
import { FoeToken } from './FoeToken'

interface DungeonGridProps {
  floor: FloorData
  dungeon: DungeonState
  cellSize: number
}

export function DungeonGrid({ floor, dungeon, cellSize }: DungeonGridProps) {
  const gridWidth = floor.width * cellSize
  const gridHeight = floor.height * cellSize
  const getActiveParty = usePartyStore((s) => s.getActiveParty)
  const activeParty = getActiveParty()

  const visibleSet = useMemo(
    () => computeVisibleTiles(dungeon.playerPosition, floor),
    [dungeon.playerPosition, floor],
  )

  const exploredSet = useMemo(
    () => new Set(dungeon.exploredTiles),
    [dungeon.exploredTiles],
  )

  return (
    <div className="relative" style={{ width: gridWidth, height: gridHeight }}>
      {/* Tile grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${floor.width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${floor.height}, ${cellSize}px)`,
        }}
      >
        {floor.tiles.flatMap((row, y) =>
          row.map((tile, x) => (
            <DungeonTile
              key={`${x}-${y}`}
              type={tile.type}
              visibility={getTileVisibility(x, y, visibleSet, exploredSet)}
            />
          )),
        )}
      </div>

      {/* FOE tokens — only render on visible tiles */}
      {dungeon.foes
        .filter((foe) => visibleSet.has(positionKey(foe.position)))
        .map((foe) => {
          const color = getFoeColor(foe.enemyId, activeParty)
          return (
            <FoeToken
              key={foe.id}
              cellSize={cellSize}
              gridX={foe.position.x}
              gridY={foe.position.y}
              aggroState={foe.aggroState}
              color={color}
            />
          )
        })}

      {/* Player token (on top) */}
      <PlayerToken
        cellSize={cellSize}
        gridX={dungeon.playerPosition.x}
        gridY={dungeon.playerPosition.y}
      />
    </div>
  )
}
