# Blob RPG — Master Plan

> **Living document.** Updated every work cycle. Never delete items — mark completed with `[x]` + date, strike through dropped items with reason.

---

## Vision

Blob RPG is a mobile-first, browser-based RPG inspired by Etrian Odyssey and Pokémon Mystery Dungeon. Players guide a party of blob characters through grid-based dungeons, managing resources and encounters, then return to town to rest, upgrade, and prepare for the next expedition. The game uses a minimal black-and-white wireframe aesthetic, built with React + TypeScript and deployed to GitHub Pages for instant access on any device.

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

> The player can navigate a grid dungeon, see FOEs, and trigger encounters.

- [ ] Define dungeon floor data format (tiles, walls, exits, FOE spawns, checkpoints)
- [ ] Build dungeon grid renderer (CSS Grid + tile components)
- [ ] Implement player position state and movement (swipe/tap controls)
- [ ] Implement turn system (player moves → FOEs move → encounter gauge ticks)
- [ ] Build encounter gauge component (visual bar, green → yellow → red)
- [ ] Implement encounter gauge logic (step-based fill, threshold trigger, reset)
- [ ] Add FOE entities on the map with basic movement patterns (patrol)
- [ ] Implement FOE collision detection → transition to combat
- [ ] Add dungeon HUD (floor number, encounter gauge, party HP summary, minimap?)
- [ ] Build checkpoint/warp mechanic (return to town from safe points)
- [ ] Create first test floor layout (handcrafted for development)

### Phase 3: Combat System

> Turn-based combat with front/back row and core mechanics.

- [ ] Define combat state types (participants, turn order, actions, status effects)
- [ ] Build combat state machine (useReducer-based)
- [ ] Implement turn order calculation (speed-based)
- [ ] Implement basic actions: Attack, Defend, Skill, Item, Flee
- [ ] Build front/back row system (position affects damage given/taken, available skills)
- [ ] Implement damage formula (ATK, DEF, element, row modifier, variance)
- [ ] Build Force gauge (fills from actions/damage, enables Force Break)
- [ ] Build Boost system (accumulate points per turn, spend to enhance actions)
- [ ] Implement enemy AI (basic: random weighted action selection)
- [ ] Build combat UI (party display, enemy display, action menu, turn order indicator)
- [ ] Implement combat rewards (XP, loot drops, encounter gauge reset)
- [ ] Add combat → dungeon transition (return to map after victory)
- [ ] Add party wipe handling (return to town, penalties)

### Phase 4: Character & Class System

> Characters have stats, classes, skill trees, and equipment.

- [ ] Define character stat types (HP, TP, STR, VIT, INT, WIS, AGI, LUC)
- [ ] Implement leveling system (XP thresholds, stat growth per class)
- [ ] Define class data format (base stats, stat growth rates, skill tree)
- [ ] Build skill tree data structure (nodes, prerequisites, point costs, max levels)
- [ ] Implement skill point allocation logic
- [ ] Build skill tree UI component
- [ ] Implement subclass system (unlock at level threshold, partial secondary tree access)
- [ ] Define equipment types (weapon, armor, accessory) and stat modifiers
- [ ] Build equipment management (equip/unequip, stat recalculation)
- [ ] Build character sheet UI (stats, skills, equipment overview)
- [ ] Create initial class roster (pending user interview — see Decisions section)

### Phase 5: Town Loop

> The hub where players rest, shop, and manage between dungeon runs.

- [ ] Build town screen with navigation to sub-locations
- [ ] Implement Inn (rest to restore HP/TP, cost calculation)
- [ ] Implement Shop — buying (equipment, consumables)
- [ ] Implement Shop — selling (loot → money)
- [ ] Implement material system (selling specific loot unlocks new shop stock)
- [ ] Build Guild / quest board (accept quests, check completion, claim rewards)
- [ ] Implement save/load system (localStorage serialization)
- [ ] Add autosave at dungeon checkpoints
- [ ] Build save slot UI (save, load, delete)
- [ ] Implement party management (add/remove characters, change formation)

### Phase 6: Content & Polish

> Fill the game with real content and balance it.

- [ ] Design full first dungeon (multiple floors, increasing difficulty)
- [ ] Create enemy roster for first dungeon (varied types, stats, AI patterns)
- [ ] Balance encounter tables and loot drops
- [ ] Design and balance initial equipment progression
- [ ] Create tutorial / new game flow
- [ ] Add sound effects (optional — may stay silent for wireframe aesthetic)
- [ ] Implement quest chain for first dungeon
- [ ] Performance optimization (lazy loading floors, memoizing renders)
- [ ] Accessibility pass (screen reader labels, keyboard navigation, color contrast)
- [ ] Playtesting and balance iteration

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

## Decisions Pending User Interview

These decisions have been identified but need user input. Options are preserved here for discussion.

### Class Roster Design

What classes should blob characters have?

**Option A: Classic RPG Trinity**
- Warrior (tank/melee), Mage (ranged/elemental), Healer (support/restore), Rogue (speed/debuff)
- Pros: Immediately understandable, proven balance archetypes
- Cons: Generic, doesn't leverage the "blob" theme

**Option B: Etrian Odyssey Inspired (Expanded)**
- Landsknecht (multi-element attacks), Protector (tank/party shields), Medic (heals/buffs), Survivalist (binds/evasion), Alchemist (elemental nukes), Dark Hunter (debuffs/status), Troubadour (party buffs/auras), Hexer (enemy debuffs/curse)
- Pros: Deep tactical variety, proven design, lots of party synergy
- Cons: Many classes to balance, may overwhelm MVP

**Option C: Blob-Themed Originals**
- Slime (adaptive, changes properties), Gel (defensive, absorbs damage), Ooze (toxic, DoT/debuffs), Jelly (support, healing/buffs), Goo (ranged, elemental projectiles), Tar (slow, heavy damage)
- Pros: Unique identity, thematic, memorable
- Cons: Need to design all mechanics from scratch, no prior art to reference

**Option D: Hybrid — Classic Roles, Blob Flavor**
- Use classic RPG role archetypes but with blob-themed names and unique twists
- Example: "Ironblob" (warrior with absorption mechanic), "Sparkblob" (mage that splits into mini-blobs for multi-target)
- Pros: Best of both worlds — familiar roles with unique flair
- Cons: Naming and theming takes creative effort

---

### Dungeon Generation

How should dungeon floors be created?

**Option A: Fully Handcrafted**
- Every floor is manually designed with specific enemy placements, puzzles, and shortcuts
- Pros: Tight level design, curated experience, puzzle integration
- Cons: Content bottleneck, limited replayability

**Option B: Fully Procedural**
- Algorithm generates floor layout, enemy placement, and loot each run
- Pros: Infinite replayability, less content authoring
- Cons: Can feel generic, hard to create set-piece moments, complex to balance

**Option C: Hybrid — Handcrafted Skeleton, Procedural Fill**
- Floor structure and key encounters are designed, but room contents, enemy patrols, and loot are procedurally placed
- Pros: Curated progression with variety, manageable content creation
- Cons: More complex than either pure approach

**Option D: Handcrafted MVP, Procedural Later**
- Start with handcrafted floors for the first dungeon. Add procedural generation in a later phase.
- Pros: Simplest MVP, can evaluate what procedural gen would add after playing the handcrafted version
- Cons: Delays procedural content

---

### Combat Complexity for MVP

How much combat depth should exist at launch?

**Option A: Minimal MVP**
- Attack, Defend, Item, Flee. No row system, no Force, no Boost. Add complexity later.
- Pros: Ship faster, iterate on feel before adding depth
- Cons: Combat may feel flat, harder to retrofit complex mechanics

**Option B: Full System From Start**
- Implement front/back row, Force, Boost, skills, status effects from day one
- Pros: Design around full combat from the start, no retrofitting
- Cons: Slower to get to a playable state, more to balance at once

**Option C: Progressive Layers**
- Start with Attack + Defend + Skills. Add rows in next pass. Add Force/Boost after. Each layer tested before adding the next.
- Pros: Controlled complexity growth, each layer is testable
- Cons: Need to ensure architecture supports all planned layers upfront

---

### Skill Tree Visualization

How should the skill tree be displayed on mobile?

**Option A: Vertical Tree (Traditional)**
- Skills flow top-to-bottom like a tech tree. Scroll to see deeper tiers.
- Pros: Familiar, clear hierarchy, works well in portrait mode
- Cons: Can be tall for deep trees, connections may be hard to trace

**Option B: Radial / Wheel**
- Skills radiate outward from a center node. Tiers are concentric rings.
- Pros: Compact, visually distinctive, fits square mobile viewport
- Cons: Harder to implement, can be cluttered with many skills

**Option C: Grid Board (FFT-style)**
- Skills on a grid, unlock adjacent skills. Can branch in any direction.
- Pros: Spatial exploration feel, flexible pathing
- Cons: Less clear hierarchy, harder to communicate prerequisites

**Option D: Simple List with Unlock Indicators**
- Skills listed by tier. Prerequisites shown inline. No spatial layout.
- Pros: Simplest to implement, clear information, mobile-friendly
- Cons: Less engaging, no visual "tree" feel

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
