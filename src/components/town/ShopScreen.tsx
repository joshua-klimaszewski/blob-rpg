import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import { ShopBuyTab } from './ShopBuyTab';
import { ShopSellTab } from './ShopSellTab';

type ShopTab = 'buy' | 'sell';

export function ShopScreen() {
  const [tab, setTab] = useState<ShopTab>('buy');
  const gold = useInventoryStore((s) => s.gold);
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold border-b-2 border-ink pb-2">Shop</h1>

      <div className="text-sm font-bold">Gold: {gold}G</div>

      {/* Tab bar */}
      <div className="flex w-full max-w-xs">
        <button
          onClick={() => setTab('buy')}
          className={`flex-1 min-h-touch border-2 font-bold text-sm
            ${tab === 'buy' ? 'bg-ink text-paper border-ink' : 'border-ink active:bg-ink active:text-paper'}
          `}
        >
          Buy
        </button>
        <button
          onClick={() => setTab('sell')}
          className={`flex-1 min-h-touch border-2 border-l-0 font-bold text-sm
            ${tab === 'sell' ? 'bg-ink text-paper border-ink' : 'border-ink active:bg-ink active:text-paper'}
          `}
        >
          Sell
        </button>
      </div>

      {/* Tab content */}
      <div className="w-full max-w-xs">
        {tab === 'buy' ? <ShopBuyTab /> : <ShopSellTab />}
      </div>

      <button
        onClick={() => setScreen('town')}
        className="min-h-touch border-2 border-ink px-4 py-3 font-bold w-full max-w-xs active:bg-ink active:text-paper"
      >
        Back
      </button>
    </div>
  );
}
