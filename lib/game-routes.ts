import type { GameType } from "@/types/multiplayer"

export const gameTypeToSlug: Record<GameType, string> = {
  goal: "goal",
  "three-days": "threedays",
  "cage-wild": "cagewild"
}

export const gameTypeToName: Record<GameType, string> = {
  goal: "GOAL!!!",
  "three-days": "THREE DAYS",
  "cage-wild": "CAGE WILD"
}

export function roomUrl(origin: string, gameType: GameType, code: string): string {
  return `${origin}/games/${gameTypeToSlug[gameType]}?room=${encodeURIComponent(code)}`
}
