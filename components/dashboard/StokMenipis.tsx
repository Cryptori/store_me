'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import type { Product } from '@/types/database'

type Props = {
  products: Product[]
}

export default function StokMenipis({ products }: Props) {
  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#2a3045]">
        <h2 className="font-bold text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" /> Stok Menipis
        </h2>
        <Link href="/stok" className="text-xs text-green-400 hover:text-green-300">Kelola →</Link>
      </div>
      <div className="p-4 space-y-3">
        {products.length === 0 ? (
          <p className="text-center text-[#64748b] text-sm py-4">Semua stok aman ✓</p>
        ) : products.map(p => (
          <div key={p.id} className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate">{p.nama}</div>
              <div className="text-xs text-[#64748b] font-mono">{p.sku ?? '-'}</div>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <span className={`font-black text-sm font-mono ${p.stok === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                {p.stok}
              </span>
              <span className="text-xs text-[#64748b] ml-1">{p.satuan}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}