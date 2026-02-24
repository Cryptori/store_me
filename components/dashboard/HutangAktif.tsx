'use client'

import Link from 'next/link'
import { formatRupiah, formatTanggal } from '@/lib/utils'
import type { Debt } from '@/types/database'

type HutangItem = Debt & { customer_nama: string }

type Props = {
  hutangs: HutangItem[]
}

export default function HutangAktif({ hutangs }: Props) {
  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#2a3045]">
        <h2 className="font-bold text-sm">Hutang Aktif</h2>
        <Link href="/hutang" className="text-xs text-green-400 hover:text-green-300">Kelola →</Link>
      </div>
      <div className="p-4 space-y-3">
        {hutangs.length === 0 ? (
          <p className="text-center text-[#64748b] text-sm py-4">Tidak ada hutang aktif ✓</p>
        ) : hutangs.map(d => (
          <div key={d.id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1e2333] flex items-center justify-center text-xs font-black text-cyan-400 flex-shrink-0">
              {d.customer_nama.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{d.customer_nama}</div>
              {d.jatuh_tempo && (
                <div className="text-xs text-[#64748b]">{formatTanggal(d.jatuh_tempo)}</div>
              )}
            </div>
            <span className="text-red-400 font-black text-sm font-mono flex-shrink-0">
              {formatRupiah(d.sisa)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}