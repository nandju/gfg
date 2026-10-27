"use client"

import { LogIn } from "lucide-react"
import { PlayerNameField } from "@/components/player-name-field"

export type JoinRoomPanelProps = {
  code: string
  onCodeChange: (code: string) => void
  playerName: string
  onNameChange: (name: string) => void
  joining: boolean
  error: string | null
  onJoin: () => void
  accentButton?: string
  accentBorder?: string
  title?: string
  subtitle?: string
}

export function JoinRoomPanel({ code, onCodeChange, playerName, onNameChange, joining, error, onJoin, accentButton = "bg-red-500 text-white hover:bg-red-400", accentBorder = "border-white/15 focus:border-red-400", title = "Rejoindre une partie", subtitle }: JoinRoomPanelProps) {
  const submit = () => { if (!joining && code.trim().length >= 2) onJoin() }
  return (
    <div className="mx-auto w-full max-w-md rounded-[1.75rem] border border-white/10 bg-black/45 p-6 backdrop-blur-xl md:p-8">
      <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-white/50">{title}</p>
      {subtitle && <p className="mt-2 text-center text-sm text-white/60">{subtitle}</p>}
      <div className="mt-5">
        <PlayerNameField value={playerName} onChange={onNameChange} accent={accentBorder} />
      </div>
      <input
        value={code}
        onChange={(e) => onCodeChange(e.target.value.toUpperCase().slice(0, 20))}
        onKeyDown={(e) => { if (e.key === "Enter") submit() }}
        placeholder="CODE (ex. GL-A123)"
        className={`mt-3 w-full rounded-2xl border bg-black/50 px-5 py-4 text-center text-2xl font-black tracking-[0.2em] outline-none ${accentBorder}`}
        aria-label="Code de la partie"
        autoComplete="off"
      />
      {error && <p className="mt-3 rounded-xl border border-red-400/30 bg-red-950/40 px-4 py-3 text-center text-sm font-bold text-red-200">{error}</p>}
      <button
        onClick={submit}
        disabled={joining || code.trim().length < 2 || !playerName.trim()}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 font-black transition disabled:cursor-not-allowed disabled:opacity-40 ${accentButton}`}
      >
        <LogIn className="h-5 w-5" /> {joining ? "Connexion…" : "Rejoindre"}
      </button>
    </div>
  )
}
