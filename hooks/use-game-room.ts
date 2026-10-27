"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import {
  createRoom as createRoomService,
  joinRoom as joinRoomService,
  leaveRoom as leaveRoomService,
  sendEvent as sendEventService,
  updateGameState as updateGameStateService,
  upsertPlayer as upsertPlayerService
} from "@/services/game-room-service"
import { useRealtimeRoom } from "@/hooks/use-realtime-room"
import { usePlayerIdentity } from "@/hooks/use-player-id"
import type { GameRoomRow, GameStatePatch, GameType, RoomPlayerRow } from "@/types/multiplayer"

export type GameRoomStatus = "idle" | "creating" | "joining" | "connected" | "error"

export type UseGameRoomReturn = {
  enabled: boolean
  status: GameRoomStatus
  error: string | null
  room: GameRoomRow | null
  players: RoomPlayerRow[]
  connectedPlayers: RoomPlayerRow[]
  playerId: string
  playerName: string
  setPlayerName: (name: string) => void
  isHost: boolean
  createRoom: (initialState?: Record<string, unknown>) => Promise<GameRoomRow | null>
  joinRoom: (code: string) => Promise<GameRoomRow | null>
  leaveRoom: () => Promise<void>
  pushState: (patch: GameStatePatch) => Promise<void>
  pushEvent: (type: string, payload?: Record<string, unknown>) => Promise<void>
  renameInRoom: (name: string) => Promise<void>
}

export function useGameRoom(gameType: GameType): UseGameRoomReturn {
  const enabled = isSupabaseConfigured()
  const { playerId, playerName, setPlayerName } = usePlayerIdentity()
  const [roomId, setRoomId] = useState<string | null>(null)
  const [status, setStatus] = useState<GameRoomStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const realtime = useRealtimeRoom(roomId)
  const roomIdRef = useRef<string | null>(null)
  roomIdRef.current = roomId

  const isHost = useMemo(() => Boolean(realtime.room && playerId && realtime.room.host_id === playerId), [realtime.room, playerId])
  const connectedPlayers = useMemo(() => realtime.players.filter((p) => p.connected), [realtime.players])

  const createRoom = useCallback(async (initialState: Record<string, unknown> = {}) => {
    const client = getSupabaseBrowserClient()
    if (!client || !playerId) return null
    setStatus("creating")
    setError(null)
    try {
      const { room } = await createRoomService(client, {
        game_type: gameType,
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
  }, [gameType, playerId, playerName])

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
      setError(err instanceof Error ? err.message : "Partie introuvable")
      setStatus("error")
      return null
    }
  }, [playerId, playerName])

  const leaveRoom = useCallback(async () => {
    const client = getSupabaseBrowserClient()
    if (!client || !roomId || !playerId) { setRoomId(null); setStatus("idle"); return }
    try {
      await leaveRoomService(client, roomId, playerId)
    } finally {
      setRoomId(null)
      setStatus("idle")
    }
  }, [roomId, playerId])

  // Best-effort disconnect marker when the tab closes or hides.
  useEffect(() => {
    if (!roomId) return
    const client = getSupabaseBrowserClient()
    if (!client) return
    const markDisconnected = () => {
      void leaveRoomService(client, roomId, playerId)
    }
    const onVisibility = () => {
      if (document.visibilityState === "hidden") markDisconnected()
      else void upsertPlayerService(client, { room_id: roomId, player_id: playerId, player_name: playerName || "Joueur" })
    }
    window.addEventListener("pagehide", markDisconnected)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("pagehide", markDisconnected)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [roomId, playerId, playerName])

  const pushState = useCallback(async (patch: GameStatePatch) => {
    const client = getSupabaseBrowserClient()
    if (!client || !roomId) return
    try {
      await updateGameStateService(client, roomId, patch)
    } catch (err) {
      console.error("ROOM PUSH STATE ERROR:", err)
    }
  }, [roomId])

  const pushEvent = useCallback(async (type: string, payload?: Record<string, unknown>) => {
    const client = getSupabaseBrowserClient()
    if (!client || !roomId) return
    try {
      await sendEventService(client, { room_id: roomId, type, payload })
    } catch (err) {
      console.error("ROOM PUSH EVENT ERROR:", err)
    }
  }, [roomId])

  const renameInRoom = useCallback(async (name: string) => {
    setPlayerName(name)
    const client = getSupabaseBrowserClient()
    if (!client || !roomIdRef.current || !playerId) return
    try {
      await upsertPlayerService(client, { room_id: roomIdRef.current, player_id: playerId, player_name: name.trim() || "Joueur" })
    } catch (err) {
      console.error("ROOM RENAME ERROR:", err)
    }
  }, [playerId, setPlayerName])

  return {
    enabled,
    status,
    error: error ?? realtime.error,
    room: realtime.room,
    players: realtime.players,
    connectedPlayers,
    playerId,
    playerName,
    setPlayerName,
    isHost,
    createRoom,
    joinRoom,
    leaveRoom,
    pushState,
    pushEvent,
    renameInRoom
  }
}
