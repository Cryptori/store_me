'use client'

import { useState } from 'react'
import { X, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { PurchaseOrder, POItem } from '@/types/supplier'

type Props = { po: PurchaseOrder; items: POItem[]; onSave: () => void; onClose: () => void }

export default function TerimaBarangModal({ po, items, onSave, onClose }: Props) {
  const [qtys, setQtys]     = useState<Record<string, number>>(
    Object.fromEntries(items.map(i => [i.id, i.qty_pesan - i.qty_diterima]))
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const penerimaan = items
      .filter(i => (qtys[i.id] ?? 0) > 0)
      .map(i => ({ po_item_id: i.id, qty_diterima: qtys[i.id] }))

    if (penerimaan.length === 0) { setSaving(false); onClose(); return }

    await (createClient() as any).rpc('terima_barang_po', {
      p_po_id: po.id,
      p_items: penerimaan,
    })

    setSaving(false)
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-lg bg-[#181c27] border border-[#2a3045] rounded-t-2xl md:rounded-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#181c27] border-b border-[#2a3045] p-4 flex items-center justify-between z-10">
          <h2 className="font-black text-white">Terima Barang</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-[#64748b] hover:text-white hover:bg-[#1e2333]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs text-[#64748b]">
            Masukkan jumlah barang yang diterima. Stok akan otomatis diupdate.
          </p>

          {items.map(item => {
            const sisaPerlu = item.qty_pesan - item.qty_diterima
            return (
              <div key={item.id} className="bg-[#1e2333] border border-[#2a3045] rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white text-sm">{item.nama_produk}</span>
                  <span className="text-xs text-[#64748b]">Sisa: {sisaPerlu}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number" min="0" max={sisaPerlu}
                    value={qtys[item.id] ?? 0}
                    onChange={e => setQtys(prev => ({ ...prev, [item.id]: Math.min(sisaPerlu, Math.max(0, Number(e.target.value))) }))}
                    className="w-24 px-3 py-2 bg-[#0f1117] border border-[#2a3045] rounded-lg text-white text-sm outline-none focus:border-green-500/40 text-center"
                  />
                  <div className="flex-1 h-1.5 bg-[#0f1117] rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full transition-all"
                      style={{ width: `${item.qty_pesan > 0 ? (item.qty_diterima + (qtys[item.id] ?? 0)) / item.qty_pesan * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs text-[#64748b] flex-shrink-0 w-12 text-right">
                    {item.qty_diterima + (qtys[item.id] ?? 0)}/{item.qty_pesan}
                  </span>
                </div>
              </div>
            )
          })}

          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors disabled:opacity-50">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" />Memproses...</>
              : <><CheckCircle className="w-4 h-4" />Konfirmasi Penerimaan</>}
          </button>
        </div>
      </div>
    </div>
  )
}