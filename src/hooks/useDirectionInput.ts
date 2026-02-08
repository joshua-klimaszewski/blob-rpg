import { useEffect, useRef, useCallback } from 'react'
import type { Direction } from '../types/dungeon'

const MIN_SWIPE_DISTANCE = 30 // px
const MAX_SWIPE_TIME = 300 // ms

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'north',
  ArrowDown: 'south',
  ArrowLeft: 'west',
  ArrowRight: 'east',
  w: 'north',
  W: 'north',
  s: 'south',
  S: 'south',
  a: 'west',
  A: 'west',
  d: 'east',
  D: 'east',
}

export function useDirectionInput(onDirection: (dir: Direction) => void) {
  const callbackRef = useRef(onDirection)
  callbackRef.current = onDirection

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const dir = KEY_MAP[e.key]
    if (dir) {
      e.preventDefault()
      callbackRef.current(dir)
    }
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const start = touchStartRef.current
    if (!start) return

    const touch = e.changedTouches[0]
    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    const elapsed = Date.now() - start.time

    touchStartRef.current = null

    if (elapsed > MAX_SWIPE_TIME) return

    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    if (absDx < MIN_SWIPE_DISTANCE && absDy < MIN_SWIPE_DISTANCE) return

    let dir: Direction
    if (absDx > absDy) {
      dir = dx > 0 ? 'east' : 'west'
    } else {
      dir = dy > 0 ? 'south' : 'north'
    }

    callbackRef.current(dir)
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [handleKeyDown, handleTouchStart, handleTouchEnd, handleTouchMove])
}
