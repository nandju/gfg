import { groq } from "@ai-sdk/groq"
import { generateObject } from "ai"
import { getFallbackGoalQuiz } from "@/lib/fallback-goal-quiz"
import { GoalQuizCategory, GoalQuizDifficulty, goalQuizPackSchema, sanitizeGoalQuizPack } from "@/lib/schemas/goal-quiz-schema"

type GenerateGoalQuizOptions = {
  category: GoalQuizCategory
  difficulty: GoalQuizDifficulty
  count?: number
}

export async function generateGoalQuiz({ category, difficulty, count = 5 }: GenerateGoalQuizOptions) {
  if (!process.env.GROQ_API_KEY) {
    return {
      source: "fallback" as const,
      ...getFallbackGoalQuiz(category, difficulty, count)
    }
  }

  try {
    const result = await generateObject({
      model: groq("llama-3.1-8b-instant"),
      schema: goalQuizPackSchema,
      temperature: 0.8,
      maxRetries: 1,
      prompt: `Generate ${count} realistic football quiz questions for a local multiplayer mobile game named GOAL!!!.

Category: ${category}
Difficulty: ${difficulty}

Rules:
- Return only structured data matching the schema.
- Avoid duplicate questions and duplicate correct answers when possible.
- Every question must have exactly four choices.
- The answer must exactly match one of the choices.
- Use varied football knowledge.
- For International Competitions, include themes like World Cup, Champions League, AFCON, Euro, Copa America, Ballon d'Or, and historical records.
- Keep questions fun, clear, and suitable for quick party gameplay.`
    })

    return {
      source: "ai" as const,
      ...sanitizeGoalQuizPack(result.object)
    }
  } catch {
    return {
      source: "fallback" as const,
      ...getFallbackGoalQuiz(category, difficulty, count)
    }
  }
}
