import { NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { joinRoom } from "@/services/game-room-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const bodySchema = z.object({
  code: z.string().min(2).max(20),
  player_id: z.string().min(1),
  player_name: z.string().min(1).max(40),
  team: z.string().max(40).optional()
})

export async function POST(request: Request) {
  try {
    const client = getSupabaseServerClient()
    if (!client) return NextResponse.json({ error: "Supabase non configuré" }, { status: 503 })

    const body = await request.json().catch(() => ({}))
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const result = await joinRoom(client, parsed.data)
    return NextResponse.json(result)
  } catch (error) {
    console.error("ROOMS JOIN ERROR:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "unknown" }, { status: 404 })
  }
}
