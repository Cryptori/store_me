'use client'

import { TrendingUp, ShoppingCart, AlertTriangle, Users } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

type Props = {
  penjualanHariIni: number
  transaksiHariIni: number
  stokMenipis: number
  totalHutang: number
}

const cards = [
  { key: 'penjualan', label: 'Penjualan Hari Ini', icon: TrendingUp, color: 'green' },
  { key: 'transaksi', label: 'Total Transaksi', icon: ShoppingCart, color: 'cyan' },
  { key: 'stok', label: 'Stok Menipis', icon: AlertTriangle, color: 'yellow' },
  { key: 'hutang', label: 'Total Hutang', icon: Users, color: 'red' },
] as const

const colorMap = {
  green:  { bar: 'bg-green-400',  text: 'text-green-400',  icon: 'text-green-400'  },
  cyan:   { bar: 'bg-cyan-400',   text: 'text-cyan-400',   icon: 'text-cyan-400'   },
  yellow: { bar: 'bg-yellow-400', text: 'text-yellow-400', icon: 'text-yellow-400' },
  red:    { bar: 'bg-red-400',    text: 'text-red-400',    icon: 'text-red-400'    },
}

export default function StatsCards({ penjualanHariIni, transaksiHariIni, stokMenipis, totalHutang }: Props) {
  const values = {
    penjualan: { value: formatRupiah(penjualanHariIni), sub: `${transaksiHariIni} transaksi` },
    transaksi: { value: String(transaksiHariIni),       sub: 'hari ini' },
    stok:      { value: String(stokMenipis),            sub: 'produk perlu restock' },
    hutang:    { value: formatRupiah(totalHutang),      sub: 'belum lunas' },
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon, color }) => {
        const c = colorMap[color]
        const { value, sub } = values[key]
        return (
          <div key={key} className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.bar}`} />
            <Icon className={`w-4 h-4 mb-3 ${c.icon}`} />
            <div className="text-xs text-[#64748b] mb-1">{label}</div>
            <div className={`text-xl font-black font-mono ${c.text}`}>{value}</div>
            <div className="text-xs text-[#64748b] mt-1">{sub}</div>
          </div>
        )
      })}
    </div>
  )
}