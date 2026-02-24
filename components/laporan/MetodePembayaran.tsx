'use client'

import { formatRupiah, formatJam } from '@/lib/utils'

const metodeColor: Record<string, string> = {
  tunai:    'bg-green-400/10 text-green-400',
  transfer: 'bg-cyan-400/10 text-cyan-400',
  qris:     'bg-purple-400/10 text-purple-400',
  hutang:   'bg-yellow-400/10 text-yellow-400',
}

export function MetodePembayaran({ metodeMap }: { metodeMap: Record<string, number> }) {
  const entries = Object.entries(metodeMap)
  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#2a3045]">
        <h2 className="font-bold text-sm">Metode Pembayaran</h2>
      </div>
      <div className="p-4 space-y-3">
        {entries.length === 0 ? (
          <p className="text-center text-[#64748b] text-sm py-4">Belum ada data</p>
        ) : entries.map(([metode, total]) => (
          <div key={metode} className="flex items-center justify-between">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${metodeColor[metode] ?? 'bg-[#2a3045] text-[#94a3b8]'}`}>
              {metode.toUpperCase()}
            </span>
            <span className="font-mono font-bold text-sm">{formatRupiah(total)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function JamTransaksi({ transactions }: { transactions: any[] }) {
  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#2a3045]">
        <h2 className="font-bold text-sm">Jam Transaksi</h2>
      </div>
      <div className="p-4 space-y-2">
        {transactions.slice(0, 5).map(t => (
          <div key={t.id} className="flex items-center justify-between text-sm">
            <span className="text-[#64748b] font-mono text-xs">{formatJam(t.created_at)}</span>
            <span className="font-mono font-bold text-sm">{formatRupiah(t.total)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}