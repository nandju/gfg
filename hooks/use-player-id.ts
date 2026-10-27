"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "gfg:player"

type StoredPlayer = { id: string; name: string }

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function generateName(): string {
  const animals = ["Lion", "Tigre", "Loup", "Aigle", "Faucon", "Panthère", "Dragon", "Renard", "Ours", "Cobra"]
  return `${animals[Math.floor(Math.random() * animals.length)]}-${Math.floor(100 + Math.random() * 900)}`
}

function readStored(): StoredPlayer | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredPlayer
    if (!parsed?.id) return null
    return parsed
  } catch {
    return null
  }
}

function writeStored(player: StoredPlayer) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(player))
}

export function usePlayerIdentity(): { playerId: string; playerName: string; setPlayerName: (name: string) => void } {
  const [player, setPlayer] = useState<StoredPlayer>({ id: "", name: "" })

  useEffect(() => {
    if (player.id && player.name) return
    const existing = readStored()
    const next = existing ?? { id: generateId(), name: generateName() }
    if (!existing) writeStored(next)
    setPlayer(next)
  }, [player.id, player.name])

  const setPlayerName = (name: string) => {
    setPlayer((current) => {
      const next = { ...current, name: name.trim() || current.name }
      writeStored(next)
      return next
    })
  }

  return { playerId: player.id, playerName: player.name, setPlayerName }
}
