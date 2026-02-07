# CLAUDE.md — Blob RPG Project Constitution

This file provides guidance to Claude Code when working with code in this repository. It is a **living document** — update it every work cycle as decisions are made and the project evolves.

---

## Project Overview

**Blob RPG** is a mobile-first, browser-based RPG featuring blob characters. Inspired by the Etrian Odyssey series and Pokémon Mystery Dungeon, the game centers on a tight loop of dungeon exploration, tactical combat, and town management.

**Core Game Loop:**
1. **Town** — Rest, revive, buy/sell equipment, upgrade skill trees, accept quests
2. **Dungeon** — Navigate a grid map, manage encounter gauge, avoid or engage FOEs (visible field enemies), gather resources
3. **Combat** — Turn-based, front/back row positioning, Force/Boost mechanics, party synergy
4. **Return** — Warp to town from checkpoints, sell loot, prepare for the next run

**Aesthetic:** Black-and-white wireframe style. Minimal, clean, zero clutter. Designed for rapid development and strong mobile UX.

**Target Platform:** Mobile browsers first, desktop browsers second. Deployed via GitHub Pages.

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | React 18+ | Component-based UI, hooks for game state binding |
| Language | TypeScript (strict mode) | Type safety for complex game data |
| Build Tool | Vite | Fast HMR, simple config, good TS support |
| State Management | Zustand | Lightweight, no Provider wrapping, fits rapid iteration |
| Complex State Machines | `useReducer` | Self-contained state machines for combat, menus |
| Styling | Tailwind CSS | Utility-first, constrained B&W palette |
| Graphics | SVG + CSS | SVG for blob characters/shapes, CSS Grid for dungeon tiles |
| Persistence | localStorage | Simple MVP saves (<5MB). Migration path to IndexedDB if needed |
| Testing | Vitest | Fast, Vite-native, good TS integration |
| Hosting | GitHub Pages | Auto-deploy on push to main |
| CI/CD | GitHub Actions | Build + deploy pipeline |

---

## Development Workflow

### Interview-First Protocol

Before implementing any non-trivial feature:
1. **Research** — Understand the problem space, read existing code
2. **Interview** — Ask the user clarifying questions, present options with trade-offs
3. **Document** — Save options and decisions to plan files (even rejected options — they are context)
4. **Implement** — Short, focused implementation cycles
5. **Update Plans** — Mark completed tasks, add discovered work, update CLAUDE.md if needed

### Work Cycles

- Keep cycles short: implement a coherent unit of work, then commit and push
- Every commit should leave the project in a deployable state
- Update `plans/plan.md` after every cycle — mark completed items, add new discoveries
- If a cycle reveals new decisions needed, document them as pending interviews

---

## Git Workflow

**Branch strategy:** Feature branch + PR flow. `main` is the deploy branch — every merge to main triggers a GitHub Pages deploy.

### Branches

- Create feature branches from `main` named `<type>/<short-description>`
  - Examples: `feat/dungeon-grid`, `fix/encounter-gauge-reset`, `chore/add-linting`
- Commit freely on feature branches (no need for every commit to be deployable)
- When work is ready, open a PR to `main` using `gh pr create`
- Squash merge PRs into `main` (one clean commit per feature)
- Delete the feature branch after merge

### Commit Message Format

PR squash commits (and any direct commits to main) use: `<type>: <description>`

| Prefix | Use |
|--------|-----|
| `feat:` | New feature or gameplay system |
| `fix:` | Bug fix |
| `docs:` | Documentation only (CLAUDE.md, plan files) |
| `plan:` | Plan file updates (decisions, sprint logs) |
| `refactor:` | Code restructuring, no behavior change |
| `style:` | Formatting, Tailwind changes, visual tweaks |
| `test:` | Adding or updating tests |
| `chore:` | Build config, dependencies, tooling |

Examples:
- `feat: add encounter gauge component with step tracking`
- `fix: prevent swipe input during combat transitions`
- `docs: update CLAUDE.md with combat system reference`
- `plan: mark phase 1 scaffold tasks complete`

---

## Plan File Conventions

### File Structure

```
plans/
├── plan.md              # Master roadmap — phases, tasks, ADRs, sprint log
├── initial-thoughts.md  # Original project brief (archived, do not edit)
├── decisions/           # Architecture Decision Records (ADRs)
│   └── 001-state-management.md  (example)
└── sprints/             # Per-sprint detailed logs
    └── sprint-01.md     (example)
```

### Rules

1. **Never delete items** from plan files — they are a historical record
2. Mark completed items with `[x]` and the completion date: `- [x] Task name (2026-02-07)`
3. Mark dropped items with strikethrough and reason: `- ~~Task name~~ — dropped: replaced by X`
4. Options presented to the user but not yet decided stay in the plan as "Pending Interview"
5. When a decision is made, move it to the Architecture Decisions section with rationale

---

## File Structure

```
blob-rpg/
├── CLAUDE.md                 # This file — project constitution
├── plans/                    # All planning documents
├── public/                   # Static assets
├── src/
│   ├── components/           # React components (display layer)
│   │   ├── dungeon/          # Dungeon grid, tiles, FOE sprites
│   │   ├── combat/           # Combat UI, action menus, health bars
│   │   ├── town/             # Town screens (inn, shop, guild)
│   │   ├── character/        # Skill trees, equipment, stats
│   │   └── ui/               # Shared UI primitives (buttons, modals, gauges)
│   ├── systems/              # Pure TypeScript game logic (NO React imports)
│   │   ├── combat.ts         # Combat resolution, damage calc, turn order
│   │   ├── dungeon.ts        # Map generation, FOE movement, encounter gauge
│   │   ├── character.ts      # Stats, leveling, skill unlocks
│   │   ├── inventory.ts      # Items, equipment, loot tables
│   │   └── save.ts           # Serialization, localStorage read/write
│   ├── stores/               # Zustand stores (bridge between systems and React)
│   ├── data/                 # Static game data (JSON/TS constants)
│   │   ├── classes/          # Class definitions, skill trees
│   │   ├── enemies/          # Enemy stats, AI patterns
│   │   ├── items/            # Item definitions, shop inventories
│   │   └── dungeons/         # Floor layouts, encounter tables
│   ├── types/                # Shared TypeScript type definitions
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Generic utility functions
│   ├── App.tsx               # Root component, routing
│   └── main.tsx              # Entry point
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vite.config.ts
└── vitest.config.ts
```

---

## Architecture Principles

1. **Separate game logic from React** — All game rules live in `src/systems/` as pure TypeScript functions. They take state in, return new state out. No React imports, no side effects. Components are thin display layers that read from stores and dispatch actions.

2. **Data-driven design** — Game content (classes, enemies, items, dungeons) lives in `src/data/` as typed constants. Adding a new enemy or item means adding data, not writing new logic.

3. **Serializable state** — All game state must be JSON-serializable for localStorage saves. No class instances, functions, or circular references in state.

4. **Mobile-first** — 44px minimum touch targets. Swipe gestures for dungeon movement. Bottom-anchored action menus for thumb reach. No hover-dependent interactions.

5. **Progressive complexity** — Start simple, layer on. MVP combat can be basic; skill trees and subclasses come later. The architecture supports this because systems are independent modules.

---

## Coding Standards

### TypeScript

- Strict mode enabled (`"strict": true` in tsconfig)
- No `any` — use `unknown` with type guards when the type is truly unknown
- Named exports only (no default exports)
- Prefer interfaces for object shapes, types for unions/intersections
- All game data IDs use kebab-case strings: `"fire-blob"`, `"iron-sword"`, `"floor-1-a"`

### React

- Functional components only
- PascalCase component names: `DungeonGrid`, `CombatMenu`
- camelCase for hooks: `useDungeonStore`, `useCombatActions`
- camelCase for system functions: `calculateDamage`, `resolveEncounter`
- Co-locate component-specific styles/types with the component when small

### Styling

- Tailwind utility classes as the primary styling method
- No custom CSS unless truly necessary (complex animations, SVG paths)
- B&W palette enforced in `tailwind.config.ts` (constrained color tokens)
- Use `gap`, `p-`, `m-` utilities for spacing — no magic numbers

### Testing

- Game systems (`src/systems/`) should have thorough unit tests
- Test game logic independently from React components
- Use descriptive test names: `"encounter gauge reaches red at 80% fill"`

---

## Game Systems Reference

Quick reference for Claude to implement correctly. See `plans/plan.md` for detailed research notes.

### Encounter Gauge

- A visible bar that fills from green → yellow → red as the player takes steps
- Each step adds a random amount (base range affected by floor difficulty)
- When full (100%), a random encounter triggers and the gauge resets
- Party skills can reduce fill rate or partially drain the gauge
- Displayed prominently on the dungeon exploration HUD

### FOE System (Field On Enemy)

- Powerful visible enemies on the dungeon map (distinct from random encounters)
- FOEs move one step each time the player moves (turn-based on the field)
- Each FOE has a movement pattern (patrol, chase, stationary, conditional)
- Colliding with a FOE initiates a difficult combat — meant to be avoided early, challenged later
- FOEs respawn on floor re-entry (or after N turns)

### Combat System

- **Turn-based** with turn order determined by speed stats
- **Row system:** Front row (melee, higher damage taken) and back row (ranged, lower damage taken)
- **Force gauge:** Fills during combat from actions taken and damage received. When full, enables a powerful one-time Force Break ability unique to each class
- **Boost:** Spend Boost points (accumulate each turn) to enhance the next action — more hits, stronger heal, longer buff duration
- **Escape:** Can flee from random encounters (chance-based). Cannot flee from FOE battles easily.

### Class & Subclass System

- Each character has a main class defining their core skill tree
- At a certain level, characters can take a subclass granting access to a secondary (partial) skill tree
- Skill trees are point-based: level up → get skill points → invest in skills
- Skills have prerequisites (must invest N points in a parent skill to unlock the next tier)

### Town Systems

- **Inn:** Rest to restore HP/TP. Cost scales with party level. Option for partial rest (cheaper, partial restore).
- **Shop:** Buy equipment and consumables. New stock unlocks when you sell specific monster loot (material system).
- **Guild:** Accept quests (kill X enemies, gather Y materials, reach floor Z). Quests give bonus rewards.
- **Save:** Manual save in town. Autosave at dungeon checkpoints. One save slot for MVP.

---

## Deployment

- **URL:** `https://joshua-klimaszewski.github.io/blob-rpg/`
- **Vite base path:** Set `base: '/blob-rpg/'` in `vite.config.ts`
- **Deploy method:** GitHub Actions — build on push to `main`, deploy `dist/` to GitHub Pages
- **Every merge to main triggers a deploy** — PRs are squash merged, keeping main clean and deployable

---

## Key Decisions Log

### Decided

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| State management | Zustand + useReducer | Lightweight, no Provider wrapping, useReducer for combat state machine | 2026-02-07 |
| Rendering approach | CSS/SVG (no Canvas) | B&W wireframe doesn't need sprites. CSS Grid = dungeon. SVG = blobs. Zero deps. | 2026-02-07 |
| Game logic separation | Pure TS in `src/systems/` | Testable without React, deterministic, components stay thin | 2026-02-07 |
| Save system | localStorage (MVP) | Simple, sufficient for <5MB RPG saves. IndexedDB migration path documented. | 2026-02-07 |
| Styling | Tailwind CSS | Utility-first for rapid iteration, easy B&W palette constraints | 2026-02-07 |
| Build tool | Vite | Fast HMR, native TS, simple GitHub Pages deploy | 2026-02-07 |
| Git workflow | Feature branch + PR | Clean main history, CI checks on PRs, squash merge | 2026-02-07 |

### To Decide (Pending User Interview)

- Class roster design (how many classes, themed how?)
- Dungeon generation approach (handcrafted vs procedural vs hybrid)
- Combat complexity in MVP (start minimal or full system?)
- Skill tree visualization style
- Number of party members
- Blob character visual style and personality

See `plans/plan.md` → "Decisions Pending User Interview" for full options.
