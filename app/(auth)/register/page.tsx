'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Store, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import AuthLeftPanel from '@/components/auth/AuthLeftPanel'
import GoogleButton from '@/components/auth/GoogleButton'

export default function RegisterPage() {
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
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function onSubmit(data: RegisterInput) {
    setLoading(true)
    setServerError('')
    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      // Simpan nama toko di metadata untuk dipakai di onboarding
      options: { data: { nama_toko: data.namaToko } },
    })

    if (authError || !authData.user) {
      const isAlreadyRegistered =
        authError?.message?.includes('already registered') ||
        authError?.message?.includes('already been registered')
      setServerError(isAlreadyRegistered ? 'Email sudah terdaftar, silakan login' : 'Gagal membuat akun, coba lagi')
      setLoading(false)
      return
    }

    // Kalau email belum dikonfirmasi — tampil email sent screen
    if (!authData.user.email_confirmed_at) {
      setSentEmail(data.email)
      setEmailSent(true)
      setLoading(false)
      return
    }

    // Email sudah confirmed (rare case) — langsung ke onboarding
    // Jangan buat store di sini, biarkan onboarding yang handle
    window.location.href = '/onboarding'
  }

  if (emailSent) return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-6">
      <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl p-10 text-center max-w-sm w-full">
        <div className="w-16 h-16 rounded-full bg-green-400/20 border-2 border-green-400/30 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Cek Email Kamu!</h2>
        <p className="text-[#64748b] text-sm mb-2">Kami kirim link verifikasi ke:</p>
        <p className="text-white font-semibold text-sm mb-4 font-mono">{sentEmail}</p>
        <p className="text-[#64748b] text-xs mb-6">
          Klik link di email untuk mengaktifkan akun, lalu login. Cek folder spam jika tidak ada.
        </p>
        <Link href="/login"
          className="block w-full py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
          Ke Halaman Login →
        </Link>
        <button onClick={() => { setEmailSent(false); setServerError('') }}
          className="mt-3 text-xs text-[#64748b] hover:text-white transition-colors">
          ← Kembali ke form
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex w-full min-h-screen">
      <AuthLeftPanel variant="register" />

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#0a0d14] overflow-y-auto">
        <div className="w-full max-w-sm py-8">
          {/* Mobile logo */}
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
              <Link href="/login" className="text-green-400 font-semibold hover:text-green-300 transition-colors">Masuk</Link>
            </p>
          </div>

          <GoogleButton loading={googleLoading} onClick={handleGoogle} label="Daftar dengan Google" />

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-[#2a3045]" />
            <span className="text-[#3a4560] text-xs">atau daftar dengan email</span>
            <div className="flex-1 h-px bg-[#2a3045]" />
          </div>

          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
            {[
              { name: 'namaToko' as const, label: 'Nama Toko', type: 'text', placeholder: 'Warung Berkah Jaya', autoComplete: 'off' },
              { name: 'email' as const, label: 'Email', type: 'email', placeholder: 'toko@email.com', autoComplete: 'email' },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">{field.label}</label>
                <input {...register(field.name)} type={field.type} placeholder={field.placeholder} autoComplete={field.autoComplete}
                  className={`w-full px-4 py-3 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${
                    errors[field.name] ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'
                  }`} />
                {errors[field.name] && <p className="text-red-400 text-xs mt-1">{errors[field.name]?.message}</p>}
              </div>
            ))}

            {[
              { name: 'password' as const, label: 'Password', show: showPassword, setShow: setShowPassword, placeholder: 'Minimal 6 karakter', autoComplete: 'new-password' },
              { name: 'confirmPassword' as const, label: 'Konfirmasi Password', show: showConfirm, setShow: setShowConfirm, placeholder: 'Ulangi password', autoComplete: 'new-password' },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">{field.label}</label>
                <div className="relative">
                  <input {...register(field.name)} type={field.show ? 'text' : 'password'} placeholder={field.placeholder} autoComplete={field.autoComplete}
                    className={`w-full px-4 py-3 pr-11 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${
                      errors[field.name] ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'
                    }`} />
                  <button type="button" onClick={() => field.setShow(!field.show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-white transition-colors">
                    {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors[field.name] && <p className="text-red-400 text-xs mt-1">{errors[field.name]?.message}</p>}
              </div>
            ))}

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