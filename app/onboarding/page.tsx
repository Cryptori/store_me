'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const [namaToko, setNamaToko] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')

  // Proteksi: kalau sudah punya toko, redirect ke dashboard
  useEffect(() => {
    async function checkStore() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) { router.replace('/login'); return }

      const { data: store } = await (supabase as any)
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (store) { router.replace('/dashboard'); return }

      setChecking(false)
    }
    checkStore()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nama = namaToko.trim()
    if (!nama) { setError('Nama toko wajib diisi'); return }
    if (nama.length < 3) { setError('Nama toko minimal 3 karakter'); return }
    if (nama.length > 50) { setError('Nama toko maksimal 50 karakter'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) { router.replace('/login'); return }

    // Double-check: pastikan belum punya toko sebelum insert
    const { data: existing } = await (supabase as any)
      .from('stores')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) { router.replace('/dashboard'); return }

    const { error: storeError } = await (supabase as any).from('stores').insert({
      user_id: user.id,
      nama,
    })

    if (storeError) {
      setError('Gagal membuat toko, coba lagi')
      setLoading(false)
      return
    }

    // Pakai window.location agar session & store state ter-refresh penuh
    window.location.href = '/dashboard'
  }

  if (checking) return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-green-400" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
            <Store className="w-5 h-5 text-[#0a0d14]" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            Toko<span className="text-green-400">Ku</span>
          </span>
        </div>

        <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-3xl mb-3">🏪</div>
            <h2 className="text-xl font-black text-white mb-2">Satu langkah lagi!</h2>
            <p className="text-[#64748b] text-sm">Beri nama toko kamu untuk mulai menggunakan TokoKu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">
                Nama Toko
              </label>
              <input
                type="text"
                value={namaToko}
                onChange={e => setNamaToko(e.target.value)}
                placeholder="Warung Berkah Jaya"
                maxLength={50}
                autoFocus
                className={`w-full px-4 py-3 rounded-xl bg-[#1e2333] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${
                  error ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'
                }`}
              />
              <div className="flex items-center justify-between mt-1">
                {error
                  ? <p className="text-red-400 text-xs">{error}</p>
                  : <span />}
                <span className="text-[#3a4560] text-xs">{namaToko.length}/50</span>
              </div>
            </div>

            <button type="submit" disabled={loading || !namaToko.trim()}
              className="w-full py-3 rounded-xl bg-green-400 hover:bg-green-300 text-[#0a0d14] font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat toko...</>
                : 'Mulai Sekarang →'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#3a4560] text-xs mt-6">
          Nama toko bisa diubah kapan saja di Pengaturan
        </p>
      </div>
    </div>
  )
}