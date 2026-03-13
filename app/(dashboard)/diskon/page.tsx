'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Plus, Tag, Percent, DollarSign, Gift, Clock, Ticket, Loader2, Trash2, ToggleLeft, ToggleRight, Edit2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { useFreemium } from '@/hooks/useFreemium'
import type { Promo, PromoTipe } from '@/types/diskon'
import { formatDiskonLabel, HARI_LABEL } from '@/types/diskon'
import PromoForm from '@/components/diskon/PromoForm'
import UpgradeModal from '@/components/shared/UpgradeModal'
import { formatRupiah } from '@/lib/utils'

const TIPE_CONFIG: Record<PromoTipe, { icon: any; label: string; color: string }> = {
  persen:          { icon: Percent,    label: 'Diskon %',        color: 'text-green-400  bg-green-400/10  border-green-400/20' },
  nominal:         { icon: DollarSign, label: 'Diskon Nominal',  color: 'text-cyan-400   bg-cyan-400/10   border-cyan-400/20' },
  beli_x_gratis_y: { icon: Gift,       label: 'Beli X Gratis Y', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  voucher:         { icon: Ticket,     label: 'Voucher',         color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  otomatis:        { icon: Clock,      label: 'Otomatis',        color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
}

export default function DiskonPage() {
  const { store } = useStore()
  const { isPro, hasProAccess } = useFreemium()
  const [promos, setPromos]         = useState<Promo[]>([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [editPromo, setEditPromo]   = useState<Promo | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => { if (store) fetchPromos() }, [store])

  async function fetchPromos() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('promos')
      .select('*')
      .eq('store_id', store!.id)
      .order('created_at', { ascending: false })
    setPromos((data ?? []) as Promo[])
    setLoading(false)
  }

  async function toggleActive(promo: Promo) {
    const supabase = createClient()
    await (supabase as any)
      .from('promos')
      .update({ is_active: !promo.is_active })
      .eq('id', promo.id)
    setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, is_active: !p.is_active } : p))
  }

  async function deletePromo(id: string) {
    if (!confirm('Hapus promo ini?')) return
    const supabase = createClient()
    await (supabase as any).from('promos').delete().eq('id', id)
    setPromos(prev => prev.filter(p => p.id !== id))
  }

  function handleAddClick(tipe: PromoTipe) {
    // FREE boleh buat diskon persen/nominal, tipe lain butuh PRO
    if (!hasProAccess && (tipe === 'voucher' || tipe === 'beli_x_gratis_y' || tipe === 'otomatis')) {
      setShowUpgrade(true)
      return
    }
    setEditPromo(null)
    setShowForm(true)
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Diskon & Promo</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{promos.length} promo aktif</p>
        </div>
        <button onClick={() => { setEditPromo(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
          <Plus className="w-4 h-4" />
          Tambah Promo
        </button>
      </div>

      {/* Tipe promo cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6">
        {(Object.entries(TIPE_CONFIG) as [PromoTipe, typeof TIPE_CONFIG[PromoTipe]][]).map(([tipe, cfg]) => {
          const Icon = cfg.icon
          const needsPro = tipe !== 'persen' && tipe !== 'nominal'
          return (
            <button key={tipe} onClick={() => handleAddClick(tipe)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all hover:scale-105 ${cfg.color}`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold text-center leading-tight">{cfg.label}</span>
              {needsPro && !hasProAccess && (
                <span className="text-[8px] font-black px-1 py-0.5 bg-black/20 rounded">PRO</span>
              )}
            </button>
          )
        })}
      </div>

      {/* List promo */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-green-400" />
        </div>
      ) : promos.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="w-10 h-10 text-[#2a3045] mx-auto mb-3" />
          <div className="text-[#64748b] text-sm">Belum ada promo. Buat yang pertama!</div>
        </div>
      ) : (
        <div className="space-y-2">
          {promos.map(promo => {
            const cfg  = TIPE_CONFIG[promo.tipe]
            const Icon = cfg.icon
            return (
              <div key={promo.id}
                className={`bg-[#181c27] border rounded-xl p-4 transition-all ${
                  promo.is_active ? 'border-[#2a3045]' : 'border-[#1e2333] opacity-60'
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-white text-sm">{promo.nama}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="text-xs text-[#64748b]">{formatDiskonLabel(promo)}</div>

                    {/* Detail extra */}
                    <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] text-[#3a4560]">
                      {promo.min_belanja > 0 && (
                        <span>Min. {formatRupiah(promo.min_belanja)}</span>
                      )}
                      {promo.berlaku_sampai && (
                        <span>s/d {new Date(promo.berlaku_sampai).toLocaleDateString('id-ID')}</span>
                      )}
                      {promo.hari_aktif && (
                        <span>{promo.hari_aktif.map(h => HARI_LABEL[h]).join(', ')}</span>
                      )}
                      {promo.kode && (
                        <span className="font-mono font-bold text-yellow-400/70">{promo.kode}</span>
                      )}
                      {promo.max_penggunaan && (
                        <span>{promo.sudah_dipakai}/{promo.max_penggunaan}x dipakai</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => { setEditPromo(promo); setShowForm(true) }}
                      className="p-1.5 rounded-lg text-[#3a4560] hover:text-[#94a3b8] hover:bg-[#1e2333] transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleActive(promo)}
                      className="p-1.5 rounded-lg text-[#3a4560] hover:text-white hover:bg-[#1e2333] transition-colors">
                      {promo.is_active
                        ? <ToggleRight className="w-4 h-4 text-green-400" />
                        : <ToggleLeft  className="w-4 h-4" />}
                    </button>
                    <button onClick={() => deletePromo(promo.id)}
                      className="p-1.5 rounded-lg text-[#3a4560] hover:text-red-400 hover:bg-red-400/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <PromoForm
          storeId={store!.id}
          promo={editPromo}
          isPro={isPro}
          onSave={(saved) => {
            setPromos(prev =>
              editPromo
                ? prev.map(p => p.id === saved.id ? saved : p)
                : [saved, ...prev]
            )
            setShowForm(false)
          }}
          onClose={() => setShowForm(false)}
        />
      )}

      {showUpgrade && (
        <UpgradeModal trigger="laporan_bulanan" onClose={() => setShowUpgrade(false)} />
      )}
    </div>
  )
}