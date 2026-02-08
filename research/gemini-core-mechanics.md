Project: Gilded Labyrinth - Core Mechanics

1. The Macro Loop (The "EO" Cycle)

The game operates on a perpetual three-phase cycle:

The Foray: Grid-based exploration, resource gathering, and mapping.

The Tension: Risk/Reward decision making—progressing to find "Shortcuts" or warping back to town to secure loot.

The Synthesis: Returning to the Hub to sell monster parts (unlocking gear), resting, and allocating Skill Points (JP).

2. Dungeon Navigation Logic (PMD x EO)

2.1 Synchronous Turn System

Discrete Turns: 1 Player Action (Move/Wait/Skill) = 1 World Tick.

Synchronous AI: Enemies (FOEs) and hazards move only when the player moves.

Mobile Input:

Swipe: Cardinal movement (1 Tile).

Tap Self: Wait one turn (allows enemies to close distance or restores minor HP/TP).

2.2 The Encounter Gauge

Visible Threat: A UI element transitions Green → Yellow → Red based on steps.

Logic: \* Steps increment a dangerValue.

Combat triggers via a probability check that scales exponentially once the gauge is "Red."

Mitigation: Skills like "Stalker" reduce the increment per step.

2.3 Cartography & Shortcuts

Auto-Map: Tiles are revealed as the player traverses them.

Manual Markers: Players can tap revealed tiles to place icons (Chest, Resource, Hazard).

Shortcuts: Critical "One-Way" paths that, once opened from the "inside," allow fast travel between the entrance and deeper floors.
