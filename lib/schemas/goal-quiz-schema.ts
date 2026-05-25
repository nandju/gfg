import { z } from "zod"

export const goalQuizCategories = ["Teams", "Players", "International Competitions"] as const
export const goalQuizDifficulties = ["easy", "medium", "hard"] as const

export const goalQuizRequestSchema = z.object({
  category: z.enum(goalQuizCategories).default("International Competitions"),
  difficulty: z.enum(goalQuizDifficulties).default("medium"),
  count: z.number().int().min(5).max(10).default(5)
}).strict()

export const goalQuizQuestionSchema = z.object({
  question: z.string().trim().min(12).max(220),
  choices: z.array(z.string().trim().min(1).max(80)).length(4),
  answer: z.string().trim().min(1).max(80),
  category: z.enum(goalQuizCategories),
  difficulty: z.enum(goalQuizDifficulties)
}).strict().refine((question) => question.choices.includes(question.answer), {
  message: "The correct answer must be included in choices.",
  path: ["answer"]
})

export const goalQuizPackSchema = z.object({
  questions: z.array(goalQuizQuestionSchema).min(5).max(10)
}).strict()

export type GoalQuizCategory = z.infer<typeof goalQuizRequestSchema>["category"]
export type GoalQuizDifficulty = z.infer<typeof goalQuizRequestSchema>["difficulty"]
export type GoalQuizQuestion = z.infer<typeof goalQuizQuestionSchema>
export type GoalQuizPack = z.infer<typeof goalQuizPackSchema>

export function sanitizeGoalQuizPack(pack: unknown): GoalQuizPack {
  const parsed = goalQuizPackSchema.parse(pack)
  const seen = new Set<string>()

  return {
    questions: parsed.questions.filter((question) => {
      const key = question.question.toLowerCase().replace(/\s+/g, " ").trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
}
