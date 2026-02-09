import { useState, useMemo } from 'react'
import { useGameStore } from '../../stores/gameStore'
import { useDungeonStore } from '../../stores/dungeonStore'
import { useDungeonProgressStore } from '../../stores/dungeonProgressStore'
import { getDungeonFloors, getFloor } from '../../data/dungeons'
import { getFloorWarpPoints, positionKey } from '../../systems/dungeon'
import { FloorMinimap } from './FloorMinimap'

export function DungeonSelectScreen() {
  const setScreen = useGameStore((s) => s.setScreen)
  const enterDungeon = useDungeonStore((s) => s.enterDungeon)
  const dungeonProgress = useDungeonProgressStore((s) => s.dungeonProgress)

  // For now, only one dungeon: verdant-depths
  const floors = useMemo(() => getDungeonFloors('verdant-depths'), [])

  // Floor 1 is always available
  const [selectedFloorId, setSelectedFloorId] = useState(floors[0]?.id ?? '')
  const [selectedWarpKey, setSelectedWarpKey] = useState<string | null>(null)

  const selectedFloor = useMemo(() => getFloor(selectedFloorId), [selectedFloorId])
  const floorProgress = dungeonProgress.floors[selectedFloorId]

  // Get warp points for selected floor, filtered to discovered ones
  const availableWarps = useMemo(() => {
    if (!selectedFloor) return []
    const allWarps = getFloorWarpPoints(selectedFloor)
    const discoveredSet = new Set(floorProgress?.discoveredWarpPoints ?? [])
    // Entrance is always available for unlocked floors
    const entranceKey = positionKey(selectedFloor.playerStart)
    return allWarps.filter((wp) => {
      const key = positionKey(wp.position)
      return key === entranceKey || discoveredSet.has(key)
    })
  }, [selectedFloor, floorProgress])

  // Default selected warp to entrance
  const effectiveWarpKey = selectedWarpKey
    ?? (selectedFloor ? positionKey(selectedFloor.playerStart) : null)

  const isFloorUnlocked = (floorId: string) => {
    // Floor 1 is always unlocked
    const f = getFloor(floorId)
    if (f && f.floorNumber === 1) return true
    return dungeonProgress.floors[floorId]?.unlocked ?? false
  }

  const handleEnter = () => {
    if (!selectedFloor || !effectiveWarpKey) return
    const [x, y] = effectiveWarpKey.split(',').map(Number)
    enterDungeon(selectedFloorId, { x, y })
  }

  const handleFloorSelect = (floorId: string) => {
    setSelectedFloorId(floorId)
    setSelectedWarpKey(null) // Reset warp selection when floor changes
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 min-h-dvh">
      <h1 className="text-2xl font-bold border-b-2 border-ink pb-2">Dungeon</h1>

      {/* Floor list */}
      <div className="w-full max-w-xs">
        <div className="text-xs font-bold mb-1">Floors</div>
        <div className="flex gap-2">
          {floors.map((floor) => {
            const unlocked = isFloorUnlocked(floor.id)
            const isSelected = floor.id === selectedFloorId
            return (
              <button
                key={floor.id}
                onClick={() => unlocked && handleFloorSelect(floor.id)}
                disabled={!unlocked}
                className={`min-h-touch flex-1 border-2 font-bold text-sm ${
                  isSelected
                    ? 'border-ink bg-ink text-paper'
                    : unlocked
                      ? 'border-ink bg-paper text-ink active:bg-ink active:text-paper'
                      : 'border-gray-300 bg-gray-100 text-gray-400'
                }`}
              >
                F{floor.floorNumber}
              </button>
            )
          })}
        </div>
      </div>

      {/* Floor detail */}
      {selectedFloor && (
        <div className="w-full max-w-xs flex flex-col gap-3">
          {/* Minimap */}
          <FloorMinimap
            floor={selectedFloor}
            progress={floorProgress}
            selectedWarpPoint={effectiveWarpKey ?? undefined}
          />

          {/* Warp points */}
          <div>
            <div className="text-xs font-bold mb-1">Spawn Point</div>
            <div className="flex flex-col gap-1">
              {availableWarps.map((wp) => {
                const key = positionKey(wp.position)
                const isSelected = key === effectiveWarpKey
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedWarpKey(key)}
                    className={`min-h-touch border-2 px-3 py-2 text-left text-sm font-bold ${
                      isSelected
                        ? 'border-ink bg-ink text-paper'
                        : 'border-ink bg-paper text-ink active:bg-ink active:text-paper'
                    }`}
                  >
                    {wp.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="w-full max-w-xs flex flex-col gap-3 mt-auto">
        <button
          onClick={handleEnter}
          disabled={!selectedFloor || !isFloorUnlocked(selectedFloorId)}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper disabled:border-gray-300 disabled:text-gray-400 disabled:bg-gray-100"
        >
          Enter
        </button>
        <button
          onClick={() => setScreen('town')}
          className="min-h-touch border-2 border-ink px-4 py-3 font-bold active:bg-ink active:text-paper"
        >
          Back
        </button>
      </div>
    </div>
  )
}
