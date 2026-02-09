/**
 * Shop Recipes
 *
 * Maps sold materials to equipment that becomes available for purchase.
 * When the player sells enough of the required materials, the item unlocks.
 */

import type { ShopRecipe } from '../../types/economy';

export const SHOP_RECIPES: ShopRecipe[] = [
  {
    unlocksItemId: 'iron-mace',
    requirements: [{ materialId: 'slime-gel', quantity: 3 }],
  },
  {
    unlocksItemId: 'leather-vest',
    requirements: [{ materialId: 'slime-gel', quantity: 5 }],
  },
  {
    unlocksItemId: 'speed-charm',
    requirements: [{ materialId: 'slime-core', quantity: 2 }],
  },
  {
    unlocksItemId: 'cloth-robe',
    requirements: [{ materialId: 'slime-core', quantity: 3 }],
  },

  // Tier 2 — F2/F3 material unlocks
  {
    unlocksItemId: 'fungal-staff',
    requirements: [{ materialId: 'fungal-cap', quantity: 3 }],
  },
  {
    unlocksItemId: 'bone-club',
    requirements: [{ materialId: 'bat-wing', quantity: 4 }],
  },
  {
    unlocksItemId: 'crystal-blade',
    requirements: [{ materialId: 'crystal-shard', quantity: 2 }],
  },
  {
    unlocksItemId: 'shell-armor',
    requirements: [{ materialId: 'tough-carapace', quantity: 3 }],
  },
  {
    unlocksItemId: 'fungal-robe',
    requirements: [{ materialId: 'fungal-cap', quantity: 5 }],
  },
  {
    unlocksItemId: 'bat-earring',
    requirements: [{ materialId: 'bat-wing', quantity: 3 }],
  },
  {
    unlocksItemId: 'crystal-pendant',
    requirements: [{ materialId: 'crystal-shard', quantity: 2 }],
  },
  {
    unlocksItemId: 'carapace-ring',
    requirements: [{ materialId: 'tough-carapace', quantity: 2 }],
  },
];
