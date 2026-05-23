"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { games, type Game } from "@/lib/games-data"
import { GameCard } from "./game-card"
import { GameDetails } from "./game-details"
import { Navbar } from "./navbar"

interface GameCatalogProps {
  onReady?: () => void
  onProgress?: (progress: number) => void
}

export function GameCatalog({ onReady, onProgress }: GameCatalogProps) {
  const [selectedGame, setSelectedGame] = useState<Game>(games[0])
  const [showDetails, setShowDetails] = useState(false)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [readyAssets, setReadyAssets] = useState<Set<string>>(new Set())
  const [componentsReady, setComponentsReady] = useState(false)
  const [fontsReady, setFontsReady] = useState(false)
  const [animationsReady, setAnimationsReady] = useState(false)
  const hasReportedReady = useRef(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const requiredAssets = useMemo(() => {
    const assets = new Set<string>()
    games.forEach((game) => {
      assets.add(game.coverImage)
    })
    assets.add(games[0].backgroundMobile)
    assets.add(games[0].backgroundDesktop)
    return assets
  }, [])

  const markAssetReady = useCallback((src: string) => {
    setReadyAssets((current) => {
      if (current.has(src)) return current

      const next = new Set(current)
      next.add(src)
      return next
    })
  }, [])

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game)
  }

  const handleOpenDetails = () => {
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showDetails) {
        if (e.key === "Escape") handleCloseDetails()
        return
      }

      const currentIndex = games.findIndex((g) => g.id === selectedGame.id)

      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setSelectedGame(games[currentIndex - 1])
      } else if (e.key === "ArrowRight" && currentIndex < games.length - 1) {
        setSelectedGame(games[currentIndex + 1])
      } else if (e.key === "Enter") {
        handleOpenDetails()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedGame, showDetails])

  useEffect(() => {
    setComponentsReady(true)
  }, [])

  useEffect(() => {
    let isMounted = true

    if ("fonts" in document) {
      document.fonts.ready.then(() => {
        if (isMounted) setFontsReady(true)
      })
    } else {
      setFontsReady(true)
    }

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimationsReady(true))
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const assetsReady = Array.from(requiredAssets).every((asset) => readyAssets.has(asset))

    const assetProgress = requiredAssets.size > 0 ? readyAssets.size / requiredAssets.size : 1
    const progress = Math.round(
      assetProgress * 70 +
      (componentsReady ? 10 : 0) +
      (fontsReady ? 10 : 0) +
      (animationsReady ? 10 : 0)
    )

    onProgress?.(Math.min(progress, 100))

    if (assetsReady && componentsReady && fontsReady && animationsReady && !hasReportedReady.current) {
      hasReportedReady.current = true
      onReady?.()
    }
  }, [animationsReady, componentsReady, fontsReady, onProgress, onReady, readyAssets, requiredAssets])

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background image of selected game */}
      <div className="absolute inset-0 transition-opacity duration-700">
        <Image
          src={selectedGame.backgroundMobile}
          alt=""
          fill
          className="object-cover md:hidden"
          priority
          onLoad={() => markAssetReady(selectedGame.backgroundMobile)}
        />
        <Image
          src={selectedGame.backgroundDesktop}
          alt=""
          fill
          className="object-cover hidden md:block"
          priority
          onLoad={() => markAssetReady(selectedGame.backgroundDesktop)}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
      </div>

      {/* Navbar */}
      <Navbar 
        isMusicPlaying={isMusicPlaying} 
        onToggleMusic={() => setIsMusicPlaying(!isMusicPlaying)} 
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col justify-end min-h-screen pb-8 pt-20">
        {/* Game cards carousel */}
        <div className="relative px-4 md:px-8">
          {/* Navigation arrows - desktop only */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-10 h-10 bg-secondary/80 backdrop-blur-sm rounded-full text-foreground hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-10 h-10 bg-secondary/80 backdrop-blur-sm rounded-full text-foreground hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Cards container */}
          <div
            ref={scrollRef}
            className="flex items-center gap-4 md:gap-6 overflow-x-auto scrollbar-hide py-8 px-4 md:px-12 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isSelected={game.id === selectedGame.id}
                onSelect={() => handleSelectGame(game)}
                onImageReady={markAssetReady}
              />
            ))}
          </div>
        </div>

        {/* Selected game info bar */}
        <div 
          className="mx-4 md:mx-8 mt-2 bg-secondary/80 backdrop-blur-md rounded-2xl p-4 md:p-6 cursor-pointer hover:bg-secondary/90 transition-colors"
          onClick={handleOpenDetails}
        >
          <div className="flex items-center gap-4">
            {/* Rating badge */}
            <div className="hidden md:flex items-center justify-center w-12 h-12 bg-muted rounded-lg text-xs font-bold text-muted-foreground">
              PEGI
              <br />
              7+
            </div>
            
            {/* Game title */}
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                {selectedGame.title}
              </h2>
              <p className="text-sm text-muted-foreground hidden md:block">
                Appuyez sur Entrée ou cliquez pour jouer
              </p>
            </div>

            {/* Play indicator */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              selectedGame.available
                ? "bg-primary/20"
                : "bg-muted/50"
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                selectedGame.available
                  ? "bg-primary animate-pulse"
                  : "bg-muted-foreground"
              }`} />
              <span className={`text-sm font-medium ${
                selectedGame.available
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}>
                {selectedGame.available ? "Disponible" : "Indisponible"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Game details overlay */}
      {showDetails && (
        <GameDetails game={selectedGame} onClose={handleCloseDetails} />
      )}
    </div>
  )
}
