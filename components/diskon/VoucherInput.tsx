'use client'

import { useState } from 'react'
import { Ticket, Check, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/utils'

type Props = {
  storeId: string
  total: number
  onApply: (promoId: string, diskon: number, label: string) => void
  onRemove: () => void
  appliedPromoId?: string | null
  appliedLabel?: string
}

export default function VoucherInput({ storeId, total, onApply, onRemove, appliedPromoId, appliedLabel }: Props) {
  const [kode, setKode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleApply() {
    if (!kode.trim()) { setError('Masukkan kode voucher'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data } = await (supabase as any).rpc('validate_voucher', {
      p_kode:     kode.trim().toUpperCase(),
      p_store_id: storeId,
      p_total:    total,
    })

    setLoading(false)
    if (!data?.valid) {
      setError(data?.pesan ?? 'Voucher tidak valid')
      return
    }
    onApply(data.promo_id, data.diskon, `Voucher ${kode.toUpperCase()}`)
    setKode('')
  }

  if (appliedPromoId) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-400/10 border border-green-500/30 rounded-xl">
        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
        <span className="text-green-400 text-sm font-semibold flex-1">{appliedLabel}</span>
        <button onClick={onRemove} className="text-green-400/60 hover:text-green-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            value={kode}
            onChange={e => { setKode(e.target.value.toUpperCase()); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleApply()}
            placeholder="Kode voucher"
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white font-mono placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40"
          />
        </div>
        <button onClick={handleApply} disabled={loading || !kode.trim()}
          className="px-4 py-2.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pakai'}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  )
}