"use client"

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"
import type { GameEventRow, GameRoomRow, RoomPlayerRow } from "@/types/multiplayer"

type RoomSubscriptionHandlers = {
  onRoom?: (room: GameRoomRow) => void
  onPlayers?: (player: RoomPlayerRow, eventType: "INSERT" | "UPDATE" | "DELETE") => void
  onEvent?: (event: GameEventRow) => void
}

export function subscribeToRoomChannel(client: SupabaseClient, roomId: string, handlers: RoomSubscriptionHandlers): RealtimeChannel {
  const channel = client.channel(`room:${roomId}`, { config: { broadcast: { self: false } } })

  channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "game_rooms", filter: `id=eq.${roomId}` }, (payload) => {
    if (handlers.onRoom && payload.new) handlers.onRoom(payload.new as GameRoomRow)
  })

  channel.on("postgres_changes", { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${roomId}` }, (payload) => {
    if (!handlers.onPlayers) return
    const row = (payload.new ?? payload.old) as RoomPlayerRow | undefined
    if (!row) return
    handlers.onPlayers(row, payload.eventType as "INSERT" | "UPDATE" | "DELETE")
  })

  channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "game_events", filter: `room_id=eq.${roomId}` }, (payload) => {
    if (handlers.onEvent && payload.new) handlers.onEvent(payload.new as GameEventRow)
  })

  channel.subscribe()
  return channel
}

export async function unsubscribeChannel(channel: RealtimeChannel | null) {
  if (!channel) return
  try {
    await channel.unsubscribe()
  } catch {
    // ignore
  }
}
