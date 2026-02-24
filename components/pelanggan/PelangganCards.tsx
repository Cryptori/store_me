'use client'

import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'
import type { Customer } from '@/types/database'

type Props = {
  customers: Customer[]
}

export default function PelangganCards({ customers }: Props) {
  return (
    <div className="md:hidden divide-y divide-[#2a3045]">
      {customers.map(c => (
        <Link key={c.id} href={`/pelanggan/${c.id}`} className="flex items-center justify-between p-4 hover:bg-[#1e2333] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1e2333] flex items-center justify-center text-xs font-black text-cyan-400 flex-shrink-0">
              {c.nama.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-sm">{c.nama}</div>
              <div className="text-xs text-[#64748b]">{c.telepon ?? 'Tidak ada HP'}</div>
            </div>
          </div>
          <div className="text-right">
            {c.total_hutang > 0 ? (
              <div className="text-red-400 font-bold font-mono text-sm">{formatRupiah(c.total_hutang)}</div>
            ) : (
              <div className="text-green-400 text-sm font-semibold">Lunas ✓</div>
            )}
            <div className="text-xs text-[#64748b] mt-0.5">Detail →</div>
          </div>
        </Link>
      ))}
    </div>
  )
}