# FOE Mechanics Research — Etrian Odyssey Study

**Research Date:** 2026-02-10
**Purpose:** Understand FOE mechanics from Etrian Odyssey to enhance Blob RPG's FOE system
**GitHub Issue:** #44

---

## Current Blob RPG Implementation

### What Exists
- **Three FOE patterns**: patrol, chase, stationary
- **Synchronous movement**: FOEs move 1 step per player step
- **Collision detection**: Colliding with FOE triggers combat
- **Combat distinction**: FOE encounters have `canFlee: false`, use separate encounter table (more enemies)
- **Visibility**: FOEs only shown on tiles within player's vision radius
- **State persistence**: FOE positions saved in suspend saves

### What's Missing (from CLAUDE.md & plans)
- ❌ FOE respawn on floor re-entry
- ❌ Aggro/detection system (FOEs noticing player)
- ❌ Visual/audio feedback for aggro state (red marker, sound)
- ❌ FOE-specific enemy types (currently uses same pool as random encounters)
- ❌ Conditional movement patterns (e.g., move only when player faces away)
- ❌ Line-of-sight detection for chase behavior

---

## Etrian Odyssey FOE Mechanics

### Respawn System
**Source:** [Etrian Odyssey Wiki - FOE](https://www.etrianodyssey.wiki/wiki/FOE)

- **Defeated FOEs respawn** after a time period:
  - Etrian Odyssey I: 3 in-game days
  - Later games: 7 in-game days
  - Bosses: 14 in-game days
- **Floor re-entry**: FOEs are persistent—if not defeated, they remain in their current patrol position even after player leaves and returns

**Blob RPG Adaptation:**
- No in-game day/night cycle → simpler respawn model
- **Option 1**: FOEs respawn to original spawn position when player leaves and re-enters floor (even if not defeated)
- **Option 2**: Track defeated FOEs per floor, respawn them after N dungeon runs or town visits
- **Recommended**: Option 1 for MVP (simple, consistent with "each dungeon run is fresh")

### Aggro/Detection System
**Source:** [Etrian Odyssey Wiki - FOE](https://etrian.fandom.com/wiki/FOE)

- **Patrol state** (default): FOE follows preset path
- **Aggro state** (triggered): FOE notices player and begins pursuit
- **Trigger conditions**:
  - Player enters FOE's detection range (varies by FOE type, typically 2-4 tiles)
  - Player is in FOE's line of sight (not blocked by walls)
- **Visual feedback**: FOE icon turns **red** on minimap
- **Audio feedback**: **"Bing!"** sound effect plays when aggro triggers
- **Behavior change**: Patrol FOEs switch to chase pattern when aggro'd

**Player Vision vs FOE Vision:**
- **Player sight range**: 3-wide-4-deep area in front (directional)
- **FOE detection**: Typically circular radius (2-4 tiles) or directional cone
- **Map marking**: FOEs only appear on map if within 1-square radius of explored tiles

**Blob RPG Adaptation:**
- Add `aggroState: 'patrol' | 'aggro'` to FoeState
- Add `detectionRadius: number` to FoeSpawnData (default 3 tiles)
- When player within detection radius + line of sight → trigger aggro
- Aggro state persists until player escapes (distance > radius + 2) or combat occurs
- Visual: render aggro'd FOEs with red border/pulsing effect
- Audio: play notification sound on aggro trigger

### Movement Patterns
**Source:** [Etrian Odyssey Wiki - Game Mechanics](https://etrianodyssey.wiki/wiki/Game_Mechanics)

- **Synchronous**: FOEs move 1 step per player step (or per combat turn if player is in combat)
- **Patrol**: Follow predefined path, reversing at endpoints
- **Chase**: Move toward player using pathfinding (avoid walls)
- **Stationary**: Don't move unless provoked
- **Conditional** (advanced):
  - Move only when player faces away
  - Move only when player is in line of sight
  - Wake up when another FOE is defeated nearby
  - Move in response to specific tile triggers

**Blob RPG Current vs Target:**
- ✅ Patrol: Implemented (simple back-and-forth along path)
- ✅ Chase: Implemented (Manhattan distance pathfinding)
- ✅ Stationary: Implemented
- ❌ Conditional patterns: Not implemented
- ❌ Aggro-triggered chase: Not implemented (chase FOEs always chase, no detection phase)

### Combat Encounters
**Source:** [Etrian Odyssey Part #36](https://lparchive.org/Etrian-Odyssey/Update%2036/)

- **Multi-FOE battles**: Up to 4 FOEs can join a single battle
  - FOEs can join from sides/back during combat (not from front)
  - Boss hitboxes block FOE entry
- **Escape behavior**: If player flees, FOE returns to its original position (allowing escape even if cornered)
- **Difficulty**: FOEs are significantly harder than random encounters
  - Higher stats
  - Access to advanced skills
  - Often boss-like mechanics (multi-turn patterns, conditional skills)

**Blob RPG Current vs Target:**
- ✅ Cannot flee from FOE battles (`canFlee: false`)
- ✅ FOE encounters spawn more enemies (`foeSize: [2, 3]` vs `randomSize: [1, 2]`)
- ❌ FOE-specific enemy types (currently uses same pool as random encounters)
- ❌ Multi-FOE battles (collision with multiple FOEs)
- ❌ Escape position reset (FOE doesn't return to spawn if player flees—can't flee anyway)

---

## Recommended Enhancements for Blob RPG

### Phase 1: Aggro System (High Impact, Low Complexity)
**Goal:** Make FOEs feel more dynamic and threatening

1. **Add aggro state to FOE system**
   - Extend `FoeState` with `aggroState: 'patrol' | 'aggro'`
   - Extend `FoeSpawnData` with `detectionRadius?: number` (default 3)
   - Implement line-of-sight check (reuse fog-of-war logic)

2. **Detection logic**
   - Each turn, check if player is within FOE's detection radius
   - Use `computeVisibleTiles()` from FOE's perspective to check line of sight
   - If detected → trigger aggro, play sound, set `aggroState: 'aggro'`

3. **Visual feedback**
   - Render aggro'd FOEs with pulsing red border
   - Aggro indicator on FOE sprite (red exclamation mark or glow)

4. **Audio feedback**
   - Play notification sound on aggro trigger (use existing SFX system)

5. **Behavior change**
   - Patrol FOEs switch to chase pattern when aggro'd
   - Stationary FOEs remain stationary even when aggro'd (intimidation factor)
   - Chase FOEs always aggro (no patrol phase)

6. **De-aggro conditions**
   - Player moves beyond `detectionRadius + 2` tiles
   - Player enters combat with different entity (FOE resumes patrol)
   - Player warps to town (reset all FOEs to patrol state)

**Estimated Complexity:** 2-3 hours (types, logic, tests, visual polish)

### Phase 2: FOE Respawn (Low Impact, Low Complexity)
**Goal:** Make FOEs persistent obstacles across multiple dungeon runs

1. **Reset FOEs on floor re-entry**
   - When `enterDungeon()` called, FOEs spawn at original positions from `foeSpawns`
   - This already happens—FOEs are initialized from floor data
   - Currently correct behavior for MVP

2. **Optional: Track defeated FOEs**
   - Add `defeatedFoes: Set<string>` to DungeonProgressStore per floor
   - After FOE combat victory, mark FOE as defeated
   - On floor re-entry, filter out defeated FOEs if still within respawn cooldown
   - Respawn cooldown: reset defeated FOEs after N town visits or real-time hours

**Decision Needed:** Current behavior (FOEs always respawn on re-entry) matches CLAUDE.md and is simpler. Tracking defeats adds complexity without much gameplay value for MVP.

**Recommended:** Mark as "works as intended"—FOEs respawn on re-entry is correct.

### Phase 3: FOE-Specific Enemies (Medium Impact, Medium Complexity)
**Goal:** Make FOE encounters feel distinct from random encounters

1. **Add FOE-specific enemy types**
   - Create 3-5 new enemy definitions for FOE encounters (e.g., "Elite Slime", "Thornblob Alpha")
   - Higher stats (2x HP, +20% ATK/DEF vs normal variants)
   - Access to advanced skills (bind skills, displacement skills, conditional skills)

2. **Update encounter tables**
   - Add `foeExclusive: boolean` flag to enemy definitions
   - FOE encounter table uses FOE-exclusive enemies + weighted elite versions of normal enemies

3. **Boss-like mechanics**
   - Multi-turn patterns (e.g., FOE telegraphs heavy attack, executes next turn)
   - Conditional skills (e.g., "If HP < 50%, enrage and gain +50% ATK")
   - Bind/ailment resistance (FOEs resist binds more effectively)

**Estimated Complexity:** 4-6 hours (enemy design, AI updates, encounter balancing, testing)

### Phase 4: Conditional Movement Patterns (Low Impact, High Complexity)
**Goal:** Create FOE puzzles inspired by Etrian Odyssey

1. **New pattern types**
   - `conditional-facing`: Move only when player faces away (direction-based)
   - `conditional-proximity`: Move only when player is within/outside N tiles
   - `conditional-visibility`: Move only when player can't see FOE (outside vision)

2. **Implementation**
   - Extend `FoePatternType` with new conditional variants
   - Add pattern-specific config to `FoeSpawnData`
   - Implement conditional checks in `moveFoes()` (evaluate condition → move or skip)

3. **Testing**
   - Add test floors showcasing conditional FOEs
   - Ensure puzzles are solvable and don't create softlocks

**Estimated Complexity:** 3-4 hours (logic, edge cases, testing)

**Recommended:** Defer to post-MVP (Phase 7) — high complexity, low gameplay impact for initial release

---

## Implementation Priority

### Must-Have (Issue #44 Scope)
1. ✅ Aggro/detection system with visual/audio feedback
2. ✅ Behavior change for patrol FOEs (switch to chase on aggro)
3. ✅ De-aggro conditions (escape beyond range)

### Should-Have (Enhances Issue #44)
4. FOE-specific enemy types (elite variants with better stats/skills)
5. Update help text to explain aggro mechanics

### Nice-to-Have (Deferred)
6. Conditional movement patterns (Phase 7)
7. Multi-FOE battles (Phase 7)
8. Respawn cooldown tracking (probably not needed)

---

## Sources

- [FOE - Etrian Odyssey Wiki](https://www.etrianodyssey.wiki/wiki/FOE)
- [FOE | Etrian Odyssey Wiki | Fandom](https://etrian.fandom.com/wiki/FOE)
- [Game Mechanics - Etrian Odyssey Wiki](https://etrianodyssey.wiki/wiki/Game_Mechanics)
- [Etrian Odyssey Part #36 - FOE in the Deep](https://lparchive.org/Etrian-Odyssey/Update%2036/)
- [Do FOEs respawn? - GameFAQs](https://gamefaqs.gamespot.com/boards/934287-etrian-odyssey/41587275)
- [FOE Walkthrough - Etrian Odyssey Untold](https://gamefaqs.gamespot.com/boards/709464-etrian-odyssey-untold-the-millennium-girl/68680539)

---

## Next Steps

1. Present research findings and implementation plan to user
2. Get user approval on priority (aggro system first? FOE-specific enemies? Both?)
3. Create task list with estimated complexity
4. Begin implementation in worktree
5. Test with agent-browser (walk near FOE, verify aggro triggers, check visual feedback)
6. Update help documentation
7. Commit and create PR
