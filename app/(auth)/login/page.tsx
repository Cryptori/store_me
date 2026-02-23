'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginInput } from '@/lib/validations'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setLoading(true)
    setServerError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setServerError('Email atau password salah')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f1117] border-r border-[#1e2333] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #4ade80 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
              <Store className="w-5 h-5 text-[#0a0d14]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black text-white tracking-tight">Toko<span className="text-green-400">Ku</span></span>
          </div>
          <div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Kelola toko,<br />
              <span className="text-green-400">stok & hutang</span><br />
              dari satu tempat.
            </h1>
            <p className="text-[#64748b] text-base leading-relaxed">
              Aplikasi kasir simpel untuk toko kecil Indonesia. Gratis untuk mulai, tanpa ribet.
            </p>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { num: '2.400+', label: 'Toko aktif' },
            { num: 'Rp 0', label: 'Untuk mulai' },
            { num: '5 menit', label: 'Setup awal' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
              <div className="text-green-400 font-black text-lg font-mono">{stat.num}</div>
              <div className="text-[#64748b] text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#0a0d14]">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
              <Store className="w-4 h-4 text-[#0a0d14]" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-black text-white">Toko<span className="text-green-400">Ku</span></span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-white mb-1">Masuk ke akun</h2>
            <p className="text-[#64748b] text-sm">Belum punya akun?{' '}
              <Link href="/register" className="text-green-400 font-semibold hover:text-green-300 transition-colors">Daftar gratis</Link>
            </p>
          </div>

          {/* Google Login */}
          <button onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-[#181c27] border border-[#2a3045] hover:border-[#3a4560] text-white text-sm font-semibold transition-all disabled:opacity-50 mb-4">
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Masuk dengan Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#2a3045]" />
            <span className="text-[#3a4560] text-xs">atau</span>
            <div className="flex-1 h-px bg-[#2a3045]" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Email</label>
              <input {...register('email')} type="email" placeholder="toko@email.com" autoComplete="email"
                className={`w-full px-4 py-3 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm transition-all outline-none focus:ring-2 focus:ring-green-500/40 ${errors.email ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'}`} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm transition-all outline-none focus:ring-2 focus:ring-green-500/40 ${errors.password ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{serverError}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-green-400 hover:bg-green-300 text-[#0a0d14] font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Masuk...</> : 'Masuk →'}
            </button>
          </form>

          <p className="text-center text-[#3a4560] text-xs mt-8">
            Dengan masuk, kamu setuju dengan{' '}
            <span className="text-[#64748b] cursor-pointer hover:text-white transition-colors">Syarat & Ketentuan</span>
          </p>
        </div>
      </div>
    </div>
  )
}