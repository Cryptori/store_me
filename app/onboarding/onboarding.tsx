'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const [namaToko, setNamaToko] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!namaToko.trim()) { setError('Nama toko wajib diisi'); return }
    if (namaToko.trim().length < 3) { setError('Nama toko minimal 3 karakter'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const db = supabase as any
    const { error: storeError } = await db.from('stores').insert({
      user_id: user.id,
      nama: namaToko.trim(),
    })

    if (storeError) {
      setError('Gagal membuat toko, coba lagi')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
            <Store className="w-5 h-5 text-[#0a0d14]" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            Toko<span className="text-green-400">Ku</span>
          </span>
        </div>

        <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl p-8">
          {/* Header */}
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
                autoFocus
                className={`w-full px-4 py-3 rounded-xl bg-[#1e2333] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${
                  error ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'
                }`}
              />
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>

            <button type="submit" disabled={loading || !namaToko.trim()}
              className="w-full py-3 rounded-xl bg-green-400 hover:bg-green-300 text-[#0a0d14] font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat toko...</> : 'Mulai Sekarang →'}
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