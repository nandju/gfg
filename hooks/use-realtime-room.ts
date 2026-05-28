"use client"

import { useEffect, useRef, useState } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { subscribeToRoomChannel, unsubscribeChannel } from "@/lib/supabase/realtime"
import { fetchRoomById, fetchRoomEvents, fetchRoomPlayers } from "@/services/game-room-service"
import type { GameEventRow, GameRoomRow, RoomPlayerRow } from "@/types/multiplayer"

type RealtimeRoomState = {
  room: GameRoomRow | null
  players: RoomPlayerRow[]
  lastEvent: GameEventRow | null
  ready: boolean
  error: string | null
}

export function useRealtimeRoom(roomId: string | null): RealtimeRoomState {
  const [state, setState] = useState<RealtimeRoomState>({ room: null, players: [], lastEvent: null, ready: false, error: null })
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!roomId) {
      setState({ room: null, players: [], lastEvent: null, ready: false, error: null })
      return
    }
    const client = getSupabaseBrowserClient()
    if (!client) {
      setState((prev) => ({ ...prev, error: "Supabase non configuré", ready: false }))
      return
    }

    let cancelled = false

    const bootstrap = async () => {
      try {
        const [room, players, events] = await Promise.all([
          fetchRoomById(client, roomId),
          fetchRoomPlayers(client, roomId),
          fetchRoomEvents(client, roomId, 1)
        ])
        if (cancelled) return
        setState({ room, players, lastEvent: events[0] ?? null, ready: true, error: null })
      } catch (error) {
        if (cancelled) return
        setState((prev) => ({ ...prev, error: error instanceof Error ? error.message : "Erreur inconnue", ready: true }))
      }
    }

    bootstrap()

    const channel = subscribeToRoomChannel(client, roomId, {
      onRoom: (room) => setState((prev) => ({ ...prev, room })),
      onPlayers: (player, eventType) =>
        setState((prev) => {
          if (eventType === "DELETE") return { ...prev, players: prev.players.filter((p) => p.id !== player.id) }
          const without = prev.players.filter((p) => p.id !== player.id)
          return { ...prev, players: [...without, player].sort((a, b) => a.created_at.localeCompare(b.created_at)) }
        }),
      onEvent: (event) => setState((prev) => ({ ...prev, lastEvent: event }))
    })
    channelRef.current = channel

    return () => {
      cancelled = true
      unsubscribeChannel(channelRef.current)
      channelRef.current = null
    }
  }, [roomId])

  return state
}
