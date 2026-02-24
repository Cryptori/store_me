'use client'

import { AlertTriangle } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import type { Product } from '@/types/database'

type Props = {
  products: Product[]
  tambahStok: { [id: string]: string }
  updating: string | null
  onChange: (id: string, val: string) => void
  onUpdate: (product: Product) => void
}

export default function StokCards({ products, tambahStok, updating, onChange, onUpdate }: Props) {
  return (
    <div className="md:hidden divide-y divide-[#2a3045]">
      {products.map(p => (
        <div key={p.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-semibold text-sm">{p.nama}</div>
              <div className="text-xs text-[#64748b]">{p.sku ?? '-'} • {formatRupiah(p.harga_jual)}</div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0 ${
              p.stok === 0 ? 'bg-red-400/10 text-red-400'
              : p.stok <= p.stok_minimum ? 'bg-yellow-400/10 text-yellow-400'
              : 'bg-green-400/10 text-green-400'
            }`}>
              {p.stok === 0 ? 'HABIS' : p.stok <= p.stok_minimum ? 'MENIPIS' : 'AMAN'}
            </span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-[#64748b]">Stok saat ini</div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xl font-black font-mono ${
                  p.stok === 0 ? 'text-red-400' : p.stok <= p.stok_minimum ? 'text-yellow-400' : 'text-white'
                }`}>{p.stok}</span>
                <span className="text-xs text-[#64748b]">{p.satuan}</span>
                {p.stok <= p.stok_minimum && (
                  <AlertTriangle className={`w-3.5 h-3.5 ${p.stok === 0 ? 'text-red-400' : 'text-yellow-400'}`} />
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#64748b]">Min. stok</div>
              <div className="font-mono text-sm text-[#64748b]">{p.stok_minimum} {p.satuan}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="± jumlah"
              value={tambahStok[p.id] ?? ''}
              onChange={e => onChange(p.id, e.target.value)}
              className="flex-1 px-3 py-2 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white text-sm font-mono outline-none focus:border-green-500/40"
            />
            <button
              onClick={() => onUpdate(p)}
              disabled={!tambahStok[p.id] || updating === p.id}
              className="px-4 py-2 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl text-sm font-black transition-all disabled:opacity-40">
              {updating === p.id ? '...' : 'Update'}
            </button>
          </div>
          {tambahStok[p.id] && (
            <div className="text-xs text-[#64748b] mt-1.5">
              Stok baru: <span className="text-white font-mono font-bold">
                {Math.max(0, p.stok + Number(tambahStok[p.id]))} {p.satuan}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}