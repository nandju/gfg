import { NextResponse } from "next/server"
import { generateGoalQuiz } from "@/lib/goal-ai"
import { getFallbackGoalQuiz } from "@/lib/fallback-goal-quiz"
import { goalQuizRequestSchema } from "@/lib/schemas/goal-quiz-schema"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const parsed = goalQuizRequestSchema.safeParse(body)

    if (!parsed.success) {
      console.error("GOAL QUIZ API ZOD ERROR:", parsed.error.flatten())
      const fallback = getFallbackGoalQuiz("International Competitions", "medium", 5)
      return NextResponse.json({ source: "fallback", ...fallback })
    }

    const quiz = await generateGoalQuiz(parsed.data)
    return NextResponse.json(quiz)
  } catch (error) {
    console.error("GOAL QUIZ ERROR:", error)
    const fallback = getFallbackGoalQuiz("International Competitions", "medium", 5)
    return NextResponse.json({ source: "fallback", ...fallback })
  }
}

