'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import type { Product } from '@/types/database'
import StokAlert from '@/components/stok/StokAlert'
import StokTable from '@/components/stok/StokTable'
import StokCards from '@/components/stok/StokCards'

type FilterType = 'semua' | 'menipis' | 'habis'

export default function StokPage() {
  const { store } = useStore()
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('semua')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [tambahStok, setTambahStok] = useState<{ [id: string]: string }>({})

  useEffect(() => { if (store) fetchStok() }, [store])

  useEffect(() => {
    let list = products
    if (filter === 'menipis') list = list.filter(p => p.stok <= p.stok_minimum && p.stok > 0)
    if (filter === 'habis') list = list.filter(p => p.stok === 0)
    const q = search.toLowerCase()
    if (q) list = list.filter(p => p.nama.toLowerCase().includes(q))
    setFiltered(list)
  }, [products, filter, search])

  async function fetchStok() {
    const supabase = createClient()
    const { data } = await supabase
      .from('products').select('*')
      .eq('store_id', store!.id)
      .eq('is_active', true)
      .order('stok')
    setProducts(data ?? [])
    setLoading(false)
  }

  async function updateStok(product: Product) {
    const jumlah = Number(tambahStok[product.id])
    if (!jumlah || jumlah === 0) return

    const stokBaru = Math.max(0, product.stok + jumlah)

    // Konfirmasi kalau stok jadi negatif
    if (product.stok + jumlah < 0) {
      const ok = confirm(`Stok akan menjadi 0 (tidak bisa negatif). Lanjutkan?`)
      if (!ok) return
    }

    setUpdating(product.id)
    const supabase = createClient()

    // Tentukan tipe log dengan benar
    const tipe = jumlah > 0 ? 'masuk' : 'keluar'

    await Promise.all([
      (supabase as any).from('products').update({
        stok: stokBaru,
        updated_at: new Date().toISOString(),
      }).eq('id', product.id),

      (supabase as any).from('stock_logs').insert({
        product_id: product.id,
        store_id: store!.id,
        tipe,
        jumlah: Math.abs(jumlah),
        stok_sebelum: product.stok,
        stok_sesudah: stokBaru,
        keterangan: 'Update manual',
      }),
    ])

    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stok: stokBaru } : p))
    setTambahStok(prev => ({ ...prev, [product.id]: '' }))
    setUpdating(null)
  }

  function handleChange(id: string, val: string) {
    setTambahStok(prev => ({ ...prev, [id]: val }))
  }

  const menipis = products.filter(p => p.stok <= p.stok_minimum && p.stok > 0).length
  const habis = products.filter(p => p.stok === 0).length

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Manajemen Stok</h1>
        <p className="text-[#64748b] text-sm mt-0.5">
          {products.length} produk • {menipis} menipis • {habis} habis
        </p>
      </div>

      <StokAlert menipis={menipis} habis={habis} />

      {/* Filter & search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input type="text" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#181c27] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
        </div>
        <div className="flex gap-2">
          {(['semua', 'menipis', 'habis'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all border ${
                filter === f ? 'bg-[#1a2a1a] border-green-500/30 text-green-400' : 'bg-[#181c27] border-[#2a3045] text-[#64748b] hover:text-white'
              }`}>{f}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#64748b]">
            <p className="font-semibold">Tidak ada produk ditemukan</p>
          </div>
        ) : (
          <>
            <StokTable
              products={filtered}
              tambahStok={tambahStok}
              updating={updating}
              onChange={handleChange}
              onUpdate={updateStok}
            />
            <StokCards
              products={filtered}
              tambahStok={tambahStok}
              updating={updating}
              onChange={handleChange}
              onUpdate={updateStok}
            />
          </>
        )}
      </div>
    </div>
  )
}