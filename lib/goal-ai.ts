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
        system: "Tu es un moteur de quiz football en français. Génère uniquement du JSON valide. N'inclus jamais de markdown, de commentaires ou d'explications.",
        prompt: `Génère ${count} questions de quiz football réalistes en français pour un jeu mobile multijoueur local nommé GOAL!!!.

Category: ${category}
Difficulty: ${difficulty}

Règles:
- Retourne uniquement des données structurées correspondant au schéma.
- Les champs question, choices et answer doivent être rédigés en français.
- Évite les questions dupliquées et les réponses correctes dupliquées quand c'est possible.
- Chaque question doit avoir exactement quatre choix.
- La réponse doit correspondre exactement à l'un des choix.
- Utilise une culture football variée.
- Pour International Competitions, inclus des thèmes comme Coupe du monde, Ligue des Champions, CAN, Euro, Copa America, Ballon d'Or et records historiques.
- Garde des questions claires, fun et adaptées à un jeu de groupe rapide.`
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
