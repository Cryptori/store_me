'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Search, MessageCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import type { Product } from '@/types/database'
import { shareStokWA } from '@/lib/stokNotification'
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
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('products').select('*')
      .eq('store_id', store!.id)
      .eq('is_active', true)
      .order('stok')
    setProducts((data ?? []) as Product[])
    setLoading(false)
  }

  async function updateStok(product: Product) {
    const jumlah = Number(tambahStok[product.id])
    if (!jumlah || jumlah === 0) return

    const stokBaru = Math.max(0, product.stok + jumlah)
    if (product.stok + jumlah < 0) {
      const ok = confirm('Stok akan menjadi 0 (tidak bisa negatif). Lanjutkan?')
      if (!ok) return
    }

    setUpdating(product.id)
    const supabase = createClient()
    const db = supabase as any

    await Promise.all([
      db.from('products').update({
        stok: stokBaru,
        updated_at: new Date().toISOString(),
      }).eq('id', product.id),
      db.from('stock_logs').insert({
        product_id: product.id,
        store_id: store!.id,
        tipe: jumlah > 0 ? 'masuk' : 'keluar',
        jumlah: Math.abs(jumlah),
        stok_sebelum: product.stok,
        stok_sesudah: stokBaru,
        keterangan: 'Update manual dari halaman stok',
      }),
    ])

    setProducts(prev => prev.map(p =>
      p.id === product.id ? { ...p, stok: stokBaru } : p
    ))
    setTambahStok(prev => ({ ...prev, [product.id]: '' }))
    setUpdating(null)
  }

  function handleChange(id: string, val: string) {
    setTambahStok(prev => ({ ...prev, [id]: val }))
  }

  const produkHabis = products.filter(p => p.stok === 0)
  const produkMenipis = products.filter(p => p.stok > 0 && p.stok <= p.stok_minimum)
  const totalAlert = produkHabis.length + produkMenipis.length

  function handleShareWA() {
    if (!store) return
    shareStokWA({
      storeName: store.nama,
      produkMenipis,
      produkHabis,
      phoneNumber: store.telepon ?? undefined,
    })
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Manajemen Stok</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{products.length} produk aktif</p>
        </div>
        <div className="flex items-center gap-2">
          {totalAlert > 0 && (
            <button onClick={handleShareWA}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20c05a] text-white rounded-xl font-black text-sm transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Kirim Alert WA</span>
              <span className="sm:hidden">WA</span>
              <span className="bg-white/20 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {totalAlert}
              </span>
            </button>
          )}
          <button onClick={fetchStok}
            className="p-2.5 rounded-xl bg-[#181c27] border border-[#2a3045] text-[#64748b] hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total Produk', value: products.length, color: 'text-white' },
          { label: 'Stok Menipis', value: produkMenipis.length, color: 'text-yellow-400' },
          { label: 'Stok Habis', value: produkHabis.length, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4 text-center">
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="text-xs text-[#64748b] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input type="text" placeholder="Cari produk..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#181c27] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
        </div>
        <div className="flex gap-1.5">
          {(['semua', 'menipis', 'habis'] as FilterType[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                filter === f
                  ? f === 'habis' ? 'bg-red-500/20 border-red-500/30 text-red-400'
                  : f === 'menipis' ? 'bg-yellow-400/20 border-yellow-400/30 text-yellow-400'
                  : 'bg-green-400/20 border-green-500/30 text-green-400'
                  : 'bg-[#181c27] border-[#2a3045] text-[#64748b] hover:text-white'
              }`}>
              {f}
              {f === 'menipis' && produkMenipis.length > 0 && (
                <span className="ml-1">({produkMenipis.length})</span>
              )}
              {f === 'habis' && produkHabis.length > 0 && (
                <span className="ml-1">({produkHabis.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Cards */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#64748b]">
            <div className="text-4xl mb-3">📦</div>
            <p className="font-semibold">Tidak ada produk</p>
          </div>
        ) : (
          <>
            <StokTable
              products={filtered}
              updating={updating}
              tambahStok={tambahStok}
              onChange={handleChange}
              onUpdate={updateStok}
            />
            <StokCards
              products={filtered}
              updating={updating}
              tambahStok={tambahStok}
              onChange={handleChange}
              onUpdate={updateStok}
            />
          </>
        )}
      </div>
    </div>
  )
}