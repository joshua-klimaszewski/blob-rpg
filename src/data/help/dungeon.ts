import type { HelpEntry } from './types'

export const DUNGEON_SECTIONS: HelpEntry[] = [
  {
    heading: 'Encounter Gauge',
    body: 'The encounter gauge fills as you walk. It progresses from green to yellow to red. When it reaches 100%, a random combat encounter triggers and the gauge resets.\n\nThe fill rate depends on the floor difficulty. Some skills can reduce the fill rate or partially drain the gauge.',
  },
  {
    heading: 'FOEs (Field On Enemy)',
    body: 'FOEs are powerful enemies visible on the dungeon map. They are much tougher than random encounters and are meant to be avoided early on.\n\nFOEs move one step each time you move. Each FOE has a movement pattern — some patrol, some chase, and some stand still until provoked.\n\nDetection & Aggro: When you enter a FOE\'s detection radius (typically 3 tiles) and are in its line of sight, the FOE will notice you. An aggro\'d FOE turns red and plays an alert sound. Patrol FOEs switch to chase behavior when aggro\'d.\n\nTo escape an aggro\'d FOE, move far enough away (beyond detection radius + 2 tiles) or transition to a different area. Colliding with a FOE starts a difficult battle with elite enemies and no retreat.',
  },
  {
    heading: 'Fog of War',
    body: 'The dungeon is shrouded in darkness until you explore it. Tiles have three states: hidden (unexplored), explored (previously seen but out of range), and visible (currently in your line of sight).\n\nYour vision radius reveals nearby tiles as you move. Explored tiles remain on your minimap but may hide enemy movements.',
  },
  {
    heading: 'Checkpoints & Shortcuts',
    body: 'Checkpoints let you warp back to town to rest and resupply. Your dungeon progress is saved at the checkpoint.\n\nShortcuts are one-way paths that open up faster routes through previously explored areas.',
  },
]
