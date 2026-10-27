"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, ChevronLeft, ChevronRight, Clock3, Info, LogIn, Play, Users, X } from "lucide-react"
import { games, type Game } from "@/lib/games-data"

const playable = games.filter((g) => g.available)

const accents: Record<string, { text: string; bg: string; border: string }> = {
  goal: { text: "text-emerald-300", bg: "bg-emerald-300", border: "border-emerald-300" },
  threedays: { text: "text-amber-200", bg: "bg-amber-200", border: "border-amber-200" },
  cagewild: { text: "text-red-300", bg: "bg-red-300", border: "border-red-300" }
}

const codeToGame: Record<string, string> = { GL: "goal", TD: "threedays", CW: "cagewild" }

function JoinPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    const clean = code.trim().toUpperCase()
    if (clean.length < 3) { setError("Entrez le code reçu de l'organisateur."); return }
    const slug = codeToGame[clean.split("-")[0]]
    if (!slug) { setError("Ce code ne correspond à aucune partie. Vérifiez le code."); return }
    router.push(`/games/${slug}/play?join=${encodeURIComponent(clean)}`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-[2rem] border border-white/10 bg-zinc-950/95 p-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 sm:rounded-[2rem] sm:slide-in-from-bottom-0 sm:zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black">Rejoindre une partie</h2>
          <button onClick={onClose} className="rounded-full p-2 transition hover:bg-white/10" aria-label="Fermer"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-sm text-zinc-400">Entrez le code affiché dans le salon de l'organisateur (ex. GL-A123).</p>
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(null) }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          maxLength={12}
          placeholder="XX-000"
          autoFocus
          className="mt-5 w-full rounded-2xl border border-white/15 bg-black/50 px-5 py-4 text-center text-2xl font-black tracking-[0.25em] outline-none focus:border-primary"
        />
        {error && <p className="mt-4 rounded-xl border border-red-300/30 bg-red-950/30 px-4 py-3 text-sm font-bold text-red-200">{error}</p>}
        <button onClick={submit} disabled={!code.trim()} className="mt-5 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 text-lg font-black text-primary-foreground transition hover:brightness-110 disabled:opacity-40">
          <LogIn className="h-5 w-5" /> Rejoindre
        </button>
      </div>
    </div>
  )
}

export function HomePage() {
  const [index, setIndex] = useState(0)
  const [joinOpen, setJoinOpen] = useState(false)
  const game = playable[index]
  const a = accents[game.id] ?? accents.goal

  const select = useCallback((i: number) => {
    setIndex(((i % playable.length) + playable.length) % playable.length)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (joinOpen) { if (e.key === "Escape") setJoinOpen(false); return }
      if (e.key === "ArrowRight") select(index + 1)
      if (e.key === "ArrowLeft") select(index - 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index, joinOpen, select])

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      {joinOpen && <JoinPanel onClose={() => setJoinOpen(false)} />}

      {/* Featured game backdrop */}
      <div key={game.id} className="absolute inset-0 animate-in fade-in duration-700">
        <Image src={game.backgroundMobile} alt="" fill priority className="object-cover md:hidden" sizes="100vw" />
        <Image src={game.backgroundDesktop} alt="" fill priority className="hidden object-cover md:block" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-zinc-950/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/40" />
      </div>

      {/* Top nav */}
      <header className="relative z-20 flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/20">
            <Image src="/logo.png" alt="GRACE's Family Games" fill className="object-cover" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-black tracking-tight">GRACE&apos;s</p>
            <p className={`text-xs font-semibold ${a.text}`}>Family Games</p>
          </div>
        </Link>

        {/* Game tabs (desktop) */}
        <nav className="hidden items-center gap-7 lg:flex">
          {playable.map((g, i) => (
            <button key={g.id} onClick={() => select(i)} className={`relative pb-1.5 text-sm font-bold tracking-wide transition ${i === index ? "text-white" : "text-white/45 hover:text-white/80"}`}>
              {g.title}
              {i === index && <span className={`absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full ${a.bg}`} />}
            </button>
          ))}
        </nav>

        <button onClick={() => setJoinOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground transition hover:brightness-110">
          <LogIn className="h-4 w-4" /> Rejoindre
        </button>
      </header>

      {/* Main stage */}
      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] flex-col justify-end">
        <div className="grid items-end gap-8 px-4 pb-24 md:px-8 lg:grid-cols-[1fr_300px] lg:pb-10">

          {/* Info panel */}
          <div key={`info-${game.id}`} className="max-w-2xl animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="mb-5 flex items-center gap-4">
              <div className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 shadow-xl md:h-20 md:w-20 ${a.border}`}>
                <Image src={game.coverImage} alt={`Logo ${game.title}`} fill className="object-cover" sizes="80px" />
              </div>
              <div>
                <p className={`text-xs font-black uppercase tracking-[0.3em] ${a.text}`}>{game.tagline}</p>
                <h1 className="text-4xl font-black tracking-tight md:text-6xl">{game.title}</h1>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap items-center gap-4 text-xs font-bold text-white/60">
              <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {game.players}</span>
              <span className="text-white/25">/</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {game.duration}</span>
              <span className="text-white/25">/</span>
              <span className={`inline-flex items-center gap-1.5 font-black ${a.text}`}>Multijoueur</span>
            </div>

            <p className="max-w-xl text-sm leading-7 text-white/75 md:text-base">{game.description}</p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={`${game.link}/play`} className={`inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-lg font-black text-zinc-950 shadow-xl transition hover:scale-[1.03] hover:brightness-110 ${a.bg}`}>
                <Play className="h-5 w-5 fill-current" /> Jouer maintenant
              </Link>
              <Link href={game.link} className="inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 font-bold backdrop-blur-md transition hover:bg-white/15">
                <Info className="h-5 w-5" /> Détails
              </Link>
            </div>
          </div>

          {/* Scenes column (desktop) */}
          <aside className="hidden lg:block">
            <p className={`mb-4 text-xs font-black uppercase tracking-[0.3em] ${a.text}`}>Autres jeux</p>
            <div className="space-y-3">
              {playable.map((g, i) => i !== index && (
                <button key={g.id} onClick={() => select(i)} className="group relative block w-full overflow-hidden rounded-2xl border border-white/10 text-left transition hover:border-white/30">
                  <div className="relative aspect-video">
                    <Image src={g.coverImage} alt={g.title} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="300px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <p className="absolute bottom-2.5 left-3 text-sm font-black">{g.title}</p>
                    <ArrowRight className="absolute bottom-2.5 right-3 h-4 w-4 text-white/60 transition group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>

        {/* Bottom bar: dots + arrows + mobile strip */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-5 md:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {playable.map((g, i) => (
                <button key={g.id} onClick={() => select(i)} aria-label={g.title} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? `w-8 ${a.bg}` : "w-3 bg-white/30 hover:bg-white/50"}`} />
              ))}
            </div>
            <div className="hidden items-center gap-2 md:flex">
              <button onClick={() => select(index - 1)} aria-label="Précédent" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-md transition hover:bg-white/10"><ChevronLeft className="h-5 w-5" /></button>
              <button onClick={() => select(index + 1)} aria-label="Suivant" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-md transition hover:bg-white/10"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming strip */}
      <section className="relative z-10 border-t border-white/5 bg-zinc-950/90 px-4 py-6 backdrop-blur-xl md:px-8">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-white/40">Bientôt disponible</p>
        <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {games.filter((g) => !g.available).map((g) => (
            <Link key={g.id} href={g.link} className="relative w-36 shrink-0 overflow-hidden rounded-2xl border border-white/10 opacity-60 transition hover:opacity-90">
              <div className="relative aspect-[3/4]">
                <Image src={g.coverImage} alt={g.title} fill className="object-cover grayscale" sizes="144px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs font-black leading-tight">{g.title}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-white/50">Bientôt</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
