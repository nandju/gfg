import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { fetchRoomById, fetchRoomPlayers, updateGameState } from "@/services/game-room-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const patchSchema = z.object({
  room_id: z.string().uuid(),
  current_screen: z.string().optional(),
  current_round: z.number().int().min(1).optional(),
  status: z.enum(["lobby", "playing", "ended"]).optional(),
  is_locked: z.boolean().optional(),
  game_state: z.record(z.string(), z.unknown()).optional()
})

export async function GET(request: Request) {
  try {
    const client = getSupabaseServerClient()
    if (!client) return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 })
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get("room_id")
    if (!roomId) return NextResponse.json({ error: "room_id requis" }, { status: 400 })
    const room = await fetchRoomById(client, roomId)
    if (!room) return NextResponse.json({ error: "Room introuvable" }, { status: 404 })
    const players = await fetchRoomPlayers(client, roomId)
    return NextResponse.json({ room, players })
  } catch (error) {
    console.error("ROOMS STATE GET ERROR:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "unknown" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const client = getSupabaseServerClient()
    if (!client) return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 })
    const body = await request.json().catch(() => ({}))
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    const { room_id, ...patch } = parsed.data
    const room = await updateGameState(client, room_id, patch)
    return NextResponse.json({ room })
  } catch (error) {
    console.error("ROOMS STATE PATCH ERROR:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "unknown" }, { status: 500 })
  }
}
