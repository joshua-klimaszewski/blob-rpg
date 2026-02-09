import { useGameStore } from '../../stores/gameStore'
import { HowToPlayContent } from './HowToPlayContent'

export function HowToPlayScreen() {
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className="flex flex-col min-h-dvh bg-paper">
      <div className="px-4 py-3 border-b-2 border-ink flex justify-between items-center">
        <h1 className="text-lg font-bold">How to Play</h1>
        <button
          type="button"
          className="min-h-touch px-3 border-2 border-ink font-bold text-sm active:bg-ink active:text-paper"
          onClick={() => setScreen('town')}
        >
          Back
        </button>
      </div>
      <HowToPlayContent />
    </div>
  )
}
