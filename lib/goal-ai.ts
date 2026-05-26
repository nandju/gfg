import { groq } from "@ai-sdk/groq"
import { generateObject } from "ai"
import { getFallbackGoalKeyword } from "@/lib/fallback-goal-keyword"
import { getFallbackGoalMime } from "@/lib/fallback-goal-mime"
import { getFallbackGoalQuiz } from "@/lib/fallback-goal-quiz"
import { GoalKeywordDifficulty, goalKeywordChallengeSchema, sanitizeGoalKeywordChallenge } from "@/lib/schemas/goal-keyword-schema"
import { GoalMimeDifficulty, goalMimeChallengeSchema, sanitizeGoalMimeChallenge } from "@/lib/schemas/goal-mime-schema"
import { GoalQuizCategory, GoalQuizDifficulty, goalQuizPackSchema, sanitizeGoalQuizPack } from "@/lib/schemas/goal-quiz-schema"

type GenerateGoalQuizOptions = {
  category: GoalQuizCategory
  difficulty: GoalQuizDifficulty
  count?: number
}

type GenerateGoalMimeOptions = {
  difficulty?: GoalMimeDifficulty
}

type GenerateGoalKeywordOptions = {
  difficulty?: GoalKeywordDifficulty
}

const groqStructuredOutputModels = [
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "meta-llama/llama-4-maverick-17b-128e-instruct"
] as const

export async function generateGoalQuiz({ category, difficulty, count = 5 }: GenerateGoalQuizOptions) {
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY?.trim())

  if (!hasGroqKey) {
    return {
      source: "fallback" as const,
      ...getFallbackGoalQuiz(category, difficulty, count)
    }
  }

  for (const modelName of groqStructuredOutputModels) {
    try {
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
        console.error("GOAL QUIZ MODEL FAILED:", modelName, "Generated quiz had too few unique valid questions.")
        continue
      }

      return {
        source: "ai" as const,
        ...sanitized
      }
    } catch (error) {
      console.error("GOAL QUIZ MODEL FAILED:", modelName, error)
    }
  }

  return {
    source: "fallback" as const,
    ...getFallbackGoalQuiz(category, difficulty, count)
  }
}

export async function generateGoalMime({ difficulty = "medium" }: GenerateGoalMimeOptions = {}) {
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY?.trim())

  if (!hasGroqKey) {
    return {
      source: "fallback" as const,
      challenge: getFallbackGoalMime(difficulty)
    }
  }

  for (const modelName of groqStructuredOutputModels) {
    try {
      const result = await generateObject({
        model: groq(modelName),
        schema: goalMimeChallengeSchema,
        temperature: 0.9,
        maxRetries: 1,
        system: "Tu es un générateur de mimes football en français. Génère uniquement du JSON valide, sans markdown ni explication.",
        prompt: `Génère un défi de mime football pour GOAL!!!.

Difficulté: ${difficulty}

Règles:
- Choisis un footballeur réel reconnaissable.
- La réponse doit être dans le champ player.
- Les mimeHints doivent être en français.
- Les indices doivent être mimables sans parole: célébration, numéro, club, poste, geste connu, style de course ou action célèbre.
- Garde une difficulté adaptée à un jeu multijoueur local rapide.`
      })

      return {
        source: "ai" as const,
        challenge: sanitizeGoalMimeChallenge(result.object)
      }
    } catch (error) {
      console.error("GOAL MIME MODEL FAILED:", modelName, error)
    }
  }

  return {
    source: "fallback" as const,
    challenge: getFallbackGoalMime(difficulty)
  }
}

export async function generateGoalKeyword({ difficulty = "medium" }: GenerateGoalKeywordOptions = {}) {
  const hasGroqKey = Boolean(process.env.GROQ_API_KEY?.trim())

  if (!hasGroqKey) {
    return {
      source: "fallback" as const,
      challenge: getFallbackGoalKeyword(difficulty)
    }
  }

  for (const modelName of groqStructuredOutputModels) {
    try {
      const result = await generateObject({
        model: groq(modelName),
        schema: goalKeywordChallengeSchema,
        temperature: 0.85,
        maxRetries: 1,
        system: "Tu es un générateur de mots-clés football en français. Génère uniquement du JSON valide, sans markdown ni explication.",
        prompt: `Génère un défi mot-clé football pour GOAL!!!.

Difficulté: ${difficulty}

Règles:
- answer doit être le nom exact d'un footballeur réel.
- keywords doit contenir 3 à 5 indices courts en français.
- Mélange héritage, club, pays, poste, numéro, surnom ou moment célèbre.
- Les indices doivent permettre à une équipe de deviner rapidement sans être trop évidents en difficulté difficile.`
      })

      return {
        source: "ai" as const,
        challenge: sanitizeGoalKeywordChallenge(result.object)
      }
    } catch (error) {
      console.error("GOAL KEYWORD MODEL FAILED:", modelName, error)
    }
  }

  return {
    source: "fallback" as const,
    challenge: getFallbackGoalKeyword(difficulty)
  }
}
