/**
 * Quest Definitions
 *
 * MVP quest set for the Guild board.
 */

import type { QuestDefinition } from '../../types/economy';

export const QUESTS: QuestDefinition[] = [
  {
    id: 'quest-slay-slimes',
    name: 'Slime Cleanup',
    description: 'Defeat 5 slimes in the Verdant Depths.',
    objective: { type: 'kill', enemyId: 'slime', count: 5 },
    reward: { gold: 50, xp: 100 },
  },
  {
    id: 'quest-gather-gel',
    name: 'Gel Collection',
    description: 'Sell 3 Slime Gel to the shop.',
    objective: { type: 'gather', materialId: 'slime-gel', count: 3 },
    reward: { gold: 40, xp: 80 },
  },
  {
    id: 'quest-explore-f1',
    name: 'Charting the Depths',
    description: 'Reach the Verdant Depths, Floor 1.',
    objective: { type: 'explore', floorId: 'verdant-depths-f1' },
    reward: { gold: 30, xp: 50 },
  },
  {
    id: 'quest-slay-slimes-2',
    name: 'Slime Scourge',
    description: 'Defeat 15 slimes total.',
    objective: { type: 'kill', enemyId: 'slime', count: 15 },
    reward: { gold: 120, xp: 250 },
  },
  {
    id: 'quest-gather-core',
    name: 'Core Samples',
    description: 'Sell 2 Slime Cores to the shop.',
    objective: { type: 'gather', materialId: 'slime-core', count: 2 },
    reward: { gold: 80, xp: 150 },
  },

  // Floor 2 quests
  {
    id: 'quest-slay-fungoids',
    name: 'Fungal Purge',
    description: 'Defeat 5 Fungoids in the Fungal Passage.',
    objective: { type: 'kill', enemyId: 'fungoid', count: 5 },
    reward: { gold: 80, xp: 150 },
  },
  {
    id: 'quest-gather-caps',
    name: 'Cap Harvest',
    description: 'Sell 4 Fungal Caps to the shop.',
    objective: { type: 'gather', materialId: 'fungal-cap', count: 4 },
    reward: { gold: 60, xp: 120 },
  },
  {
    id: 'quest-explore-f2',
    name: 'Into the Passage',
    description: 'Reach the Fungal Passage, Floor 2.',
    objective: { type: 'explore', floorId: 'verdant-depths-f2' },
    reward: { gold: 50, xp: 100 },
  },

  // Floor 3 quests
  {
    id: 'quest-slay-beetles',
    name: 'Shell Crackers',
    description: 'Defeat 3 Crystal Beetles in the Crystal Depths.',
    objective: { type: 'kill', enemyId: 'crystal-beetle', count: 3 },
    reward: { gold: 120, xp: 250 },
  },
  {
    id: 'quest-explore-f3',
    name: 'Deep Descent',
    description: 'Reach the Crystal Depths, Floor 3.',
    objective: { type: 'explore', floorId: 'verdant-depths-f3' },
    reward: { gold: 100, xp: 200 },
  },
];

const QUEST_REGISTRY: Record<string, QuestDefinition> = {};
for (const quest of QUESTS) {
  QUEST_REGISTRY[quest.id] = quest;
}

/** Get quest definition by ID */
export function getQuest(id: string): QuestDefinition | undefined {
  return QUEST_REGISTRY[id];
}
