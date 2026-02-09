/**
 * Material Definitions
 *
 * Materials dropped by enemies and sold at the shop
 * to unlock new equipment for purchase.
 */

import type { MaterialDefinition } from '../../types/economy';

export const MATERIALS: MaterialDefinition[] = [
  {
    id: 'slime-gel',
    name: 'Slime Gel',
    description: 'A wobbly glob of slime residue. Common but useful.',
    sellPrice: 10,
  },
  {
    id: 'slime-core',
    name: 'Slime Core',
    description: 'A hardened core found in larger slimes. Somewhat rare.',
    sellPrice: 25,
  },
  {
    id: 'fungal-cap',
    name: 'Fungal Cap',
    description: 'A mushroom cap harvested from a Fungoid. Smells earthy.',
    sellPrice: 15,
  },
  {
    id: 'bat-wing',
    name: 'Bat Wing',
    description: 'A leathery wing membrane from a Sporebat.',
    sellPrice: 12,
  },
  {
    id: 'crystal-shard',
    name: 'Crystal Shard',
    description: 'A fragment of crystallized shell from a Crystal Beetle.',
    sellPrice: 30,
  },
  {
    id: 'tough-carapace',
    name: 'Tough Carapace',
    description: 'A section of hardened exoskeleton from a Caveworm.',
    sellPrice: 20,
  },
];
