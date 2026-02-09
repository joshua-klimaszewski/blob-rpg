import type { TileType, TileVisibility } from '../../types/dungeon'
import { DungeonTileIcon } from './DungeonTileIcon'

interface DungeonTileProps {
  type: TileType
  visibility: TileVisibility
}

// Navigation tile types that show icons
const NAVIGATION_TILES: TileType[] = ['entrance', 'exit', 'checkpoint', 'shortcut']

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

  const isNavigationTile = NAVIGATION_TILES.includes(type)

  // Explored floor — dimmed
  if (visibility === 'explored') {
    return (
      <div className="bg-gray-300 border border-gray-400 w-full h-full flex items-center justify-center">
        {isNavigationTile && (
          <DungeonTileIcon type={type} className="text-gray-500" />
        )}
      </div>
    )
  }

  // Visible navigation tile — inverted for emphasis
  if (isNavigationTile) {
    return (
      <div className="bg-ink border-2 border-ink w-full h-full flex items-center justify-center">
        <DungeonTileIcon type={type} className="text-paper" />
      </div>
    )
  }

  // Visible floor — bright white
  return (
    <div className="bg-paper border border-gray-200 w-full h-full flex items-center justify-center" />
  )
}
