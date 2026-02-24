'use client'

import { TrendingDown, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import type { HutangItem } from './types'

type Props = {
  hutangs: HutangItem[]
}

export default function SummaryCards({ hutangs }: Props) {
  const today = new Date()
  const totalAktif = hutangs.filter(h => h.status === 'belum_lunas').reduce((s, h) => s + h.sisa, 0)
  const totalLunas = hutangs.filter(h => h.status === 'lunas').reduce((s, h) => s + h.jumlah, 0)
  const jumlahTerlambat = hutangs.filter(h => h.status === 'belum_lunas' && h.jatuh_tempo && new Date(h.jatuh_tempo) < today).length
  const jumlahAktif = hutangs.filter(h => h.status === 'belum_lunas').length
  const jumlahLunas = hutangs.filter(h => h.status === 'lunas').length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown className="w-4 h-4 text-red-400" />
          <span className="text-xs text-[#64748b]">Total Aktif</span>
        </div>
        <div className="text-lg font-black text-red-400 font-mono">{formatRupiah(totalAktif)}</div>
        <div className="text-xs text-[#64748b] mt-0.5">{jumlahAktif} hutang</div>
      </div>

      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-[#64748b]">Terlambat</span>
        </div>
        <div className="text-lg font-black text-yellow-400 font-mono">{jumlahTerlambat}</div>
        <div className="text-xs text-[#64748b] mt-0.5">hutang jatuh tempo</div>
      </div>

      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-xs text-[#64748b]">Total Lunas</span>
        </div>
        <div className="text-lg font-black text-green-400 font-mono">{formatRupiah(totalLunas)}</div>
        <div className="text-xs text-[#64748b] mt-0.5">{jumlahLunas} hutang</div>
      </div>

      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-[#64748b]" />
          <span className="text-xs text-[#64748b]">Total Hutang</span>
        </div>
        <div className="text-lg font-black text-white font-mono">{hutangs.length}</div>
        <div className="text-xs text-[#64748b] mt-0.5">semua transaksi</div>
      </div>
    </div>
  )
}