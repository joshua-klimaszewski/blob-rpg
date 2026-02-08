import type { DungeonState, FloorData } from '../../types/dungeon'
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
            <DungeonTile key={`${x}-${y}`} type={tile.type} />
          )),
        )}
      </div>

      {/* FOE tokens */}
      {dungeon.foes.map((foe) => (
        <FoeToken
          key={foe.id}
          cellSize={cellSize}
          gridX={foe.position.x}
          gridY={foe.position.y}
        />
      ))}

      {/* Player token (on top) */}
      <PlayerToken
        cellSize={cellSize}
        gridX={dungeon.playerPosition.x}
        gridY={dungeon.playerPosition.y}
      />
    </div>
  )
}
