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
  const [emailSent, setEmailSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema) as any,
  })

  async function onSubmit(data: RegisterInput) {
    setLoading(true)
    setServerError('')
    const supabase = createClient()

    // Step 1: Buat akun dengan metadata nama toko
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { nama_toko: data.namaToko }, // simpan sementara di metadata
      }
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

    // Step 2: Coba login langsung (berhasil jika email confirm dimatikan)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (signInError) {
      // Email confirmation aktif — tampilkan halaman "cek email"
      setSentEmail(data.email)
      setEmailSent(true)
      setLoading(false)
      return
    }

    // Step 3: Login berhasil — buat toko langsung
    const db = supabase as any
    const { error: storeError } = await db.from('stores').insert({
      user_id: authData.user.id,
      nama: data.namaToko,
    })

    if (storeError) {
      console.error('Store error:', storeError)
      setServerError('Akun dibuat tapi gagal buat toko. Coba login ulang.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const fiturGratis = [
    '50 produk gratis',
    'Kasir & transaksi harian',
    'Kelola hutang pelanggan',
    'Laporan harian otomatis',
  ]

  // ===== HALAMAN CEK EMAIL =====
  if (emailSent) return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-6">
      <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 rounded-full bg-green-400/20 border-2 border-green-400/30 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Cek Email Kamu!</h2>
        <p className="text-[#64748b] text-sm mb-2">
          Kami kirim link verifikasi ke:
        </p>
        <p className="text-white font-semibold text-sm mb-6 font-mono">{sentEmail}</p>
        <p className="text-[#64748b] text-xs mb-6">
          Klik link di email untuk mengaktifkan akun, lalu login. Cek folder spam jika tidak ada.
        </p>
        <Link href="/login"
          className="block w-full py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
          Ke Halaman Login →
        </Link>
        <button
          onClick={() => { setEmailSent(false); setServerError('') }}
          className="mt-3 text-xs text-[#64748b] hover:text-white transition-colors">
          ← Kembali ke form
        </button>
      </div>
    </div>
  )

  // ===== FORM REGISTER =====
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
            <span className="text-xl font-black text-white tracking-tight">
              Toko<span className="text-green-400">Ku</span>
            </span>
          </div>

          <div className="mb-10">
            <div className="inline-block bg-green-400/10 border border-green-400/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-green-400 text-xs font-bold uppercase tracking-wide">Gratis untuk mulai</span>
            </div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Mulai kelola<br />toko lo <span className="text-green-400">hari ini.</span>
            </h1>
            <p className="text-[#64748b] text-sm leading-relaxed">
              Setup 5 menit, langsung bisa pakai. Tidak perlu kartu kredit.
            </p>
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
          <p className="text-[#94a3b8] text-sm italic mb-3">
            "TokoKu bantu saya catat hutang pelanggan yang biasa lupa. Sekarang gak ada yang lolos!"
          </p>
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
            <p className="text-[#64748b] text-sm">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-green-400 font-semibold hover:text-green-300 transition-colors">
                Masuk
              </Link>
            </p>
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