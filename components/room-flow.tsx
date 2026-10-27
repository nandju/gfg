"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import QRCode from "react-qr-code"
import { ArrowLeft, Check, Copy, Crown, Link2, Loader2, LogIn, Play, Plus, Users, Wifi, WifiOff } from "lucide-react"
import type { UseGameRoomReturn } from "@/hooks/use-game-room"

export type RoomFlowAccent = "emerald" | "amber" | "red"

type View = "select" | "create" | "join" | "lobby"

const accents: Record<RoomFlowAccent, { text: string; button: string; border: string; chip: string; focus: string }> = {
  emerald: {
    text: "text-emerald-300",
    button: "bg-emerald-300 text-slate-950 hover:bg-emerald-200",
    border: "border-emerald-300/40",
    chip: "border-emerald-300/30 bg-emerald-500/10 text-emerald-100",
    focus: "focus:border-emerald-300"
  },
  amber: {
    text: "text-amber-200",
    button: "bg-amber-100 text-stone-950 hover:bg-amber-200",
    border: "border-amber-200/40",
    chip: "border-amber-200/30 bg-amber-950/30 text-amber-100",
    focus: "focus:border-amber-200"
  },
  red: {
    text: "text-red-300",
    button: "bg-red-200 text-zinc-950 hover:bg-red-300",
    border: "border-red-300/40",
    chip: "border-red-300/30 bg-red-950/30 text-red-100",
    focus: "focus:border-red-300"
  }
}

type RoomFlowProps = {
  room: UseGameRoomReturn
  gameSlug: string
  gameTitle: string
  accent: RoomFlowAccent
  minPlayers?: number
  startScreen: string
  initialView?: Exclude<View, "lobby">
  initialJoinCode?: string
  onEnterGame: () => void
  onBack: () => void
}

function mapJoinError(message: string): string {
  if (message.includes("introuvable")) return "Code invalide ou partie inexistante."
  if (message.includes("verrouillée")) return "Cette partie est verrouillée."
  if (message.includes("ended") || message.includes("terminée")) return "Cette partie est terminée."
  return "Impossible de rejoindre la partie. Réessayez."
}

export function RoomFlow({ room, gameSlug, gameTitle, accent, minPlayers = 2, startScreen, initialView = "select", initialJoinCode = "", onEnterGame, onBack }: RoomFlowProps) {
  const a = accents[accent]
  const [view, setView] = useState<View>(initialView)
  const [joinCode, setJoinCode] = useState(initialJoinCode)
  const [nameDraft, setNameDraft] = useState(room.playerName)
  const [formError, setFormError] = useState<string | null>(null)
  const [copied, setCopied] = useState<"code" | "link" | null>(null)
  const [feed, setFeed] = useState<string[]>([])
  const prevPlayerIds = useRef<Set<string>>(new Set())
  const enteredRef = useRef(false)

  const code = room.room?.code ?? ""
  const shareUrl = useMemo(() => {
    if (!code || typeof window === "undefined") return ""
    return `${window.location.origin}/games/${gameSlug}/play?join=${encodeURIComponent(code)}`
  }, [code, gameSlug])

  const connectedPlayers = useMemo(() => room.players.filter((p) => p.connected !== false), [room.players])
  const canStart = connectedPlayers.length >= minPlayers

  // Keep a small arrival/departure feed from realtime player changes
  useEffect(() => {
    if (view !== "lobby") return
    const current = new Set(room.players.map((p) => p.id))
    const previous = prevPlayerIds.current
    const messages: string[] = []
    room.players.forEach((p) => {
      if (!previous.has(p.id) && p.player_id !== room.playerId) messages.push(`${p.player_name} a rejoint le salon`)
    })
    previous.forEach((id) => {
      if (!current.has(id)) {
        const left = room.players.find((p) => p.id === id)
        if (left) messages.push(`${left.player_name} a quitté le salon`)
      }
    })
    prevPlayerIds.current = current
    if (messages.length) setFeed((f) => [...messages, ...f].slice(0, 3))
  }, [room.players, view])

  // Reset the "already entered" guard each time we (re)enter a lobby
  useEffect(() => {
    if (view === "lobby") enteredRef.current = false
  }, [view])

  // Guests advance when the host starts the game
  useEffect(() => {
    if (view !== "lobby" || room.isHost || enteredRef.current) return
    const started = room.room?.status === "playing" || room.room?.current_screen === startScreen
    if (started) {
      enteredRef.current = true
      onEnterGame()
    }
  }, [view, room.isHost, room.room?.status, room.room?.current_screen, startScreen, onEnterGame])

  const confirmName = () => {
    const name = nameDraft.trim()
    if (name) room.setPlayerName(name)
    return name
  }

  const handleCreate = async () => {
    if (!confirmName()) { setFormError("Choisissez un pseudo pour continuer."); return }
    setFormError(null)
    const created = await room.createRoom({ started: false })
    if (created) {
      prevPlayerIds.current = new Set()
      setView("lobby")
    } else {
      setFormError(room.error ?? "Création impossible. Réessayez.")
    }
  }

  const handleJoin = async () => {
    if (!confirmName()) { setFormError("Choisissez un pseudo pour continuer."); return }
    if (!joinCode.trim()) { setFormError("Entrez le code de la partie."); return }
    setFormError(null)
    const joined = await room.joinRoom(joinCode.trim())
    if (joined) {
      prevPlayerIds.current = new Set()
      setView("lobby")
    } else {
      setFormError(mapJoinError(room.error ?? ""))
    }
  }

  const handleStart = async () => {
    if (!canStart) return
    await room.pushState({ status: "playing", current_screen: startScreen })
    enteredRef.current = true
    onEnterGame()
  }

  const handleLeave = async () => {
    await room.leaveRoom()
    setView("select")
  }

  const copy = async (kind: "code" | "link") => {
    const text = kind === "code" ? code : shareUrl
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const el = document.createElement("textarea")
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      el.remove()
    }
    setCopied(kind)
    window.setTimeout(() => setCopied(null), 2000)
  }

  const busy = room.status === "creating" || room.status === "joining"

  return (
    <div className="mx-auto max-w-4xl">
      <button onClick={view === "lobby" ? handleLeave : view === "select" ? onBack : () => setView("select")} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm font-bold backdrop-blur-xl transition hover:bg-white/10">
        <ArrowLeft className="h-4 w-4" /> {view === "lobby" ? "Quitter le salon" : "Retour"}
      </button>

      <div className="mb-6 flex items-center justify-center gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.2em] ${room.enabled ? a.chip : "border-white/15 bg-white/5 text-white/60"}`}>
          {room.enabled ? <><Wifi className="h-3.5 w-3.5" /> En ligne</> : <><WifiOff className="h-3.5 w-3.5" /> Mode local</>}
        </span>
        <span className="rounded-full border border-white/10 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white/60 backdrop-blur-xl">{gameTitle}</span>
      </div>

      {!room.enabled && (
        <div className="mx-auto mb-6 max-w-2xl rounded-[1.5rem] border border-white/10 bg-black/45 p-5 text-center backdrop-blur-xl">
          <p className="text-sm leading-6 text-white/70">Le jeu en ligne entre appareils n'est pas encore activé sur cette plateforme. Vous pouvez déjà jouer en face-à-face sur le même appareil.</p>
        </div>
      )}

      {view === "select" && (
        <section>
          <div className="mb-8 text-center">
            <p className={`text-xs font-black uppercase tracking-[0.35em] ${a.text}`}>Salon</p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">Créez ou rejoignez une partie</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <button onClick={() => room.enabled ? setView("create") : onEnterGame()} className="group rounded-[2rem] border border-white/10 bg-black/45 p-7 text-left backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/25">
              <Plus className={`mb-5 h-11 w-11 ${a.text}`} />
              <h3 className="text-2xl font-black">Créer une partie</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">{room.enabled ? "Obtenez un code et un QR à partager avec les autres joueurs." : "Lancez une partie en face-à-face sur cet appareil."}</p>
            </button>
            <button onClick={() => setView("join")} className="group rounded-[2rem] border border-white/10 bg-black/45 p-7 text-left backdrop-blur-xl transition hover:-translate-y-1">
              <LogIn className={`mb-5 h-11 w-11 ${a.text}`} />
              <h3 className="text-2xl font-black">Rejoindre une partie</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">{room.enabled ? "Saisissez le code ou ouvrez le lien reçu de l'organisateur." : "Nécessite le jeu en ligne — bientôt disponible."}</p>
            </button>
          </div>
        </section>
      )}

      {view === "create" && (
        <section className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-black/45 p-6 text-center backdrop-blur-xl md:p-10">
          <p className={`text-xs font-black uppercase tracking-[0.35em] ${a.text}`}>Créer une partie</p>
          <h2 className="mt-3 text-3xl font-black md:text-4xl">Votre pseudo</h2>
          <p className="mt-3 text-sm text-white/60">C'est le nom que les autres joueurs verront dans le salon.</p>
          <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={24} placeholder="Votre pseudo" className={`mt-6 w-full rounded-2xl border border-white/15 bg-black/50 px-5 py-4 text-center text-xl font-black outline-none ${a.focus}`} />
          {formError && <p className="mt-4 rounded-xl border border-red-300/30 bg-red-950/30 px-4 py-3 text-sm font-bold text-red-200">{formError}</p>}
          {room.error && !formError && <p className="mt-4 rounded-xl border border-red-300/30 bg-red-950/30 px-4 py-3 text-sm font-bold text-red-200">{room.error}</p>}
          <button onClick={handleCreate} disabled={busy} className={`mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-lg font-black transition disabled:opacity-40 ${a.button}`}>
            {busy ? <><Loader2 className="h-5 w-5 animate-spin" /> Création du salon…</> : <><Plus className="h-5 w-5" /> Créer le salon</>}
          </button>
        </section>
      )}

      {view === "join" && (
        <section className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-black/45 p-6 text-center backdrop-blur-xl md:p-10">
          <p className={`text-xs font-black uppercase tracking-[0.35em] ${a.text}`}>Rejoindre une partie</p>
          <h2 className="mt-3 text-3xl font-black md:text-4xl">Code + pseudo</h2>
          <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={12} placeholder="XX-000" className={`mt-6 w-full rounded-2xl border border-white/15 bg-black/50 px-5 py-4 text-center text-2xl font-black tracking-[0.2em] outline-none ${a.focus}`} />
          <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} maxLength={24} placeholder="Votre pseudo" className={`mt-3 w-full rounded-2xl border border-white/15 bg-black/50 px-5 py-4 text-center text-xl font-black outline-none ${a.focus}`} />
          {formError && <p className="mt-4 rounded-xl border border-red-300/30 bg-red-950/30 px-4 py-3 text-sm font-bold text-red-200">{formError}</p>}
          {!room.enabled && <p className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">Le jeu en ligne n'est pas encore activé : la jonction par code sera disponible dès que le serveur temps réel sera configuré.</p>}
          <button onClick={handleJoin} disabled={busy || !room.enabled || !joinCode.trim() || !nameDraft.trim()} className={`mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-lg font-black transition disabled:opacity-40 ${a.button}`}>
            {busy ? <><Loader2 className="h-5 w-5 animate-spin" /> Connexion…</> : <><LogIn className="h-5 w-5" /> Rejoindre</>}
          </button>
        </section>
      )}

      {view === "lobby" && room.room && (
        <section className="rounded-[2rem] border border-white/10 bg-black/45 p-6 backdrop-blur-xl md:p-10">
          <div className="grid items-start gap-8 md:grid-cols-[auto_1fr]">
            <div className="mx-auto">
              <div className="rounded-[1.5rem] bg-white p-4 shadow-2xl">
                {shareUrl && <QRCode value={shareUrl} size={180} />}
              </div>
              <p className="mt-3 text-center text-xs text-white/50">Scannez pour rejoindre</p>
            </div>
            <div>
              <p className={`text-xs font-black uppercase tracking-[0.3em] ${a.text}`}>Salon · {gameTitle}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-4xl font-black tracking-[0.2em] md:text-5xl">{code}</div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => copy("code")} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/15">
                  {copied === "code" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied === "code" ? "Copié !" : "Copier le code"}
                </button>
                <button onClick={() => copy("link")} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/15">
                  {copied === "link" ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />} {copied === "link" ? "Lien copié !" : "Copier le lien"}
                </button>
              </div>

              <div className="mt-6">
                <p className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-white/50"><Users className="h-4 w-4" /> Joueurs · {connectedPlayers.length}/{room.room.max_players}</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {room.players.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${p.connected !== false ? "bg-emerald-400" : "bg-white/30"}`} />
                      <span className="flex-1 truncate font-bold">{p.player_name}{p.player_id === room.playerId && " (vous)"}</span>
                      {p.role === "host" && <Crown className={`h-4 w-4 ${a.text}`} />}
                    </li>
                  ))}
                </ul>
                {feed.length > 0 && <div className="mt-3 space-y-1">{feed.map((m, i) => <p key={`${m}-${i}`} className="text-xs text-white/50">{m}</p>)}</div>}
              </div>

              {room.isHost ? (
                <div className="mt-6">
                  <button onClick={handleStart} disabled={!canStart} className={`inline-flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-lg font-black transition disabled:opacity-40 sm:w-auto ${a.button}`}>
                    <Play className="h-5 w-5" /> Démarrer la partie
                  </button>
                  {!canStart && <p className="mt-3 text-sm text-white/50">En attente de {minPlayers - connectedPlayers.length} joueur(s) supplémentaire(s)…</p>}
                </div>
              ) : (
                <p className="mt-6 flex items-center gap-3 text-sm text-white/60"><Loader2 className={`h-4 w-4 animate-spin ${a.text}`} /> En attente du démarrage par l'organisateur…</p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
