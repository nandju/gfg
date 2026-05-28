import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { fetchRoomEvents, sendEvent } from "@/services/game-room-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const eventSchema = z.object({
  room_id: z.string().uuid(),
  type: z.string().min(1).max(60),
  payload: z.record(z.string(), z.unknown()).optional()
})

export async function GET(request: Request) {
  try {
    const client = getSupabaseServerClient()
    if (!client) return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 })
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get("room_id")
    if (!roomId) return NextResponse.json({ error: "room_id requis" }, { status: 400 })
    const events = await fetchRoomEvents(client, roomId)
    return NextResponse.json({ events })
  } catch (error) {
    console.error("ROOMS EVENTS GET ERROR:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "unknown" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = getSupabaseServerClient()
    if (!client) return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 })
    const body = await request.json().catch(() => ({}))
    const parsed = eventSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    const event = await sendEvent(client, parsed.data)
    return NextResponse.json({ event })
  } catch (error) {
    console.error("ROOMS EVENTS POST ERROR:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "unknown" }, { status: 500 })
  }
}
