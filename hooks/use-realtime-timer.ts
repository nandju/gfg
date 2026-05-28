"use client"

import { useEffect, useState } from "react"

export function useRealtimeTimer(deadlineMs: number | null): { remainingMs: number; remainingSeconds: number; expired: boolean } {
  const [now, setNow] = useState<number>(() => Date.now())

  useEffect(() => {
    if (!deadlineMs) return
    const tick = () => setNow(Date.now())
    tick()
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [deadlineMs])

  if (!deadlineMs) return { remainingMs: 0, remainingSeconds: 0, expired: true }
  const remainingMs = Math.max(0, deadlineMs - now)
  return { remainingMs, remainingSeconds: Math.ceil(remainingMs / 1000), expired: remainingMs <= 0 }
}
