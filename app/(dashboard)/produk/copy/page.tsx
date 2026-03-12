'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Copy, ArrowRight, Search, CheckSquare, Square, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useActiveStore } from '@/hooks/useActiveStore'
import { formatRupiah } from '@/lib/utils'
import type { Product, Store } from '@/types/database'

export default function CopyProdukPage() {
  const { stores, activeStore } = useActiveStore()
  const [sourceStore, setSourceStore] = useState<Store | null>(null)
  const [products, setProducts]       = useState<Product[]>([])
  const [selected, setSelected]       = useState<Set<string>>(new Set())
  const [search, setSearch]           = useState('')
  const [loading, setLoading]         = useState(false)
  const [copying, setCopying]         = useState(false)
  const [result, setResult]           = useState<{ copied: number; skipped: number } | null>(null)

  // Toko sumber = toko lain (bukan aktif)
  const otherStores = stores.filter(s => s.id !== activeStore?.id)

  useEffect(() => {
    if (otherStores.length > 0 && !sourceStore) {
      setSourceStore(otherStores[0])
    }
  }, [stores])

  useEffect(() => {
    if (sourceStore) fetchProducts()
  }, [sourceStore])

  async function fetchProducts() {
    if (!sourceStore) return
    setLoading(true)
    setSelected(new Set())
    const supabase = createClient()
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', sourceStore.id)
      .eq('is_active', true)
      .order('nama')
    setProducts((data ?? []) as Product[])
    setLoading(false)
  }

  const filtered = products.filter(p =>
    p.nama.toLowerCase().includes(search.toLowerCase())
  )

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(p => p.id)))
    }
  }

  function toggleOne(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleCopy() {
    if (!activeStore || !sourceStore || selected.size === 0) return
    setCopying(true)
    setResult(null)

    const supabase = createClient()
    const db = supabase as any
    const { data } = await db.rpc('copy_products_to_store', {
      p_source_store_id: sourceStore.id,
      p_target_store_id: activeStore.id,
      p_product_ids: Array.from(selected),
    })

    if (data?.success) {
      setResult({ copied: data.copied, skipped: data.skipped })
      setSelected(new Set())
    }
    setCopying(false)
  }

  if (otherStores.length === 0) return (
    <div className="p-6 max-w-lg text-center py-16">
      <div className="text-4xl mb-3">🏪</div>
      <h2 className="font-black text-white mb-2">Belum ada toko lain</h2>
      <p className="text-[#64748b] text-sm">Tambah toko kedua dulu untuk bisa copy produk antar toko.</p>
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Copy Produk</h1>
        <p className="text-[#64748b] text-sm mt-0.5">Salin produk dari toko lain ke toko aktif</p>
      </div>

      {/* Route: dari → ke */}
      <div className="flex items-center gap-3 bg-[#181c27] border border-[#2a3045] rounded-xl p-4 mb-4">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-[#64748b] font-bold uppercase tracking-wide mb-1">Dari</div>
          <select
            value={sourceStore?.id ?? ''}
            onChange={e => {
              const s = otherStores.find(s => s.id === e.target.value)
              if (s) setSourceStore(s)
            }}
            className="w-full bg-[#1e2333] border border-[#2a3045] rounded-lg text-white text-sm px-3 py-2 outline-none">
            {otherStores.map(s => (
              <option key={s.id} value={s.id}>{s.nama}</option>
            ))}
          </select>
        </div>
        <ArrowRight className="w-5 h-5 text-green-400 flex-shrink-0 mt-4" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-[#64748b] font-bold uppercase tracking-wide mb-1">Ke</div>
          <div className="px-3 py-2 bg-[#0f1117] border border-green-500/20 rounded-lg text-green-400 text-sm font-semibold truncate">
            {activeStore?.nama}
          </div>
        </div>
      </div>

      {/* Result banner */}
      {result && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-400/10 border border-green-500/30 rounded-xl mb-4 text-sm">
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-green-400 font-semibold">
            {result.copied} produk berhasil disalin
            {result.skipped > 0 && `, ${result.skipped} dilewati (nama duplikat)`}
          </span>
        </div>
      )}

      {/* Search + select all */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#181c27] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40"
          />
        </div>
        <button onClick={toggleAll}
          className="px-3 py-2 bg-[#181c27] border border-[#2a3045] rounded-xl text-xs font-bold text-[#64748b] hover:text-white transition-colors whitespace-nowrap">
          {selected.size === filtered.length && filtered.length > 0 ? 'Batal Semua' : 'Pilih Semua'}
        </button>
      </div>

      {/* Product list */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden mb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-green-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-[#64748b] text-sm">Tidak ada produk</div>
        ) : (
          <div className="divide-y divide-[#2a3045]">
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => toggleOne(p.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1e2333] transition-colors text-left">
                {selected.has(p.id)
                  ? <CheckSquare className="w-4 h-4 text-green-400 flex-shrink-0" />
                  : <Square className="w-4 h-4 text-[#3a4560] flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{p.nama}</div>
                  {p.sku && <div className="text-xs text-[#64748b]">SKU: {p.sku}</div>}
                </div>
                <div className="text-sm font-mono text-green-400 flex-shrink-0">
                  {formatRupiah(p.harga_jual)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        disabled={copying || selected.size === 0}
        className="w-full flex items-center justify-center gap-2 py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors disabled:opacity-50">
        {copying
          ? <><Loader2 className="w-4 h-4 animate-spin" />Menyalin...</>
          : <><Copy className="w-4 h-4" />Salin {selected.size > 0 ? `${selected.size} Produk` : 'Produk'} ke {activeStore?.nama}</>
        }
      </button>
    </div>
  )
}