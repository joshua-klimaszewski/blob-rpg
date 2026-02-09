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
];
