export type GameType = "goal" | "three-days" | "cage-wild"

export type RoomStatus = "lobby" | "playing" | "ended"

export type GameRoomRow = {
  id: string
  code: string
  game_type: GameType
  status: RoomStatus
  host_id: string
  created_at: string
  updated_at: string
  current_round: number
  current_screen: string | null
  game_state: Record<string, unknown>
  max_players: number
  is_locked: boolean
}

export type RoomPlayerRow = {
  id: string
  room_id: string
  player_id: string
  player_name: string
  score: number
  eliminated: boolean
  team: string | null
  role: string | null
  connected: boolean
  created_at: string
  updated_at: string
}

export type GameEventRow = {
  id: string
  room_id: string
  type: string
  payload: Record<string, unknown>
  created_at: string
}

export type CreateRoomInput = {
  game_type: GameType
  host_id: string
  host_name: string
  max_players?: number
  initial_state?: Record<string, unknown>
}

export type JoinRoomInput = {
  code: string
  player_id: string
  player_name: string
  team?: string
}

export type GameEventInput = {
  room_id: string
  type: string
  payload?: Record<string, unknown>
}

export type GameStatePatch = {
  current_screen?: string
  current_round?: number
  status?: RoomStatus
  is_locked?: boolean
  game_state?: Record<string, unknown>
}
