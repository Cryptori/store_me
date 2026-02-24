'use client'

import { formatRupiah, formatTanggal } from '@/lib/utils'
import type { Debt } from '@/types/database'

type Props = {
  debts: Debt[]
}

export default function HutangLunas({ debts }: Props) {
  if (debts.length === 0) return null

  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#2a3045]">
        <h2 className="font-bold text-sm text-[#64748b]">Riwayat Lunas ({debts.length})</h2>
      </div>
      {debts.map(d => (
        <div key={d.id} className="p-4 border-b border-[#2a3045] last:border-0 opacity-60">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{formatTanggal(d.created_at)}</div>
              <div className="text-xs text-[#64748b]">{formatRupiah(d.jumlah)}</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-green-400/10 text-green-400 rounded-md">LUNAS</span>
          </div>
        </div>
      ))}
    </div>
  )
}