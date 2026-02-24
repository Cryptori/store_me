'use client'

import { formatRupiah } from '@/lib/utils'
import type { Customer } from '@/types/database'

type Props = {
  customer: Customer
  hutangAktif: number
  hutangLunas: number
}

export default function SummaryCards({ customer, hutangAktif, hutangLunas }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
        <div className="text-xs text-[#64748b] mb-1">Total Hutang Aktif</div>
        <div className="text-xl font-black font-mono text-red-400">{formatRupiah(customer.total_hutang)}</div>
      </div>
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
        <div className="text-xs text-[#64748b] mb-1">Hutang Aktif</div>
        <div className="text-xl font-black font-mono text-yellow-400">{hutangAktif}</div>
      </div>
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
        <div className="text-xs text-[#64748b] mb-1">Hutang Lunas</div>
        <div className="text-xl font-black font-mono text-green-400">{hutangLunas}</div>
      </div>
    </div>
  )
}