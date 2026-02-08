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

- [ ] Define dungeon floor data format (tiles, walls, exits, FOE spawns, checkpoints)
- [ ] Build dungeon grid renderer (CSS Grid + tile components)
- [ ] Implement player position + movement (swipe gestures + keyboard arrows)
- [ ] Turn system: player moves → FOEs move → encounter gauge ticks
- [ ] Encounter gauge component + logic (step-based fill, green→yellow→red, threshold trigger)
- [ ] FOE entities with patrol movement pattern
- [ ] FOE collision → transition to combat screen
- [ ] Dungeon HUD (floor number, encounter gauge, party HP summary)
- [ ] Shortcut/checkpoint mechanic (one-way paths, warp to town)
- [ ] First test floor (handcrafted, ~15x15 grid with corridors + rooms)

### Phase 3: Combat System (3x3 Grid + Bind/Shutdown)

> Full combat with displacement combos and bind system.

**3a — Combat Foundation:**
- [ ] 3x3 enemy grid state model (array of entities per tile for stacking)
- [ ] Grid renderer (tap to target tiles)
- [ ] Party display (4 characters in a list with HP/TP bars)
- [ ] Turn order (speed-based timeline, visible to player)
- [ ] Basic actions: Attack (target a tile), Defend, Item, Flee
- [ ] Damage formula (STR, DEF, variance, tile position modifier)
- [ ] Combat state machine (useReducer-based)
- [ ] Combat rewards (XP, material drops) and victory/defeat transitions
- [ ] Party wipe handling (return to town, penalties)

**3b — Displacement + Combos:**
- [ ] Displacement skills with direction vectors: Push (back), Pull (forward), Lateral (left/right)
- [ ] Stacking mechanic: multiple entities per tile, AOE hits all stacked
- [ ] Combo multiplier: consecutive hits increase damage (BaseDmg * (1 + combo * 0.1))
- [ ] Trap tiles on the enemy grid (spike = damage, web = leg bind)

**3c — Bind/Shutdown:**
- [ ] Bind status effects: Head (disables spells/INT attacks), Arm (disables physicals, -50% damage), Leg (prevents escape/evasion, disables speed skills)
- [ ] Bind duration (turns-based) + resistance scaling
- [ ] Ailments: Poison (flat DoT), Paralyze (% turn loss), Sleep (skip + 1.5x first hit), Blind (accuracy drop)
- [ ] Conditional skill logic: "if target has N binds, deal Nx damage"
- [ ] Enemy AI: weighted random action selection, respects own binds (bound arm = can't use physical)

### Phase 4: Character & Class System

> 6 blob classes with skill trees and equipment.

- [ ] Character stat types (HP, TP, STR, VIT, INT, WIS, AGI, LUC)
- [ ] Leveling system (XP thresholds, stat growth rates per class)
- [ ] 6 blob class data definitions (base stats, growth rates, skill tree)
- [ ] Skill trees: hub-and-spoke model (central core skill + 3-4 branches)
  - 25/25/25/25 distribution: Passives / Actives / Synergy-conditionals / Ultimate
  - Point-based investment, prerequisites
- [ ] Skill tree UI (mobile-friendly, hub-and-spoke layout)
- [ ] Equipment types: weapon, armor, 2 accessory slots
- [ ] Equipment stat modifiers + equip/unequip logic
- [ ] Character sheet UI
- [ ] Party formation screen (choose 4 of 6 for the dungeon)

### Phase 5: Town & Economy

> Material-driven shop, inn, guild, saves.

- [ ] Town screen with sub-location navigation
- [ ] Inn: rest to restore HP/TP, cost scales with party level, partial rest option
- [ ] Shop — material unlock system:
  - Global sold-material counters
  - Selling N of a specific drop unlocks new items
  - Conditional drops: specific loot only when killed under conditions (e.g. "killed while head-bound")
- [ ] Shop — buy equipment + consumables from unlocked inventory
- [ ] Guild / quest board (kill X, gather Y, reach floor Z)
- [ ] Save/load system (localStorage, Zustand persist middleware)
- [ ] Autosave at dungeon checkpoints

### Phase 6: Content & Polish

> Fill the first dungeon, balance, tutorial.

- [ ] Full first dungeon: 3-5 floors with increasing difficulty
- [ ] Enemy roster (8-12 enemy types with varied stats, AI patterns, bind vulnerabilities)
- [ ] Balance: encounter tables, drop rates, shop unlock recipes, XP curves
- [ ] Equipment progression for first dungeon
- [ ] Tutorial / new game flow
- [ ] Accessibility pass (keyboard nav, screen reader labels, touch targets)
- [ ] Performance (memoization, lazy loading)

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
