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

export default function StokTable({ products, tambahStok, updating, onChange, onUpdate }: Props) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#2a3045]">
            {['Produk', 'Stok Saat Ini', 'Min. Stok', 'Harga Jual', 'Tambah/Kurangi', ''].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} className="border-b border-[#2a3045] last:border-0 hover:bg-[#1e2333] transition-colors">
              <td className="px-4 py-3">
                <div className="font-semibold text-sm">{p.nama}</div>
                <div className="text-xs text-[#64748b]">{p.sku ?? '-'}</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-black font-mono ${
                    p.stok === 0 ? 'text-red-400' : p.stok <= p.stok_minimum ? 'text-yellow-400' : 'text-white'
                  }`}>{p.stok}</span>
                  <span className="text-xs text-[#64748b]">{p.satuan}</span>
                  {p.stok <= p.stok_minimum && (
                    <AlertTriangle className={`w-3.5 h-3.5 ${p.stok === 0 ? 'text-red-400' : 'text-yellow-400'}`} />
                  )}
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-sm text-[#64748b]">{p.stok_minimum}</td>
              <td className="px-4 py-3 font-mono text-sm text-green-400">{formatRupiah(p.harga_jual)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="± jumlah"
                    value={tambahStok[p.id] ?? ''}
                    onChange={e => onChange(p.id, e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && tambahStok[p.id] && onUpdate(p)}
                    className="w-28 px-3 py-1.5 bg-[#1e2333] border border-[#2a3045] rounded-lg text-white text-sm font-mono outline-none focus:border-green-500/40"
                  />
                  <button
                    onClick={() => onUpdate(p)}
                    disabled={!tambahStok[p.id] || updating === p.id}
                    className="px-3 py-1.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-lg text-xs font-black transition-all disabled:opacity-40">
                    {updating === p.id ? '...' : 'Update'}
                  </button>
                </div>
                {tambahStok[p.id] && (
                  <div className="text-xs text-[#64748b] mt-1">
                    Stok baru: <span className="text-white font-mono font-bold">
                      {Math.max(0, p.stok + Number(tambahStok[p.id]))} {p.satuan}
                    </span>
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                  p.stok === 0 ? 'bg-red-400/10 text-red-400'
                  : p.stok <= p.stok_minimum ? 'bg-yellow-400/10 text-yellow-400'
                  : 'bg-green-400/10 text-green-400'
                }`}>
                  {p.stok === 0 ? 'HABIS' : p.stok <= p.stok_minimum ? 'MENIPIS' : 'AMAN'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}