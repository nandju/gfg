import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { createRoom } from "@/services/game-room-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const bodySchema = z.object({
  game_type: z.enum(["goal", "three-days", "cage-wild"]),
  host_id: z.string().min(1),
  host_name: z.string().min(1).max(40),
  max_players: z.number().int().min(2).max(64).optional(),
  initial_state: z.record(z.string(), z.unknown()).optional()
})

export async function POST(request: Request) {
  try {
    const client = getSupabaseServerClient()
    if (!client) return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 })

    const body = await request.json().catch(() => ({}))
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const result = await createRoom(client, parsed.data)
    return NextResponse.json(result)
  } catch (error) {
    console.error("ROOMS CREATE ERROR:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "unknown" }, { status: 500 })
  }
}
