"use client"

import Image from "next/image"
import type { Game } from "@/lib/games-data"

interface GameCardProps {
  game: Game
  isSelected: boolean
  onSelect: () => void
}

export function GameCard({ game, isSelected, onSelect }: GameCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`relative flex-shrink-0 w-32 md:w-40 lg:w-48 aspect-[3/4] rounded-xl overflow-hidden transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-primary ${
        isSelected
          ? "scale-110 ring-4 ring-primary shadow-xl shadow-primary/40 z-10"
          : "scale-100 opacity-80 hover:opacity-100 hover:scale-105"
      }`}
    >
      <Image
        src={game.coverImage}
        alt={game.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      
      {/* Game title on card */}
      <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3">
        <p className="text-xs md:text-sm font-semibold text-white text-center line-clamp-2">
          {game.title}
        </p>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium animate-in fade-in zoom-in duration-200">
          En cours
        </div>
      )}
    </button>
  )
}
