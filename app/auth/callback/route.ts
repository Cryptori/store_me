import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Daftar path yang diizinkan untuk redirect setelah login
const ALLOWED_PATHS = ['/dashboard', '/kasir', '/produk', '/stok', '/pelanggan', '/hutang', '/laporan', '/pengaturan', '/upgrade', '/onboarding']

function isSafePath(next: string): boolean {
  // Hanya izinkan relative path (tidak boleh ada domain lain)
  if (!next.startsWith('/')) return false
  // Tidak boleh ada double slash (//evil.com)
  if (next.startsWith('//')) return false
  // Cek apakah path diawali dengan salah satu allowed path
  return ALLOWED_PATHS.some(p => next === p || next.startsWith(p + '/') || next.startsWith(p + '?'))
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next') ?? '/dashboard'

  // Validasi next param untuk mencegah open redirect
  const next = isSafePath(nextParam) ? nextParam : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Cek apakah user sudah punya store
      const { data: store } = await (supabase as any)
        .from('stores')
        .select('id')
        .eq('user_id', data.user.id)
        .single()

      // Kalau belum punya store (Google OAuth pertama kali), arahkan ke onboarding
      if (!store) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}