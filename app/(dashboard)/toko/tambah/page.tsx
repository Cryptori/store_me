'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useActiveStore } from '@/hooks/useActiveStore'
import { useFreemium } from '@/hooks/useFreemium'
import Link from 'next/link'

export default function TambahTokoPage() {
  const router = useRouter()
  const { stores, addStore } = useActiveStore()
  const { isPro } = useFreemium()
  const [nama, setNama] = useState('')
  const [alamat, setAlamat] = useState('')
  const [telepon, setTelepon] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Guard: FREE hanya boleh 1 toko
  if (!isPro && stores.length >= 1) {
    return (
      <div className="p-6 max-w-lg">
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏪</div>
          <h1 className="text-xl font-black text-white mb-2">Fitur Multi-Toko</h1>
          <p className="text-[#64748b] text-sm mb-6">
            Akun FREE hanya bisa mengelola 1 toko. Upgrade ke PRO untuk menambah toko kedua, ketiga, dan seterusnya.
          </p>
          <Link href="/upgrade"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
            Upgrade ke PRO
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit() {
    if (!nama.trim()) { setError('Nama toko wajib diisi'); return }
    if (nama.trim().length < 3) { setError('Nama toko minimal 3 karakter'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const db = supabase as any

    // Cek limit di server
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Sesi habis, login ulang'); setLoading(false); return }

    const { data: check } = await db.rpc('can_create_store', { p_user_id: user.id })
    if (!check?.allowed) {
      setError(check?.reason ?? 'Tidak bisa membuat toko baru')
      setLoading(false)
      return
    }

    const { data: newStore, error: storeErr } = await db
      .from('stores')
      .insert({
        user_id: user.id,
        nama: nama.trim(),
        alamat: alamat.trim() || null,
        telepon: telepon.trim() || null,
        urutan: stores.length,
      })
      .select()
      .single()

    if (storeErr || !newStore) {
      setError('Gagal membuat toko, coba lagi')
      setLoading(false)
      return
    }

    // Aktifkan trial untuk toko baru
    try { await db.rpc('activate_trial', { p_store_id: newStore.id }) } catch {}

    addStore(newStore as any)
    router.push('/dashboard')
  }

  return (
    <div className="p-4 md:p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard"
          className="p-2 rounded-xl bg-[#181c27] border border-[#2a3045] text-[#64748b] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white">Tambah Toko Baru</h1>
          <p className="text-[#64748b] text-xs mt-0.5">Toko ke-{stores.length + 1}</p>
        </div>
      </div>

      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">
            Nama Toko <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={nama}
            onChange={e => { setNama(e.target.value); setError('') }}
            placeholder="Contoh: Toko Cabang Selatan"
            className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">
            Alamat
          </label>
          <input
            type="text"
            value={alamat}
            onChange={e => setAlamat(e.target.value)}
            placeholder="Alamat toko (opsional)"
            className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">
            Nomor WA
          </label>
          <input
            type="tel"
            value={telepon}
            onChange={e => setTelepon(e.target.value)}
            placeholder="08123456789 (opsional)"
            className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !nama.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors disabled:opacity-50">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Membuat toko...</>
          ) : (
            <><Store className="w-4 h-4" />Buat Toko</>
          )}
        </button>
      </div>

      <p className="text-[#3a4560] text-xs text-center mt-4">
        Toko baru akan mendapat trial PRO 7 hari secara otomatis
      </p>
    </div>
  )
}