"use client"

import { useState } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { GameCatalog } from "@/components/game-catalog"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <main className="min-h-screen bg-background">
      {isLoading ? (
        <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />
      ) : (
        <GameCatalog />
      )}
    </main>
  )
}
