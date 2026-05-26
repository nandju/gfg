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
      console.log("GOAL QUIZ API ZOD ERROR:", parsed.error.flatten())
      const fallback = getFallbackGoalQuiz("International Competitions", "medium", 5)
      return NextResponse.json({ source: "fallback", ...fallback })
    }

    console.log("GOAL QUIZ API POST:", {
      category: parsed.data.category,
      difficulty: parsed.data.difficulty,
      count: parsed.data.count
    })

    const quiz = await generateGoalQuiz(parsed.data)
    return NextResponse.json(quiz)
  } catch (error) {
    console.log("GOAL QUIZ API ERROR:", error)
    const fallback = getFallbackGoalQuiz("International Competitions", "medium", 5)
    return NextResponse.json({ source: "fallback", ...fallback })
  }
}

