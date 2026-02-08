RPG Research: "Gilded Labyrinth" Mechanical Specification

This document outlines the core game mechanics derived from Etrian Odyssey, Pokemon Mystery Dungeon, Final Fantasy VI, and Final Fantasy Tactics.

1. The Core Loop (The "Macro" Cycle)

The Foray: Grid-based exploration, resource gathering, and mapping.

The Tension: Risk/Reward decision making—progress further to find the next "Shortcut" or warp back to town to secure loot.

The Synthesis: Returning to the Hub to sell monster parts (unlocking gear), resting (HP/TP recovery), and allocating Skill Points (JP).

2. Dungeon Exploration Mechanics

2.1 Movement & Turn Synchronization (PMD)

Discrete Turns: The world operates on a "tick" system. 1 Player Step = 1 World Turn.

Synchronous AI: Enemies (FOEs) and hazards move only when the player moves.

Input Mapping: \* Swipe: Cardinal movement.

Tap-Self: Wait one turn (allows enemies to close distance or restores minor HP/TP if skills allow).

2.2 The Encounter Gauge (EO)

Visible Threat: A UI element that transitions from Green $\rightarrow$ Yellow $\rightarrow$ Red based on steps taken.

Logic: \* Steps increment a dangerValue.

Combat is triggered by a probability check that scales exponentially once the gauge hits the "Red" threshold.

Abilities: Survivalist-style skills can reduce the dangerValue increment per step.

2.3 Cartography & Shortcuts

Auto-Mapping: Floors are revealed as the player traverses tiles.

Shortcut Nodes: Critical "One-Way" paths that, once opened from the "inside," allow fast travel between the entrance and deeper floors. This is the primary "Checkpoint" system.

3. Combat & Economic Meta

3.1 The "Shutdown" System (EO)

Combat revolves around disabling enemy body parts to neutralize threats:

Head Binds: Disables "Spells" and "Intelligence-based" attacks.

Arm Binds: Disables "Physical" attacks and reduces damage output.

Leg Binds: Prevents "Escape" and "Evasion." Disables "Agility-based" skills.

3.2 The "Unlock" Economy

Material-Based Shop: Shops do not have static inventories.

Logic: Selling specific quantities of monster drops (e.g., 5x "Pointy Horn") triggers a Shop_Unlock event for a specific item (e.g., "Bronze Spear").

Conditional Drops: Specific loot is only dropped if the enemy is defeated under certain conditions (e.g., "Killed while Head Bound" or "Killed with Fire").

4. Progression & Character Growth

4.1 Skill Trees (EO/FFT)

Dependency Nodes: Skills are arranged in a tree. Investing in "Basic Sword" unlocks "Vertical Slice."

Active vs. Passive: Players must balance TP-consuming active skills with permanent passive stat boosts.

Job Points (JP): Earned through combat and used as the currency for tree progression.

4.2 Stat Growth & Sub-classing (FF6/FFT)

Magicite Growth: Equippable items (Espers/Artifacts) that provide permanent stat bonuses (e.g., +2 STR) only at the moment of Level Up.

Dual-Classing: Allowing a primary class to equip a secondary class's skill tree (at reduced effectiveness) to create hybrid builds (e.g., a "Tank" with "Healing" sub-skills).

5. Summary Table for AI Logic Implementation

System

Inspiration

Key Variable/Logic

Movement

PMD

OnStep() { moveWorld(); checkEncounter(); }

Encounter

EO

ThreatLevel 0-100; probability check at >80.

Combat

EO

Target.Status = HeadBound $\rightarrow$ Disable Magic.

Progression

FF6

OnLevelUp() { stats += Artifact.Bonus }

Economy

EO

Shop.Unlock(Item) IF Global.Sold(Material) >= Required.

Deep Dive: Etrian Odyssey Skill Tree Architecture

This research focuses on the structural logic of EO skill trees to facilitate the synthesis of new classes for the "Gilded Labyrinth" project.

1. The Functional Taxonomy of Skills

EO skills generally fall into one of four "Value Tiers." When synthesizing a new tree, ensure a 25/25/25/25 distribution across these tiers.

Tier A: Foundational Passives

Purpose: The "Stat Floor."

Examples: HP Up, TP Up, Phys DEF Up, Element Mastery.

Scaling: Usually diminishing returns (e.g., Level 1-5 give 3% each, 6-10 give 1% each).

Logic: These are often "Gates." (Example: Requires Level 5 Sword Mastery to unlock "Falcon Slash").

Tier B: Tactical Actives (The "Bread and Butter")

Purpose: Constant use in standard encounters.

Mechanics:

Lines: Skills that hit a Front Row, Back Row, or All enemies.

Splashes: Hits target + neighbors.

Multihits: Hits random targets 2-4 times (High variance).

Tier C: Strategic Setups (Synergy/Binds)

Purpose: Boss killing and "Shutdown."

The Bind Logic: \* Head/Arm/Leg Snipes. High success rate but low damage.

Ailments: Poison (Flat damage), Paralyze (Chance to lose turn), Blind (Accuracy drop), Sleep (Skip turn + extra damage taken).

The "Lead-in" Skill: Skills that do bonus damage if a target has an ailment/bind.

Tier D: Force/Burst (The "Limit Break")

Purpose: Once-per-battle momentum shifts.

Mechanics: "Force Boost" (3-turn self-buff) and "Force Break" (Massive effect that destroys the Force Gauge for the rest of the dungeon dive).

2. Core Class Archetypes & Mechanical Hooks

The "Protector" (Tank)

Signature Logic: Redirection & Damage Mitigation.

Key Skills:

Front/Back Guard: Reduces damage to a row for one turn.

Provoke: Increases self-aggro.

Parry/Aegis: Chance to nullify an attack.

Elemental Walls: Complete immunity to Fire/Ice/Volt for one turn (Requires precise prediction).

The "Landsknecht" (Frontline DPS)

Signature Logic: Chasing & Linking.

Key Skills:

Link [Element]: If an ally hits the target with that element later in the turn, the Landsknecht follows up with a free attack.

Vanguard: Lower defense to move first and increase damage.

The "Medic" (Healer)

Signature Logic: Maintenance & Recovery.

Key Skills:

Refresh/Recover: Remove Ailments/Binds.

Overheal: Allows HP to exceed 100% temporarily.

Auto-Revive: Passive chance to revive a fallen ally at the end of the turn.

The "Dark Hunter" (The Specialist)

Signature Logic: Sadistic Synergy.

Key Skills:

Ecstasy: Massive damage, but ONLY if the target has 3 Binds.

Soul Libation: Heal party based on the amount of binds on the enemy.

3. The "Synthesis" Formula (Creating New Trees)

To create a "Gilded Labyrinth" class, follow this dependency map:

Level 1-10 (Early Dive): Focus on 1 Active attack, 1 Passive Stat boost, and 1 Resource skill (e.g., "Scavenge" or "Chop").

Level 11-25 (Mid Dive): Unlock "Conditional" skills. These require a specific state (e.g., "If target is Poisoned, this skill hits 3 times").

Level 26+ (Late Dive): "Expert" passives that alter the class identity (e.g., "Weapon Free" allowing a Mage to use Sword skills).

4. Synergy Loops (Cross-Class Logic)

When building the "Skill Tree" for the AI agent, ensure these loops exist:

The Chain: [Sniper] Binds Legs $\rightarrow$ [Brawler] gets 100% Crit on Leg Bound targets $\rightarrow$ [Zodiac] uses "Break" skill that consumes the Bind for massive AOE.

The Wall: [Tank] uses Provoke $\rightarrow$ [Fencer] uses "Predict" (Counter-attacks every time they are targeted).

The Battery: [Bard] uses "TP Regen Song" $\rightarrow$ [Alchemist] can now spam high-cost Tier 3 Spells every turn.

5. UI/UX Considerations for Mobile

Tree Depth: Avoid deep vertical trees. Use a "Hub and Spoke" model (Central core skill with 3-4 upgrades branching out).

Skill Previews: Display a "Next Level" tooltip showing exactly how much the % damage or % proc rate increases.

Respec: Always include a "Rest" mechanic (Level -2 to get all SP back) to encourage experimentation.
