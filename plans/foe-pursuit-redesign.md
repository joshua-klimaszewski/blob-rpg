# FOE Pursuit System Redesign

## Goals

1. Remove audio triggers (not needed)
2. Add `canPursue` flag to FOEs (some pursue, some patrol forever)
3. FOEs continue moving while player is in combat
4. Design Floor 1 corridor puzzle using pursuit mechanics

## Design Changes

### 1. Remove Audio
- Delete `playAggroSound()` function from DungeonScreen.tsx
- Remove audio trigger effect on FOE aggro events
- Keep visual notification (red border on FOE sprite)

### 2. Add `canPursue` Flag

**Type Changes:**
```typescript
// FoeSpawnData (in dungeon types)
interface FoeSpawnData {
  // ... existing fields
  readonly canPursue?: boolean  // Default: true (FOE will chase when player detected)
}

// FoeState (runtime)
interface FoeState {
  // ... existing fields
  readonly canPursue: boolean  // If false, FOE stays on patrol even when player nearby
}
```

**Behavior:**
- `canPursue: true` (default): FOE enters aggro state when player detected, switches to chase
- `canPursue: false`: FOE ignores player, follows patrol path forever (puzzle FOEs)

### 3. FOE Movement Logic

**Current:**
- FOEs move one step per player move

**New:**
- FOEs move one step per player move on field
- **FOEs continue moving one step per player combat turn** (while player is in battle)
- This creates risk: if player takes too long in combat, pursuing FOE might catch up
- Opens puzzle opportunities: lead FOE away, start combat, FOE leaves area

**Implementation:**
- When player enters combat, store dungeon state
- After each combat turn (player or enemy), call FOE movement logic
- Update dungeon FOE positions (visible on return to field)

### 4. Floor 1 Corridor Puzzle

**Layout:**
```
ENTRANCE
   |
   v
[Corridor 1] -- FOE patrol blocks exit ---> EXIT (to Floor 2)
   |
   |
[Corridor 2 - Loop]
   |
   +---[back to Corridor 1]
```

**Puzzle Flow:**
1. Player reaches intersection, sees FOE patrolling in front of exit
2. FOE has `canPursue: true` and patrol path blocking exit
3. When player gets close, FOE detects and pursues
4. Player leads FOE into Corridor 2 (the loop)
5. Player loops back to Corridor 1 while FOE is still in loop
6. Player reaches exit to Floor 2
7. Later, player can return and defeat FOE for loot

**FOE Configuration:**
```typescript
{
  id: 'foe-floor1-guardian',
  name: 'Verdant Guardian',
  position: { x: 15, y: 8 },  // Near exit
  pattern: 'patrol',
  patrolPath: [
    { x: 15, y: 8 },
    { x: 16, y: 8 },
    { x: 17, y: 8 },  // Blocks exit
    { x: 16, y: 8 },
  ],
  canPursue: true,
  detectionRadius: 4,  // Fairly wide detection
}
```

## Implementation Steps

### Phase 1: Remove Audio (Quick)
- [ ] Delete audio function from DungeonScreen.tsx
- [ ] Remove audio trigger useEffect
- [ ] Test: FOE aggro still shows visual notification

### Phase 2: Add canPursue Flag
- [ ] Update FoeSpawnData type with `canPursue?: boolean`
- [ ] Update FoeState type with `canPursue: boolean`
- [ ] Update FOE initialization to copy canPursue (default true)
- [ ] Update FOE movement logic: skip aggro transition if `!canPursue`
- [ ] Test: FOE with canPursue=false stays on patrol

### Phase 3: FOE Movement During Combat
- [ ] Add FOE movement call in combat store after each turn
- [ ] Update dungeon state with new FOE positions during combat
- [ ] Ensure FOE collision detected if player returns to field on same tile
- [ ] Test: FOE moves while player in combat

### Phase 4: Floor 1 Puzzle
- [ ] Design floor 1 layout with corridor loop
- [ ] Add Guardian FOE with pursuit enabled
- [ ] Position patrol path to block exit
- [ ] Add help text explaining FOE pursuit
- [ ] Test: Player can lure FOE away and reach exit

## Testing Checklist

- [ ] Build succeeds
- [ ] All tests pass
- [ ] FOE with canPursue=true chases player
- [ ] FOE with canPursue=false ignores player
- [ ] FOE moves during player combat
- [ ] Floor 1 puzzle solvable by luring FOE
- [ ] No audio triggers (removed)
- [ ] Visual FOE aggro notification still works

## Files to Modify

1. **src/types/dungeon.ts** - Add canPursue to FoeSpawnData and FoeState
2. **src/systems/dungeon.ts** - Update FOE movement logic
3. **src/components/dungeon/DungeonScreen.tsx** - Remove audio
4. **src/stores/dungeonStore.ts** - Initialize canPursue
5. **src/stores/combatStore.ts** - Call FOE movement after turns
6. **src/data/dungeons/floor-1.ts** - Add puzzle layout and Guardian FOE
7. **src/data/help/foe-system.ts** - Document pursuit mechanics

## Notes

- Combat-time FOE movement adds strategic depth (don't take forever in combat!)
- Puzzle FOEs (canPursue=false) create navigation challenges
- Pursuit FOEs (canPursue=true) create dynamic threats
- This opens design space for complex puzzles on later floors
