Project: Gilded Labyrinth - Combat & Economy

1. Combat Meta: The "Shutdown" Protocol

Inspired by Etrian Odyssey, combat focuses on utility depletion over pure HP sponges.

1.1 The Bind System

Head Bind: Disables "Spells," "Breath," and "INT-based" attacks. Reduces accuracy.

Arm Bind: Disables "Weapon" skills. Reduces Physical Damage by 50%.

Leg Bind: Prevents "Escape" and "Evasion." Disables "Speed-based" skills and "Charges."

1.2 Ailment Hierarchy

Poison: High fixed damage per turn.

Paralyze: Chance to lose a turn.

Sleep: Skip turn; first hit taken deals 1.5x damage and wakes target.

Blind: Drastic reduction in accuracy.

2. The "Unlock" Economy

Shops do not have static inventories. They act as a "Progress Tree."

2.1 Material-Driven Progression

Logic: Selling monster drops (e.g., "Sharp Talon") to the shop increases a global counter.

Unlocks: IF (Sold_Talon >= 5) { Unlock_Item("Iron_Claw"); }

Conditional Drops: 100% drop rate IF specific criteria are met (e.g., "Kill while Head Bound"). This forces players to use specific party compositions to get high-tier gear.

3. Resource Management

Ariadne Thread: A consumable item that teleports the party to town.

The Tension: If the player runs out of TP/Health and forgot a Thread, they must walk back through the shortcuts, risking a "Wipe" and loss of unsaved loot.
