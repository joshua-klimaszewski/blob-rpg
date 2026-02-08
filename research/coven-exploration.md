Deep Dive: The Coven (Squad) System for Mobile DRPGs

This research explores the transition from individual party management (Etrian Odyssey) to Squad management (Labyrinth of Refrain), specifically optimized for a React-based mobile state.

1. The Core Concept: "The Pact"

Instead of a party consisting of 5-6 independent units, the player manages 3-5 Pacts.

The Unit: An individual character (Class, Stats, Level).

The Pact: A "container" item that defines the squad's capabilities.

The Coven: The resulting combination of a Pact + assigned Units.

Why this works for Mobile:

Fewer UI Targets: You tap 3-5 command buttons in combat instead of 6+.

Aggregated Stats: Health bars and Mana pools can be visually merged into one "Squad Bar."

Deep Customization, Simple Execution: The "Crunch" happens in the town menu; the "Play" is streamlined.

2. Technical Architecture (State Model)

In a React/Redux/Local-Storage context, a Coven is a composite object.

2.1 The Pact Schema

A Pact is an equippable item that dictates the "Shape" of the squad.

{
"id": "pact_defensive_circle",
"name": "Shield Wall Pact",
"slots": 3,
"bonuses": { "def": 1.2, "aggro": 1.5 },
"pactSkills": ["total_guard", "counter_stance"],
"requirement": { "class": "Protector", "minLevel": 10 }
}

2.2 Aggregation Logic (The "Coven" Object)

The combat engine calculates the Coven's power by summing the units within:

HP/TP: Combined total of all units. If the Coven takes damage, it is distributed (either equally or via a "Leader" system).

Speed: The average of the units (or the lowest, for balancing).

Actions: A Pact might allow 1 attack per turn, or 1 attack per unit in the pact if it’s a high-tier item.

3. Skill Synergy: "Vanguard & Rearguard"

Pacts allow for Sub-Grid positioning within a single squad.

Vanguard Slots (Front): Units here deal 100% damage but take 100% damage.

Rearguard Slots (Back): Units here deal 50% damage (unless using ranged/magic) but take 50% damage.

Synthesis: You can put your "Medic" in the Rearguard slot of a "Protector's" Pact, ensuring the healer is shielded by the tank's stats.

4. Mobile UX Implementation

4.1 The "Tactical Overview" (Combat UI)

Visual: 3 large "Plates" on the screen.

Tapping: Tapping a Plate opens a radial menu: [Attack, Skill, Defend, Brave].

Visual Feedback: When a Coven attacks, the sprites of all 3 units inside it perform a coordinated animation.

4.2 The "Coven Workshop" (Town UI)

Drag-and-Drop: Drag character portraits into Pact slots.

Auto-Optimization: A "Fill Best" button that places high-DEF units in Vanguard slots and high-INT units in Rearguard slots.

5. Synthesis Formula: Creating a Coven

Step

Action

Outcome

1. Find Pact

Loot/Shop

Unlock "Assassin's Pact" (2 Slots).

2. Assign Units

Menu

Place a "Rogue" and a "Binder" inside.

3. Calculate

State Engine

New "Assassination Squad" created with combined Speed and "Dagger" skills.

4. Combat

Gameplay

1 Tap triggers a "Dual Strike" that procs both units' passives.

6. Implementation for "Gilded Labyrinth"

To maintain the Etrian Odyssey feel while using Pacts:

Class-Locked Pacts: Only a "Landsknecht" can lead a "Vanguard Pact."

Shared Skill Points: Characters still have individual EO-style skill trees, but some skills are "Aura" skills that buff their entire Pact.

Permadeath/Loss: If a Coven "Wipes," all units inside are KO'd. This increases the tension of a deep dive—one bad turn loses 3 people, not just 1.
