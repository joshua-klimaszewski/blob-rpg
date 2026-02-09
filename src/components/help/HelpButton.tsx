import { useGameStore } from '../../stores/gameStore'

export function HelpButton() {
  const toggleHelp = useGameStore((s) => s.toggleHelp)
  return (
    <button
      type="button"
      onClick={toggleHelp}
      className="border border-ink w-8 h-8 flex items-center justify-center text-sm font-bold active:bg-ink active:text-paper"
    >
      ?
    </button>
  )
}
