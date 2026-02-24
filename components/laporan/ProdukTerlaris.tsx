'use client'

import { TrendingUp } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'

type ProdukItem = { nama: string; qty: number; total: number }

export default function ProdukTerlaris({ products }: { products: ProdukItem[] }) {
  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[#2a3045]">
        <h2 className="font-bold text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-400" /> Produk Terlaris
        </h2>
      </div>
      <div className="p-4 space-y-3">
        {products.length === 0 ? (
          <p className="text-center text-[#64748b] text-sm py-4">Belum ada data</p>
        ) : products.map((p, i) => (
          <div key={p.nama} className="flex items-center gap-3">
            <span className="w-5 h-5 rounded-md bg-[#1e2333] text-[10px] font-black text-[#64748b] flex items-center justify-center flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{p.nama}</div>
              <div className="text-xs text-[#64748b]">{p.qty} terjual</div>
            </div>
            <span className="text-sm font-bold font-mono text-green-400 flex-shrink-0">{formatRupiah(p.total)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}