import type { HelpEntry } from './types'

export const PROGRESSION_SECTIONS: HelpEntry[] = [
  {
    heading: 'XP & Leveling',
    body: 'Your party members earn XP from combat victories. When a character accumulates enough XP, they level up automatically after battle.\n\nXP thresholds scale quadratically: the XP needed for the next level equals level squared times 100. For example, reaching level 2 requires 400 XP, level 5 requires 2,500 XP, and level 10 requires 10,000 XP. The maximum level is 20.',
  },
  {
    heading: 'Skill Points (SP)',
    body: 'Characters start at level 1 with 0 SP. You gain 1 SP each time a character levels up. Spend SP on the skill tree via the Characters screen in town.\n\nIf all skill "Learn" buttons appear disabled, your character likely needs to level up first to earn SP. Head into the dungeon, win some battles, and come back to check your skill tree.',
  },
  {
    heading: 'Skill Tree Categories',
    body: 'Each class has a hub-and-spoke skill tree organized into five categories.\n\nCore — the class identity skill that defines your role.\nActive — combat skills you can use during battle, costing TP.\nPassive — permanent bonuses that are always in effect once learned.\nSynergy — conditional skills that reward setup play, such as dealing bonus damage to bound targets.\nUltimate — a powerful capstone skill at the end of the tree.',
  },
  {
    heading: 'Skill Prerequisites',
    body: 'Some skills require a minimum character level before they can be learned. If a skill shows a level requirement, you must reach that level before spending SP on it.\n\nEach skill also has an SP cost (usually 1). Plan your skill point investments carefully — you earn a limited number of SP as you level up.',
  },
  {
    heading: 'Equipment',
    body: 'Visit the Shop in town to buy weapons, armor, and accessories. Each character has four equipment slots: weapon, armor, and two accessories.\n\nEquipment provides stat bonuses that improve your combat effectiveness. Selling monster materials at the shop unlocks new and better equipment for purchase.',
  },
]
