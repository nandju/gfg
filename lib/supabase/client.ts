"use client"

import { createClient, SupabaseClient } from "@supabase/supabase-js"

let browserClient: SupabaseClient | null = null

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null
  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  browserClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { params: { eventsPerSecond: 10 } }
  })
  return browserClient
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
