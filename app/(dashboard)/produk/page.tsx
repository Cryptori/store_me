'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle, Tag } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { useFreemium } from '@/hooks/useFreemium'
import { formatRupiah } from '@/lib/utils'
import type { Product, Category } from '@/types/database'

export default function ProdukPage() {
  const { store } = useStore()
  const { canAddProduk } = useFreemium()
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { if (store) fetchData() }, [store])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(products.filter(p => {
      const matchSearch = p.nama.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q)
      const matchCat = selectedCategory === '' || p.category_id === selectedCategory
      return matchSearch && matchCat
    }))
  }, [search, products, selectedCategory])

  async function fetchData() {
    const supabase = createClient()
    const [{ data: produkData }, { data: katData }] = await Promise.all([
      supabase.from('products').select('*').eq('store_id', store!.id).eq('is_active', true).order('nama'),
      (supabase as any).from('categories').select('*').eq('store_id', store!.id).order('nama'),
    ])
    setProducts((produkData ?? []) as Product[])
    setFiltered((produkData ?? []) as Product[])
    setCategories((katData ?? []) as Category[])
    setLoading(false)
  }

  async function deleteProduct(id: string) {
    if (!confirm('Hapus produk ini?')) return
    setDeleting(id)
    await (createClient() as any).from('products').update({ is_active: false }).eq('id', id)
    setProducts(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const canAdd = canAddProduk(products.length)

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Produk</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{products.length} produk terdaftar</p>
        </div>
        {canAdd ? (
          <Link href="/produk/tambah"
            className="flex items-center gap-2 px-4 py-2.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
            <Plus className="w-4 h-4" /> Tambah Produk
          </Link>
        ) : (
          <Link href="/upgrade"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2a1a] border border-green-500/30 text-green-400 rounded-xl font-bold text-sm hover:bg-green-400/10 transition-colors">
            ✨ Upgrade untuk tambah lebih
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
        <input type="text" placeholder="Cari nama produk atau SKU..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#181c27] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-0.5 scrollbar-none">
          <button onClick={() => setSelectedCategory('')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              selectedCategory === ''
                ? 'bg-green-400/20 border-green-500/30 text-green-400'
                : 'bg-[#181c27] border-[#2a3045] text-[#64748b] hover:text-white'}`}>
            Semua
          </button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-green-400/20 border-green-500/30 text-green-400'
                  : 'bg-[#181c27] border-[#2a3045] text-[#64748b] hover:text-white'}`}>
              <Tag className="w-3 h-3" /> {cat.nama}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#64748b]">
            <Package className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-semibold">Belum ada produk</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a3045]">
                  {['Produk', 'Kategori', 'Harga Jual', 'Stok', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const kategori = categories.find(c => c.id === p.category_id)
                  return (
                    <tr key={p.id} className="border-b border-[#2a3045] last:border-0 hover:bg-[#1e2333] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* Foto thumbnail */}
                          <div className="w-9 h-9 rounded-lg bg-[#0f1117] flex items-center justify-center text-lg overflow-hidden flex-shrink-0 relative">
                            {p.gambar_url ? (
                              <Image src={p.gambar_url} alt={p.nama} fill className="object-cover" sizes="36px" />
                            ) : (
                              <span>🛍️</span>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">{p.nama}</div>
                            <div className="text-xs text-[#64748b]">{p.satuan}{p.sku ? ` · ${p.sku}` : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {kategori ? (
                          <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-[#1e2333] border border-[#2a3045] text-[#94a3b8]">
                            {kategori.nama}
                          </span>
                        ) : (
                          <span className="text-xs text-[#3a4560]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-sm text-green-400">{formatRupiah(p.harga_jual)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {p.stok <= p.stok_minimum && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
                          <span className={`font-mono font-bold text-sm ${
                            p.stok === 0 ? 'text-red-400' : p.stok <= p.stok_minimum ? 'text-yellow-400' : 'text-white'}`}>
                            {p.stok}
                          </span>
                          <span className="text-xs text-[#64748b]">{p.satuan}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/produk/${p.id}`}
                            className="p-1.5 rounded-lg hover:bg-[#2a3045] text-[#64748b] hover:text-white transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button onClick={() => deleteProduct(p.id)} disabled={deleting === p.id}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#64748b] hover:text-red-400 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}