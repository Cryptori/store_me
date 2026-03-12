'use client'

import { useState } from 'react'
import { Bell, MessageCircle, Check, Phone } from 'lucide-react'
import type { Store } from '@/types/database'
import { shareStokWA } from '@/lib/stokNotification'
import { createClient } from '@/lib/supabase/client'

type Props = {
  store: Store
  onUpdate: (updated: Store) => void
}

export default function NotifikasiSettings({ store, onUpdate }: Props) {
  const [phone, setPhone] = useState(store.telepon ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSavePhone() {
    const cleaned = phone.trim()
    if (cleaned && !/^(08|\+62)[0-9]{7,12}$/.test(cleaned)) {
      setError('Format nomor tidak valid. Contoh: 08123456789')
      return
    }

    setSaving(true)
    setError('')
    const supabase = createClient()
    const db = supabase as any
    const { data, error: err } = await db
      .from('stores')
      .update({ telepon: cleaned || null })
      .eq('id', store.id)
      .select()
      .single()

    if (err || !data) {
      setError('Gagal menyimpan')
    } else {
      onUpdate(data as Store)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  async function handleTestWA() {
    shareStokWA({
      storeName: store.nama,
      produkMenipis: [
        { nama: 'Contoh Produk A', stok: 3, stok_minimum: 5, satuan: 'pcs' } as any,
      ],
      produkHabis: [
        { nama: 'Contoh Produk B', stok: 0, stok_minimum: 5, satuan: 'pcs' } as any,
      ],
      phoneNumber: phone || undefined,
    })
  }

  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-green-400/10 flex items-center justify-center">
          <Bell className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-white">Notifikasi Stok via WhatsApp</h3>
          <p className="text-xs text-[#64748b]">Terima alert stok menipis di WA kamu</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">
            Nomor WA Pemilik Toko
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError('') }}
                placeholder="08123456789"
                className="w-full pl-10 pr-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40"
              />
            </div>
            <button onClick={handleSavePhone} disabled={saving}
              className="px-4 py-2.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5">
              {saved ? <><Check className="w-3.5 h-3.5" />Tersimpan</> : saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          <p className="text-[#3a4560] text-xs mt-1.5">
            Digunakan untuk kirim alert stok langsung ke WA kamu
          </p>
        </div>

        {/* Info jadwal otomatis */}
        <div className="bg-[#0f1117] border border-[#2a3045] rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-bold text-green-400">Notifikasi Otomatis</span>
          </div>
          <p className="text-xs text-[#64748b]">
            Sistem akan cek stok setiap hari jam 07:00 WIB. Kalau ada stok menipis atau habis,
            kamu akan menerima notifikasi di halaman dashboard.
          </p>
        </div>

        {/* Test button */}
        <button onClick={handleTestWA}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-xl text-sm font-bold transition-colors">
          <MessageCircle className="w-4 h-4" />
          Test Kirim Contoh Pesan WA
        </button>
      </div>
    </div>
  )
}