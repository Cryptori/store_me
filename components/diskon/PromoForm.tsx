'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Promo, PromoTipe } from '@/types/diskon'
import { HARI, HARI_LABEL } from '@/types/diskon'

type Props = {
  storeId: string
  promo: Promo | null
  isPro: boolean
  onSave: (promo: Promo) => void
  onClose: () => void
}

const TIPE_OPTIONS: { value: PromoTipe; label: string; proOnly?: boolean }[] = [
  { value: 'persen',          label: 'Diskon %' },
  { value: 'nominal',         label: 'Diskon Nominal (Rp)' },
  { value: 'beli_x_gratis_y', label: 'Beli X Gratis Y', proOnly: true },
  { value: 'voucher',         label: 'Voucher / Kode Promo', proOnly: true },
  { value: 'otomatis',        label: 'Diskon Otomatis (Waktu)', proOnly: true },
]

export default function PromoForm({ storeId, promo, isPro, onSave, onClose }: Props) {
  const isEdit = !!promo

  const [tipe, setTipe]               = useState<PromoTipe>(promo?.tipe ?? 'persen')
  const [nama, setNama]               = useState(promo?.nama ?? '')
  const [nilai, setNilai]             = useState(String(promo?.nilai ?? ''))
  const [beliQty, setBeliQty]         = useState(String(promo?.beli_qty ?? '2'))
  const [gratisQty, setGratisQty]     = useState(String(promo?.gratis_qty ?? '1'))
  const [kode, setKode]               = useState(promo?.kode ?? '')
  const [maxPakai, setMaxPakai]       = useState(String(promo?.max_penggunaan ?? ''))
  const [minBelanja, setMinBelanja]   = useState(String(promo?.min_belanja ?? '0'))
  const [hariAktif, setHariAktif]     = useState<string[]>(promo?.hari_aktif ?? [])
  const [jamMulai, setJamMulai]       = useState(promo?.jam_mulai ?? '00:00')
  const [jamSelesai, setJamSelesai]   = useState(promo?.jam_selesai ?? '23:59')
  const [berlakuMulai, setBerlakuMulai] = useState(promo?.berlaku_mulai ?? new Date().toISOString().slice(0, 10))
  const [berlakuSampai, setBerlakuSampai] = useState(promo?.berlaku_sampai ?? '')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  function toggleHari(hari: string) {
    setHariAktif(prev => prev.includes(hari) ? prev.filter(h => h !== hari) : [...prev, hari])
  }

  async function handleSave() {
    if (!nama.trim()) { setError('Nama promo wajib diisi'); return }
    if ((tipe === 'persen' || tipe === 'nominal' || tipe === 'otomatis') && !nilai) {
      setError('Nilai diskon wajib diisi'); return
    }
    if (tipe === 'voucher' && !kode.trim()) { setError('Kode voucher wajib diisi'); return }
    if (tipe === 'persen' && Number(nilai) > 100) { setError('Diskon persen max 100%'); return }

    setSaving(true)
    setError('')

    const payload: Partial<Promo> = {
      store_id: storeId,
      nama: nama.trim(),
      tipe,
      nilai: Number(nilai) || 0,
      min_belanja: Number(minBelanja) || 0,
      berlaku_mulai: berlakuMulai,
      berlaku_sampai: berlakuSampai || null,
      is_active: promo?.is_active ?? true,
      ...(tipe === 'beli_x_gratis_y' && {
        beli_qty: Number(beliQty),
        gratis_qty: Number(gratisQty),
      }),
      ...(tipe === 'voucher' && {
        kode: kode.trim().toUpperCase(),
        max_penggunaan: maxPakai ? Number(maxPakai) : null,
      }),
      ...(tipe === 'otomatis' && {
        hari_aktif: hariAktif.length > 0 ? hariAktif : null,
        jam_mulai: jamMulai || null,
        jam_selesai: jamSelesai || null,
      }),
    }

    const supabase = createClient()
    const db = supabase as any

    let data: Promo | null = null
    if (isEdit && promo) {
      const { data: updated } = await db.from('promos').update(payload).eq('id', promo.id).select().single()
      data = updated
    } else {
      const { data: created } = await db.from('promos').insert(payload).select().single()
      data = created
    }

    setSaving(false)
    if (data) onSave(data)
    else setError('Gagal menyimpan promo, coba lagi')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-lg bg-[#181c27] border border-[#2a3045] rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#181c27] border-b border-[#2a3045] p-4 flex items-center justify-between z-10">
          <h2 className="font-black text-white">{isEdit ? 'Edit Promo' : 'Tambah Promo'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-[#64748b] hover:text-white hover:bg-[#1e2333]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Tipe */}
          {!isEdit && (
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-2">Jenis Promo</label>
              <div className="grid grid-cols-2 gap-2">
                {TIPE_OPTIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => { if (opt.proOnly && !isPro) return; setTipe(opt.value) }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                      tipe === opt.value
                        ? 'bg-green-400/20 border-green-500/40 text-green-400'
                        : opt.proOnly && !isPro
                        ? 'bg-[#1e2333] border-[#2a3045] text-[#3a4560] cursor-not-allowed'
                        : 'bg-[#1e2333] border-[#2a3045] text-[#64748b] hover:text-white'
                    }`}>
                    <span>{opt.label}</span>
                    {opt.proOnly && !isPro && (
                      <span className="text-[9px] font-black px-1 py-0.5 bg-green-400/10 text-green-400/60 border border-green-400/20 rounded">PRO</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nama */}
          <div>
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Nama Promo *</label>
            <input value={nama} onChange={e => setNama(e.target.value)}
              placeholder={tipe === 'voucher' ? 'Promo Hari Jadi' : tipe === 'otomatis' ? 'Weekend Sale' : 'Diskon Lebaran'}
              className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
          </div>

          {/* Nilai diskon (persen / nominal / otomatis) */}
          {(tipe === 'persen' || tipe === 'nominal' || tipe === 'otomatis') && (
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">
                {tipe === 'persen' ? 'Besar Diskon (%)' : 'Besar Diskon (Rp / %)'}
              </label>
              <div className="relative">
                <input value={nilai} onChange={e => setNilai(e.target.value)}
                  type="number" min="0" max={tipe === 'persen' ? 100 : undefined}
                  placeholder={tipe === 'persen' ? '10' : '20000'}
                  className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
                {tipe === 'persen' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] text-sm">%</span>
                )}
              </div>
              {tipe === 'otomatis' && (
                <p className="text-[10px] text-[#64748b] mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Nilai ≤ 100 = persen, &gt; 100 = nominal Rupiah
                </p>
              )}
            </div>
          )}

          {/* Beli X Gratis Y */}
          {tipe === 'beli_x_gratis_y' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Beli (qty)</label>
                <input value={beliQty} onChange={e => setBeliQty(e.target.value)}
                  type="number" min="1" placeholder="2"
                  className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Gratis (qty)</label>
                <input value={gratisQty} onChange={e => setGratisQty(e.target.value)}
                  type="number" min="1" placeholder="1"
                  className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40" />
              </div>
            </div>
          )}

          {/* Voucher */}
          {tipe === 'voucher' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Kode Voucher *</label>
                <input value={kode} onChange={e => setKode(e.target.value.toUpperCase())}
                  placeholder="HEMAT10"
                  className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white font-mono placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Nilai Diskon *</label>
                <input value={nilai} onChange={e => setNilai(e.target.value)}
                  type="number" placeholder="10 (%) atau 20000 (Rp)"
                  className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Maks. Pemakaian</label>
                <input value={maxPakai} onChange={e => setMaxPakai(e.target.value)}
                  type="number" placeholder="Kosong = unlimited"
                  className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
              </div>
            </div>
          )}

          {/* Otomatis: hari & jam */}
          {tipe === 'otomatis' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-2">Hari Aktif</label>
                <div className="flex flex-wrap gap-1.5">
                  {HARI.map(hari => (
                    <button key={hari} onClick={() => toggleHari(hari)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        hariAktif.includes(hari)
                          ? 'bg-orange-400/20 border-orange-400/40 text-orange-400'
                          : 'bg-[#1e2333] border-[#2a3045] text-[#64748b] hover:text-white'
                      }`}>
                      {HARI_LABEL[hari]}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-[#64748b] mt-1">Kosong = berlaku setiap hari</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Jam Mulai</label>
                  <input type="time" value={jamMulai} onChange={e => setJamMulai(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Jam Selesai</label>
                  <input type="time" value={jamSelesai} onChange={e => setJamSelesai(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40" />
                </div>
              </div>
            </>
          )}

          {/* Min belanja */}
          <div>
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Minimum Belanja (Rp)</label>
            <input value={minBelanja} onChange={e => setMinBelanja(e.target.value)}
              type="number" placeholder="0 = tidak ada minimum"
              className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
          </div>

          {/* Periode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Berlaku Mulai</label>
              <input type="date" value={berlakuMulai} onChange={e => setBerlakuMulai(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Berlaku Sampai</label>
              <input type="date" value={berlakuSampai} onChange={e => setBerlakuSampai(e.target.value)}
                placeholder="Kosong = selamanya"
                className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</> : isEdit ? 'Simpan Perubahan' : 'Buat Promo'}
          </button>
        </div>
      </div>
    </div>
  )
}