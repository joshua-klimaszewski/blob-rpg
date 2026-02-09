import { useEffect } from 'react'
import { useDungeonStore } from '../../stores/dungeonStore'
import { useGameStore } from '../../stores/gameStore'
import { usePartyStore } from '../../stores/partyStore'
import { useInventoryStore } from '../../stores/inventoryStore'
import { useQuestStore } from '../../stores/questStore'

export function TownScreen() {
  const enterDungeon = useDungeonStore((s) => s.enterDungeon)
  const setScreen = useGameStore((s) => s.setScreen)
  const roster = usePartyStore((s) => s.roster)
  const activePartyIds = usePartyStore((s) => s.activePartyIds)
  const initializeRoster = usePartyStore((s) => s.initializeRoster)
  const gold = useInventoryStore((s) => s.gold)
  const activeQuests = useQuestStore((s) => s.activeQuests)

  // Auto-initialize roster on first visit
  useEffect(() => {
    if (roster.length === 0) {
      initializeRoster()
    }
  }, [roster.length, initializeRoster])

  const activeParty = activePartyIds
    .map((id) => roster.find((m) => m.id === id))
    .filter((m) => m !== undefined)

  const pendingQuests = activeQuests.filter((q) => !q.claimed).length
  const claimableQuests = activeQuests.filter((q) => q.completed && !q.claimed).length

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold border-b-2 border-ink pb-2">Town</h1>

      {/* Status bar */}
      <div className="w-full max-w-xs flex justify-between text-sm">
        <span className="font-bold">{gold}G</span>
        {pendingQuests > 0 && (
          <span className="text-xs">
            Quests: {pendingQuests}{claimableQuests > 0 && ` (${claimableQuests} ready)`}
          </span>
        )}
      </div>

      {/* Party HP summary */}
      {activeParty.length > 0 && (
        <div className="w-full max-w-xs">
          <div className="flex flex-col gap-1">
            {activeParty.map((member) => (
              <div key={member.id} className="flex items-center justify-between text-xs">
                <span className="font-bold truncate mr-2">{member.name}</span>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums">
                    {member.hp}/{member.maxHp}
                  </span>
                  <div className="w-12 h-1.5 border border-ink bg-paper">
                    <div
                      className="h-full bg-ink"
                      style={{ width: `${(member.hp / member.maxHp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => enterDungeon('verdant-depths-f1')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Enter Dungeon
        </button>

        <button
          onClick={() => setScreen('inn')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Inn
        </button>

        <button
          onClick={() => setScreen('shop')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Shop
        </button>

        <button
          onClick={() => setScreen('guild')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Guild{claimableQuests > 0 ? ` (${claimableQuests})` : ''}
        </button>

        <button
          onClick={() => setScreen('inventory')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Inventory
        </button>

        <button
          onClick={() => setScreen('character')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Characters
        </button>

        <button
          onClick={() => setScreen('party-formation')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Party
        </button>

        <button
          onClick={() => setScreen('how-to-play')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          How to Play
        </button>
      </div>
    </div>
  )
}
