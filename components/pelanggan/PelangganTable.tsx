'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import type { Customer } from '@/types/database'

type Props = {
  customers: Customer[]
}

export default function PelangganTable({ customers }: Props) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#2a3045]">
            {['Pelanggan', 'No. HP', 'Total Hutang', ''].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.id} className="border-b border-[#2a3045] last:border-0 hover:bg-[#1e2333] transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1e2333] flex items-center justify-center text-xs font-black text-cyan-400 flex-shrink-0">
                    {c.nama.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{c.nama}</div>
                    {c.alamat && <div className="text-xs text-[#64748b] truncate max-w-xs">{c.alamat}</div>}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-[#64748b] font-mono">{c.telepon ?? '-'}</td>
              <td className="px-4 py-3">
                {c.total_hutang > 0 ? (
                  <span className="flex items-center gap-1.5 text-red-400 font-bold font-mono text-sm">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formatRupiah(c.total_hutang)}
                  </span>
                ) : (
                  <span className="text-green-400 text-sm font-semibold">Lunas ✓</span>
                )}
              </td>
              <td className="px-4 py-3">
                <Link href={`/pelanggan/${c.id}`} className="text-xs text-green-400 hover:text-green-300 font-semibold">
                  Detail →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}