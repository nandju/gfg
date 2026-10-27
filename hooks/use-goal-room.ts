"use client"

import { useGameRoom, type UseGameRoomReturn } from "@/hooks/use-game-room"

export type { UseGameRoomReturn as UseGoalRoomReturn }

export function useGoalRoom(): UseGameRoomReturn {
  return useGameRoom("goal")
}
