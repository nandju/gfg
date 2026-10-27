"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CalendarClock, Gamepad2, Loader2, LogIn, Play, Sparkles, User, Users } from "lucide-react"
import { games, type Game } from "@/lib/games-data"
import { JoinGameDialog } from "@/components/join-game-dialog"
import { usePlayerIdentity } from "@/hooks/use-player-id"
import { GFGLogo } from "@/components/gfg-logo"

export function HomeScreen() {
  const router = useRouter()
  const playable = useMemo(() => games.filter((g) => g.available), [])
  const [featuredId, setFeaturedId] = useState(playable[0]?.id ?? games[0].id)
  const featured = useMemo(() => games.find((g) => g.id === featuredId) ?? games[0], [featuredId])
  const [bgIndex, setBgIndex] = useState(0)
  const [joinOpen, setJoinOpen] = useState(false)
  const { playerName, setPlayerName } = usePlayerIdentity()
  const [nameOpen, setNameOpen] = useState(false)
  const [nameDraft, setNameDraft] = useState(playerName)

  const backgrounds = featured.backgrounds.length > 0 ? featured.backgrounds : [featured.image]

  useEffect(() => {
    setBgIndex(0)
  }, [featuredId])

  useEffect(() => {
    if (backgrounds.length < 2) return
    const t = window.setInterval(() => setBgIndex((i) => (i + 1) % backgrounds.length), 6000)
    return () => window.clearInterval(t)
  }, [backgrounds.length])

  useEffect(() => setNameDraft(playerName), [playerName])

  const goPlay = useCallback(() => {
    if (featured.available) router.push(featured.link)
  }, [featured, router])

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#12070a] text-white">
      <div className="pointer-events-none absolute -left-32 top-0 h-[540px] w-[540px] rounded-full bg-red-700/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[540px] w-[540px] rounded-full bg-rose-900/25 blur-[120px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-8 pt-5 md:px-8">
        {/* Navbar */}
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-black/40 py-2 pl-4 pr-2 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3">
            <GFGLogo size={36} />
            <span className="hidden text-sm font-black tracking-wide sm:block">GRACE&apos;S FAMILY GAMES</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setJoinOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold transition hover:bg-white/15">
              <LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Rejoindre une partie</span><span className="sm:hidden">Rejoindre</span>
            </button>
            <button onClick={() => setNameOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2.5 text-sm font-bold transition hover:bg-red-400">
              <User className="h-4 w-4" /> <span className="max-w-[120px] truncate">{playerName || "Invité"}</span>
            </button>
          </div>
        </nav>

        {nameOpen && (
          <div className="mt-2 ml-auto flex w-full max-w-xs items-center gap-2 rounded-2xl border border-white/10 bg-black/60 p-2 backdrop-blur-xl">
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value.slice(0, 20))}
              onKeyDown={(e) => { if (e.key === "Enter") { setPlayerName(nameDraft); setNameOpen(false) } }}
              placeholder="Votre pseudo"
              className="w-full bg-transparent px-3 py-2 text-sm font-bold outline-none placeholder:text-white/35"
              autoFocus
            />
            <button onClick={() => { setPlayerName(nameDraft); setNameOpen(false) }} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold hover:bg-red-400">OK</button>
          </div>
        )}

        {/* Hero */}
        <section className="relative mt-6 flex-1 overflow-hidden rounded-[2rem] border border-white/10">
          <div className="absolute inset-0">
            {backgrounds.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className={`object-cover transition-opacity duration-1000 ${i === bgIndex ? "opacity-100" : "opacity-0"}`}
                priority={i === 0}
                unoptimized
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#12070a] via-[#12070a]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#12070a]/90 via-transparent to-transparent" />
          </div>

          <div className="relative flex h-full flex-col justify-end p-6 md:p-12">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.35em] text-red-300">
                <Sparkles className="h-4 w-4" /> {featured.tagline}
              </p>
              <h1 className="mt-3 text-4xl font-black md:text-7xl">{featured.title}</h1>
              <p className="mt-4 line-clamp-3 text-sm text-white/75 md:text-base">{featured.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-white/70">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">{featured.players}</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">{featured.genre}</span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5">{featured.mode}</span>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {featured.available ? (
                  <button onClick={goPlay} className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-8 py-4 text-base font-black shadow-[0_10px_40px_-10px_rgba(239,68,68,0.9)] transition hover:scale-[1.02] hover:bg-red-400">
                    <Play className="h-5 w-5" /> Jouer maintenant
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-base font-black text-white/60">
                    <CalendarClock className="h-5 w-5" /> Bientôt disponible
                  </span>
                )}
                <button onClick={() => setJoinOpen(true)} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 font-bold backdrop-blur transition hover:bg-white/20">
                  <LogIn className="h-5 w-5" /> Rejoindre une partie
                </button>
                {featured.available && (
                  <Link href={`${featured.link}?action=create`} className="inline-flex items-center gap-2 rounded-2xl px-5 py-4 font-bold text-white/80 transition hover:bg-white/10">
                    <Gamepad2 className="h-5 w-5" /> Créer une partie
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Game cards */}
        <section className="mt-6">
          <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-white/50">
            <Users className="h-4 w-4" /> Les jeux du catalogue
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {games.map((g) => (
              <button
                key={g.id}
                onClick={() => setFeaturedId(g.id)}
                onDoubleClick={() => g.available && router.push(g.link)}
                className={`group relative aspect-[3/4] overflow-hidden rounded-2xl border text-left transition ${g.id === featuredId ? "border-red-400/70 shadow-[0_0_30px_-10px_rgba(239,68,68,0.8)]" : "border-white/10 hover:border-white/30"}`}
              >
                <Image src={g.image} alt={g.title} fill sizes="(max-width:640px) 50vw, 240px" className="object-cover transition duration-500 group-hover:scale-105" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="text-sm font-black leading-tight">{g.title}</p>
                  {g.available ? (
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-red-300"><Play className="h-3 w-3" /> Jouable</p>
                  ) : (
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-white/50"><Loader2 className="h-3 w-3" /> Bientôt</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <JoinGameDialog open={joinOpen} onClose={() => setJoinOpen(false)} />
    </main>
  )
}
