import type { SupabaseClient } from "@supabase/supabase-js"
import type {
  CreateRoomInput,
  GameEventInput,
  GameEventRow,
  GameRoomRow,
  GameStatePatch,
  JoinRoomInput,
  RoomPlayerRow
} from "@/types/multiplayer"

const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ"

function generateRoomCode(prefix = "GL"): string {
  const letter = ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)]
  const number = Math.floor(100 + Math.random() * 900)
  return `${prefix}-${letter}${number}`
}

export async function createRoom(client: SupabaseClient, input: CreateRoomInput): Promise<{ room: GameRoomRow; player: RoomPlayerRow }> {
  let lastError: unknown = null
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateRoomCode(input.game_type === "goal" ? "GL" : input.game_type === "three-days" ? "TD" : "CW")
    const { data: room, error } = await client
      .from("game_rooms")
      .insert({
        code,
        game_type: input.game_type,
        host_id: input.host_id,
        status: "lobby",
        max_players: input.max_players ?? 12,
        game_state: input.initial_state ?? {}
      })
      .select("*")
      .single()
    if (error) {
      lastError = error
      continue
    }
    const player = await upsertPlayer(client, {
      room_id: (room as GameRoomRow).id,
      player_id: input.host_id,
      player_name: input.host_name,
      role: "host"
    })
    return { room: room as GameRoomRow, player }
  }
  throw lastError instanceof Error ? lastError : new Error("Échec de création de la room")
}

export async function joinRoom(client: SupabaseClient, input: JoinRoomInput): Promise<{ room: GameRoomRow; player: RoomPlayerRow }> {
  const { data: room, error } = await client
    .from("game_rooms")
    .select("*")
    .eq("code", input.code.trim().toUpperCase())
    .maybeSingle()
  if (error) throw error
  if (!room) throw new Error("Room introuvable")
  if ((room as GameRoomRow).is_locked) throw new Error("Room verrouillée")

  const player = await upsertPlayer(client, {
    room_id: (room as GameRoomRow).id,
    player_id: input.player_id,
    player_name: input.player_name,
    team: input.team,
    role: "guest"
  })
  return { room: room as GameRoomRow, player }
}

export async function leaveRoom(client: SupabaseClient, roomId: string, playerId: string): Promise<void> {
  await client
    .from("room_players")
    .update({ connected: false })
    .eq("room_id", roomId)
    .eq("player_id", playerId)
}

export async function upsertPlayer(client: SupabaseClient, input: { room_id: string; player_id: string; player_name: string; team?: string; role?: string }): Promise<RoomPlayerRow> {
  const { data, error } = await client
    .from("room_players")
    .upsert(
      {
        room_id: input.room_id,
        player_id: input.player_id,
        player_name: input.player_name,
        team: input.team ?? null,
        role: input.role ?? "guest",
        connected: true
      },
      { onConflict: "room_id,player_id" }
    )
    .select("*")
    .single()
  if (error) throw error
  return data as RoomPlayerRow
}

export async function fetchRoomById(client: SupabaseClient, roomId: string): Promise<GameRoomRow | null> {
  const { data, error } = await client.from("game_rooms").select("*").eq("id", roomId).maybeSingle()
  if (error) throw error
  return (data as GameRoomRow) ?? null
}

export async function fetchRoomPlayers(client: SupabaseClient, roomId: string): Promise<RoomPlayerRow[]> {
  const { data, error } = await client.from("room_players").select("*").eq("room_id", roomId).order("created_at", { ascending: true })
  if (error) throw error
  return (data as RoomPlayerRow[]) ?? []
}

export async function fetchRoomEvents(client: SupabaseClient, roomId: string, limit = 50): Promise<GameEventRow[]> {
  const { data, error } = await client.from("game_events").select("*").eq("room_id", roomId).order("created_at", { ascending: false }).limit(limit)
  if (error) throw error
  return (data as GameEventRow[]) ?? []
}

export async function updateGameState(client: SupabaseClient, roomId: string, patch: GameStatePatch): Promise<GameRoomRow> {
  const updates: Record<string, unknown> = {}
  if (patch.current_screen !== undefined) updates.current_screen = patch.current_screen
  if (patch.current_round !== undefined) updates.current_round = patch.current_round
  if (patch.status !== undefined) updates.status = patch.status
  if (patch.is_locked !== undefined) updates.is_locked = patch.is_locked
  if (patch.game_state !== undefined) updates.game_state = patch.game_state

  const { data, error } = await client.from("game_rooms").update(updates).eq("id", roomId).select("*").single()
  if (error) throw error
  return data as GameRoomRow
}

export async function sendEvent(client: SupabaseClient, input: GameEventInput): Promise<GameEventRow> {
  const { data, error } = await client
    .from("game_events")
    .insert({ room_id: input.room_id, type: input.type, payload: input.payload ?? {} })
    .select("*")
    .single()
  if (error) throw error
  return data as GameEventRow
}
