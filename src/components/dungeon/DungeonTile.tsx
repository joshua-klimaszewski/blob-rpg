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
  // Fog of war — never seen
  if (visibility === 'hidden') {
    return <div className="bg-ink w-full h-full" />
  }

  // Visible wall — dark gray with subtle border, distinct from fog
  if (type === 'wall' && visibility === 'visible') {
    return (
      <div className="bg-gray-800 border border-gray-700 w-full h-full" />
    )
  }

  // Explored wall — slightly lighter than visible wall, clearly "seen before"
  if (type === 'wall' && visibility === 'explored') {
    return (
      <div className="bg-gray-700 border border-gray-600 w-full h-full" />
    )
  }

  // Explored floor — dimmed
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

  // Visible floor — bright white
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
