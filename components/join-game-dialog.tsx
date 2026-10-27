"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { JoinRoomPanel } from "@/components/join-room-panel"
import { usePlayerIdentity } from "@/hooks/use-player-id"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { joinRoom as joinRoomService } from "@/services/game-room-service"
import { gameTypeToSlug } from "@/lib/game-routes"

export function JoinGameDialog({ open, onClose, initialCode = "" }: { open: boolean; onClose: () => void; initialCode?: string }) {
  const router = useRouter()
  const { playerName, setPlayerName } = usePlayerIdentity()
  const [code, setCode] = useState(initialCode)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const configured = isSupabaseConfigured()

  if (!open) return null

  const join = async () => {
    const client = getSupabaseBrowserClient()
    if (!client) { setError("Multijoueur indisponible : Supabase n'est pas configuré."); return }
    const { playerId } = readPlayerId()
    setJoining(true)
    setError(null)
    try {
      const { room } = await joinRoomService(client, {
        code,
        player_id: playerId,
        player_name: playerName.trim() || "Joueur"
      })
      onClose()
      router.push(`/games/${gameTypeToSlug[room.game_type]}?room=${encodeURIComponent(room.code)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de rejoindre la partie.")
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-12 right-0 rounded-full border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20" aria-label="Fermer">
          <X className="h-5 w-5" />
        </button>
        {configured ? (
          <JoinRoomPanel
            code={code}
            onCodeChange={setCode}
            playerName={playerName}
            onNameChange={setPlayerName}
            joining={joining}
            error={error}
            onJoin={join}
            subtitle="Entrez le code reçu de l'hôte."
          />
        ) : (
          <div className="rounded-[1.75rem] border border-white/10 bg-black/45 p-8 text-center backdrop-blur-xl">
            <p className="text-lg font-black">Multijoueur indisponible</p>
            <p className="mt-3 text-sm text-white/60">Supabase n'est pas configuré. Renseignez <code className="text-white/80">NEXT_PUBLIC_SUPABASE_URL</code> et <code className="text-white/80">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function readPlayerId(): { playerId: string } {
  if (typeof window === "undefined") return { playerId: "" }
  try {
    const raw = window.localStorage.getItem("gfg:player")
    const parsed = raw ? (JSON.parse(raw) as { id?: string }) : null
    if (parsed?.id) return { playerId: parsed.id }
    const id = crypto.randomUUID()
    window.localStorage.setItem("gfg:player", JSON.stringify({ id, name: "" }))
    return { playerId: id }
  } catch {
    return { playerId: `p_${Date.now()}` }
  }
}
