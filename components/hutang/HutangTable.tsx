'use client'

import { formatRupiah, formatTanggal } from '@/lib/utils'
import type { HutangItem } from './types'

type Props = {
  hutangs: HutangItem[]
  onBayar: (hutang: HutangItem) => void
}

export default function HutangTable({ hutangs, onBayar }: Props) {
  const today = new Date()

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#2a3045]">
            {['Pelanggan', 'Total Hutang', 'Sisa', 'Jatuh Tempo', 'Status', ''].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hutangs.map(h => {
            const isLate = h.status === 'belum_lunas' && h.jatuh_tempo && new Date(h.jatuh_tempo) < today
            return (
              <tr key={h.id} className="border-b border-[#2a3045] last:border-0 hover:bg-[#1e2333] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#1e2333] flex items-center justify-center text-xs font-black text-cyan-400 flex-shrink-0">
                      {h.customer_nama.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{h.customer_nama}</div>
                      {h.customer_telepon && <div className="text-xs text-[#64748b]">{h.customer_telepon}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-sm text-[#94a3b8]">{formatRupiah(h.jumlah)}</td>
                <td className="px-4 py-3 font-mono font-bold text-sm text-red-400">{formatRupiah(h.sisa)}</td>
                <td className="px-4 py-3 text-sm">
                  {h.jatuh_tempo ? (
                    <span className={isLate ? 'text-red-400 font-semibold' : 'text-[#94a3b8]'}>
                      {isLate && '⚠ '}{formatTanggal(h.jatuh_tempo)}
                    </span>
                  ) : <span className="text-[#64748b]">-</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                    h.status === 'lunas' ? 'bg-green-400/10 text-green-400'
                    : isLate ? 'bg-yellow-400/10 text-yellow-400'
                    : 'bg-red-400/10 text-red-400'
                  }`}>
                    {h.status === 'lunas' ? 'LUNAS' : isLate ? 'TERLAMBAT' : 'BELUM LUNAS'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {h.status === 'belum_lunas' && (
                    <button onClick={() => onBayar(h)}
                      className="text-xs bg-green-400/10 hover:bg-green-400/20 text-green-400 font-semibold px-3 py-1.5 rounded-lg transition-colors">
                      Bayar
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}