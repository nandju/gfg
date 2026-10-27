"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogIn } from "lucide-react"

type JoinCodeFormProps = {
  slug: string
  accentClass: string
  buttonClass: string
}

export function JoinCodeForm({ slug, accentClass, buttonClass }: JoinCodeFormProps) {
  const router = useRouter()
  const [code, setCode] = useState("")

  const submit = () => {
    const clean = code.trim().toUpperCase()
    if (!clean) return
    router.push(`/games/${slug}/play?join=${encodeURIComponent(clean)}`)
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          maxLength={12}
          placeholder="CODE DE SALON"
          className={`w-full flex-1 rounded-2xl border border-white/15 bg-black/50 px-5 py-4 text-center text-lg font-black tracking-[0.2em] text-white outline-none sm:text-left ${accentClass}`}
        />
        <button onClick={submit} disabled={!code.trim()} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 font-black transition disabled:opacity-40 ${buttonClass}`}>
          <LogIn className="h-5 w-5" /> Rejoindre
        </button>
      </div>
      <p className="mt-3 text-xs text-white/40">Vous avez reçu un code ? Saisissez-le pour entrer directement dans le salon.</p>
    </div>
  )
}
