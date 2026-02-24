'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatRupiah, formatTanggal } from '@/lib/utils'
import type { Transaction } from '@/types/database'

type TransaksiItem = Transaction & { customer_nama?: string }

const metodeColor: Record<string, string> = {
  tunai:    'bg-green-400/10 text-green-400',
  transfer: 'bg-cyan-400/10 text-cyan-400',
  qris:     'bg-purple-400/10 text-purple-400',
  hutang:   'bg-yellow-400/10 text-yellow-400',
}

type Props = {
  transaksi: TransaksiItem[]
}

export default function TransaksiTerakhir({ transaksi }: Props) {
  return (
    <div className="lg:col-span-2 bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#2a3045]">
        <h2 className="font-bold text-sm">Transaksi Terakhir</h2>
        <Link href="/laporan" className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
          Lihat Semua <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {transaksi.length === 0 ? (
        <div className="py-10 text-center text-[#64748b] text-sm">Belum ada transaksi hari ini</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a3045]">
                  {['No. Transaksi', 'Pelanggan', 'Total', 'Bayar', 'Waktu'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-[#64748b] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transaksi.map(trx => (
                  <tr key={trx.id} className="border-b border-[#2a3045] last:border-0 hover:bg-[#1e2333] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#64748b]">{trx.nomor_transaksi}</td>
                    <td className="px-4 py-3 text-sm">{trx.customer_nama ?? 'Umum'}</td>
                    <td className="px-4 py-3 font-mono font-bold text-sm text-green-400">{formatRupiah(trx.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${metodeColor[trx.metode_bayar] ?? 'bg-[#2a3045] text-[#94a3b8]'}`}>
                        {trx.metode_bayar.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748b]">{formatTanggal(trx.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-[#2a3045]">
            {transaksi.map(trx => (
              <div key={trx.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{trx.customer_nama ?? 'Umum'}</div>
                  <div className="text-xs text-[#64748b] font-mono mt-0.5">{trx.nomor_transaksi}</div>
                </div>
                <div className="text-right">
                  <div className="font-black font-mono text-green-400 text-sm">{formatRupiah(trx.total)}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${metodeColor[trx.metode_bayar] ?? ''}`}>
                    {trx.metode_bayar.toUpperCase()}
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