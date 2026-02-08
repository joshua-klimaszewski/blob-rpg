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
