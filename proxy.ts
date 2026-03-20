import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Halaman yang bisa diakses tanpa login
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/onboarding',       // user baru setelah OAuth belum punya store
  '/join',             // kasir accept invite link
  '/offline',          // PWA offline page
]

// Prefix yang selalu publik (API internal, static files)
const PUBLIC_PREFIXES = [
  '/api/auth/',        // Supabase auth callback
  '/api/payment/webhook', // Midtrans webhook (server-to-server)
  '/api/cron/',        // Vercel cron jobs
  '/api/push/',        // Web push (bisa dari service worker)
  '/_next/',
  '/icons/',
  '/screenshots/',
  '/splash/',
  '/.well-known/',     // Chrome DevTools & browser internals
]

// File statis publik di root /public
const PUBLIC_FILES = [
  '/manifest.json',
  '/sw.js',
  '/robots.txt',
  '/sitemap.xml',
  '/favicon.ico',
]

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Cek apakah route ini publik
  const isPublic =
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_FILES.includes(pathname) ||
    PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix)) ||
    pathname.startsWith('/join') // /join?token=xxx

  // Cek apakah halaman auth (login/register)
  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')

  // Belum login & bukan halaman publik → redirect ke login
  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Simpan redirect target agar setelah login bisa langsung ke halaman yg dituju
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Sudah login & buka halaman auth → redirect ke dashboard
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Sudah login & buka /pilih-toko — biarkan lewat (multi-toko)
  // Tidak perlu redirect apapun

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|json|js)$).*)',
  ],
}