'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Store, Check, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterInput } from '@/lib/validations'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as any,
  })

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

  async function onSubmit(data: RegisterInput) {
    setLoading(true)
    setServerError('')
    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { nama_toko: data.namaToko } }
    })

    if (authError || !authData.user) {
      setServerError(
        authError?.message?.includes('already registered') || authError?.message?.includes('already been registered')
          ? 'Email sudah terdaftar, silakan login'
          : 'Gagal membuat akun, coba lagi'
      )
      setLoading(false)
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError) {
      setSentEmail(data.email)
      setEmailSent(true)
      setLoading(false)
      return
    }

    const db = supabase as any
    await db.from('stores').insert({ user_id: authData.user.id, nama: data.namaToko })
    router.push('/dashboard')
    router.refresh()
  }

  const fiturGratis = ['50 produk gratis', 'Kasir & transaksi harian', 'Kelola hutang pelanggan', 'Laporan harian otomatis']

  if (emailSent) return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-6">
      <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 rounded-full bg-green-400/20 border-2 border-green-400/30 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Cek Email Kamu!</h2>
        <p className="text-[#64748b] text-sm mb-2">Kami kirim link verifikasi ke:</p>
        <p className="text-white font-semibold text-sm mb-6 font-mono">{sentEmail}</p>
        <p className="text-[#64748b] text-xs mb-6">Klik link di email untuk mengaktifkan akun, lalu login. Cek folder spam jika tidak ada.</p>
        <Link href="/login" className="block w-full py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
          Ke Halaman Login →
        </Link>
        <button onClick={() => { setEmailSent(false); setServerError('') }} className="mt-3 text-xs text-[#64748b] hover:text-white transition-colors">
          ← Kembali ke form
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex w-full min-h-screen">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f1117] border-r border-[#1e2333] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #4ade80 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
              <Store className="w-5 h-5 text-[#0a0d14]" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black text-white tracking-tight">Toko<span className="text-green-400">Ku</span></span>
          </div>
          <div className="mb-10">
            <div className="inline-block bg-green-400/10 border border-green-400/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-green-400 text-xs font-bold uppercase tracking-wide">Gratis untuk mulai</span>
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Mulai kelola<br />toko lo <span className="text-green-400">hari ini.</span>
            </h1>
            <p className="text-[#64748b] text-sm leading-relaxed">Setup 5 menit, langsung bisa pakai. Tidak perlu kartu kredit.</p>
          </div>
          <div className="space-y-3">
            {fiturGratis.map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-400/20 border border-green-400/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-400" strokeWidth={3} />
                </div>
                <span className="text-[#94a3b8] text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 bg-[#181c27] border border-[#2a3045] rounded-xl p-5">
          <p className="text-[#94a3b8] text-sm italic mb-3">"TokoKu bantu saya catat hutang pelanggan yang biasa lupa. Sekarang gak ada yang lolos!"</p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-xs font-black text-[#0a0d14]">S</div>
            <div>
              <div className="text-white text-xs font-semibold">Ibu Sari</div>
              <div className="text-[#64748b] text-xs">Warung Sembako, Surabaya</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#0a0d14] overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
              <Store className="w-4 h-4 text-[#0a0d14]" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-black text-white">Toko<span className="text-green-400">Ku</span></span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-white mb-1">Buat akun gratis</h2>
            <p className="text-[#64748b] text-sm">Sudah punya akun?{' '}
              <Link href="/login" className="text-green-400 font-semibold hover:text-green-300 transition-colors">Masuk</Link>
            </p>
          </div>

          {/* Google Register */}
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
            Daftar dengan Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#2a3045]" />
            <span className="text-[#3a4560] text-xs">atau daftar dengan email</span>
            <div className="flex-1 h-px bg-[#2a3045]" />
          </div>

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Nama Toko</label>
              <input {...register('namaToko')} type="text" placeholder="Warung Berkah Jaya"
                className={`w-full px-4 py-3 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${errors.namaToko ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'}`} />
              {errors.namaToko && <p className="text-red-400 text-xs mt-1">{errors.namaToko.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Email</label>
              <input {...register('email')} type="email" placeholder="toko@email.com" autoComplete="email"
                className={`w-full px-4 py-3 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${errors.email ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'}`} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Minimal 6 karakter" autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${errors.password ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Konfirmasi Password</label>
              <div className="relative">
                <input {...register('confirmPassword')} type={showConfirm ? 'text' : 'password'} placeholder="Ulangi password" autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${errors.confirmPassword ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'}`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {serverError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{serverError}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-green-400 hover:bg-green-300 text-[#0a0d14] font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat akun...</> : 'Daftar Gratis →'}
            </button>
          </form>

          <p className="text-center text-[#3a4560] text-xs mt-8">
            Dengan mendaftar, kamu setuju dengan{' '}
            <span className="text-[#64748b] cursor-pointer hover:text-white transition-colors">Syarat & Ketentuan</span>
          </p>
        </div>
      </div>
    </div>
  )
}