import type { HelpEntry } from './types'

export const COMBAT_SECTIONS: HelpEntry[] = [
  {
    heading: 'Turn Order',
    body: 'Combat is turn-based. Turn order is determined by AGI (agility) — faster characters act first. The turn timeline is shown at the top of the combat screen.',
  },
  {
    heading: 'The 3x3 Grid',
    body: 'Enemies are positioned on a 3x3 grid. Multiple enemies can share the same tile. Your party of 4 is displayed as a list on the left.\n\nTap a grid tile to select it as your target. Skills that target a tile will hit all enemies on that tile.',
  },
  {
    heading: 'Basic Actions',
    body: 'Attack — deal physical damage to all enemies on the targeted tile.\n\nDefend — reduce incoming damage until your next turn.\n\nFlee — attempt to escape from combat. Success is chance-based. You cannot flee from FOE battles.',
  },
  {
    heading: 'Displacement',
    body: 'Some skills push or pull enemies between tiles on the grid. Displacement moves enemies in a direction: push (away), pull (toward), left, or right.\n\nPushing enemies into the same tile groups them for AOE attacks. Pushing enemies into hazard tiles triggers trap effects. Enemies at the grid boundary cannot be pushed further.',
  },
  {
    heading: 'Combo Multiplier',
    body: 'Consecutive hits on the same turn increase damage. Each hit adds +10% to the combo multiplier. The combo counter resets at the start of each new turn.\n\nMulti-hit skills and AOE attacks that strike multiple enemies all build the combo counter.',
  },
  {
    heading: 'Trap Tiles',
    body: 'Skills can place hazards on grid tiles. Enemies standing on or pushed into a trap tile trigger its effect.\n\nSpike — deals direct damage.\nWeb — inflicts leg bind.\nFire — inflicts poison (damage over time).',
  },
  {
    heading: 'Binds',
    body: 'Binds disable specific body parts for a number of turns.\n\nHead bind — disables INT-based attacks and spells.\nArm bind — reduces physical damage by 50%.\nLeg bind — prevents fleeing and reduces evasion.\n\nSome skills deal bonus damage based on how many binds the target has.',
  },
  {
    heading: 'Ailments',
    body: 'Ailments are status effects separate from binds.\n\nPoison — deals flat damage at the end of each turn.\nParalyze — chance to skip your turn.\nSleep — skip your turn, but wake up when hit. First hit on a sleeping target deals 1.5x damage.\nBlind — reduces accuracy.',
  },
]
