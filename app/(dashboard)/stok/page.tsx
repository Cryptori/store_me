'use client'

import { useEffect, useState } from 'react'
import { Search, Plus, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { formatRupiah } from '@/lib/utils'
import type { Product } from '@/types/database'

export default function StokPage() {
  const { store } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'semua' | 'menipis' | 'habis'>('semua')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [tambahStok, setTambahStok] = useState<{ [id: string]: string }>({})
  const supabase = createClient()

  useEffect(() => {
    if (!store) return
    fetchStok()
  }, [store])

  useEffect(() => {
    let list = products
    if (filter === 'menipis') list = list.filter(p => p.stok <= p.stok_minimum && p.stok > 0)
    if (filter === 'habis') list = list.filter(p => p.stok === 0)
    const q = search.toLowerCase()
    if (q) list = list.filter(p => p.nama.toLowerCase().includes(q))
    setFiltered(list)
  }, [products, filter, search])

  async function fetchStok() {
    const { data } = await supabase.from('products').select('*').eq('store_id', store!.id).eq('is_active', true).order('stok')
    setProducts(data ?? [])
    setLoading(false)
  }

  async function updateStok(productId: string) {
    const jumlah = Number(tambahStok[productId])
    if (!jumlah || jumlah === 0) return
    setUpdating(productId)

    const product = products.find(p => p.id === productId)!
    const stokBaru = product.stok + jumlah

    await supabase.from('products').update({ stok: stokBaru, updated_at: new Date().toISOString() }).eq('id', productId)

    // Log stok
    await supabase.from('stock_logs').insert({
      product_id: productId,
      store_id: store!.id,
      tipe: jumlah > 0 ? 'masuk' : 'koreksi',
      jumlah,
      stok_sebelum: product.stok,
      stok_sesudah: stokBaru,
      keterangan: 'Update manual',
    })

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stok: stokBaru } : p))
    setTambahStok(prev => ({ ...prev, [productId]: '' }))
    setUpdating(null)
  }

  const menipis = products.filter(p => p.stok <= p.stok_minimum && p.stok > 0).length
  const habis = products.filter(p => p.stok === 0).length

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Manajemen Stok</h1>
        <p className="text-[#64748b] text-sm mt-0.5">{products.length} produk • {menipis} menipis • {habis} habis</p>
      </div>

      {/* Alert summary */}
      {(menipis > 0 || habis > 0) && (
        <div className="flex gap-3 mb-5">
          {habis > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400 font-semibold">{habis} produk stok habis</span>
            </div>
          )}
          {menipis > 0 && (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400 font-semibold">{menipis} produk stok menipis</span>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input type="text" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#181c27] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
        </div>
        {(['semua', 'menipis', 'habis'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all border ${
              filter === f ? 'bg-[#1a2a1a] border-green-500/30 text-green-400' : 'bg-[#181c27] border-[#2a3045] text-[#64748b] hover:text-white'
            }`}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a3045]">
                  {['Produk', 'Stok Saat Ini', 'Min. Stok', 'Tambah/Kurangi', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-[#2a3045] last:border-0 hover:bg-[#1e2333] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-sm">{p.nama}</div>
                      <div className="text-xs text-[#64748b]">{p.sku ?? '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-black font-mono ${
                          p.stok === 0 ? 'text-red-400' :
                          p.stok <= p.stok_minimum ? 'text-yellow-400' : 'text-white'
                        }`}>{p.stok}</span>
                        <span className="text-xs text-[#64748b]">{p.satuan}</span>
                        {p.stok <= p.stok_minimum && <AlertTriangle className={`w-3.5 h-3.5 ${p.stok === 0 ? 'text-red-400' : 'text-yellow-400'}`} />}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-[#64748b]">{p.stok_minimum}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="±"
                          value={tambahStok[p.id] ?? ''}
                          onChange={e => setTambahStok(prev => ({ ...prev, [p.id]: e.target.value }))}
                          className="w-24 px-3 py-1.5 bg-[#1e2333] border border-[#2a3045] rounded-lg text-white text-sm font-mono outline-none focus:border-green-500/40"
                        />
                        <button
                          onClick={() => updateStok(p.id)}
                          disabled={!tambahStok[p.id] || updating === p.id}
                          className="px-3 py-1.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-lg text-xs font-black transition-all disabled:opacity-40"
                        >
                          {updating === p.id ? '...' : 'Update'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#64748b] font-mono">{formatRupiah(p.harga_jual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}