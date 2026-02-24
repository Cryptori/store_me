'use client'

import { formatRupiah, formatTanggal } from '@/lib/utils'
import type { HutangItem } from './types'

type Props = {
  hutangs: HutangItem[]
  onBayar: (hutang: HutangItem) => void
}

export default function HutangCards({ hutangs, onBayar }: Props) {
  const today = new Date()

  return (
    <div className="md:hidden divide-y divide-[#2a3045]">
      {hutangs.map(h => {
        const isLate = h.status === 'belum_lunas' && h.jatuh_tempo && new Date(h.jatuh_tempo) < today
        return (
          <div key={h.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1e2333] flex items-center justify-center text-xs font-black text-cyan-400 flex-shrink-0">
                  {h.customer_nama.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold">{h.customer_nama}</div>
                  {h.customer_telepon && <div className="text-xs text-[#64748b]">{h.customer_telepon}</div>}
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                h.status === 'lunas' ? 'bg-green-400/10 text-green-400'
                : isLate ? 'bg-yellow-400/10 text-yellow-400'
                : 'bg-red-400/10 text-red-400'
              }`}>
                {h.status === 'lunas' ? 'LUNAS' : isLate ? 'TERLAMBAT' : 'BELUM LUNAS'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#64748b]">Sisa hutang</div>
                <div className="font-black text-red-400 font-mono">{formatRupiah(h.sisa)}</div>
                {h.jatuh_tempo && (
                  <div className={`text-xs mt-0.5 ${isLate ? 'text-red-400' : 'text-[#64748b]'}`}>
                    {isLate ? '⚠ ' : ''}Jatuh tempo: {formatTanggal(h.jatuh_tempo)}
                  </div>
                )}
              </div>
              {h.status === 'belum_lunas' && (
                <button onClick={() => onBayar(h)}
                  className="bg-green-400 hover:bg-green-300 text-[#0a0d14] font-black text-xs px-4 py-2 rounded-xl transition-colors">
                  Bayar
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}