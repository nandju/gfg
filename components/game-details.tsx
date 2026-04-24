"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, X } from "lucide-react"
import type { Game } from "@/lib/games-data"

interface GameDetailsProps {
  game: Game
  onClose: () => void
}

export function GameDetails({ game, onClose }: GameDetailsProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <div className="fixed inset-0 z-40 animate-in fade-in duration-300">
      {/* Background image - responsive */}
      <div className="absolute inset-0">
        <Image
          src={game.backgroundMobile}
          alt={game.title}
          fill
          className="object-cover md:hidden"
          priority
          onLoad={() => setImageLoaded(true)}
        />
        <Image
          src={game.backgroundDesktop}
          alt={game.title}
          fill
          className="object-cover hidden md:block"
          priority
          onLoad={() => setImageLoaded(true)}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-secondary/80 backdrop-blur-sm rounded-full text-foreground hover:bg-secondary transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Content */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-6 md:p-10 transition-all duration-500 ${
          imageLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <div className="max-w-2xl">
          {/* Logo and Title */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-primary shadow-lg">
              <Image
                src={game.coverImage}
                // src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-1D4w14VdJaweQDPMBlcaNX8jygy0Yp.jpg"
                alt="Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-white">
                {game.title}
              </h1>
              <p className="text-primary font-medium">GRACE&apos;s Family Games</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-white/90 text-base md:text-lg mb-6 max-w-xl leading-relaxed">
            {game.description}
          </p>

          {/* Play button */}
          <Link
            href={game.available ? game.link : "#"}
            onClick={game.available ? undefined : (e) => e.preventDefault()}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 ${
              game.available
                ? "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-105 shadow-lg shadow-primary/40 cursor-pointer"
                : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
            }`}
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-current">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-1D4w14VdJaweQDPMBlcaNX8jygy0Yp.jpg"
                alt="Logo"
                fill
                className="object-cover"
              />
            </div>
            <span>{game.available ? "Jouer" : "Indisponible"}</span>
            <Play className="w-5 h-5 fill-current" />
          </Link>
        </div>
      </div>
    </div>
  )
}
