Deep Dive: Radiant Historia (Grid Manipulation)

This research focuses on the 3x3 Grid Combat and Turn Manipulation systems of Radiant Historia. It provides the blueprint for adding spatial depth to the "Gilded Labyrinth" combat encounters without increasing input complexity.

1. The Spatial Architecture (The 3x3 Grid)

1.1 The Enemy Field

Unlike standard RPGs where enemies stand in a line, enemies occupy a 3x3 grid.

Rows:

Front Row: Enemies deal 100% damage and take 100% damage.

Middle Row: Enemies deal/take standard damage.

Back Row: Enemies deal reduced damage but are harder to hit with melee.

The Hook: Enemies can be forced out of their preferred row.

1.2 Displacement Skills (The "Push" Meta)

Skills are defined not just by damage, but by a Vector.

Push: Knocks an enemy 1 tile BACK.

Pull: Yanks an enemy 1 tile FORWARD (into melee range).

Left/Right Slash: Knocks an enemy laterally.

Launch: Knocks an enemy into the "Air" (setup for aerial combos).

2. The "Stacking" Mechanic (The Core Loop)

This is the most critical system for your project.

The Logic: If Enemy A is at [1,1] and you Push Enemy B from [1,0] into [1,1], they occupy the Same Tile.

The Payoff: Any attack targeting that tile now hits BOTH enemies simultaneously.

The Combo:

Turn 1 (Pioneer): Uses "Shield Bash" (Push) to knock the Front Guard into the Back Mage.

Turn 2 (Alchemist): Casts "Fireball" on the Back tile.

Result: Both enemies take full Fire damage, effectively doubling the party's DPS efficiency.

3. Turn Manipulation (The "Change" System)

To set up combos, characters often need to act after the enemies or consecutively.

The "Change" Command:

A player can swap their turn with any enemy or ally in the timeline.

Cost: The character takes critical damage (Defenseless) until their new turn arrives.

Mobile Synergy: This is a perfect "Risk/Reward" button. "Do I take a hit now to get 3 turns in a row later?"

4. Synthesis for "Gilded Labyrinth"

4.1 Mobile Implementation (Gestures)

Instead of navigating menus to select "Push Back," use gestures on the enemy portrait.

Tap: Standard Attack.

Swipe Up: Push Back skill.

Swipe Down: Pull Forward skill.

Swipe Left/Right: Lateral Slash.

4.2 Environmental Hazards (PMD Hybrid)

Since you are mixing PMD (Dungeon) and EO (Battle), adding "Trap Tiles" to the combat grid enhances the push mechanics.

Spike Trap: Pushing an enemy into this tile deals 10% HP damage.

Web Trap: Pushing an enemy here triggers "Leg Bind."

4.3 Data Structure for React State

To implement "Stacking," the grid state must allow arrays of entities.

// Example Battle Grid State
const battleGrid = [
// Row 1
[
{ tileId: "0,0", entities: [] },
{ tileId: "0,1", entities: ["goblin_A"] }, // Goblin here
{ tileId: "0,2", entities: [] }
],
// Row 2
[
{ tileId: "1,0", entities: [] },
{ tileId: "1,1", entities: ["goblin_B", "orc_captain"] }, // STACKED!
{ tileId: "1,2", entities: [] }
],
// ...
];

5. The Combo Multiplier (Dopamine Engineering)

Hit Count: Every hit in a continuous chain increases the Damage Multiplier for subsequent hits.

Formula: Damage = BaseDamage _ (1 + (ComboCount _ 0.1))

Loop:

Push enemies together (0 damage, but sets up stack).

Multi-hit skill (increases Combo Count).

Finisher Nuke (Massive damage due to high Combo Count).

6. Recommended "Class Hooks" based on RH

The Grappler: Specializes in "Pull" and "Left/Right" to group enemies.

The Lancer: Attacks penetrate 2 tiles (hitting the enemy and the one behind them).

The Trapper: Places a "Mine" on an empty tile. The Grappler then pulls an enemy into it.
