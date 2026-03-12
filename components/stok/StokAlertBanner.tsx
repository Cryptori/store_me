'use client'

import { useState } from 'react'
import { AlertTriangle, X, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { Product } from '@/types/database'
import { shareStokWA } from '@/lib/stokNotification'

type Props = {
  storeName: string
  produkMenipis: Product[]
  produkHabis: Product[]
  ownerPhone?: string
}

export default function StokAlertBanner({
  storeName, produkMenipis, produkHabis, ownerPhone,
}: Props) {
  const [dismissed, setDismissed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const total = produkMenipis.length + produkHabis.length
  if (total === 0 || dismissed) return null

  const isKritis = produkHabis.length > 0

  return (
    <div className={`rounded-xl border p-4 ${
      isKritis
        ? 'bg-red-500/10 border-red-500/30'
        : 'bg-yellow-400/10 border-yellow-400/30'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isKritis ? 'bg-red-500/20' : 'bg-yellow-400/20'
          }`}>
            <AlertTriangle className={`w-4 h-4 ${isKritis ? 'text-red-400' : 'text-yellow-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-black text-sm mb-0.5 ${isKritis ? 'text-red-400' : 'text-yellow-400'}`}>
              {isKritis
                ? `${produkHabis.length} produk habis${produkMenipis.length > 0 ? `, ${produkMenipis.length} menipis` : ''}`
                : `${produkMenipis.length} produk stok menipis`
              }
            </div>
            <div className="text-xs text-[#64748b]">Segera lakukan restok</div>

            {/* Detail produk */}
            {expanded && (
              <div className="mt-3 space-y-1.5">
                {produkHabis.map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                    <span className="text-[#e2e8f0] font-medium">{p.nama}</span>
                    <span className="text-red-400 font-bold ml-auto">HABIS</span>
                  </div>
                ))}
                {produkMenipis.map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                    <span className="text-[#e2e8f0] font-medium">{p.nama}</span>
                    <span className="text-yellow-400 font-bold ml-auto">
                      {p.stok} {p.satuan}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button onClick={() => setDismissed(true)}
          className="text-[#3a4560] hover:text-[#64748b] flex-shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => shareStokWA({ storeName, produkMenipis, produkHabis, phoneNumber: ownerPhone })}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20c05a] text-white rounded-lg text-xs font-bold transition-colors">
          <MessageCircle className="w-3.5 h-3.5" />
          Kirim via WA
        </button>
        <button
          onClick={() => setExpanded(e => !e)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            isKritis
              ? 'border-red-500/30 text-red-400/70 hover:text-red-400'
              : 'border-yellow-400/30 text-yellow-400/70 hover:text-yellow-400'
          }`}>
          {expanded ? <><ChevronUp className="w-3 h-3" />Sembunyikan</> : <><ChevronDown className="w-3 h-3" />Lihat Detail</>}
        </button>
      </div>
    </div>
  )
}