"use client"

import { useCallback, useMemo, useState } from "react"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import {
  createRoom as createRoomService,
  joinRoom as joinRoomService,
  leaveRoom as leaveRoomService,
  sendEvent as sendEventService,
  updateGameState as updateGameStateService
} from "@/services/game-room-service"
import { useRealtimeRoom } from "@/hooks/use-realtime-room"
import { usePlayerIdentity } from "@/hooks/use-player-id"
import type { GameRoomRow, GameStatePatch, RoomPlayerRow } from "@/types/multiplayer"

type GoalRoomStatus = "idle" | "creating" | "joining" | "connected" | "error"

export type UseGoalRoomReturn = {
  enabled: boolean
  status: GoalRoomStatus
  error: string | null
  room: GameRoomRow | null
  players: RoomPlayerRow[]
  playerId: string
  playerName: string
  setPlayerName: (name: string) => void
  isHost: boolean
  createRoom: (initialState?: Record<string, unknown>) => Promise<GameRoomRow | null>
  joinRoom: (code: string) => Promise<GameRoomRow | null>
  leaveRoom: () => Promise<void>
  pushState: (patch: GameStatePatch) => Promise<void>
  pushEvent: (type: string, payload?: Record<string, unknown>) => Promise<void>
}

export function useGoalRoom(): UseGoalRoomReturn {
  const enabled = isSupabaseConfigured()
  const { playerId, playerName, setPlayerName } = usePlayerIdentity()
  const [roomId, setRoomId] = useState<string | null>(null)
  const [status, setStatus] = useState<GoalRoomStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const realtime = useRealtimeRoom(roomId)

  const isHost = useMemo(() => Boolean(realtime.room && playerId && realtime.room.host_id === playerId), [realtime.room, playerId])

  const createRoom = useCallback(async (initialState: Record<string, unknown> = {}) => {
    const client = getSupabaseBrowserClient()
    if (!client || !playerId) return null
    setStatus("creating")
    setError(null)
    try {
      const { room } = await createRoomService(client, {
        game_type: "goal",
        host_id: playerId,
        host_name: playerName || "Hôte",
        initial_state: initialState
      })
      setRoomId(room.id)
      setStatus("connected")
      return room
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de création")
      setStatus("error")
      return null
    }
  }, [playerId, playerName])

  const joinRoom = useCallback(async (code: string) => {
    const client = getSupabaseBrowserClient()
    if (!client || !playerId) return null
    setStatus("joining")
    setError(null)
    try {
      const { room } = await joinRoomService(client, {
        code,
        player_id: playerId,
        player_name: playerName || "Joueur"
      })
      setRoomId(room.id)
      setStatus("connected")
      return room
    } catch (err) {
      setError(err instanceof Error ? err.message : "Room introuvable")
      setStatus("error")
      return null
    }
  }, [playerId, playerName])

  const leaveRoom = useCallback(async () => {
    const client = getSupabaseBrowserClient()
    if (!client || !roomId || !playerId) return
    try {
      await leaveRoomService(client, roomId, playerId)
    } finally {
      setRoomId(null)
      setStatus("idle")
    }
  }, [roomId, playerId])

  const pushState = useCallback(async (patch: GameStatePatch) => {
    const client = getSupabaseBrowserClient()
    if (!client || !roomId) return
    try {
      await updateGameStateService(client, roomId, patch)
    } catch (err) {
      console.error("GOAL ROOM PUSH STATE ERROR:", err)
    }
  }, [roomId])

  const pushEvent = useCallback(async (type: string, payload?: Record<string, unknown>) => {
    const client = getSupabaseBrowserClient()
    if (!client || !roomId) return
    try {
      await sendEventService(client, { room_id: roomId, type, payload })
    } catch (err) {
      console.error("GOAL ROOM PUSH EVENT ERROR:", err)
    }
  }, [roomId])

  return {
    enabled,
    status,
    error: error ?? realtime.error,
    room: realtime.room,
    players: realtime.players,
    playerId,
    playerName,
    setPlayerName,
    isHost,
    createRoom,
    joinRoom,
    leaveRoom,
    pushState,
    pushEvent
  }
}
