import { z } from "zod"

export const goalKeywordDifficulties = ["easy", "medium", "hard"] as const

export const goalKeywordRequestSchema = z.object({
  difficulty: z.enum(goalKeywordDifficulties).default("medium")
}).strict()

export const goalKeywordChallengeSchema = z.object({
  answer: z.string().trim().min(2).max(80),
  keywords: z.array(z.string().trim().min(1).max(40)).min(3).max(5),
  difficulty: z.enum(goalKeywordDifficulties)
}).strict()

export type GoalKeywordDifficulty = z.infer<typeof goalKeywordRequestSchema>["difficulty"]
export type GoalKeywordChallenge = z.infer<typeof goalKeywordChallengeSchema>

export function sanitizeGoalKeywordChallenge(challenge: unknown): GoalKeywordChallenge {
  const parsed = goalKeywordChallengeSchema.parse(challenge)
  return {
    ...parsed,
    keywords: Array.from(new Set(parsed.keywords.map((keyword) => keyword.trim()))).slice(0, 5)
  }
}
