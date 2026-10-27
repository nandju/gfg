"use client"

import { User } from "lucide-react"

export function PlayerNameField({ value, onChange, accent = "border-white/15 focus:border-red-400", className = "" }: {
  value: string
  onChange: (name: string) => void
  accent?: string
  className?: string
}) {
  return (
    <label className={`flex items-center gap-3 rounded-2xl border bg-black/40 px-4 py-3 ${accent} ${className}`}>
      <User className="h-5 w-5 shrink-0 text-white/60" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 20))}
        placeholder="Votre pseudo"
        maxLength={20}
        className="w-full bg-transparent text-base font-bold outline-none placeholder:text-white/35"
        aria-label="Pseudonyme"
      />
    </label>
  )
}
