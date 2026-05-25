import { groq } from "@ai-sdk/groq"
import { generateObject } from "ai"
import { getFallbackGoalQuiz } from "@/lib/fallback-goal-quiz"
import { GoalQuizCategory, GoalQuizDifficulty, goalQuizPackSchema, sanitizeGoalQuizPack } from "@/lib/schemas/goal-quiz-schema"

type GenerateGoalQuizOptions = {
  category: GoalQuizCategory
  difficulty: GoalQuizDifficulty
  count?: number
}

const groqStructuredOutputModels = ["openai/gpt-oss-20b", "openai/gpt-oss-120b"] as const

export async function generateGoalQuiz({ category, difficulty, count = 5 }: GenerateGoalQuizOptions) {
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY?.trim())

  console.log("GOAL AI KEY DETECTED:", hasGroqKey)

  if (!hasGroqKey) {
    return {
      source: "fallback" as const,
      ...getFallbackGoalQuiz(category, difficulty, count)
    }
  }

  for (const modelName of groqStructuredOutputModels) {
    try {
      console.log("GOAL AI MODEL:", modelName)

      const result = await generateObject({
        model: groq(modelName),
        schema: goalQuizPackSchema,
        temperature: 0.8,
        maxRetries: 1,
        system: "You are a football quiz engine. Generate valid JSON only. Never include markdown, comments, or explanations.",
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

      const sanitized = sanitizeGoalQuizPack(result.object)

      if (sanitized.questions.length < count) {
        console.log("GOAL AI ZOD ERROR:", "Generated quiz had too few unique valid questions.")
        continue
      }

      return {
        source: "ai" as const,
        ...sanitized
      }
    } catch (error) {
      console.log("GOAL AI ERROR:", error)
    }
  }

  return {
    source: "fallback" as const,
    ...getFallbackGoalQuiz(category, difficulty, count)
  }
}
