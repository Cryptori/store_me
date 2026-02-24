'use client'

import { TrendingUp } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import type { BulanData } from './exportPDFBulanan'

const currentMonth = new Date().toISOString().slice(0, 7)

export function GrafikBulanan({ data, tahun }: { data: BulanData[], tahun: number }) {
  const maxPenjualan = Math.max(...data.map(d => d.totalPenjualan), 1)

  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-6 mb-5">
      <h2 className="font-bold text-sm mb-5 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-green-400" /> Grafik Penjualan {tahun}
      </h2>
      <div className="flex items-end gap-1.5 md:gap-2 h-40">
        {data.map(d => {
          const height = (d.totalPenjualan / maxPenjualan) * 100
          const isCurrent = d.bulan === currentMonth
          return (
            <div key={d.bulan} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex items-end justify-center" style={{ height: '120px' }}>
                <div
                  className={`w-full rounded-t-lg transition-all ${isCurrent ? 'bg-green-400' : 'bg-[#2a3045] group-hover:bg-green-400/50'}`}
                  style={{ height: `${Math.max(height, 2)}%` }}
                  title={`${d.label}: ${formatRupiah(d.totalPenjualan)}`}
                />
              </div>
              <span className="text-[9px] text-[#64748b] font-mono">{d.label.slice(0, 3)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TabelBulanan({ data, tahun }: { data: BulanData[], tahun: number }) {
  const totalTahunan = data.reduce((s, d) => s + d.totalPenjualan, 0)
  const totalTransaksi = data.reduce((s, d) => s + d.totalTransaksi, 0)

  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#2a3045]">
        <h2 className="font-bold text-sm">Detail Per Bulan</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a3045]">
              {['Bulan', 'Total Penjualan', 'Transaksi', 'Rata-rata/Transaksi'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.bulan} className={`border-b border-[#2a3045] last:border-0 hover:bg-[#1e2333] transition-colors ${d.bulan === currentMonth ? 'bg-[#1a2a1a]' : ''}`}>
                <td className="px-4 py-3 font-semibold text-sm">{d.label}</td>
                <td className="px-4 py-3 font-mono font-bold text-sm text-green-400">{formatRupiah(d.totalPenjualan)}</td>
                <td className="px-4 py-3 font-mono text-sm">{d.totalTransaksi}</td>
                <td className="px-4 py-3 font-mono text-sm text-[#94a3b8]">{formatRupiah(d.rataRata)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-[#2a3045] bg-[#1e2333]">
              <td className="px-4 py-3 font-black text-sm">Total {tahun}</td>
              <td className="px-4 py-3 font-mono font-black text-sm text-green-400">{formatRupiah(totalTahunan)}</td>
              <td className="px-4 py-3 font-mono font-black text-sm">{totalTransaksi}</td>
              <td className="px-4 py-3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}