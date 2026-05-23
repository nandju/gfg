"use client"

import { useState } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { GameCatalog } from "@/components/game-catalog"

export default function Home() {
  const [isReady, setIsReady] = useState(false)
  const [showLoader, setShowLoader] = useState(true)
  const [progress, setProgress] = useState(0)

  return (
    <main className="relative min-h-screen bg-background">
      <div
        className={`transition-opacity duration-700 ease-out ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!isReady}
      >
        <GameCatalog
          onReady={() => setIsReady(true)}
          onProgress={setProgress}
        />
      </div>

      {showLoader && (
        <LoadingScreen
          progress={isReady ? 100 : progress}
          isExiting={isReady}
          onExited={() => setShowLoader(false)}
        />
      )}
    </main>
  )
}
