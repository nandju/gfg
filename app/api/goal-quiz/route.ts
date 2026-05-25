import { NextResponse } from "next/server"
import { generateGoalQuiz } from "@/lib/goal-ai"
import { getFallbackGoalQuiz } from "@/lib/fallback-goal-quiz"
import { goalQuizRequestSchema } from "@/lib/schemas/goal-quiz-schema"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = goalQuizRequestSchema.safeParse(body)

    if (!parsed.success) {
      const fallback = getFallbackGoalQuiz("International Competitions", "medium", 5)
      return NextResponse.json({ source: "fallback", ...fallback })
    }

    const quiz = await generateGoalQuiz(parsed.data)
    return NextResponse.json(quiz)
  } catch {
    const fallback = getFallbackGoalQuiz("International Competitions", "medium", 5)
    return NextResponse.json({ source: "fallback", ...fallback })
  }
}

export async function GET() {
  const fallback = getFallbackGoalQuiz("International Competitions", "medium", 5)
  return NextResponse.json({ source: "fallback", ...fallback })
}
