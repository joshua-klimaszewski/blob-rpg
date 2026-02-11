/**
 * Combat Store
 *
 * Zustand store that bridges combat system to React components.
 * Manages combat state, action execution, and event streaming.
 */

import { create } from 'zustand';
import type {
  CombatState,
  EncounterData,
  CombatEventUnion,
  Action,
  CombatRewards,
} from '../types/combat';
import {
  initializeCombat,
  executeAction,
  executeEnemyTurn,
  advanceToNextAlive,
  calculateRewards,
  defaultRNG,
  addFoeReinforcement,
} from '../systems/combat';
import { useGameStore } from './gameStore';
import { usePartyStore } from './partyStore';
import { useInventoryStore } from './inventoryStore';
import { useQuestStore } from './questStore';
import { getEnemy } from '../data/enemies/index';
import { getSkill } from '../data/classes/index';
import { getEnemySkill } from '../data/enemies/skills';
import type { SkillDefinition } from '../types/character';
import { getPassiveModifiers } from '../systems/character';
import { moveFoesAndCheckReinforcements } from '../systems/dungeon';
import { useDungeonStore } from './dungeonStore';

/** Combined skill lookup: checks player skills first, then enemy skills */
function lookupSkill(id: string): SkillDefinition | undefined {
  try {
    return getSkill(id);
  } catch {
    // Not a player skill — check enemy skills
  }
  const enemySkill = getEnemySkill(id);

  // Warn in development if skill not found
  if (!enemySkill && import.meta.env.DEV) {
    console.warn(`[Combat] Skill not found: "${id}" — falling back to basic attack`);
  }

  return enemySkill; // Returns undefined if not found (no throw)
}

interface CombatStore {
  /** Current combat state (null = not in combat) */
  combat: CombatState | null;

  /** Encounter data that started this combat */
  encounter: EncounterData | null;

  /** Events from last action (for UI animations/notifications) */
  lastEvents: CombatEventUnion[];

  /** Rewards from victory (calculated at end) */
  rewards: CombatRewards | null;

  /** Start a new combat encounter */
  startCombat: (encounter: EncounterData) => void;

  /** Execute a combat action and atomically advance to the next actor */
  selectAction: (action: Action) => void;

  /** Process an enemy's turn and advance to the next actor atomically */
  processEnemyTurnAndAdvance: () => void;

  /** End combat and return to previous screen */
  endCombat: () => void;

  /** Clear last events (after UI has processed them) */
  clearEvents: () => void;
}

/**
 * Process FOE movement and reinforcements during combat.
 * Called after each combat turn to move FOEs on the dungeon map.
 * If any FOE moves onto the player's position, they join the combat!
 */
function processFoeReinforcements(combat: CombatState): {
  combat: CombatState;
  reinforcementEvents: CombatEventUnion[];
} {
  const dungeonStore = useDungeonStore;
  const { dungeon, floor } = dungeonStore.getState();

  // Skip if no dungeon (shouldn't happen, but defensive)
  if (!dungeon || !floor) {
    return { combat, reinforcementEvents: [] };
  }

  // Move FOEs one step and check for reinforcements
  const { state: newDungeonState, reinforcements} = moveFoesAndCheckReinforcements(
    dungeon,
    floor
  );

  // Update dungeon state with new FOE positions using Zustand's set
  dungeonStore.setState({ dungeon: newDungeonState });

  // Add each reinforcement to combat and create events
  let updatedCombat = combat;
  const events: CombatEventUnion[] = [];

  for (const event of reinforcements) {
    if (event.type === 'foe-reinforcement') {
      const enemyDef = getEnemy(event.enemyId);
      if (enemyDef) {
        // Generate unique instance ID for this reinforcement
        const instanceId = `${event.foeId}-reinforce-${Date.now()}`;
        updatedCombat = addFoeReinforcement(updatedCombat, enemyDef, instanceId);

        // Create reinforcement event
        events.push({
          type: 'reinforcement',
          timestamp: Date.now(),
          enemyName: event.foeName,
          message: `${event.foeName} has joined the battle!`,
        });
      }
    }
  }

  return { combat: updatedCombat, reinforcementEvents: events };
}

function handlePhaseTransition(get: () => CombatStore, state: CombatState) {
  if (state.phase === 'victory') {
    const rewards = calculateRewards(state, defaultRNG, getEnemy);

    // Snapshot pre-XP levels for level-up detection
    const partyStore = usePartyStore.getState();
    const preLevels = new Map<string, { level: number; name: string }>();
    for (const member of partyStore.getActiveParty()) {
      preLevels.set(member.id, { level: member.level, name: member.name });
    }

    // Award XP and sync HP/TP to party store
    partyStore.awardXp(rewards.xp);
    usePartyStore.getState().syncHpTpFromCombat(state.party);

    // Detect level-ups by comparing pre/post levels
    const postParty = usePartyStore.getState().getActiveParty();
    const levelUps: CombatRewards['levelUps'] = [];
    for (const member of postParty) {
      const pre = preLevels.get(member.id);
      if (pre && member.level > pre.level) {
        levelUps.push({
          memberId: member.id,
          name: pre.name,
          oldLevel: pre.level,
          newLevel: member.level,
        });
      }
    }
    rewards.levelUps = levelUps;

    useCombatStore.setState({ rewards });

    // Award gold and materials to inventory
    const inventory = useInventoryStore.getState();
    inventory.addGold(rewards.gold);
    for (const mat of rewards.materials) {
      inventory.addMaterial(mat.id, mat.quantity);
    }

    // Track kill quest progress (count defeated enemies by type)
    const questStore = useQuestStore.getState();
    const killCounts: Record<string, number> = {};
    for (const enemy of state.enemies) {
      if (enemy.hp <= 0) {
        killCounts[enemy.definitionId] = (killCounts[enemy.definitionId] ?? 0) + 1;
      }
    }
    for (const [enemyId, count] of Object.entries(killCounts)) {
      questStore.incrementKillProgress(enemyId, count);
    }

    setTimeout(() => {
      get().endCombat();
    }, 2000);
  }

  if (state.phase === 'defeat') {
    setTimeout(() => {
      get().endCombat();
      useGameStore.getState().setScreen('town');
    }, 2000);
  }
}

export const useCombatStore = create<CombatStore>((set, get) => ({
  combat: null,
  encounter: null,
  lastEvents: [],
  rewards: null,

  startCombat: (encounter) => {
    const combat = initializeCombat(encounter);

    // Inject passive modifiers from learned skills into party combat entities
    const partyWithPassives = combat.party.map((entity) => {
      const member = encounter.party.find((m) => m.id === entity.id);
      if (!member) return entity;
      const modifiers = getPassiveModifiers(member.learnedSkills, lookupSkill);
      return { ...entity, passiveModifiers: modifiers };
    });

    set({
      combat: { ...combat, party: partyWithPassives },
      encounter,
      lastEvents: [],
      rewards: null,
    });

    // Transition game screen to combat
    useGameStore.getState().setScreen('combat');
  },

  selectAction: (action) => {
    const { combat } = get();
    if (!combat || combat.phase !== 'active') return;

    const result = executeAction(combat, action, defaultRNG, lookupSkill);

    // If phase changed (victory/defeat/fled), don't advance turn
    if (result.state.phase !== 'active') {
      set({ combat: result.state, lastEvents: result.events });
      handlePhaseTransition(get, result.state);
      return;
    }

    // Atomically execute action AND advance to next alive actor in one set()
    const advanced = advanceToNextAlive(result.state);

    // Process FOE reinforcements (FOEs move during combat!)
    const { combat: withReinforcements, reinforcementEvents } = processFoeReinforcements(advanced);

    // Combine action events with reinforcement events
    const allEvents = [...result.events, ...reinforcementEvents];

    set({ combat: withReinforcements, lastEvents: allEvents });
  },

  processEnemyTurnAndAdvance: () => {
    const { combat } = get();
    if (!combat || combat.phase !== 'active') return;

    const currentEntry = combat.turnOrder[combat.currentActorIndex];
    if (!currentEntry) return;

    const result = executeEnemyTurn(combat, currentEntry.entityId, defaultRNG, lookupSkill, getEnemy);

    // If phase changed (victory/defeat), don't advance turn
    if (result.state.phase !== 'active') {
      set({
        combat: result.state,
        lastEvents: result.events,
      });
      handlePhaseTransition(get, result.state);
      return;
    }

    // Atomically apply enemy action AND advance to next alive actor in one set() call
    const advanced = advanceToNextAlive(result.state);

    // Process FOE reinforcements (FOEs move during combat!)
    const { combat: withReinforcements, reinforcementEvents } = processFoeReinforcements(advanced);

    // Combine enemy turn events with reinforcement events
    const allEvents = [...result.events, ...reinforcementEvents];

    set({
      combat: withReinforcements,
      lastEvents: allEvents,
    });
  },

  endCombat: () => {
    const { combat } = get();

    set({
      combat: null,
      encounter: null,
      lastEvents: [],
      rewards: null,
    });

    // Return to dungeon (unless defeat sent us to town)
    if (combat?.phase !== 'defeat') {
      useGameStore.getState().setScreen('dungeon');
    }
  },

  clearEvents: () => {
    set({ lastEvents: [] });
  },
}));
