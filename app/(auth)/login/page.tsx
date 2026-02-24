'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginInput } from '@/lib/validations'
import AuthLeftPanel from '@/components/auth/AuthLeftPanel'
import GoogleButton from '@/components/auth/GoogleButton'

export default function LoginPage() {
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
    // Pakai window.location agar session state ter-refresh penuh
    window.location.href = '/dashboard'
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="flex w-full min-h-screen">
      <AuthLeftPanel variant="login" />

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#0a0d14]">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
              <Store className="w-4 h-4 text-[#0a0d14]" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-black text-white">Toko<span className="text-green-400">Ku</span></span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-white mb-1">Masuk ke akun</h2>
            <p className="text-[#64748b] text-sm">
              Belum punya akun?{' '}
              <Link href="/register" className="text-green-400 font-semibold hover:text-green-300 transition-colors">
                Daftar gratis
              </Link>
            </p>
          </div>

          <GoogleButton loading={googleLoading} onClick={handleGoogle} label="Masuk dengan Google" />

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#2a3045]" />
            <span className="text-[#3a4560] text-xs">atau</span>
            <div className="flex-1 h-px bg-[#2a3045]" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Email</label>
              <input {...register('email')} type="email" placeholder="toko@email.com" autoComplete="email"
                className={`w-full px-4 py-3 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${
                  errors.email ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'
                }`} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${
                    errors.password ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'
                  }`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors">
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