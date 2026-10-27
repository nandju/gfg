import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock3, Gamepad2, Play, Users } from "lucide-react"
import { games } from "@/lib/games-data"
import { JoinCodeForm } from "@/components/join-code-form"

const accents: Record<string, { text: string; bg: string; border: string; focus: string }> = {
  goal: { text: "text-emerald-300", bg: "bg-emerald-300", border: "border-emerald-300", focus: "focus:border-emerald-300" },
  threedays: { text: "text-amber-200", bg: "bg-amber-200", border: "border-amber-200", focus: "focus:border-amber-200" },
  cagewild: { text: "text-red-300", bg: "bg-red-300", border: "border-red-300", focus: "focus:border-red-300" }
}
const fallbackAccent = { text: "text-primary", bg: "bg-primary", border: "border-primary", focus: "focus:border-primary" }

export function generateStaticParams() {
  return games.map((g) => ({ slug: g.id }))
}

export default async function GameDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const game = games.find((g) => g.id === slug)
  if (!game) notFound()
  const a = accents[game.id] ?? fallbackAccent

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Backdrop */}
      <div className="absolute inset-0">
        <Image src={game.backgroundMobile} alt="" fill priority className="object-cover md:hidden" sizes="100vw" />
        <Image src={game.backgroundDesktop} alt="" fill priority className="hidden object-cover md:block" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-zinc-950/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-zinc-950/40" />
      </div>

      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm font-bold backdrop-blur-md transition hover:bg-white/10">
          <ArrowLeft className="h-4 w-4" /> Accueil
        </Link>
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/20">
            <Image src="/logo.png" alt="GRACE's Family Games" fill className="object-cover" />
          </div>
          <p className="text-sm font-black">GFG</p>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-4.5rem)] items-end">
        <div className="grid w-full items-end gap-10 px-4 pb-10 md:px-8 lg:grid-cols-[1fr_340px]">
          <div className="max-w-2xl">
            <div className="mb-6 flex items-center gap-5">
              <div className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-3xl border-2 shadow-2xl md:h-28 md:w-28 ${a.border}`}>
                <Image src={game.coverImage} alt={`Logo ${game.title}`} fill priority className="object-cover" sizes="112px" />
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
              <span className={`inline-flex items-center gap-1.5 font-black ${a.text}`}><Gamepad2 className="h-3.5 w-3.5" /> Multijoueur</span>
            </div>

            <p className="max-w-xl text-sm leading-7 text-white/75 md:text-base">{game.description}</p>

            {game.available ? (
              <div className="mt-8 space-y-5">
                <Link href={`${game.link}/play`} className={`inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-lg font-black text-zinc-950 shadow-xl transition hover:scale-[1.03] hover:brightness-110 ${a.bg}`}>
                  <Play className="h-5 w-5 fill-current" /> Créer une partie
                </Link>
                <div className="max-w-md">
                  <JoinCodeForm slug={game.id} accentClass={a.focus} buttonClass={`${a.bg} text-zinc-950`} />
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <span className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-black text-white/60">Bientôt disponible</span>
                <p className="mt-4 text-sm text-white/50">Ce jeu arrive prochainement sur la plateforme. Revenez vite.</p>
              </div>
            )}
          </div>

          {/* Scenes */}
          {game.scenes.length > 0 && (
            <aside className="hidden lg:block">
              <p className={`mb-4 text-xs font-black uppercase tracking-[0.3em] ${a.text}`}>Scènes</p>
              <div className="space-y-3">
                {game.scenes.map((scene) => (
                  <div key={scene} className="relative overflow-hidden rounded-2xl border border-white/10">
                    <div className="relative aspect-video">
                      <Image src={scene} alt={`${game.title} — scène`} fill className="object-cover" sizes="340px" />
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}

          {/* Scenes (mobile strip) */}
          {game.scenes.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-1 lg:hidden" style={{ scrollbarWidth: "none" }}>
              {game.scenes.map((scene) => (
                <div key={scene} className="relative w-52 shrink-0 overflow-hidden rounded-2xl border border-white/10">
                  <div className="relative aspect-video">
                    <Image src={scene} alt={`${game.title} — scène`} fill className="object-cover" sizes="208px" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
