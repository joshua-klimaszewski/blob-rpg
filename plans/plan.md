# Blob RPG — Master Plan

> **Living document.** Updated every work cycle. Never delete items — mark completed with `[x]` + date, strike through dropped items with reason.

---

## Vision

Blob RPG is a mobile-first, browser-based RPG inspired by Etrian Odyssey, Pokémon Mystery Dungeon, and Radiant Historia. Players guide a party of 4 blob characters through handcrafted grid-based dungeons, managing resources and encounters, then return to town to rest, upgrade, and prepare for the next expedition. Combat uses a 3x3 enemy grid with push/pull displacement combos and a head/arm/leg bind system for deep tactical play with swipe-friendly inputs. The game uses a minimal black-and-white wireframe aesthetic, built with React + TypeScript and deployed to GitHub Pages for instant access on any device.

---

## Phases

### Phase 1: Project Scaffold

> Get the project building, deploying, and structured correctly.

- [x] Write comprehensive CLAUDE.md (2026-02-07)
- [x] Create master plan.md (2026-02-07)
- [x] Initialize Vite + React + TypeScript project (2026-02-07)
- [x] Configure Tailwind CSS with B&W palette (2026-02-07)
- [x] Set up Vitest (2026-02-07)
- [x] Create GitHub Actions workflow for Pages deploy (2026-02-07)
- [x] Set up `src/` directory structure (components, systems, stores, data, types, hooks, utils) (2026-02-07)
- [x] Create App shell with placeholder screens (Town, Dungeon, Combat) (2026-02-07)
- [ ] Verify deploy to `https://joshua-klimaszewski.github.io/blob-rpg/` (pending push)
- [x] Add Zustand with a minimal test store (2026-02-07)

### Phase 2: Core Dungeon Movement

> Walk a grid, encounter gauge, FOEs.

- [x] Define dungeon floor data format (tiles, walls, exits, FOE spawns, checkpoints) (2026-02-08)
- [x] Build dungeon grid renderer (CSS Grid + tile components) (2026-02-08)
- [x] Implement player position + movement (swipe gestures + keyboard arrows) (2026-02-08)
- [x] Turn system: player moves → FOEs move → encounter gauge ticks (2026-02-08)
- [x] Encounter gauge component + logic (step-based fill, green→yellow→red, threshold trigger) (2026-02-08)
- [x] FOE entities with patrol movement pattern (2026-02-08)
- [x] FOE collision → transition to combat screen (2026-02-08)
- [x] Dungeon HUD (floor number, encounter gauge, party HP summary) (2026-02-08)
- [x] Shortcut/checkpoint mechanic (one-way paths, warp to town) (2026-02-08)
- [x] First test floor (handcrafted, ~15x15 grid with corridors + rooms) (2026-02-08)

**Phase 2b — Dungeon UI Polish:**
- [x] Differentiate walls from fog of war — visible walls render as dark gray (`bg-gray-800`) with border, explored walls as medium gray (`bg-gray-700`), fog stays pure black (2026-02-08)
- [x] Zoom out viewport — show ~9 tiles across shorter axis (was 7), min cell size 32px (was 40px) for better dungeon overview (2026-02-08)
- [x] Update minimap to reflect wall visibility states (visible walls dark gray, explored walls medium gray) (2026-02-08)

### Phase 3: Combat System (3x3 Grid + Bind/Shutdown)

> Full combat with displacement combos and bind system.

**3a — Combat Foundation:**
- [x] 3x3 enemy grid state model (array of entities per tile for stacking) (2026-02-08)
- [x] Party display (4 characters in a list with HP/TP bars) (2026-02-08)
- [x] Turn order (speed-based timeline, AGI-sorted) (2026-02-08)
- [x] Basic actions: Attack (target a tile), Defend, Flee (2026-02-08)
- [x] Damage formula (STR/VIT, variance, crit, combo multiplier) (2026-02-08)
- [x] Combat state machine (Zustand + pure TS systems) (2026-02-08)
- [x] Combat rewards (XP calculation) and victory/defeat transitions (2026-02-08)
- [x] Party wipe handling (return to town) (2026-02-08)
- ~~Grid renderer (tap to target tiles)~~ — deferred to Phase 3b UI polish
- ~~Item action~~ — deferred to Phase 5 (inventory system)

**3b — Displacement + Combos:**
- [x] Displacement mechanics with direction vectors: Push (back), Pull (forward), Left, Right (2026-02-08)
- [x] Stacking mechanic: multiple entities per tile, AOE hits all stacked (2026-02-08)
- [x] Combo multiplier: consecutive hits increase damage (BaseDmg * (1 + combo * 0.1)) (2026-02-08)
- [x] Trap tiles on the enemy grid (spike = 10 dmg, web = leg bind, fire = poison) (2026-02-08)

**3c — Bind/Shutdown:**
- [x] Bind status effects: Head (disables INT attacks), Arm (50% damage reduction), Leg (prevents flee) (2026-02-08)
- [x] Bind duration (turns-based) + resistance scaling (duration reduction, resistance buildup) (2026-02-08)
- [x] Ailments: Poison (flat DoT), Paralyze (% turn skip), Sleep (turn skip + removed on hit), Blind (accuracy penalty) (2026-02-08)
- ~~Conditional skill logic: "if target has N binds, deal Nx damage"~~ — deferred to Phase 4 (skill system)
- ~~Enemy AI: weighted random action selection~~ — deferred to Phase 4 (basic random AI for MVP)

**Phase 3b UI Polish:**
- [x] 3x3 grid renderer with tap-to-target interaction (2026-02-08)
- [x] Action menu UI (Attack/Defend/Flee buttons with disable states) (2026-02-08)
- [x] Enemy AI auto-turn processing (random party member targeting) (2026-02-08)
- [x] Turn order timeline component (2026-02-08)
- [x] Combat HUD (round counter, combo display, flee status) (2026-02-08)
- [x] Damage number popups and animations (2026-02-08)
- [x] Bind/ailment status icon display (2026-02-08)
- [x] Combat event feedback system (useCombatEvents hook) (2026-02-08)
- [x] Victory/Defeat overlay animations (2026-02-08)
- ~~Displacement animation effects~~ — deferred to future polish pass (highlight-only for now)

### Phase 4: Character & Class System

> 6 blob classes with skill trees and equipment.

**4a — Core Character System (done):**
- [x] Character stat types (HP, TP, STR, VIT, INT, WIS, AGI, LUC) (2026-02-08)
- [x] Leveling system (XP thresholds, stat growth rates per class, max level 20) (2026-02-08)
- [x] 6 blob class data definitions (base stats, growth rates, 36 skills total) (2026-02-08)
- [x] Skill execution engine in combat (damage, displacement, bind, ailment, heal, conditional, multi-hit, AOE splash, self-buff) (2026-02-08)
- [x] Equipment types: weapon, armor, 2 accessory slots (2026-02-08)
- [x] Equipment stat modifiers applied to combat calculations (2026-02-08)
- [x] Character sheet UI with tabs for all 6 roster members, stats grid, equipment display, skill list (2026-02-08)
- [x] Party formation screen (choose 4 of 6, tap-to-toggle) (2026-02-08)
- [x] Skill learning with SP cost and level requirements (2026-02-08)

**4b — Character System Gaps (remaining):**
- [ ] Hub-and-spoke skill tree visualization (currently a flat list — needs visual graph with branches, prerequisites, and category grouping)
- [x] Equipment management from character sheet — inline EquipmentPicker opens on slot tap, shows owned items filtered by slot type, supports equip/unequip, tracks duplicates and prevents double-equipping across party (2026-02-08)
- [ ] Passive skill auto-application (passives are defined in skill data but not applied to character stats — e.g. Ironblob's "Iron Wall" +VIT passive)
- [ ] TP costs enforced in skill usage (verify TP is deducted and skills disabled when insufficient TP)
- [ ] Level-up notification UI (visual feedback when a character levels up after combat)

### Phase 5: Town & Economy

> Material-driven shop, inn, guild, saves.

**5a — Town Core (done):**
- [x] Town screen with sub-location navigation (Enter Dungeon, Inn, Shop, Guild, Characters, Party, How to Play) (2026-02-08)
- [x] Inn: full rest (100% HP/TP) and quick rest (50% HP/TP), cost scales with party level (2026-02-08)
- [x] Shop — material unlock system with global sold-material counters (2026-02-08)
- [x] Shop — buy equipment + consumables (Medica, Amrita, Theriaca) from unlocked inventory (2026-02-08)
- [x] Shop — sell materials tab (2026-02-08)
- [x] Guild / quest board: 10 quests (kill, gather, explore) with accept/track/claim flow (2026-02-08)
- ~~Save/load system (Zustand persist middleware to localStorage for party, inventory, quests, game state)~~ — replaced: multi-guild save system in Sprint 13
- ~~Title screen with Continue (if save exists) / New Game flow~~ — replaced: redesigned title with New Game / Load Game in Sprint 13

**5a-addendum — Inventory UI (done):**
- [x] Inventory screen accessible from Town — tabbed view (Equipment / Items / Materials) showing all owned items with quantities and "Equipped by" indicators (2026-02-08)
- [x] Added `'inventory'` to `GameScreen` type, registered in App.tsx router, added button to TownScreen (2026-02-08)

**5b — Save System Redesign (done):**
- [x] Multi-guild save system: 3 guilds, 3 save slots each, suspend saves for dungeon save & quit (2026-02-08)
- [x] Save data types (SaveRegistry, GuildEntry, SaveData, SuspendSaveData) in `src/types/save.ts` (2026-02-08)
- [x] Save system rewrite (`src/systems/save.ts`): registry, guild CRUD, slot CRUD, suspend saves, legacy migration (2026-02-08)
- [x] Remove Zustand persist middleware from all 4 stores (gameStore, partyStore, inventoryStore, questStore) (2026-02-08)
- [x] Guild store (`src/stores/guildStore.ts`) for runtime guild context (2026-02-08)
- [x] Save actions bridge (`src/stores/saveActions.ts`): loadGameState, loadSuspendState, collectGameState, resetAllStores (2026-02-08)
- [x] Title screen redesign: New Game → guild naming, Load Game → guild/slot picker, auto-migrate legacy saves (2026-02-08)
- [x] Guild name screen, Load Game screen, Save Game screen (from Inn), ConfirmDialog component (2026-02-08)
- [x] Dungeon Save & Quit: suspend save from DungeonHUD with confirmation dialog (2026-02-08)
- [x] Town screen shows guild name (2026-02-08)
- [x] 30 save system unit tests (2026-02-08)

**5c — Economy & Persistence Gaps (remaining):**
- [ ] Conditional drops: specific loot only when killed under conditions (e.g. "killed while head-bound" drops rare material) — drop tables exist but no condition checking
- [ ] Autosave at dungeon checkpoints (checkpoint tiles exist but don't trigger a save)
- [ ] Dungeon floor selection from town (currently hardcoded to F1 — should resume last floor or let player choose unlocked floors)
- [ ] Death penalty design (party wipe returns to town — define what's lost: gold percentage? consumables? nothing?)
- [ ] Bind-cure consumable (Theriaca cures ailments but not binds — add "Therica B" or similar)

### Phase 6: Content & Polish

> Fill the first dungeon, balance, tutorial.

**6a — First Dungeon Content (done):**
- [x] Full first dungeon: 3 floors with increasing difficulty (2026-02-08)
- [x] Enemy roster: 6 types (Slime, Mossy Slime, Fungoid, Sporebat, Crystal Beetle, Caveworm) (2026-02-08)
- [x] Balance: floor encounter tables, material drops, 8 shop recipes, tiered XP/gold (2026-02-08)
- [x] Equipment progression: 16 items (8 starter + 8 tier 2 unlocked via F2/F3 materials) (2026-02-08)
- [x] Enemy AI improvements: aggressive/defensive/random patterns (2026-02-08)
- [x] 10 quests across F1-F3 (kill, gather, explore) (2026-02-08)
- [x] Floor transitions: exit → next floor or return to town (2026-02-08)
- [x] How to Play / Glossary screen — 5-tab reference guide (Controls, Dungeon, Combat, Classes, Glossary) accessible from Town + "?" overlay from Dungeon/Combat HUDs (2026-02-08)

**6b — Combat & AI Depth (remaining):**
- [ ] Enemy skill usage in AI — enemies currently only basic-attack; give enemies access to their defined skills (binds, displacement, ailments) with weighted selection based on AI pattern
- [ ] FOE-specific combat encounters (FOEs should be significantly harder, use unique skills, have boss-like behavior)
- [ ] Boss encounter on Floor 3 (gate the dungeon exit behind a mandatory boss fight)
- [ ] FOE respawn on floor re-entry (CLAUDE.md specifies this, not implemented)
- [ ] Combo counter feedback — reward multi-character combos more visibly (sound cue placeholder, screen shake, escalating text size)

**6c — Onboarding & Tutorial (remaining):**
- [ ] Guided first-run tutorial (separate from How to Play reference):
  - First town visit: brief walkthrough of Inn/Shop/Guild
  - First dungeon step: movement controls overlay
  - First encounter: action menu walkthrough (attack → target → confirm)
  - First skill: prompt to open Characters screen after first level-up
- [ ] New Game class introduction (brief intro to each of the 6 blob classes when roster is created)

**6d — Polish & QoL (remaining):**
- [ ] Accessibility pass (keyboard nav for all menus, ARIA labels on interactive elements, screen reader support for combat events, focus management)
- [ ] Performance (React.memo on tile components, lazy-load town sub-screens, virtualize long lists like skill trees)
- [ ] Settings screen (accessible from town and title screen):
  - Text size toggle (small/medium/large)
  - Animation speed (normal/fast/instant)
  - Clear save data with confirmation
- [ ] Dungeon left-edge viewport clamp bug (white strip when player near left boundary — found in QA Sprint 10)
- [ ] Minimap size increase (collapsed minimap at 4px/tile is hard to read — increase to 5-6px)
- [ ] Encounter gauge height increase for mobile visibility

### Phase 7: Second Dungeon & Endgame (post-MVP stretch)

> Extend the game beyond the first dungeon. Only tackle after Phases 4b–6d are complete.

- [ ] Second dungeon: "Frozen Hollows" (3 new floors, new tile types: ice/slide, dark/limited-vision)
- [ ] 4-6 new enemy types with F4-F6 encounter tables
- [ ] Tier 3 equipment unlocked via new materials
- [ ] New quest set for second dungeon
- [ ] FOE with chase AI pattern (pursues player in line of sight)
- [ ] Conditional FOE mechanics (e.g. FOE that only moves when player faces away)
- [ ] Second dungeon boss encounter
- [ ] Town upgrades (expanded inn services, new shop tiers)

---

## Architecture Decisions

### ADR-001: CSS/SVG Over Canvas for Rendering

**Status:** Decided (2026-02-07)

**Context:** The game needs to render a grid dungeon, blob characters, UI elements, and combat scenes. Options considered:
1. HTML Canvas / Pixi.js — full 2D rendering engine
2. Pure CSS + SVG — use CSS Grid for dungeons, SVG for character shapes, HTML for UI
3. Hybrid — Canvas for dungeon, HTML overlay for UI

**Decision:** Pure CSS + SVG.

**Rationale:**
- B&W wireframe aesthetic doesn't require sprite sheets or texture rendering
- CSS Grid maps perfectly to dungeon tile grids
- SVG is ideal for the blob character shapes (scalable, animatable, lightweight)
- No additional dependency weight (Pixi.js is ~200KB)
- Standard DOM elements get accessibility for free (screen readers, keyboard nav)
- Tailwind works naturally with CSS approach

**Consequences:**
- Complex animations may be harder than Canvas
- If we ever need sprite-based graphics, migration would be significant
- Performance ceiling is lower than Canvas for many animated entities

---

### ADR-002: Zustand + useReducer for State Management

**Status:** Decided (2026-02-07)

**Context:** RPG games have complex, nested state (party, inventory, dungeon progress, combat). Options:
1. Redux Toolkit — industry standard, verbose, powerful middleware
2. Zustand — minimal API, no Provider, works outside React
3. Jotai/Recoil — atomic state, good for independent pieces
4. Plain React Context + useReducer — zero dependencies

**Decision:** Zustand for global game state. `useReducer` for self-contained state machines (combat flow, menu navigation).

**Rationale:**
- Zustand is ~1KB, no boilerplate, no Provider component needed
- Stores can be accessed outside React (useful for `src/systems/` pure logic)
- `useReducer` is perfect for combat: finite states, predictable transitions, easy to test
- Avoids Redux boilerplate overhead for a solo/small project
- Zustand's `persist` middleware has built-in localStorage support

**Consequences:**
- Less ecosystem tooling than Redux (but we don't need it)
- Team scaling could be harder (but this is a solo/pair project)

---

### ADR-003: localStorage for Save System

**Status:** Decided (2026-02-07)

**Context:** RPG progress must persist between sessions. Options:
1. localStorage — simple key-value, synchronous, 5-10MB limit
2. IndexedDB — async, large storage, complex API
3. Backend server — unlimited, cloud saves, requires infrastructure

**Decision:** localStorage for MVP. Document migration path to IndexedDB.

**Rationale:**
- RPG save data (party stats, inventory, dungeon progress, quest state) fits well under 5MB
- Synchronous API is simpler to reason about for save/load
- No server infrastructure needed
- Migration path: when save data approaches limits, move to IndexedDB using `idb` wrapper library. Same serialization format, just different storage backend.

**Consequences:**
- Single-device saves only (no cloud sync)
- Storage limit will eventually be hit if game grows significantly
- Private browsing may clear saves

---

### ADR-004: Separated Game Logic (`src/systems/`)

**Status:** Decided (2026-02-07)

**Context:** Game logic (damage calculation, encounter rules, skill effects) needs to live somewhere. Options:
1. Inline in React components — fastest to write, hardest to test
2. Custom hooks — testable with hook testing utilities, coupled to React
3. Pure TypeScript modules — framework-agnostic, directly unit-testable

**Decision:** Pure TypeScript functions in `src/systems/`.

**Rationale:**
- Pure functions are trivially testable: `expect(calculateDamage(attacker, defender, skill)).toBe(42)`
- No React dependency means systems can be developed and tested in isolation
- Deterministic: same input → same output, no hidden state
- Components become thin display layers, reducing UI complexity
- Systems could theoretically be reused if we ever port to a different framework

**Consequences:**
- Requires discipline to keep React out of system files
- State must be passed explicitly (no reaching into stores from systems)
- Slightly more wiring code in stores/components to bridge systems ↔ UI

---

### ADR-005: Swipe/Tap Controls for Dungeon Movement

**Status:** Decided (2026-02-07)

**Context:** Dungeon navigation needs to feel natural on mobile. Options:
1. Virtual D-pad overlay — familiar to gamers, takes screen space
2. Swipe gestures — natural mobile interaction, no UI overlay
3. Tap-to-move — tap an adjacent tile to move there
4. Hybrid — swipe for direction + tap for interaction

**Decision:** Primary swipe gestures with tap as secondary.

**Rationale:**
- Swipe up/down/left/right maps directly to grid movement (like Pokémon Mystery Dungeon)
- No on-screen controls means more space for the dungeon map
- Tap can be used for interacting with objects, NPCs, and menu elements
- Swipe threshold tuning will be important (prevent accidental triggers)

**Consequences:**
- Need robust swipe detection library or custom implementation
- Must handle swipe vs scroll conflicts carefully
- Desktop users will need keyboard arrow key support as well

---

### ADR-006: Feature Branch + PR Workflow

**Status:** Decided (2026-02-07)

**Context:** The project initially used main-branch flow (all commits direct to `main`). As the project grows and CI is added, a more structured workflow is needed. Options:
1. Main-branch flow (current) — simple, every commit deploys
2. Feature branch + PR flow — branches per feature, squash merge to main
3. Gitflow — develop/release/hotfix branches (heavyweight)

**Decision:** Feature branch + PR flow.

**Rationale:**
- PRs provide a natural checkpoint for CI checks (lint, test, build) before merging
- Squash merging keeps `main` history clean (one commit per feature)
- Feature branches allow WIP commits without breaking deploy
- Lighter than Gitflow, appropriate for solo/small team
- `main` remains the deploy branch — every merge triggers GitHub Pages deploy

**Consequences:**
- Slightly more overhead per change (create branch, open PR, merge)
- Need `gh` CLI for PR creation (already available)
- Branch naming convention: `<type>/<short-description>` (e.g., `feat/dungeon-grid`)

---

## Resolved Decisions (2026-02-07)

These decisions were pending user interview and have been resolved through research + interview.

### Class Roster Design — RESOLVED

**Decision:** Option D — Hybrid (classic roles, blob flavor). 6 blob classes for MVP.

**Rejected options:**
- ~~Option A: Classic RPG Trinity~~ — too generic, doesn't leverage blob theme
- ~~Option B: EO Inspired (Expanded)~~ — too many classes for MVP
- ~~Option C: Blob-Themed Originals~~ — no prior art, too much design from scratch

**6 Blob Classes:**

| Class | Role | Grid Hook | Key Synergy |
|-------|------|-----------|-------------|
| **Ironblob** | Tank/Protector | "Shield Bash" pushes enemies back tiles | Creates space, stacks enemies for AOE |
| **Strikblob** | Melee DPS/Striker | "Pull" yanks enemies forward, multi-hit combos | Builds combo counter, exploits stacks |
| **Hexblob** | Binder/Specialist | Bind Head/Arm/Leg, conditional payoff skills | Shuts down bosses, sets up "Ecstasy"-type finishers |
| **Sparkblob** | Mage/Nuker | AOE splash hits tile + adjacent tiles | Finisher on stacked enemies, elemental damage |
| **Mendblob** | Healer/Medic | Heal, cure binds/ailments, overheal | Party sustain, can place healing zones on grid |
| **Toxblob** | Debuffer/Field Control | Poison/para/blind, place trap tiles on enemy grid | Trap tiles + push = environmental combos |

**Core synergy loops:**
- **Stack & Nuke**: Ironblob pushes enemies together → Strikblob multi-hits for combo → Sparkblob AOE finisher
- **Shutdown**: Hexblob binds head+arm+leg → Strikblob conditional massive damage
- **Trap Combo**: Toxblob places spike trap → Ironblob pushes enemy into it → bonus damage + leg bind
- **Sustain War**: Mendblob heals + Toxblob poisons → party outlasts tough FOEs

---

### Dungeon Generation — RESOLVED

**Decision:** Option D — Handcrafted MVP, procedural later. 3-5 manual floors for the first dungeon. Procedural generation deferred to post-MVP.

**Rejected options:**
- ~~Option A: Fully Handcrafted~~ — content bottleneck long-term (but fine for MVP scope)
- ~~Option B: Fully Procedural~~ — too complex for MVP, can feel generic
- ~~Option C: Hybrid~~ — more complex than either pure approach, overkill for MVP

---

### Combat Spatial Model — RESOLVED (new decision)

**Decision:** 3x3 enemy grid with push/pull displacement (Radiant Historia inspired). Party of 4 in a list/row, enemies on the grid.

**Rationale:**
- Swipe-friendly — displacement via directional swipes maps naturally to mobile
- Combo stacking — pushing multiple enemies onto one tile enables AOE combos
- High tactical depth with simple inputs
- Enemy-only grid simplifies state (party doesn't need grid positions)

**Rejected alternatives:**
- ~~Front/back row (EO-style)~~ — less tactical depth, less combo potential
- ~~Full 5x5 grid for both sides~~ — too complex for mobile, too much state
- ~~Brave/Default turn banking~~ — deferred to post-MVP
- ~~Break/Boost shield system (Octopath)~~ — deferred to post-MVP

---

### Combat Spice Mechanic — RESOLVED (new decision)

**Decision:** Bind/Shutdown system (EO-style). Head/Arm/Leg binds disable enemy capabilities; conditional skills exploit bound enemies for massive damage.

**Rationale:**
- Creates meaningful pre-combat planning (which binds to target)
- Synergizes with grid displacement (push bound enemies into traps)
- Clear visual feedback (bound body parts shown on enemy sprites)
- Adds strategic depth without complex UI

**Rejected alternatives:**
- ~~Force Boost / Force Break (EO)~~ — deferred to post-MVP
- ~~Brave/Default (Bravely Default)~~ — deferred to post-MVP

---

### Party Structure — RESOLVED

**Decision:** 4 individual party members in combat. Choose 4 of 6 available blob classes for each dungeon run. Enemies on the 3x3 grid, party displayed as a list.

**Rejected alternatives:**
- ~~Coven/Pact squad system (Labyrinth of Refrain)~~ — too complex for MVP
- ~~3 or 5 party members~~ — 4 is the standard sweet spot for balance and mobile screen real estate

---

### Economy — RESOLVED

**Decision:** Material unlock shop from day one. Selling monster parts unlocks new gear in the shop. Conditional drops (kill under specific conditions) for rare loot.

**Rationale:**
- Proven system (EO series), incentivizes engaging with all enemies
- Conditional drops synergize with bind system (e.g. "kill while head-bound" drops rare material)
- Creates a secondary goal layer beyond XP

---

### Skill Tree Visualization — RESOLVED

**Decision:** Hub-and-spoke model. Central core skill with 3-4 branches radiating outward. 25/25/25/25 distribution: Passives / Actives / Synergy-conditionals / Ultimate.

**Rejected options:**
- ~~Option A: Vertical Tree~~ — too tall on mobile, less visual interest
- ~~Option C: Grid Board~~ — unclear hierarchy
- ~~Option D: Simple List~~ — too plain, no spatial feel

The hub-and-spoke is compact, fits mobile viewport, and visually communicates class identity through branch structure.

---

### ADR-007: 3x3 Enemy Grid Combat Model

**Status:** Decided (2026-02-07)

**Context:** The combat system needed a spatial model. Options ranged from no spatial element (pure turn-based), front/back row (EO-style), to full grid systems. Research covered Radiant Historia's push/pull displacement, Etrian Odyssey's rows, and Final Fantasy Tactics' grids.

**Decision:** 3x3 enemy-only grid with push/pull displacement. Party displayed as a list (no grid positions for allies).

**Rationale:**
- Radiant Historia-style displacement creates emergent combo depth from simple inputs
- 3x3 is small enough for mobile touch targets but large enough for tactical positioning
- Enemy-only grid halves the state complexity vs full grid for both sides
- Stacking mechanic (multiple enemies on one tile) creates natural AOE synergy
- Swipe gestures map naturally to push/pull directions

**Key Implementation Details:**
- Each tile holds an array of entity IDs (supports stacking)
- Tiles can have hazards (spike, web, fire) placed by skills
- Displacement skills carry direction vectors (push/pull/left/right)
- Combo multiplier: consecutive hits deal increasing damage (BaseDmg * (1 + combo * 0.1))

**Consequences:**
- All class skills must be designed around grid positioning
- Enemy AI needs spatial awareness (avoid stacking, avoid traps)
- Damage formulas need tile position modifiers

---

### ADR-008: Bind/Shutdown Combat Mechanic

**Status:** Decided (2026-02-07)

**Context:** The combat system needed a "spice" mechanic beyond basic attack/defend. Options included Force/Boost (EO), Brave/Default (Bravely Default), Break/Boost shields (Octopath), and Bind/Shutdown (EO).

**Decision:** Head/Arm/Leg bind system with conditional payoff skills.

**Rationale:**
- Three bind types create clear tactical choices (what to disable first)
- Conditional skills ("if N binds active, deal Nx damage") reward setup play
- Binds interact with the grid system (push bound enemy into trap for extra effect)
- Clear UI: show bound body parts on enemy sprites
- Simpler implementation than shield-break counting systems

**Key Implementation Details:**
- `BindState { head: number; arm: number; leg: number }` — turns remaining per bind
- Head bind: disables spells/INT-based attacks
- Arm bind: disables physical attacks, -50% damage dealt
- Leg bind: prevents escape, disables speed-based skills, -evasion
- Resistance scaling: repeated binds become harder to land
- Ailments (Poison, Paralyze, Sleep, Blind) are separate from binds

**Consequences:**
- Need UI space to show bind state on enemies
- Enemy AI must respect binds (can't use disabled skills)
- Balance requires careful bind duration/resistance tuning

---

### ADR-009: 6 Blob Class Roster

**Status:** Decided (2026-02-07)

**Context:** Needed to define the class roster. Options ranged from 4 generic classes to 8+ EO-inspired classes. The blob theme demanded unique naming.

**Decision:** 6 blob-themed classes: Ironblob, Strikblob, Hexblob, Sparkblob, Mendblob, Toxblob.

**Rationale:**
- 6 classes with 4-member parties gives 15 possible party compositions — enough variety without balance nightmare
- Each class has a unique grid hook (push, pull, bind, AOE, heal zone, trap)
- Classes form clear synergy loops (Stack&Nuke, Shutdown, TrapCombo, SustainWar)
- Blob-themed names maintain project identity while keeping roles recognizable
- Hub-and-spoke skill trees with 25/25/25/25 split (Passives/Actives/Synergy/Ultimate)

**Consequences:**
- 6 skill trees to design and balance
- Need to ensure all 15 party combinations are viable (no "required" class)
- Sub-classing deferred to post-MVP

---

### ADR-010: Handcrafted Dungeons for MVP

**Status:** Decided (2026-02-07)

**Context:** Dungeon floors can be handcrafted, procedurally generated, or hybrid. Procedural generation is complex and can feel generic.

**Decision:** Handcrafted floors for MVP (3-5 floors). Procedural generation deferred to post-MVP.

**Rationale:**
- Handcrafted floors allow tight level design and curated difficulty curve
- Simpler to implement — just data files
- Can evaluate what procedural gen would add after playing the handcrafted version
- FOE placement and puzzle design benefit from intentional layout

**Consequences:**
- Content creation bottleneck if game expands significantly
- Limited replayability for the first dungeon
- Procedural gen remains a post-MVP enhancement

---

## Explicitly Deferred (Post-MVP)

These systems were researched but intentionally excluded from MVP scope:

- ~~Force Boost / Force Break (EO)~~ — interesting but adds complexity; bind system provides enough depth for MVP
- ~~Brave/Default turn banking~~ — conflicts with grid displacement combo pacing
- ~~Break/Boost shield system (Octopath)~~ — redundant with bind/shutdown
- ~~Sub-classing~~ — post-MVP progression layer
- ~~Stat sculpting artifacts (FF6 Magicite)~~ — equip for +stat on level up, deferred
- ~~Coven/Pact squad system (Labyrinth of Refrain)~~ — decided individual party instead
- ~~Procedural dungeon generation~~ — handcrafted for MVP
- ~~Node-based fast travel for cleared areas~~ — post-MVP QoL
- ~~Monster Houses (mass spawn trap rooms)~~ — interesting, deferred
- ~~Item identification (Shiren-style unknown items)~~ — not aligned with MVP direction
- ~~JP spillover (FFT party-wide XP trickle)~~ — deferred
- ~~Union formations (Yggdra Union)~~ — deferred
- ~~Tactic Cards~~ — deferred
- ~~Respec / "Rest" mechanic (level -2 for SP refund)~~ — deferred
- ~~Multi-party dungeons~~ — deferred

---

## Sprint Log

### Sprint 01 — Project Setup (2026-02-07)

**Goal:** Establish project constitution and master plan.

**Tasks:**
- [x] Write comprehensive CLAUDE.md (2026-02-07)
- [x] Create plans/plan.md master roadmap (2026-02-07)
- [x] Create plans/decisions/ directory stub (2026-02-07)
- [x] Create plans/sprints/ directory stub (2026-02-07)
- [x] Initial commit: `docs: add comprehensive CLAUDE.md and master plan` (2026-02-07)

**Next sprint:** Phase 1 scaffold — Vite + React + TS project initialization, Tailwind config, GitHub Actions deploy pipeline.

### Sprint 02 — Project Scaffold (2026-02-07)

**Goal:** Get the project building, tested, and deployable with full directory structure.

**Tasks:**
- [x] Initialize Vite + React 19 + TypeScript project (2026-02-07)
- [x] Configure Tailwind CSS v4 with B&W wireframe palette (`@theme` tokens) (2026-02-07)
- [x] Set up Vitest with 3 passing store tests (2026-02-07)
- [x] Create GitHub Actions deploy workflow (build → upload → deploy-pages) (2026-02-07)
- [x] Create full `src/` directory structure per CLAUDE.md spec (2026-02-07)
- [x] Create App shell with screen switching (Town, Dungeon, Combat placeholders) (2026-02-07)
- [x] Add Zustand gameStore with screen state + tests (2026-02-07)
- [x] Verify `npm run build` produces correct base path `/blob-rpg/` (2026-02-07)
- [ ] Verify live deploy to GitHub Pages (pending push)

**Notes:**
- Used Tailwind v4 `@theme` directive (not v3 `tailwind.config.ts` `theme.extend`) for design tokens
- Monospace font (`Courier New`) fits the wireframe aesthetic
- Touch target minimum set as `--spacing-touch: 44px` custom token

**Next sprint:** Push to deploy, verify Pages URL works, then begin Phase 2 dungeon movement.

### Sprint 03 — Dev Process Upgrades (2026-02-07)

**Goal:** Switch to feature branch + PR workflow and add agent-browser for visual testing.

**Tasks:**
- [x] Update CLAUDE.md Git Workflow section to feature branch + PR flow (2026-02-07)
- [x] Add ADR-006 for workflow change (2026-02-07)
- [x] Install `agent-browser` globally (v0.9.1) + Chromium (2026-02-07)
- [x] Create `/agent-browser` custom slash command (`.claude/commands/agent-browser.md`) (2026-02-07)
- [x] Update MEMORY.md to reflect new workflow (2026-02-07)
- [x] Dogfood: commit on `chore/dev-process-upgrades` branch, open PR to main (2026-02-07)

**Notes:**
- First PR using the new workflow — dogfooding the process
- `agent-browser` v0.9.1 uses Playwright Chromium under the hood

**Next sprint:** Phase 2 — begin dungeon movement system.

### Sprint 04 — Research & Design Decisions (2026-02-07)

**Goal:** Resolve all pending design decisions through research and user interview. Integrate findings into the master plan.

**Tasks:**
- [x] Research 12 reference games (EO, PMD, FF6, FFT, Radiant Historia, Bravely Default, Octopath, Labyrinth of Refrain, Yggdra Union, etc.) (2026-02-07)
- [x] Interview user on all pending decisions (2026-02-07)
- [x] Resolve: combat spatial model → 3x3 enemy grid + displacement (2026-02-07)
- [x] Resolve: combat spice mechanic → Bind/Shutdown (EO-style) (2026-02-07)
- [x] Resolve: party structure → 4 individual members (2026-02-07)
- [x] Resolve: class roster → 6 blob classes (Ironblob, Strikblob, Hexblob, Sparkblob, Mendblob, Toxblob) (2026-02-07)
- [x] Resolve: dungeon generation → Handcrafted MVP (2026-02-07)
- [x] Resolve: economy → Material unlock shop from day one (2026-02-07)
- [x] Resolve: skill tree viz → Hub-and-spoke model (2026-02-07)
- [x] Add ADRs 007-010 (grid combat, bind system, class roster, handcrafted dungeons) (2026-02-07)
- [x] Update phases 2-6 with revised task lists (2026-02-07)
- [x] Document deferred post-MVP systems (2026-02-07)
- [x] Update CLAUDE.md Game Systems Reference (2026-02-07)

**Notes:**
- All "Decisions Pending User Interview" have been resolved
- Previous combat design (front/back row, Force/Boost) replaced by 3x3 grid + bind system
- Sub-classing removed from MVP scope (was Phase 4), deferred to post-MVP
- 12 research documents preserved in `research/` directory

**Next sprint:** Phase 2 — begin dungeon movement system implementation.

### Sprint 05 — Phase 2: Core Dungeon Movement (2026-02-08)

**Goal:** Implement full dungeon exploration system with grid movement, encounter gauge, FOEs, and checkpoints.

**Tasks:**
- [x] Define FloorData type with tiles, walls, exits, checkpoints, FOE spawns (2026-02-08)
- [x] Create dungeon.ts system with pure TS logic (processTurn, moveFOEs, tickEncounterGauge) (2026-02-08)
- [x] Build GridRenderer component with CSS Grid + SVG tokens (2026-02-08)
- [x] Implement Camera system with viewport scrolling (5x5 visible area from 15x15 floor) (2026-02-08)
- [x] Add swipe gesture input (react-swipeable) + keyboard arrow support (2026-02-08)
- [x] Create EncounterGauge component with color progression (green→yellow→red) (2026-02-08)
- [x] Implement FOE system with patrol movement patterns (2026-02-08)
- [x] Add FOE collision detection → triggers combat transition (2026-02-08)
- [x] Create DungeonHUD with floor info, encounter gauge, event notifications (2026-02-08)
- [x] Implement checkpoint system (special tiles that trigger events) (2026-02-08)
- [x] Add shortcut system (one-way exits that return to earlier checkpoints) (2026-02-08)
- [x] Create floor-1.ts test floor (15x15 with corridors, rooms, 1 FOE) (2026-02-08)
- [x] Write comprehensive tests (53 tests for dungeon.ts, 12 for floor data) (2026-02-08)
- [x] Create dungeonStore with Zustand (bridges dungeon system to React) (2026-02-08)

**Notes:**
- All dungeon logic pure TypeScript in `src/systems/dungeon.ts` (no React imports)
- Event-based architecture: processTurn returns state + events for UI consumption
- Camera follows player with smooth viewport updates
- Encounter gauge step variance: `baseAmount + floor(random() * 3)` per step
- FOE movement synchronized: 1 FOE step per 1 player step
- Reached 129 tests total (76 new tests)

**PR:** #3 — Phase 2: Core Dungeon Movement (merged 2026-02-08)

**Next sprint:** Phase 3 — Combat system implementation.

### Sprint 06 — Phase 3: Combat System (2026-02-08)

**Goal:** Implement full combat system with 3x3 enemy grid, displacement mechanics, bind/ailment status effects, and victory/defeat handling.

**Implementation Plan:** 7 incremental commits following interview-first protocol.

**Commit 1: Combat Types & State Foundation**
- [x] Define complete type system in `src/types/combat.ts` (2026-02-08)
- [x] GridPosition, BattleTile, CombatEntity, CombatState, Action types (2026-02-08)
- [x] Event discriminated unions for UI consumption (2026-02-08)
- [x] EncounterData and CombatRewards types (2026-02-08)

**Commit 2: Grid & Entity Utilities**
- [x] Grid utilities: isValidPosition, getTile, addEntityToTile, moveEntity (2026-02-08)
- [x] Entity queries: findEntity, isAlive, getAliveParty, isPartyWiped (2026-02-08)
- [x] Bind checks: isHeadBound, isArmBound, isLegBound, canUsePhysicalAttack (2026-02-08)
- [x] Turn order: calculateSpeed, sortBySpeed, getCurrentActor, advanceTurn (2026-02-08)
- [x] 53 unit tests for all utility functions (2026-02-08)

**Commit 3: Damage Calculation & Basic Attack**
- [x] Damage formula: `baseDmg = str * multiplier - vit / 2` (2026-02-08)
- [x] Variance (0.9-1.1), crit (luc/100 chance → 1.5x), arm bind penalty (0.5x) (2026-02-08)
- [x] Combo multiplier: `damage * (1 + comboCounter * 0.1)` (2026-02-08)
- [x] executeAttack: hits ALL entities at target tile (AOE on stacks) (2026-02-08)
- [x] 17 unit tests with deterministic RNG (2026-02-08)

**Commit 4: Displacement & Trap Tiles**
- [x] Displacement directions: push (back), pull (forward), left, right (2026-02-08)
- [x] Boundary clamping (0-2 for 3x3 grid) (2026-02-08)
- [x] Hazard tiles: spike (10 dmg), web (leg bind 2 turns), fire (poison 5 dmg/turn, 3 turns) (2026-02-08)
- [x] displaceEntity: moves entity + triggers hazard if present (2026-02-08)
- [x] 22 unit tests covering all displacement scenarios (2026-02-08)

**Commit 5: Bind & Ailment System**
- [x] applyBind with resistance scaling: `duration = max(1, baseDuration - floor(resistance/25))` (2026-02-08)
- [x] Resistance increases by 20 on successful application (2026-02-08)
- [x] applyAilment for poison, paralyze, sleep, blind (2026-02-08)
- [x] tickStatusDurations: decrements turn counters at end of turn (2026-02-08)
- [x] processAilmentEffects: poison damage, paralyze turn skip, sleep removal on hit (2026-02-08)
- [x] 20 unit tests with controlled RNG (2026-02-08)

**Commit 6: Combat State Machine & Turn Loop**
- [x] initializeCombat: creates CombatState from EncounterData (2026-02-08)
- [x] Places enemies on 3x3 grid, sorts turn order by AGI (2026-02-08)
- [x] executeAction: routes to handlers, checks victory/defeat, marks hasActed (2026-02-08)
- [x] executeAttack, executeDefend, executeFlee implementations (2026-02-08)
- [x] checkVictoryDefeat: detects all-enemies-dead or party-wiped (2026-02-08)
- [x] processTurnEnd, resetComboCounter for turn management (2026-02-08)
- [x] calculateRewards: fixed 100 + 20*enemies XP (MVP, no materials) (2026-02-08)
- [x] 20 unit tests for state machine and action execution (2026-02-08)

**Commit 7: Combat Store & Screen Integration**
- [x] Create combatStore with Zustand (startCombat, selectAction, endCombat) (2026-02-08)
- [x] Victory: calculates rewards, returns to dungeon after 2s (2026-02-08)
- [x] Defeat: returns to town after 2s (2026-02-08)
- [x] Create test data: ENEMY_SLIME, DEFAULT_PARTY (4 blobs), encounter factory (2026-02-08)
- [x] Update dungeonStore to trigger combatStore.startCombat() on encounters (2026-02-08)
- [x] Update CombatScreen with MVP display (enemy/party HP bars, phase status) (2026-02-08)
- [x] 12 unit tests for combat store integration (2026-02-08)

**Test Coverage:**
- **220 tests total** (+144 new combat tests)
- All tests passing, build verified clean

**Architecture:**
- Pure TypeScript game logic in `src/systems/combat.ts` (no React imports)
- Injectable RNG for deterministic testing
- Discriminated union events for UI consumption
- Immutable state updates throughout
- JSON-serializable state for future save system

**MVP Simplifications:**
- Skills: Only "Attack" and "Defend" (skill system deferred to Phase 4)
- Items: Stub (deferred to Phase 5)
- Enemy AI: Simple random (deferred to Phase 4)
- Rewards: Fixed XP, no materials yet (deferred to Phase 5)
- UI: Basic HP bars (polish in Phase 3b)

**PR:** #4 — Phase 3: Combat System Implementation (open, ready for review)

**Next sprint:** Phase 3b — Combat UI polish (grid renderer, action menu, animations) OR Phase 4 — Character & Class System.

### Sprint 07 — Phase 3b: Combat UI Polish (2026-02-08)

**Goal:** Make combat fully playable with interactive UI — grid targeting, action menu, turn timeline, damage feedback, and victory/defeat overlays.

**Tasks:**

**Commit 1: 3x3 Grid Renderer + Tap-to-Target**
- [x] CombatGrid component with 3x3 CSS Grid layout (2026-02-08)
- [x] GridTile component with enemy display, HP, hazard icons (2026-02-08)
- [x] Tap tile to select target (highlight with inverted colors) (2026-02-08)
- [x] Touch targets >= 44px, empty tiles grayed out (2026-02-08)

**Commit 2: Action Menu + Enemy AI**
- [x] ActionMenu component: Attack/Defend/Flee buttons (bottom-anchored) (2026-02-08)
- [x] Attack targeting flow: tap Attack → "Select target" → tap tile → confirm (2026-02-08)
- [x] Defend and Flee action execution (2026-02-08)
- [x] Enemy auto-turn: executeEnemyTurn in combat.ts (attacks random alive party member) (2026-02-08)
- [x] Auto-advance turn order with dead-actor skipping (2026-02-08)
- [x] advanceToNext and processEnemyTurn added to combatStore (2026-02-08)

**Commit 3: Turn Order Timeline + Combat HUD**
- [x] TurnOrderTimeline: horizontal entity list sorted by speed, current actor highlighted (2026-02-08)
- [x] Dead actors shown with strikethrough, acted actors with checkmark (2026-02-08)
- [x] CombatHUD: round counter, combo display (highlighted when high), flee status (2026-02-08)

**Commit 4: Event Feedback & Animations**
- [x] DamageNumber component with CSS fade-up animation (2026-02-08)
- [x] StatusIcon component for bind/ailment indicators on grid tiles (2026-02-08)
- [x] useCombatEvents hook: processes store events into damage displays + messages (2026-02-08)
- [x] Party damage display (red numbers next to HP bars when hit) (2026-02-08)
- [x] Victory overlay (inverted colors, "Returning to dungeon...") (2026-02-08)
- [x] Defeat overlay (dark background, "Returning to town...") (2026-02-08)
- [x] CSS keyframe animations: fadeUp, overlayFadeIn (2026-02-08)
- [x] Event message log below grid (flee success/fail, bind applied, etc.) (2026-02-08)

**Test Coverage:**
- 220 tests still passing (no regressions)
- Build verified clean after each commit

**New Files Created:**
- `src/components/combat/CombatGrid.tsx` — 3x3 grid renderer
- `src/components/combat/GridTile.tsx` — Individual tile with entity display
- `src/components/combat/ActionMenu.tsx` — Attack/Defend/Flee buttons
- `src/components/combat/CombatHUD.tsx` — Top bar with round/combo info
- `src/components/combat/TurnOrderTimeline.tsx` — Speed-sorted entity list
- `src/components/combat/DamageNumber.tsx` — Floating damage animation
- `src/components/combat/StatusIcon.tsx` — Bind/ailment indicators
- `src/hooks/useCombatEvents.ts` — Event processing hook

**Modified Files:**
- `src/components/combat/CombatScreen.tsx` — Complete rewrite with all new components
- `src/stores/combatStore.ts` — Added processEnemyTurn, advanceToNext
- `src/systems/combat.ts` — Added executeEnemyTurn for enemy AI
- `src/index.css` — Added combat animation keyframes

**Architecture Notes:**
- Enemy turns auto-execute via useEffect with debounced delays (500ms think + 600ms advance)
- Dead actors in turn order are automatically skipped
- Damage displays use unique IDs and self-destruct after 800ms animation
- Event messages auto-clear after 1500ms
- Party members targeted by enemies via direct damage (not grid-based, since party isn't on the grid)
- All new components follow B&W wireframe palette with gauge-color accents

**PR:** #4 — Phase 3: Combat System Implementation (updated with UI polish)

**Next sprint:** Phase 4 — Character & Class System (6 blob classes, skill trees, equipment).

### Sprint 08 — Dungeon Visual Improvements: Zoom Fix, Fog of War, Minimap (2026-02-08)

**Goal:** Fix the dungeon viewport zoom calculation for landscape displays, add Etrian Odyssey-style fog of war with three visibility states, and add a canvas-based minimap overlay.

**Tasks:**

**Zoom Fix:**
- [x] Change cellSize calculation to use shorter axis (`Math.min(width, height) / 7`) instead of just width (2026-02-08)
- [x] Add MIN_CELL_SIZE floor (40px) to prevent tiles from being too small (2026-02-08)

**Fog of War — Types:**
- [x] Add `TileVisibility = 'hidden' | 'explored' | 'visible'` type to `src/types/dungeon.ts` (2026-02-08)
- [x] Add `exploredTiles: readonly string[]` to `DungeonState` for serializable fog state (2026-02-08)

**Fog of War — System Logic (`src/systems/dungeon.ts`):**
- [x] Add `positionKey(pos)` utility for "x,y" string keys (2026-02-08)
- [x] Add `computeVisibleTiles(playerPos, floor, radius)` — BFS flood-fill within Manhattan radius 3, stops at walls (includes wall faces), respects directional walls (2026-02-08)
- [x] Add `updateExploredTiles(current, newVisible)` — merges with stable ref optimization (2026-02-08)
- [x] Add `getTileVisibility(x, y, visibleSet, exploredSet)` — priority: visible > explored > hidden (2026-02-08)
- [x] Modify `initializeDungeonState()` to seed `exploredTiles` from starting position visibility (2026-02-08)
- [x] Modify `processTurn()` to update `exploredTiles` after player movement (2026-02-08)

**Fog of War — Components:**
- [x] Update `DungeonTile.tsx` with `visibility` prop: hidden=black, explored=dimmed gray, visible=white (2026-02-08)
- [x] Update `DungeonGrid.tsx` to compute `visibleSet` and `exploredSet` via `useMemo`, pass visibility to tiles, filter FOE tokens to only visible tiles (2026-02-08)

**Fog of War — Tests:**
- [x] Update `makeState` helper to include `exploredTiles: []` (2026-02-08)
- [x] Add `positionKey` tests (2026-02-08)
- [x] Add `computeVisibleTiles` tests: open floor radius, wall blocking (includes wall faces), directional wall blocking, out-of-bounds exclusion (2026-02-08)
- [x] Add `updateExploredTiles` tests: merge, deduplication, stable ref when unchanged (2026-02-08)
- [x] Add `getTileVisibility` tests: priority ordering (visible > explored > hidden) (2026-02-08)
- [x] Update `initializeDungeonState` test to verify `exploredTiles` is populated (2026-02-08)

**Minimap:**
- [x] Create `src/components/dungeon/Minimap.tsx` — canvas-based minimap with collapsed (4px/tile, top-right overlay) and expanded (8px/tile, full-screen dark overlay) modes (2026-02-08)
- [x] Canvas rendering: black=hidden/wall, white=visible floor, gray=explored floor, black dot=player, gray square=visible FOE (2026-02-08)
- [x] Integrate `<Minimap>` into `DungeonViewport.tsx` (2026-02-08)

**Test Coverage:**
- 232 tests passing (12 new fog of war tests)
- TypeScript compiles cleanly (`tsc --noEmit`)

**Files Modified:**
- `src/components/dungeon/DungeonViewport.tsx` — zoom fix + minimap integration
- `src/types/dungeon.ts` — `TileVisibility` type, `exploredTiles` on `DungeonState`
- `src/systems/dungeon.ts` — 4 new visibility functions, modified init + processTurn
- `src/systems/dungeon.test.ts` — updated helper, 12 new tests
- `src/components/dungeon/DungeonTile.tsx` — visibility prop with 3 render states
- `src/components/dungeon/DungeonGrid.tsx` — visibility computation, FOE filtering

**Files Created:**
- `src/components/dungeon/Minimap.tsx` — canvas minimap with collapse/expand

**Next sprint:** Phase 4 — Character & Class System (6 blob classes, skill trees, equipment).

### Sprint 09 — Phase 2b: Dungeon UI Polish (2026-02-08)

**Goal:** Fix wall/fog indistinguishability and adjust dungeon viewport zoom for better exploration experience.

**Tasks:**
- [x] Differentiate visible walls from fog of war in DungeonTile (dark gray + border vs pure black) (2026-02-08)
- [x] Add explored wall rendering state (medium gray, distinct from both visible walls and explored floors) (2026-02-08)
- [x] Zoom out viewport from 7 to 9 tiles per short axis, reduce min cell size from 40px to 32px (2026-02-08)
- [x] Update Minimap canvas to render visible/explored walls differently from fog (2026-02-08)
- [x] Visual testing with agent-browser (verified wall differentiation, zoom level, FOE visibility) (2026-02-08)

**Test Coverage:**
- 232 tests still passing (no regressions)
- Build verified clean

**Files Modified:**
- `src/components/dungeon/DungeonTile.tsx` — 4 visibility×type render states (was 3)
- `src/components/dungeon/DungeonViewport.tsx` — zoom constants (9 tiles, 32px min)
- `src/components/dungeon/Minimap.tsx` — wall visibility rendering in canvas
- `plans/plan.md` — Phase 2b tasks + sprint log

**Visual Changes:**
- Hidden (fog of war): pure black (`bg-ink`) — unchanged
- Visible wall: dark gray (`bg-gray-800`, border `gray-700`) — NEW, was indistinguishable from fog
- Explored wall: medium gray (`bg-gray-700`, border `gray-600`) — NEW
- Visible floor: white (`bg-paper`, border `gray-200`) — unchanged
- Explored floor: light gray (`bg-gray-300`, border `gray-400`) — unchanged

**PR:** feat/dungeon-ui-polish (new branch from main)

### Sprint 10 — Full QA Session & Bug Fixes (2026-02-08)

**Goal:** Comprehensive QA of all implemented screens with agent-browser visual testing. Fix critical bugs found.

**Bugs Found & Fixed:**
- [x] **CRITICAL: Combat soft-lock on enemy turns** — Enemy turn processing got stuck on "Slime is acting..." indefinitely. Root cause: nested `setTimeout` in `CombatScreen.tsx` useEffect — the inner timer (for `advanceToNext`) was not tracked by the cleanup function, causing a race condition when the effect re-ran after `processEnemyTurn` state update. Fix: track both outer and inner timers in cleanup. (2026-02-08)
- [x] **Round counter stuck at "Round 1"** — `CombatHUD` computed rounds from `hasActed` count, but `advanceTurn()` resets `hasActed` per-actor as it advances, so the count never reached a full cycle. Fix: added `round` field to `CombatState`, incremented in `advanceTurn()` when index wraps to 0, display directly in `CombatHUD`. (2026-02-08)

**Bugs Found (Not Fixed — Pre-existing):**
- **Dungeon left-edge white strip** — When player is near the left edge of the dungeon, the viewport shows a white area to the left of the map boundary. The camera doesn't clamp properly at map edges. Low priority.

**Suggestions for Improvement:**
- **Town screen**: Buttons work well, good disabled state for coming-soon items. Consider adding a game title/logo above "Town" heading for branding.
- **Character screen**: Clean layout with tabs, stats, equipment slots, and skill list. Skill descriptions and level requirements are clear. Consider highlighting the stat that matters for each class (e.g., bold STR for Ironblob, bold INT for Sparkblob).
- **Party formation**: Inverted color toggle is intuitive. "Tap to toggle. 4/4 active members" instruction is clear.
- **Dungeon viewport**: Fog of war works well with 3 visibility states. Minimap is functional but small — consider making the collapsed minimap slightly larger (currently hard to read at 4px/tile). Wall vs fog differentiation is good after the Phase 2b polish.
- **Combat grid**: 3x3 grid is clear, tile selection with inverted colors works well. "Select a target" / "Tap Attack to confirm" two-step flow prevents misclicks.
- **Turn order timeline**: Readable with checkmarks for acted entities and strikethrough for dead ones. Shield icon for defend is nice.
- **Combo counter**: Good visual feedback — turns red at x3+, draws attention.
- **Party HP bars**: Clean and readable. Damage numbers appear next to HP when hit.
- **FOE encounters**: "No escape" + disabled Flee button correctly communicates FOE fight severity.
- **Victory/defeat transitions**: Auto-return after 2s works. Dungeon state persists through combat correctly.
- **Encounter gauge**: Green fill at bottom is subtle but functional. Consider making it slightly taller for better visibility on mobile.

**Test Coverage:**
- 341 tests passing (no regressions from bug fixes)
- Build verified clean

**Files Modified:**
- `src/components/combat/CombatScreen.tsx` — Fixed enemy turn timer cleanup (inner setTimeout)
- `src/types/combat.ts` — Added `round` field to `CombatState`
- `src/systems/combat.ts` — Added `round: 1` to `initializeCombat`, increment in `advanceTurn` on wrap
- `src/components/combat/CombatHUD.tsx` — Use `combat.round` directly instead of computing from hasActed
- `src/systems/combat.test.ts` — Added `round: 1` to test state helper
- `src/systems/skill-execution.test.ts` — Added `round: 1` to test state helper

**Screenshots:** 23 screenshots saved to `~/Desktop/blob-rpg-screenshots/qa-session/`

**PR:** qa/full-qa-session (branch from main)

### Sprint 11 — How to Play / Glossary (2026-02-08)

**Goal:** Add a tabbed reference guide for new players covering all implemented game systems.

**Tasks:**
- [x] Add `'how-to-play'` to `GameScreen` type (2026-02-08)
- [x] Add `helpOpen` boolean + `toggleHelp` action to `gameStore` (2026-02-08)
- [x] Create help content data files in `src/data/help/` (controls, dungeon, combat, glossary) (2026-02-08)
- [x] Create `HelpSection` reusable renderer component (2026-02-08)
- [x] Create `HowToPlayContent` with 5 horizontal tabs: Controls, Dungeon, Combat, Classes, Glossary (2026-02-08)
- [x] Classes tab dynamically pulls from `getAllClasses()` + `getClassSkills()` registry (2026-02-08)
- [x] Glossary tab with 24 alphabetical game term definitions (2026-02-08)
- [x] Create `HowToPlayScreen` full-screen wrapper (Town entry point) (2026-02-08)
- [x] Create `HelpOverlay` absolute overlay wrapper (Dungeon/Combat entry point) (2026-02-08)
- [x] Create `HelpButton` ("?") component for HUD integration (2026-02-08)
- [x] Add "How to Play" button to TownScreen (2026-02-08)
- [x] Add `HelpButton` to DungeonHUD (next to Town button) (2026-02-08)
- [x] Add `HelpButton` to CombatHUD (right end) (2026-02-08)
- [x] Register `HowToPlayScreen` in App.tsx screens map (2026-02-08)
- [x] Render `HelpOverlay` conditionally in App.tsx when `helpOpen === true` (2026-02-08)

**Test Coverage:**
- 341 tests still passing (no regressions)
- Build verified clean (`tsc -b && vite build`)

**Files Created (10):**
- `src/data/help/types.ts` — `HelpEntry` and `GlossaryEntry` interfaces
- `src/data/help/controls.ts` — 3 sections (movement, combat controls, minimap)
- `src/data/help/dungeon.ts` — 4 sections (encounter gauge, FOEs, fog, checkpoints)
- `src/data/help/combat.ts` — 8 sections (turn order, grid, actions, displacement, combos, traps, binds, ailments)
- `src/data/help/glossary.ts` — 24 alphabetical terms (AGI through XP)
- `src/components/help/HelpSection.tsx` — Reusable section renderer
- `src/components/help/HelpButton.tsx` — "?" icon button wired to `toggleHelp`
- `src/components/help/HowToPlayContent.tsx` — 5-tab content component
- `src/components/help/HowToPlayScreen.tsx` — Full screen wrapper (Town entry)
- `src/components/help/HelpOverlay.tsx` — Overlay wrapper (Dungeon/Combat entry)

**Files Modified (6):**
- `src/types/game.ts` — Added `'how-to-play'` to `GameScreen`
- `src/stores/gameStore.ts` — Added `helpOpen` + `toggleHelp`
- `src/App.tsx` — Registered `HowToPlayScreen`, renders `HelpOverlay` conditionally
- `src/components/town/TownScreen.tsx` — Added "How to Play" button
- `src/components/dungeon/DungeonHUD.tsx` — Added `HelpButton` next to Town button
- `src/components/combat/CombatHUD.tsx` — Added `HelpButton` at right end

**PR:** #12 — feat/help-screen (branch from main)

### Sprint 12 — Equipment Picker & Inventory Screen (2026-02-08)

**Goal:** Fix two related bugs — equipment slots do nothing when tapped (#14), and there's no way to view owned items (#15).

**Tasks:**

**Equipment Picker (fixes #14):**
- [x] Create `EquipmentPicker` component — inline panel below tapped slot (2026-02-08)
- [x] Filter owned items by slot type (weapons for weapon slot, accessories interchangeable between acc1/acc2) (2026-02-08)
- [x] Track duplicates — if you own 2 of the same item and 1 is equipped elsewhere, only 1 shows available (2026-02-08)
- [x] Wire `onSlotTap` in CharacterSheet (was empty no-op) to toggle picker (2026-02-08)
- [x] Equip calls `partyStore.equipItem()` → stats recalculate with equipment bonuses (2026-02-08)
- [x] Unequip option shown when item is currently equipped (2026-02-08)
- [x] Current item marked with "(equipped)" label + gray background (2026-02-08)

**Inventory Screen (fixes #15):**
- [x] Create `InventoryScreen` component with 3 tabs: Equipment, Items (consumables), Materials (2026-02-08)
- [x] Equipment tab shows owned items with descriptions and "Equipped by: [name]" indicators (2026-02-08)
- [x] Items tab shows consumables with quantities (2026-02-08)
- [x] Materials tab shows gathered materials with quantities (2026-02-08)
- [x] Gold display in header (2026-02-08)
- [x] Empty state messages for each tab (2026-02-08)
- [x] Add `'inventory'` to `GameScreen` type, register in App.tsx, add button to TownScreen (2026-02-08)

**Test Coverage:**
- 354 tests passing (no regressions)
- Build verified clean (`tsc -b && vite build`)
- Visual testing with agent-browser: buy from shop → view in inventory → equip on character → verify stat change → unequip → verify revert

**Files Created (2):**
- `src/components/character/EquipmentPicker.tsx` — Inline equipment selection panel
- `src/components/town/InventoryScreen.tsx` — Tabbed inventory viewer

**Files Modified (4):**
- `src/components/character/CharacterSheet.tsx` — Wired `onSlotTap` to EquipmentPicker
- `src/App.tsx` — Registered InventoryScreen in screens map
- `src/components/town/TownScreen.tsx` — Added Inventory button
- `src/types/game.ts` — Added `'inventory'` to GameScreen union

**Screenshots:** 12 screenshots saved to `~/Desktop/blob-rpg-screenshots/` (01-12 series)

**PR:** #18 — fix/equip-inventory-ui (branch from main, git worktree)

### Sprint 13 — Multi-Guild Save System (2026-02-08)

**Goal:** Replace Zustand persist middleware with an explicit multi-guild save system supporting named guilds, multiple save slots, dungeon suspend saves, and legacy data migration. Resolves issue #13.

**Tasks:**

**Types & Architecture:**
- [x] Create `src/types/save.ts` with SaveRegistry, GuildEntry, GuildSlotIndex, SlotMeta, SaveData, SuspendSaveData interfaces (2026-02-08)
- [x] Add `'guild-name' | 'load-game' | 'save-game'` to `GameScreen` type (2026-02-08)

**Save System Rewrite (`src/systems/save.ts`):**
- [x] Registry API: `getRegistry()`, `saveRegistry()`, `hasAnyGuilds()` (2026-02-08)
- [x] Guild CRUD: `createGuild()`, `deleteGuild()`, `updateGuildLastPlayed()` — max 3 guilds (2026-02-08)
- [x] Slot API: `saveToSlot()`, `loadSlot()`, `deleteSlot()`, `getSlotIndex()` — max 3 slots per guild (2026-02-08)
- [x] Suspend API: `saveSuspend()`, `loadAndDeleteSuspend()`, `hasSuspendSave()` — one-shot, deleted on load (2026-02-08)
- [x] Legacy migration: `migrateLegacySaves()`, `hasLegacySaveData()`, `clearLegacyKeys()` — unwraps Zustand persist envelope, creates "Legacy Guild" (2026-02-08)

**Store Changes:**
- [x] Remove `persist` middleware from gameStore, partyStore, inventoryStore, questStore (2026-02-08)
- [x] Create `src/stores/guildStore.ts` — runtime guild context (currentGuildId, currentGuildName, lastLoadedSlotId) (2026-02-08)
- [x] Create `src/stores/saveActions.ts` — bridge functions: loadGameState, loadSuspendState, collectGameState, collectSuspendState, resetAllStores (2026-02-08)
- [x] Add `saveAndQuit` action to dungeonStore — creates suspend save, clears dungeon, returns to title (2026-02-08)

**New UI Screens:**
- [x] `GuildNameScreen` — text input for guild name + Begin/Back buttons (2026-02-08)
- [x] `LoadGameScreen` — two-step: guild list → slot list, with suspend save highlight and delete guild option (2026-02-08)
- [x] `SaveGameScreen` — slot picker from Inn, overwrite confirmation, delete slot, brief "Saved!" feedback (2026-02-08)
- [x] `ConfirmDialog` — reusable confirmation modal (2026-02-08)

**Existing Screen Modifications:**
- [x] `TitleScreen` — redesigned: New Game → guild-name, Load Game → load-game, auto-migrates legacy saves in useState initializer (2026-02-08)
- [x] `TownScreen` — shows guild name below heading (2026-02-08)
- [x] `InnScreen` — added "Save Game" button (only when guild is active) (2026-02-08)
- [x] `DungeonHUD` — added "Save" button with confirmation dialog for Save & Quit (2026-02-08)
- [x] `DungeonScreen` — passes `saveAndQuit` to DungeonHUD (2026-02-08)
- [x] `App.tsx` — registered 3 new screens (guild-name, load-game, save-game) (2026-02-08)

**Tests:**
- [x] 30 new save system tests covering registry, guild CRUD, slot CRUD, suspend saves, legacy migration (2026-02-08)
- [x] All 384 tests passing (354 existing + 30 new) (2026-02-08)

**localStorage Key Structure:**
```
blob-rpg-registry                       → SaveRegistry (guild index)
blob-rpg-guild-<id>-slots               → GuildSlotIndex (slot metadata)
blob-rpg-guild-<id>-slot-<slotId>       → SaveData (full game snapshot)
blob-rpg-guild-<id>-suspend             → SuspendSaveData (dungeon save & quit)
```

**Files Created (8):**
- `src/types/save.ts` — Save data schema and constants
- `src/systems/save.ts` — Complete save system rewrite (was 25 lines, now 366)
- `src/systems/save.test.ts` — 30 unit tests
- `src/stores/guildStore.ts` — Runtime guild context
- `src/stores/saveActions.ts` — Load/collect/reset bridge
- `src/components/ui/GuildNameScreen.tsx` — Guild name input
- `src/components/ui/LoadGameScreen.tsx` — Guild/slot picker
- `src/components/town/SaveGameScreen.tsx` — Inn save slot picker
- `src/components/ui/ConfirmDialog.tsx` — Reusable confirm modal

**Files Modified (13):**
- `src/types/game.ts` — Added 3 new screen types
- `src/stores/gameStore.ts` — Removed persist
- `src/stores/partyStore.ts` — Removed persist
- `src/stores/inventoryStore.ts` — Removed persist
- `src/stores/questStore.ts` — Removed persist
- `src/stores/dungeonStore.ts` — Added saveAndQuit
- `src/App.tsx` — Registered 3 new screens
- `src/components/ui/TitleScreen.tsx` — Redesigned with guild flow
- `src/components/town/TownScreen.tsx` — Shows guild name
- `src/components/town/InnScreen.tsx` — Added Save Game button
- `src/components/dungeon/DungeonHUD.tsx` — Added Save & Quit button
- `src/components/dungeon/DungeonScreen.tsx` — Passes saveAndQuit to HUD
- `plans/plan.md` — Sprint log + Phase 5b update

**PR:** #20 — feat/save-system (branch from main, git worktree)

---

## Research Notes

### Etrian Odyssey Mechanics Reference

**Source:** Etrian Odyssey series (primarily EO4, EO5, EOX/Nexus)

#### Encounter Gauge
- Displayed at bottom of screen during dungeon exploration
- Color progression: Blue → Green → Yellow → Orange → Red
- Each step adds a semi-random value (base amount + floor modifier + random variance)
- When the gauge fills completely, a random encounter triggers immediately
- The gauge resets to zero after the encounter
- Certain skills (e.g., Survivalist's "Stalker") reduce the fill rate
- Some items temporarily suppress the gauge
- Higher dungeon floors have higher base fill rates (more frequent encounters)

#### FOE (Field On Enemy) System
- FOEs are visible on the dungeon map as distinct, colored orbs (orange in most games)
- They move on the field in sync with the player — 1 FOE step per 1 player step
- Movement patterns vary:
  - **Patrol:** Walks a fixed path back and forth
  - **Chase:** Moves toward the player when in line of sight
  - **Stationary:** Blocks a passage, doesn't move
  - **Conditional:** Moves only when player performs certain actions (e.g., steps on a trigger tile)
- FOEs are significantly stronger than random encounters on the same floor
- Players are expected to avoid them initially and return later when stronger
- FOEs respawn when the player leaves and re-enters a floor
- Some FOEs have field interactions (e.g., clearing a FOE opens a shortcut)

#### Force System (EO4+)
- Each class has a unique Force Boost and Force Break
- **Force Boost:** Activated to enter a powered-up state for several turns (e.g., Landsknecht hits all enemies, Medic heals every turn automatically)
- **Force Break:** The ultimate ability — extremely powerful but breaks the Force gauge for the rest of the battle (cannot use Force Boost again until it regenerates between battles)
- Force gauge fills from: dealing damage, taking damage, using skills, turns passing
- Fill rate varies by class and equipment
- Strategic decision: use Force Boost for sustained advantage, or wait for Force Break as a panic button / finisher

#### Subclass System
- Unlocked at a story milestone (varies by game, usually ~level 20-30 range)
- Player picks one other class as subclass for each character
- Character gains access to most (not all) of the subclass skill tree
- Subclass skills have a level cap lower than main class skills
- Enables powerful combinations (e.g., Protector subclassing Medic for self-healing tank)
- Can be changed in town at any time (skill points are refunded for subclass skills)

#### Town Economy / Costs
- Inn cost formula: roughly `base_cost * average_party_level * party_size`
- Partial rest option: recover 50% HP/TP for ~60% of full rest cost
- Equipment prices scale with tier — early items are cheap, late-game items are expensive
- Shop unlock mechanic: selling 1-5 of a specific monster drop unlocks new items to buy. Players don't know the recipe until the item unlocks. Incentivizes selling loot rather than hoarding.
- Quest rewards: money + XP + sometimes unique items/equipment not available in shops

### Pokémon Mystery Dungeon Movement Reference

**Source:** PMD Explorers of Sky, PMD DX

#### Grid Movement
- All movement is tile-based on a grid
- Player and all entities move simultaneously in a turn
- 8-directional movement (4 cardinal + 4 diagonal)
- For mobile adaptation: likely best to start with 4-directional (swipe up/down/left/right)

#### Turn Structure
- Player takes an action (move, attack, use item, use move/skill, wait)
- All enemies then take their actions simultaneously
- This creates a puzzle-like feel where positioning matters

#### Entity Behavior
- Enemies have simple AI: wander when player is far, approach when player is nearby, attack when adjacent
- Some enemies have ranged attacks or special movement patterns
- Items are scattered on the floor, visible as tiles
- Traps are hidden until stepped on (or revealed by abilities)

#### Relevance to Blob RPG
- The simultaneous turn structure is core to our dungeon design
- Simplify to 4-directional for mobile swipe controls
- FOE system adapts this by making strong enemies visible and predictable (player can plan around their movement)
- Random encounters (via gauge) replace the "every tile might have an enemy" feel

### Key Architecture Notes (Combat)

**3x3 Grid State** — Each tile holds an array of entity IDs (for stacking):
```ts
interface BattleGrid {
  tiles: BattleTile[][]; // 3x3
}
interface BattleTile {
  position: [number, number];
  entities: string[]; // entity IDs, multiple = stacked
  hazard?: 'spike' | 'web' | 'fire' | null;
}
```

**Displacement** — Skills carry a vector:
```ts
interface DisplacementEffect {
  direction: 'push' | 'pull' | 'left' | 'right';
  distance: number; // usually 1
}
```

**Bind System** — Three body-part slots, each with duration:
```ts
interface BindState {
  head: number; // turns remaining, 0 = unbound
  arm: number;
  leg: number;
}
```

All combat logic lives in `src/systems/combat.ts` as pure functions. Grid state, bind state, and combo counters are part of the combat reducer state.
