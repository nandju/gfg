import { NextResponse } from "next/server"
import { generateGoalMime } from "@/lib/goal-ai"
import { getFallbackGoalMime } from "@/lib/fallback-goal-mime"
import { goalMimeRequestSchema } from "@/lib/schemas/goal-mime-schema"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = goalMimeRequestSchema.safeParse(body)

    if (!parsed.success) {
      console.error("GOAL MIME API ZOD ERROR:", parsed.error.flatten())
      return NextResponse.json({ source: "fallback", challenge: getFallbackGoalMime("medium") })
    }

    const mime = await generateGoalMime(parsed.data)
    return NextResponse.json(mime)
  } catch (error) {
    console.error("GOAL MIME ERROR:", error)
    return NextResponse.json({ source: "fallback", challenge: getFallbackGoalMime("medium") })
  }
}
