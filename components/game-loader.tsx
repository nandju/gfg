"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

const loaderAccents = {
  emerald: { text: "text-emerald-300", bar: "bg-emerald-300", border: "border-emerald-300/50", glow: "bg-emerald-500/15" },
  amber: { text: "text-amber-200", bar: "bg-amber-200", border: "border-amber-200/50", glow: "bg-amber-500/15" },
  red: { text: "text-red-300", bar: "bg-red-300", border: "border-red-300/50", glow: "bg-red-500/15" }
} as const

type GameLoaderProps = {
  title: string
  tagline: string
  logo: string
  accent: keyof typeof loaderAccents
  onDone: () => void
}

const BOOT_MS = 1100

export function GameLoader({ title, tagline, logo, accent, onDone }: GameLoaderProps) {
  const a = loaderAccents[accent]
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / BOOT_MS)
      setProgress(t)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const exitTimer = window.setTimeout(() => setLeaving(true), BOOT_MS + 120)
    const doneTimer = window.setTimeout(onDone, BOOT_MS + 520)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(exitTimer)
      window.clearTimeout(doneTimer)
    }
  }, [onDone])

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-zinc-950 transition-all duration-500 ease-out ${leaving ? "pointer-events-none scale-105 opacity-0" : "opacity-100"}`}>
      <div className={`absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${a.glow}`} />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div className={`relative mb-7 h-24 w-24 overflow-hidden rounded-[1.75rem] border-2 shadow-2xl md:h-28 md:w-28 ${a.border}`}>
          <Image src={logo} alt={title} fill priority className="object-cover" sizes="112px" />
        </div>
        <p className={`text-[10px] font-black uppercase tracking-[0.45em] ${a.text}`}>{tagline}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-white md:text-6xl">{title}</h1>

        <div className="mt-9 h-1 w-44 overflow-hidden rounded-full bg-white/10">
          <div className={`h-full rounded-full transition-none ${a.bar}`} style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Chargement</p>
      </div>
    </div>
  )
}
