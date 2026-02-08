# Phase 3b: Combat UI Polish — Implementation Plan

## Context

Phase 3 core combat system is complete (PR #4) with all game logic implemented and tested (220 tests passing). The combat mechanics work (3x3 grid, displacement, binds, ailments, turn order), but the UI is a basic placeholder showing only HP bars. Phase 3b adds interactive UI to make combat actually playable.

**Current state:** Combat transitions from dungeon, displays enemy/party HP, shows victory/defeat messages. No player interaction yet.

**Goal:** Add interactive combat UI with grid targeting, action menus, turn order display, and visual feedback for all combat events.

---

## Implementation Strategy: 4 Incremental Commits

### Commit 1: 3x3 Grid Renderer with Tap-to-Target

**Goal:** Display the 3x3 enemy grid and allow player to tap tiles to select targets.

**Create:**
- `src/components/combat/CombatGrid.tsx` — 3x3 grid renderer
- `src/components/combat/GridTile.tsx` — Individual tile component

**Features:**
- 3x3 CSS Grid layout (mobile-friendly, touch targets ≥44px)
- Display enemies at each tile position (show count if stacked: "Slime x2")
- Show hazards on tiles (spike/web/fire icons or border colors)
- Tap tile to select as target (highlight selected tile)
- Visual feedback: empty tiles grayed out, occupied tiles show entity names
- Responsive: works on mobile (primary) and desktop

**State management:**
- Add `selectedTile: GridPosition | null` to local component state
- Pass `onTileSelect` callback to parent for action execution

**Testing:**
- Manual: tap tiles, verify selection highlights
- Unit tests for tile rendering logic

**Visual design (B&W wireframe):**
- Grid cells: 2px solid border
- Empty tile: light gray background
- Occupied tile: white background, black text
- Selected tile: inverted colors (black background, white text)
- Hazard indicator: corner icon or colored border accent

---

### Commit 2: Action Menu UI

**Goal:** Interactive action buttons (Attack/Defend/Flee) with proper state management.

**Create:**
- `src/components/combat/ActionMenu.tsx` — Bottom-anchored action buttons

**Features:**
- 3 buttons: Attack, Defend, Flee (centered, mobile-friendly)
- Attack: enabled when tile selected, disabled otherwise
- Defend: always enabled when it's player's turn
- Flee: enabled based on `canFlee` state, shows success/fail feedback
- Disable all buttons during enemy turns
- Show which action is selected (Attack shows "Select a target")

**Flow:**
1. Player's turn starts → show action menu
2. Player taps "Attack" → show "Select target" prompt
3. Player taps grid tile → execute attack on that tile
4. Enemy's turn → hide or disable action menu

**State:**
- Track `selectedAction: 'attack' | 'defend' | 'flee' | null`
- Clear selection after action executes

**Integration:**
- Wire up to `combatStore.selectAction()`
- Handle action execution with proper Action type construction

**Testing:**
- Button enable/disable states
- Action execution integration

---

### Commit 3: Turn Order Timeline & Combat HUD

**Goal:** Show whose turn it is and provide combat context (turn counter, combo, phase).

**Create:**
- `src/components/combat/TurnOrderTimeline.tsx` — Visual turn order
- `src/components/combat/CombatHUD.tsx` — Top bar with combat info

**Turn Order Timeline:**
- Horizontal list of entity portraits/names in speed order
- Highlight current actor
- Show "hasActed" indicator (grayed out or checkmark)
- Scroll or wrap on mobile if needed
- Position: Below combat grid, above action menu

**Combat HUD:**
- Current turn number / round counter
- Combo counter (show when > 0, highlight in color when high)
- Phase indicator (active/victory/defeat)
- Can flee status indicator

**Visual:**
- Minimal, fits mobile screen
- B&W with accent for current turn

**Testing:**
- Turn order updates after actions
- Current actor highlight moves correctly

---

### Commit 4: Event Feedback & Animations

**Goal:** Visual feedback for damage, displacement, status effects, victory/defeat.

**Create:**
- `src/components/combat/DamageNumber.tsx` — Floating damage number
- `src/components/combat/StatusIcon.tsx` — Bind/ailment indicators
- `src/hooks/useCombatEvents.ts` — Event processor for animations

**Event Feedback:**
- **Damage:** Floating number appears above damaged entity, fades up and out (1s animation)
- **Crit:** Show "CRIT!" text with damage, different color/size
- **Displacement:** Brief highlight of from→to tiles
- **Bind applied:** Icon appears on entity (head/arm/leg symbol)
- **Ailment applied:** Icon appears (poison/paralyze/sleep/blind symbol)
- **Victory/Defeat:** Full-screen overlay with message, auto-dismiss after 2s

**Status Icons:**
- Display on entity tiles or in party list
- Small icons (16x16 or 20x20) with tooltips
- Clear visual distinction between binds and ailments

**Event Processing:**
- Read `combatStore.lastEvents` after each action
- Trigger animations based on event type
- Clear events after processing (call `clearEvents()`)

**Animations:**
- CSS transitions (no complex libraries)
- Simple, fast, mobile-friendly
- Damage numbers: `transform: translateY(-20px)` + `opacity: 0`

**Testing:**
- Manual: trigger damage, binds, ailments, verify animations
- Event processing logic unit tests

---

## Technical Approach

### Component Hierarchy

```
<CombatScreen>
  <CombatHUD /> — turn/combo/phase info
  <TurnOrderTimeline /> — whose turn is it
  <CombatGrid>
    <GridTile> × 9 — 3x3 grid
      <StatusIcon> — binds/ailments on tile
      <DamageNumber> — floating damage
  </CombatGrid>
  <PartyDisplay> — party HP/TP bars
  <ActionMenu /> — Attack/Defend/Flee buttons
  <VictoryOverlay> — shown on phase=victory
  <DefeatOverlay> — shown on phase=defeat
</CombatScreen>
```

### State Flow

1. **Combat starts** → `combatStore.startCombat(encounter)`
2. **Player's turn** → Action menu enabled
3. **Player selects Attack** → `selectedAction = 'attack'`
4. **Player taps grid tile** → `combatStore.selectAction({ actorId, type: 'attack', targetTile })`
5. **Combat system executes** → Returns new state + events
6. **UI processes events** → Trigger damage numbers, status icons, animations
7. **Next turn** → Timeline updates, action menu re-enabled

### Mobile-First Considerations

- Touch targets ≥44px (grid tiles, action buttons)
- Bottom-anchored action menu (thumb-friendly)
- No hover states (use active/pressed states)
- Simplified animations (60fps on mobile)
- Swipe gestures NOT needed (tap-only for combat)

### Styling (Tailwind + B&W)

- Grid: `border-2 border-ink`, `bg-paper` for occupied tiles
- Buttons: `min-h-touch border-2 border-ink`, `active:bg-ink active:text-paper`
- Selected state: `bg-ink text-paper`
- Disabled state: `border-gray-300 text-gray-400`
- Status icons: SVG or Unicode symbols (⚡, 💀, 🔥, etc.) — keep it wireframe

---

## Key Files

| File | Role |
|------|------|
| `src/components/combat/CombatScreen.tsx` | Update to use new components |
| `src/components/combat/CombatGrid.tsx` | 3x3 grid renderer (Commit 1) |
| `src/components/combat/GridTile.tsx` | Individual tile component (Commit 1) |
| `src/components/combat/ActionMenu.tsx` | Attack/Defend/Flee buttons (Commit 2) |
| `src/components/combat/TurnOrderTimeline.tsx` | Turn order display (Commit 3) |
| `src/components/combat/CombatHUD.tsx` | Top bar info (Commit 3) |
| `src/components/combat/DamageNumber.tsx` | Floating damage animation (Commit 4) |
| `src/components/combat/StatusIcon.tsx` | Bind/ailment icons (Commit 4) |
| `src/hooks/useCombatEvents.ts` | Event processing hook (Commit 4) |

---

## Testing Plan

**Manual Testing Flow:**
1. Town → Enter Dungeon
2. Walk until encounter gauge fills or FOE collision
3. **Combat Screen appears** with 3x3 grid showing enemies
4. **Turn Order Timeline** shows party members and enemies in speed order
5. **Current actor highlighted** (should be fastest character)
6. **Tap Attack button** → prompt "Select a target"
7. **Tap enemy tile** → damage number appears, enemy HP decreases
8. **Combo counter increments** in HUD
9. **Enemy turn** → enemy attacks, party member takes damage
10. **Binds/ailments** → icons appear on affected entities
11. **Defeat all enemies** → Victory overlay, return to dungeon after 2s
12. **Party wipe** → Defeat overlay, return to town after 2s

**Edge Cases to Test:**
- Stacked enemies (2-3 on one tile) → shows "Slime x2", hits all
- Displaced enemies → visual feedback of movement
- Hazard tiles → shows trap icon, triggers on displacement
- Flee action → success (50% chance) or fail message
- Defend action → visual feedback (shield icon on timeline?)
- Multiple status effects → multiple icons displayed

**Unit Tests:**
- GridTile rendering (empty, occupied, selected states)
- ActionMenu button states (enabled/disabled logic)
- Event processing logic (damage numbers, status icons)

---

## MVP Simplifications (Phase 3b)

To ship faster, these are intentionally simple:

1. **Animations:** Basic CSS transitions only (no complex libraries)
2. **Damage numbers:** Simple fade-up, no particle effects
3. **Status icons:** Unicode symbols or simple SVGs (no custom art)
4. **Enemy AI visualization:** No indicator of what enemy will do (just execute their action)
5. **Displacement animation:** Highlight only, no smooth movement (add in polish pass later)
6. **Skill descriptions:** Not shown in UI yet (just "Attack" button, no tooltips)

---

## Success Criteria

After Phase 3b, the combat system should be:
- ✅ **Playable end-to-end** — Town → Dungeon → Combat → Victory/Defeat
- ✅ **Interactive** — Player can select actions and targets
- ✅ **Clear feedback** — Damage, status effects, turn order all visible
- ✅ **Mobile-friendly** — Touch targets, bottom-anchored menu, responsive
- ✅ **Testable** — Manual flow works, no crashes

This completes the combat MVP and makes it ready for actual gameplay testing before moving to Phase 4 (classes/skills).

---

## Estimated Scope

- **4 commits** (incremental, buildable)
- **~8-10 new components** (combat UI layer)
- **~500-700 lines of code** (components + hooks)
- **~50-100 lines of tests** (component rendering tests)
- **Manual testing:** ~30 minutes for full flow

**Branch:** Continue on `feat/combat-system` (add to PR #4)
**Merge:** Single PR with all of Phase 3 (core + UI)

---

## Next Steps After Phase 3b

Once Phase 3b is complete and merged:
1. **Phase 4:** 6 blob classes with skill trees
2. **Phase 5:** Town economy (shop, inn, materials)
3. **Phase 6:** Content & balance (enemy roster, equipment, tutorial)

Phase 3b is the last piece needed to make combat fully functional for MVP.
