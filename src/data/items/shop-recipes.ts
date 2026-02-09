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
];
