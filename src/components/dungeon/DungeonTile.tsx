import type { TileType, TileVisibility } from '../../types/dungeon'

interface DungeonTileProps {
  type: TileType
  visibility: TileVisibility
}

const TILE_ICONS: Partial<Record<TileType, string>> = {
  exit: '\u2191',       // ↑ arrow up
  checkpoint: '\u2691', // ⚑ flag
  shortcut: '\u21C5',   // ⇅ up/down arrows
}

export function DungeonTile({ type, visibility }: DungeonTileProps) {
  if (visibility === 'hidden') {
    return <div className="bg-ink w-full h-full" />
  }

  if (type === 'wall') {
    return <div className="bg-ink w-full h-full" />
  }

  if (visibility === 'explored') {
    return (
      <div className="bg-gray-300 border border-gray-400 w-full h-full flex items-center justify-center">
        {TILE_ICONS[type] && (
          <span className="text-gray-500 text-xs leading-none">
            {TILE_ICONS[type]}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="bg-paper border border-gray-200 w-full h-full flex items-center justify-center">
      {TILE_ICONS[type] && (
        <span className="text-gray-500 text-xs leading-none">
          {TILE_ICONS[type]}
        </span>
      )}
    </div>
  )
}
