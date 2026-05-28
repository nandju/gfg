import { NextResponse } from "next/server"
import { generateGoalKeyword } from "@/lib/goal-ai"
import { getFallbackGoalKeyword } from "@/lib/fallback-goal-keyword"
import { goalKeywordRequestSchema } from "@/lib/schemas/goal-keyword-schema"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = goalKeywordRequestSchema.safeParse(body)

    if (!parsed.success) {
      console.error("GOAL KEYWORD API ZOD ERROR:", parsed.error.flatten())
      return NextResponse.json({ source: "fallback", challenge: getFallbackGoalKeyword("medium") })
    }

    const keyword = await generateGoalKeyword(parsed.data)
    return NextResponse.json(keyword)
  } catch (error) {
    console.error("GOAL KEYWORD ERROR:", error)
    return NextResponse.json({ source: "fallback", challenge: getFallbackGoalKeyword("medium") })
  }
}
