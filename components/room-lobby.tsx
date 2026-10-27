"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, Copy, Crown, Link2, Play, Users, Wifi, WifiOff } from "lucide-react"
import { RealQrCode } from "@/components/real-qr-code"
import { PlayerNameField } from "@/components/player-name-field"
import { roomUrl } from "@/lib/game-routes"
import type { GameRoomRow, RoomPlayerRow } from "@/types/multiplayer"

export type LobbyAccent = {
  button: string
  text: string
  border: string
  chip: string
}

export const redAccent: LobbyAccent = {
  button: "bg-red-500 text-white hover:bg-red-400",
  text: "text-red-300",
  border: "border-red-400/40",
  chip: "bg-red-500/15 text-red-200 border-red-400/30"
}

export const emeraldAccent: LobbyAccent = {
  button: "bg-emerald-300 text-slate-950 hover:bg-emerald-200",
  text: "text-emerald-300",
  border: "border-emerald-300/40",
  chip: "bg-emerald-500/15 text-emerald-200 border-emerald-300/30"
}

export const amberAccent: LobbyAccent = {
  button: "bg-amber-300 text-zinc-950 hover:bg-amber-200",
  text: "text-amber-300",
  border: "border-amber-300/40",
  chip: "bg-amber-500/15 text-amber-200 border-amber-300/30"
}

export type RoomLobbyProps = {
  room: GameRoomRow
  players: RoomPlayerRow[]
  playerId: string
  playerName: string
  isHost: boolean
  gameTitle: string
  accent?: LobbyAccent
  minPlayers?: number
  startLabel?: string
  onRename: (name: string) => void
  onStart: () => void
  onLeave: () => void
  onPlayerJoined?: (name: string) => void
  onPlayerLeft?: (name: string) => void
}

export function RoomLobby({ room, players, playerId, playerName, isHost, gameTitle, accent = redAccent, minPlayers = 2, startLabel = "Lancer la partie", onRename, onStart, onLeave, onPlayerJoined, onPlayerLeft }: RoomLobbyProps) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const prevNamesRef = useRef<Set<string> | null>(null)

  const connected = useMemo(() => players.filter((p) => p.connected), [players])
  const shareLink = useMemo(() => {
    if (typeof window === "undefined") return ""
    return roomUrl(window.location.origin, room.game_type, room.code)
  }, [room.game_type, room.code])

  // Arrival / departure notices driven by the realtime players list.
  useEffect(() => {
    const current = new Map(connected.map((p) => [p.id, p.player_name]))
    const prev = prevNamesRef.current
    if (prev !== null) {
      for (const [id, name] of current) {
        if (!prev.has(id)) {
          setNotice(`${name} a rejoint la partie`)
          onPlayerJoined?.(name)
        }
      }
      const prevIds = new Set(prev.keys())
      for (const [id] of prevIds) {
        void id
      }
    }
    // Detect departures: players that were connected before but no longer are.
    if (prev !== null) {
      for (const p of players) {
        if (prev.has(p.id) && !p.connected) {
          setNotice(`${p.player_name} a quitté la partie`)
          onPlayerLeft?.(p.player_name)
        }
      }
    }
    prevNamesRef.current = new Set(connected.map((p) => p.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, connected])

  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(() => setNotice(null), 4000)
    return () => window.clearTimeout(t)
  }, [notice])

  const copy = async (text: string, kind: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      window.setTimeout(() => setCopied(null), 1600)
    } catch {
      // clipboard may be unavailable (non-secure context) — selection fallback below
    }
  }

  const share = async () => {
    const text = `Rejoins ma partie ${gameTitle} : ${room.code}\n${shareLink}`
    if (navigator.share) {
      try { await navigator.share({ title: gameTitle, text, url: shareLink }); return } catch { /* cancelled */ }
    }
    await copy(shareLink, "link")
  }

  const enoughPlayers = connected.length >= minPlayers

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6 text-center">
        <p className={`text-xs font-black uppercase tracking-[0.35em] ${accent.text}`}>Lobby</p>
        <h1 className="mt-2 text-3xl font-black md:text-5xl">{gameTitle}</h1>
      </div>

      <div className="grid gap-5 md:grid-cols-[auto_1fr]">
        <div className="mx-auto flex flex-col items-center gap-3">
          <RealQrCode value={shareLink} size={220} />
          <p className="text-xs text-white/50">Scannez pour rejoindre</p>
        </div>

        <section className="rounded-[1.75rem] border border-white/10 bg-black/45 p-5 backdrop-blur-xl md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-white/50">Code de la partie</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-3xl font-black tracking-[0.18em] md:text-4xl">{room.code}</span>
            <button onClick={() => copy(room.code, "code")} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/20" aria-label="Copier le code">
              {copied === "code" ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              {copied === "code" ? "Copié" : "Copier"}
            </button>
            <button onClick={share} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold transition hover:bg-white/20" aria-label="Partager le lien">
              {copied === "link" ? <Check className="h-4 w-4 text-emerald-300" /> : <Link2 className="h-4 w-4" />}
              {copied === "link" ? "Lien copié" : "Partager"}
            </button>
          </div>

          <div className="mt-5">
            <PlayerNameField value={playerName} onChange={onRename} accent={accent.border} />
          </div>

          <div className="mt-6">
            <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.3em] text-white/50">
              <Users className="h-4 w-4" /> Joueurs connectés ({connected.length})
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {players.map((p) => (
                <li key={p.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-bold ${p.connected ? "border-white/10 bg-white/5" : "border-white/5 bg-white/[0.02] text-white/40"}`}>
                  {p.connected ? <Wifi className="h-4 w-4 shrink-0 text-emerald-300" /> : <WifiOff className="h-4 w-4 shrink-0 text-white/30" />}
                  <span className="flex-1 truncate">{p.player_name}{p.player_id === playerId ? " (vous)" : ""}</span>
                  {p.role === "host" && <Crown className="h-4 w-4 shrink-0 text-amber-300" aria-label="Hôte" />}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {isHost ? (
              <button onClick={onStart} disabled={!enoughPlayers} className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-6 py-4 font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${accent.button}`}>
                <Play className="h-5 w-5" /> {startLabel}
              </button>
            ) : (
              <div className={`flex-1 rounded-2xl border px-5 py-4 text-center text-sm font-bold ${accent.chip}`}>
                En attente du démarrage par l'hôte…
              </div>
            )}
            <button onClick={onLeave} className="rounded-2xl border border-white/15 px-6 py-4 font-bold transition hover:bg-white/10">Quitter</button>
          </div>
          {isHost && !enoughPlayers && (
            <p className="mt-3 text-center text-xs text-white/50">Il faut au moins {minPlayers} joueurs connectés pour commencer.</p>
          )}
        </section>
      </div>

      {notice && (
        <div className={`fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-in slide-in-from-bottom-4 rounded-full border px-5 py-2.5 text-sm font-bold shadow-2xl backdrop-blur-xl ${accent.chip}`}>
          {notice}
        </div>
      )}
    </div>
  )
}
