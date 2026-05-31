"use client"

import { useEffect, useState } from "react"
import { LoadingScreen } from "@/components/loading-screen"
import { GameCatalog } from "@/components/game-catalog"

export default function Home() {
  const [isReady, setIsReady] = useState(false)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    console.log("[LOADER] Asset loaded")
    const visualDelay = new Promise<"visual">((resolve) => window.setTimeout(() => resolve("visual"), 3200))
    const failsafe = new Promise<"timeout">((resolve) => window.setTimeout(() => resolve("timeout"), 4000))
    Promise.race([visualDelay, failsafe]).then((result) => {
      if (result === "timeout") console.log("[LOADER] Timeout reached")
      console.log("[LOADER] Entering application")
      setIsReady(true)
    })
  }, [])

  return (
    <main className="relative min-h-screen bg-background">
      <div
        className={`transition-opacity duration-700 ease-out ${
          isReady ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!isReady}
      >
        <GameCatalog />
      </div>

      {showLoader && (
        <LoadingScreen
          isExiting={isReady}
          onExited={() => setShowLoader(false)}
        />
      )}
    </main>
  )
}
