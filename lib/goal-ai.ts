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

// ── Lightweight RAM anti-repeat cache ──
const recentItems = new Map<string, string[]>()

function getRecentKey(type: "quiz" | "mime" | "keyword", category?: string, difficulty?: string) {
  return `${type}:${category ?? ""}:${difficulty ?? ""}`
}

function addRecent(type: "quiz" | "mime" | "keyword", value: string, category?: string, difficulty?: string) {
  const key = getRecentKey(type, category, difficulty)
  const list = recentItems.get(key) ?? []
  const next = [value.toLowerCase(), ...list].slice(0, 10)
  recentItems.set(key, next)
}

function isRecent(type: "quiz" | "mime" | "keyword", value: string, category?: string, difficulty?: string): boolean {
  const key = getRecentKey(type, category, difficulty)
  const list = recentItems.get(key) ?? []
  return list.some((item) => item === value.toLowerCase())
}

// ── Randomness helpers ──
function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function makeSeed(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getGenerationContext() {
  return {
    seed: makeSeed(),
    style: pickRandom([
      "commentaire de match en direct",
      "football de rue",
      "Coupe du monde intense",
      "trivia fun",
      "histoire légendaire",
      "faits inattendus",
      "analyse tactique",
      "culture supporter"
    ] as const),
    tone: pickRandom([
      "sérieux",
      "drôle",
      "dramatique",
      "compétitif",
      "surprenant",
      "nostalgique"
    ] as const)
  }
}

function jitterTemperature(base: number, range = 0.2): number {
  const value = base + Math.random() * range
  return Math.min(Math.max(Number(value.toFixed(3)), 0), 2)
}

// ── Prompt builders ──
function buildQuizPrompt(count: number, category: GoalQuizCategory, difficulty: GoalQuizDifficulty) {
  const ctx = getGenerationContext()
  return {
    temperature: jitterTemperature(0.9),
    system: `Tu es un moteur de quiz football en français. Contexte unique: seed=${ctx.seed}, style="${ctx.style}", ton="${ctx.tone}".
Génère uniquement du JSON valide correspondant au schéma Zod. N'inclus jamais de markdown, de commentaires ou d'explications.

RÈGLES STRICTES:
- Chaque sortie doit être unique dans sa structure et son wording.
- Ne répète jamais les formulations ou les angles utilisés dans les générations précédentes.
- Varie constamment le type de question: statistique, anecdote, culture foot, tactique, rivalité, transfert, record, sélection, club.
- Évite absolument les templates et les paraphrases prévisibles.
- Les champs question, choices et answer doivent être rédigés en français.
- Chaque question doit avoir exactement quatre choix.
- La réponse doit correspondre exactement à l'un des choix.
- Pour International Competitions, inclus des thèmes variés: Coupe du monde, Ligue des Champions, CAN, Euro, Copa America, Ballon d'Or, records historiques, anecdotes de tournois.
- Garde des questions claires, fun et adaptées à un jeu de groupe rapide.`,
    prompt: `Génère ${count} questions de quiz football réalistes en français pour un jeu mobile multijoueur local nommé GOAL!!!.

Category: ${category}
Difficulty: ${difficulty}
Style narratif imposé: ${ctx.style}
Ton imposé: ${ctx.tone}
Seed unique: ${ctx.seed}

Consignes:
- Aucune répétition de questions ou de réponses correctes avec les appels précédents.
- Varie la structure des phrases (question directe, complétion, comparaison, anecdote).
- Mélange football européen, sud-américain, africain et international.
- Propose des pièges crédibles mais pas évidents.`
  }
}

function buildMimePrompt(difficulty: GoalMimeDifficulty) {
  const ctx = getGenerationContext()
  return {
    temperature: jitterTemperature(0.95),
    system: `Tu es un générateur de mimes football en français. Contexte unique: seed=${ctx.seed}, style="${ctx.style}", ton="${ctx.tone}".
Génère uniquement du JSON valide, sans markdown ni explication.

RÈGLES STRICTES:
- Choisis un footballeur réel reconnaissable mais varie énormément (stars, légendes, joueurs actuels, icônes de club, icônes de sélection).
- Varie les styles de mime: célébration, numéro, club, poste, geste connu, style de course, action célèbre, coiffure, célébration spécifique, signature technique.
- Ne répète jamais le même joueur ou le même angle que les générations précédentes.
- Les mimeHints doivent être en français, courts et mimables sans parole.
- Adapte la difficulté: easy = très connu, hard = plus niche ou technique.`,
    prompt: `Génère un défi de mime football pour GOAL!!!.

Difficulté: ${difficulty}
Style narratif imposé: ${ctx.style}
Ton imposé: ${ctx.tone}
Seed unique: ${ctx.seed}

Consignes:
- Joueur varié et imprévisible.
- Indices créatifs et situationnels.
- Mélange héritage, club actuel ou ancien, pays, poste, numéro, surnom ou moment célèbre.`
  }
}

function buildKeywordPrompt(difficulty: GoalKeywordDifficulty) {
  const ctx = getGenerationContext()
  return {
    temperature: jitterTemperature(0.85),
    system: `Tu es un générateur de mots-clés football en français. Contexte unique: seed=${ctx.seed}, style="${ctx.style}", ton="${ctx.tone}".
Génère uniquement du JSON valide, sans markdown ni explication.

RÈGLES STRICTES:
- answer doit être le nom exact d'un footballeur réel, mais varie énormément (joueurs actuels, légendes, stars africaines, sud-américaines, européennes).
- keywords doit contenir 3 à 5 indices courts en français.
- Mélange héritage, club, pays, poste, numéro, surnom, moment historique, rivalité, compétition, technique signature, stade.
- Ne répète jamais le même joueur ou les mêmes indices que les générations précédentes.
- Les indices doivent permettre à une équipe de deviner rapidement sans être trop évidents en difficulté difficile.
- Varie constamment le type d'indices: palmarès, physique, anecdote, culture supporter, record, transfert.`,
    prompt: `Génère un défi mot-clé football pour GOAL!!!.

Difficulté: ${difficulty}
Style narratif imposé: ${ctx.style}
Ton imposé: ${ctx.tone}
Seed unique: ${ctx.seed}

Consignes:
- Réponse variée et imprévisible.
- Indices riches, culturellement football, et jamais répétitifs.
- Mélange joueurs, clubs, moments historiques, gestes techniques, stades, rivalités.`
  }
}

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
      const { temperature, system, prompt } = buildQuizPrompt(count, category, difficulty)
      const result = await generateObject({
        model: groq(modelName),
        schema: goalQuizPackSchema,
        temperature,
        maxRetries: 1,
        system,
        prompt
      })

      const sanitized = sanitizeGoalQuizPack(result.object)

      if (sanitized.questions.length < count) {
        console.error("GOAL QUIZ MODEL FAILED:", modelName, "Generated quiz had too few unique valid questions.")
        continue
      }

      // Anti-repeat: reject if all questions are recent duplicates and we still have models left
      const allDuplicate = sanitized.questions.every((q) =>
        isRecent("quiz", q.question, category, difficulty)
      )
      if (allDuplicate && modelName !== groqStructuredOutputModels[groqStructuredOutputModels.length - 1]) {
        console.warn("GOAL QUIZ ALL DUPLICATES:", modelName, "retrying next model...")
        continue
      }

      sanitized.questions.forEach((q) => addRecent("quiz", q.question, category, difficulty))

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
      const { temperature, system, prompt } = buildMimePrompt(difficulty)
      const result = await generateObject({
        model: groq(modelName),
        schema: goalMimeChallengeSchema,
        temperature,
        maxRetries: 1,
        system,
        prompt
      })

      const challenge = sanitizeGoalMimeChallenge(result.object)

      if (isRecent("mime", challenge.player, difficulty) && modelName !== groqStructuredOutputModels[groqStructuredOutputModels.length - 1]) {
        console.warn("GOAL MIME DUPLICATE DETECTED:", challenge.player, "retrying next model...")
        continue
      }

      addRecent("mime", challenge.player, difficulty)

      return {
        source: "ai" as const,
        challenge
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
      const { temperature, system, prompt } = buildKeywordPrompt(difficulty)
      const result = await generateObject({
        model: groq(modelName),
        schema: goalKeywordChallengeSchema,
        temperature,
        maxRetries: 1,
        system,
        prompt
      })

      const challenge = sanitizeGoalKeywordChallenge(result.object)

      if (isRecent("keyword", challenge.answer, difficulty) && modelName !== groqStructuredOutputModels[groqStructuredOutputModels.length - 1]) {
        console.warn("GOAL KEYWORD DUPLICATE DETECTED:", challenge.answer, "retrying next model...")
        continue
      }

      addRecent("keyword", challenge.answer, difficulty)

      return {
        source: "ai" as const,
        challenge
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
