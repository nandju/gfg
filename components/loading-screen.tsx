"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"

const loadingTips = [
  { title: "100% Multijoueur", subtitle: "Jouez uniquement en équipe, jamais seul." },
  { title: "Histoires Originales", subtitle: "Chaque jeu est basé sur une histoire unique." },
  { title: "Fun & Compétition", subtitle: "Affrontez d'autres équipes et gagnez ensemble." },
  { title: "Univers Cinématique", subtitle: "Des jeux inspirés de films et séries originales." },
  { title: "Jouez en Famille", subtitle: "Une expérience de jeu pour toute la famille." },
]

interface Particle {
  left: number
  top: number
  delay: number
  duration: number
}

interface LoadingScreenProps {
  onLoadingComplete: () => void
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [currentTip, setCurrentTip] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const [particles, setParticles] = useState<Particle[]>([])

  // Generate particles only on client side to avoid hydration mismatch
  useEffect(() => {
    const newParticles = [...Array(20)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 3,
    }))
    setParticles(newParticles)
  }, [])

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => onLoadingComplete(), 500)
          return 100
        }
        return prev + Math.random() * 3 + 1
      })
    }, 80)

    return () => clearInterval(progressInterval)
  }, [onLoadingComplete])

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentTip((prev) => (prev + 1) % loadingTips.length)
        setFadeIn(true)
      }, 300)
    }, 3000)

    return () => clearInterval(tipInterval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo and Title */}
        <div className="flex items-center gap-4 animate-in fade-in zoom-in duration-700">
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-primary shadow-lg shadow-primary/30">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-1D4w14VdJaweQDPMBlcaNX8jygy0Yp.jpg"
              alt="GRACE's Family Games Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
              GRACE&apos;s
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-primary">
              Family Games
            </h2>
          </div>
        </div>

        {/* Loading tips */}
        <div
          className={`text-center transition-opacity duration-300 h-20 flex flex-col justify-center ${
            fadeIn ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-lg md:text-xl font-semibold text-accent">
            {loadingTips[currentTip].title}
          </p>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {`"${loadingTips[currentTip].subtitle}"`}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 md:w-80">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-200 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Chargement... {Math.min(Math.round(progress), 100)}%
          </p>
        </div>
      </div>

      {/* Animated glow effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
    </div>
  )
}
