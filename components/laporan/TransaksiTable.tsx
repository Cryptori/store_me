'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { formatRupiah, formatJam } from '@/lib/utils'

const metodeColor: Record<string, string> = {
  tunai:    'bg-green-400/10 text-green-400',
  transfer: 'bg-cyan-400/10 text-cyan-400',
  qris:     'bg-purple-400/10 text-purple-400',
  hutang:   'bg-yellow-400/10 text-yellow-400',
}

type Props = {
  transactions: any[]
  canExportPDF: boolean
}

export default function TransaksiTable({ transactions, canExportPDF }: Props) {
  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#2a3045]">
        <h2 className="font-bold text-sm">Semua Transaksi ({transactions.length})</h2>
        {!canExportPDF && (
          <Link href="/upgrade" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2333] border border-[#2a3045] text-[#64748b] hover:text-green-400 rounded-lg text-xs font-semibold transition-colors">
            <Lock className="w-3 h-3" /> Export PDF (PRO)
          </Link>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="py-12 text-center text-[#64748b] text-sm">Tidak ada transaksi pada tanggal ini</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a3045]">
                  {['Waktu', 'No. Transaksi', 'Pelanggan', 'Total', 'Metode'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id} className="border-b border-[#2a3045] last:border-0 hover:bg-[#1e2333] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#64748b]">{formatJam(t.created_at)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#64748b]">{t.nomor_transaksi}</td>
                    <td className="px-4 py-3 text-sm">{t.customers?.nama ?? 'Umum'}</td>
                    <td className="px-4 py-3 font-mono font-bold text-sm text-green-400">{formatRupiah(t.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${metodeColor[t.metode_bayar] ?? ''}`}>
                        {t.metode_bayar.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-[#2a3045]">
            {transactions.map(t => (
              <div key={t.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{t.customers?.nama ?? 'Umum'}</div>
                  <div className="text-xs text-[#64748b] font-mono mt-0.5">{formatJam(t.created_at)}</div>
                </div>
                <div className="text-right">
                  <div className="font-black font-mono text-green-400 text-sm">{formatRupiah(t.total)}</div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${metodeColor[t.metode_bayar] ?? ''}`}>
                    {t.metode_bayar.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}