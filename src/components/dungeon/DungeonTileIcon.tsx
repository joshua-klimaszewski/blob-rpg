import type { TileType } from '../../types/dungeon'

interface DungeonTileIconProps {
  type: TileType
  className?: string
}

/**
 * SVG icons for dungeon navigation tiles.
 * Minimal B&W wireframe style, designed for clarity at small sizes.
 */
export function DungeonTileIcon({ type, className = '' }: DungeonTileIconProps) {
  const baseClasses = `w-6 h-6 ${className}`

  switch (type) {
    case 'entrance':
      // Door/archway - represents entrance back to town
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Door frame */}
          <rect x="7" y="4" width="10" height="16" />
          {/* Door handle */}
          <circle cx="14" cy="12" r="0.5" fill="currentColor" />
          {/* Arrow pointing up (exit/return) */}
          <polyline points="12,8 12,4 12,8" strokeWidth="1.5" />
          <polyline points="10,6 12,4 14,6" strokeWidth="1.5" />
        </svg>
      )

    case 'exit':
      // Stairs going down - represents descent to next floor
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Steps descending */}
          <path d="M4,8 L8,8 L8,12 L12,12 L12,16 L16,16 L16,20 L20,20" strokeLinejoin="miter" />
          {/* Arrow pointing down */}
          <polyline points="18,14 18,18 18,14" strokeWidth="1.5" />
          <polyline points="16,16 18,18 20,16" strokeWidth="1.5" />
        </svg>
      )

    case 'checkpoint':
      // Flag marker - save/warp point
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Flagpole */}
          <line x1="6" y1="4" x2="6" y2="20" />
          {/* Flag */}
          <path d="M6,4 L18,8 L6,12 Z" fill="currentColor" />
          {/* Base */}
          <line x1="4" y1="20" x2="8" y2="20" strokeWidth="2.5" />
        </svg>
      )

    case 'shortcut':
      // Concentric circles - warp point discovered by exploring
      return (
        <svg className={baseClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {/* Outer circle */}
          <circle cx="12" cy="12" r="8" />
          {/* Middle circle */}
          <circle cx="12" cy="12" r="5" />
          {/* Inner dot */}
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          {/* Vertical line through center */}
          <line x1="12" y1="4" x2="12" y2="20" strokeWidth="1" />
          {/* Horizontal line through center */}
          <line x1="4" y1="12" x2="20" y2="12" strokeWidth="1" />
        </svg>
      )

    default:
      return null
  }
}
