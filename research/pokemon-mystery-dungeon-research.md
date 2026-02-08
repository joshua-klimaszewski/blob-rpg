Deep Dive: Pokémon Mystery Dungeon (PMD) Mechanics

This research focuses on the spatial and environmental mechanics of PMD, providing the logic for "tactical grid" movement and survival in the "Gilded Labyrinth."

1. The "True" Synchronous Turn System

Unlike Etrian Odyssey, where the "World Tick" happens after a menu selection, PMD is a Fluid Grid system.

1.1 Time-Step Logic

Player Move = World Move: Every single cardinal step is a turn.

Speed Stat Tiers: Speed isn't just a number; it determines "Action Density."

Standard: 1 Action per Turn.

Haste: 2 Actions per Turn (Player moves twice while enemies move once).

Slow: 1 Action every 2 Turns.

Mobile Adaptation: This allows for "Bumping" into enemies to trigger basic attacks, reducing the need for menu-diving.

2. Environmental & Spatial Tactics

2.1 Room vs. Corridor Logic

PMD treats rooms and corridors as two different tactical zones:

Corridors: Narrow 1-tile paths. Force "Conga Line" combat. Perfect for the "Protector" at the front.

Rooms: Wide open areas. Allows enemies to surround the player. Skills like "Wide Slash" or "Room-Clear Spells" (like AOE Earthquakes) gain value here.

2.2 Monster Houses (The "Trap" Meta)

The Mechanic: Entering a specific room triggers a massive spawn of 10+ enemies simultaneously.

The Tension: This acts as the "FOE" equivalent—a sudden shift from exploration to high-stakes survival.

Synthesis: Use this to gate high-tier loot chests.

3. Item-Centric Survival (The "Tool" Meta)

PMD leans heavily on "Utility Consumables" rather than just "Potions."

3.1 Orbs & Seeds

Seeds (Status/Self): \* Reviver Seed: Passive insurance (Auto-resurrection).

Warp Seed: Emergency escape/random repositioning.

Stun Seed: Single-target hard CC.

Orbs (Environment): \* Luminous Orb: Reveals the entire map for the floor.

Petrify Orb: Freezes everyone in the room.

The "Gilded" Twist: These items should be rare loot found in the dungeon, forcing the player to decide: "Do I use my only Warp Seed now, or hope I survive the next 3 steps?"

4. The IQ/Tactics System (Party AI)

Since the player only controls the "Leader," the rest of the party needs logic.

Tactics Presets:

Follow Me: Units stay within 1 tile.

Go After Enemies: Units split up to hunt (High risk/High reward).

Wait There: Strategic positioning for traps.

Synthesis for "Gilded": Even if you use the Coven System, individual units within the squad can have "IQ Skills" (Passives) that trigger automatically (e.g., "Bodyguard" lets a unit take a hit for the leader).

5. Summary Table: PMD vs. EO Integration

Feature

PMD Style (Fluid)

EO Style (Strategic)

Gilded Synthesis

Movement

Swipe to move/attack

Menu-based movement

Swipe to move/bump-attack.

Enemies

Large quantities; weak

Low quantities; lethal

Standard mobs (PMD) + FOEs (EO).

Death

Lose all items/money

Game Over / Reload

Lose loot/materials; keep XP.

Mapping

Auto-generating fog

Manual wall-drawing

Auto-reveal + Manual Markers.

6. Synthesis: The "Tactical Bump" Combat

For the project, we should implement combat that triggers based on Collision:

Exploration Mode: Swipe to move.

Contact: Swiping into an enemy tile executes a "Basic Attack."

Skill Mode: Tap a "Coven Plate" to open the Skill Menu for specialized "Shutdown" (Binds) or "AOE" (Room-clearing) abilities.
