import type { HelpEntry } from './types'

export const CONTROLS_SECTIONS: HelpEntry[] = [
  {
    heading: 'Dungeon Movement',
    body: 'Swipe in any direction or use the arrow keys to move one tile at a time. Movement is 4-directional: up, down, left, and right.\n\nEach step you take fills the encounter gauge and causes FOEs on the map to move.',
  },
  {
    heading: 'Combat Controls',
    body: 'Tap an enemy on the 3x3 grid to select a target tile. Then choose an action from the bottom menu: Attack, Skill, Defend, or Flee.\n\nSkills can be selected from the skill list. Each skill shows its TP cost and target type.',
  },
  {
    heading: 'Minimap',
    body: 'The minimap shows explored areas of the current floor. Tap it to expand or collapse the view.\n\nYour position is shown as a filled marker. Explored but out-of-sight tiles appear dimmed.',
  },
]
