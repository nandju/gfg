"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, DoorOpen, LogIn, Plus, QrCode, RefreshCw, ScanLine, Users } from "lucide-react"

type Step = "loading" | "menu" | "mode" | "create" | "join" | "waiting" | "cards"

type GameFlowCard = {
  title: string
  text: string
  image: string
}

type GameFlowPageProps = {
  game: {
    title: string
    coverImage: string
    backgroundMobile: string
    backgroundDesktop: string
  }
  cards: GameFlowCard[]
}

function generateLobbyCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const numbers = "23456789"
  return `${letters[Math.floor(Math.random() * letters.length)]}${letters[Math.floor(Math.random() * letters.length)]}${numbers[Math.floor(Math.random() * numbers.length)]}${numbers[Math.floor(Math.random() * numbers.length)]}${letters[Math.floor(Math.random() * letters.length)]}`
}

function QrPattern({ code }: { code: string }) {
  const cells = useMemo(() => Array.from({ length: 81 }, (_, index) => (code.charCodeAt(index % code.length) + index * 7) % 3 !== 0), [code])

  return (
    <div className="grid h-48 w-48 grid-cols-9 gap-1 rounded-3xl bg-white p-4 shadow-2xl md:h-56 md:w-56">
      {cells.map((active, index) => (
        <div key={index} className={`rounded-sm ${active ? "bg-background" : "bg-white"}`} />
      ))}
    </div>
  )
}

export function GameFlowPage({ game, cards }: GameFlowPageProps) {
  const [step, setStep] = useState<Step>("loading")
  const [progress, setProgress] = useState(0)
  const [lobbyCode, setLobbyCode] = useState(generateLobbyCode)
  const [timeLeft, setTimeLeft] = useState(30)
  const [joinCode, setJoinCode] = useState("")

  useEffect(() => {
    if (step !== "loading") return

    const interval = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 4, 100)
        if (next === 100) {
          window.clearInterval(interval)
          window.setTimeout(() => setStep("menu"), 350)
        }
        return next
      })
    }, 90)

    return () => window.clearInterval(interval)
  }, [step])

  useEffect(() => {
    if (step !== "create") return

    setTimeLeft(30)
    const interval = window.setInterval(() => {
      setTimeLeft((current) => Math.max(current - 1, 0))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [step, lobbyCode])

  const renewLobby = () => {
    setLobbyCode(generateLobbyCode())
  }

  if (step === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="w-full max-w-sm text-center">
          <div className="relative mx-auto mb-8 h-28 w-28 overflow-hidden rounded-3xl border border-primary/60 shadow-2xl shadow-primary/30">
            <Image src={game.coverImage} alt={game.title} fill priority className="object-cover" />
          </div>
          <h1 className="mb-6 text-4xl font-black tracking-tight md:text-5xl">{game.title}</h1>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-primary transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-4 text-sm font-medium text-muted-foreground">Chargement... {progress}%</p>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0">
        <Image src={game.backgroundMobile} alt="" fill priority className="object-cover md:hidden" />
        <Image src={game.backgroundDesktop} alt="" fill priority className="hidden object-cover md:block" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-background/65 to-background/95" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-8 md:px-10">
        {step === "menu" && (
          <section className="w-full max-w-xl rounded-[2rem] border border-white/15 bg-black/45 p-6 text-center shadow-2xl backdrop-blur-md md:p-10">
            <div className="relative mx-auto mb-5 h-24 w-24 overflow-hidden rounded-3xl border border-primary/70 md:h-28 md:w-28">
              <Image src={game.coverImage} alt={game.title} fill className="object-cover" />
            </div>
            <h1 className="text-4xl font-black md:text-6xl">{game.title}</h1>
            <p className="mx-auto mt-4 max-w-md text-white/75">Entrez dans la partie ou retournez au catalogue.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button onClick={() => setStep("mode")} className="rounded-2xl bg-primary px-8 py-5 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105">
                Play
              </button>
              <Link href="/" className="rounded-2xl border border-white/20 bg-white/10 px-8 py-5 text-lg font-bold text-white transition hover:scale-105 hover:bg-white/20">
                Quit
              </Link>
            </div>
          </section>
        )}

        {step === "mode" && (
          <section className="w-full max-w-4xl">
            <div className="mb-8 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-primary">Lobby</p>
              <h2 className="mt-3 text-3xl font-black md:text-5xl">Choisissez votre rôle</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <button onClick={() => setStep("create")} className="group rounded-[2rem] border border-white/15 bg-black/50 p-8 text-left shadow-2xl backdrop-blur-md transition hover:-translate-y-1 hover:border-primary/70">
                <Plus className="mb-6 h-12 w-12 text-primary" />
                <h3 className="text-2xl font-black">Create a game</h3>
                <p className="mt-3 text-white/70">Générez un code et un QR code pendant 30 secondes pour inviter les joueurs.</p>
              </button>
              <button onClick={() => setStep("join")} className="group rounded-[2rem] border border-white/15 bg-black/50 p-8 text-left shadow-2xl backdrop-blur-md transition hover:-translate-y-1 hover:border-primary/70">
                <LogIn className="mb-6 h-12 w-12 text-primary" />
                <h3 className="text-2xl font-black">Join a game</h3>
                <p className="mt-3 text-white/70">Scannez le QR code ou entrez le code fourni par l'organisateur.</p>
              </button>
            </div>
          </section>
        )}

        {step === "create" && (
          <section className="w-full max-w-5xl rounded-[2rem] border border-white/15 bg-black/50 p-6 shadow-2xl backdrop-blur-md md:p-10">
            <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
              <div className="mx-auto"><QrPattern code={lobbyCode} /></div>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Create a game</p>
                <h2 className="mt-3 text-3xl font-black md:text-5xl">Invitez les joueurs</h2>
                <div className="mt-6 inline-flex rounded-2xl border border-white/20 bg-white/10 px-7 py-4 text-4xl font-black tracking-[0.25em] md:text-5xl">{lobbyCode}</div>
                <p className="mt-5 text-white/75">Ce code reste actif pendant <span className="font-bold text-primary">{timeLeft}s</span>. Vous pouvez générer un nouveau code ou terminer quand tout le monde est prêt.</p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <button onClick={renewLobby} className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 font-bold transition hover:bg-white/20">
                    <RefreshCw className="h-5 w-5" /> Nouveau code
                  </button>
                  <button onClick={() => setStep("cards")} className="inline-flex items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 font-bold text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105">
                    <Check className="h-5 w-5" /> Finish
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {step === "join" && (
          <section className="w-full max-w-3xl rounded-[2rem] border border-white/15 bg-black/50 p-6 text-center shadow-2xl backdrop-blur-md md:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-primary">Join a game</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">Rejoindre une partie</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <button onClick={() => setStep("waiting")} className="rounded-3xl border border-white/15 bg-white/10 p-7 transition hover:bg-white/20">
                <ScanLine className="mx-auto mb-4 h-12 w-12 text-primary" />
                <span className="text-xl font-black">Scan QR code</span>
              </button>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-7">
                <QrCode className="mx-auto mb-4 h-12 w-12 text-primary" />
                <input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="CODE" className="mb-4 w-full rounded-2xl border border-white/15 bg-black/40 px-5 py-4 text-center text-2xl font-black tracking-[0.25em] outline-none focus:border-primary" />
                <button onClick={() => setStep("waiting")} disabled={!joinCode.trim()} className="w-full rounded-2xl bg-primary px-5 py-4 font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40">Join</button>
              </div>
            </div>
          </section>
        )}

        {step === "waiting" && (
          <section className="w-full max-w-xl rounded-[2rem] border border-white/15 bg-black/50 p-8 text-center shadow-2xl backdrop-blur-md md:p-12">
            <Users className="mx-auto mb-6 h-16 w-16 text-primary" />
            <h2 className="text-3xl font-black md:text-5xl">En attente</h2>
            <p className="mt-5 text-white/75">Vous devez attendre que l'organisateur ait terminé la préparation avant de pouvoir jouer.</p>
            <button onClick={() => setStep("mode")} className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 font-bold transition hover:bg-white/20">
              <DoorOpen className="h-5 w-5" /> Retour
            </button>
          </section>
        )}

        {step === "cards" && (
          <section className="w-full max-w-6xl">
            <div className="mb-7 text-center md:mb-10">
              <p className="text-sm font-bold uppercase tracking-[0.35em] text-primary">Cards</p>
              <h2 className="mt-3 text-3xl font-black md:text-5xl">Choisissez une carte</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((card) => (
                <article key={card.title} className="overflow-hidden rounded-[1.75rem] border border-white/15 bg-black/55 shadow-2xl backdrop-blur-md transition hover:-translate-y-1 hover:border-primary/70">
                  <div className="relative aspect-[4/5]">
                    <Image src={card.image} alt={card.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-black">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/70">{card.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
