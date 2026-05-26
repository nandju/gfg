import { z } from "zod"

export const goalMimeDifficulties = ["easy", "medium", "hard"] as const

export const goalMimeRequestSchema = z.object({
  difficulty: z.enum(goalMimeDifficulties).default("medium")
}).strict()

export const goalMimeChallengeSchema = z.object({
  player: z.string().trim().min(2).max(80),
  difficulty: z.enum(goalMimeDifficulties),
  mimeHints: z.array(z.string().trim().min(2).max(90)).min(3).max(5)
}).strict()

export type GoalMimeDifficulty = z.infer<typeof goalMimeRequestSchema>["difficulty"]
export type GoalMimeChallenge = z.infer<typeof goalMimeChallengeSchema>

export function sanitizeGoalMimeChallenge(challenge: unknown): GoalMimeChallenge {
  const parsed = goalMimeChallengeSchema.parse(challenge)
  return {
    ...parsed,
    mimeHints: Array.from(new Set(parsed.mimeHints.map((hint) => hint.trim()))).slice(0, 5)
  }
}
