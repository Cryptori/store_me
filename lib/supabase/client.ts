import { createBrowserClient } from '@supabase/ssr'

// Pakai 'any' sementara sampai generate types dari Supabase CLI
// Setelah generate, ganti dengan: import type { Database } from '@/types/database'
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}