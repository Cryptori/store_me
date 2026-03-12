'use client'

import { Search, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { formatRupiah } from '@/lib/utils'
import type { Product, Category } from '@/types/database'
import type { CartItem } from './types'

type Props = {
  products: Product[]
  cart: CartItem[]
  search: string
  loading: boolean
  categories: Category[]
  selectedCategory: string   // '' = semua
  onSearch: (q: string) => void
  onAddToCart: (product: Product) => void
  onCategoryChange: (id: string) => void
}

export default function ProductGrid({
  products, cart, search, loading, categories,
  selectedCategory, onSearch, onAddToCart, onCategoryChange,
}: Props) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0f1117]">

      {/* Search */}
      <div className="p-4 pb-2 border-b border-[#2a3045]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            placeholder="Cari produk atau SKU..."
            value={search}
            onChange={e => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181c27] border border-[#2a3045] text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40"
          />
        </div>

        {/* Category tabs — hanya tampil kalau ada kategori */}
        {categories.length > 0 && (
          <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => onCategoryChange('')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                selectedCategory === ''
                  ? 'bg-green-400/20 border-green-500/30 text-green-400'
                  : 'bg-[#181c27] border-[#2a3045] text-[#64748b] hover:text-white'
              }`}>
              Semua
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-green-400/20 border-green-500/30 text-green-400'
                    : 'bg-[#181c27] border-[#2a3045] text-[#64748b] hover:text-white'
                }`}>
                {cat.nama}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-[#64748b]" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#64748b]">
            <div className="text-4xl mb-3">📦</div>
            <p className="font-semibold">Produk tidak ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {products.map(product => {
              const inCart = cart.find(i => i.product_id === product.id)
              return (
                <button
                  key={product.id}
                  onClick={() => onAddToCart(product)}
                  className={`relative text-left p-3 rounded-xl border transition-all ${
                    inCart
                      ? 'bg-[#1a2a1a] border-green-500/40 hover:border-green-400'
                      : 'bg-[#181c27] border-[#2a3045] hover:border-[#3a4560] hover:bg-[#1e2333]'
                  }`}>

                  {/* Qty badge */}
                  {inCart && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-400 text-[#0a0d14] text-xs font-black flex items-center justify-center z-10">
                      {inCart.qty}
                    </div>
                  )}

                  {/* Foto atau emoji fallback */}
                  <div className="w-full aspect-square rounded-lg bg-[#0f1117] flex items-center justify-center text-2xl mb-2.5 overflow-hidden relative">
                    {product.gambar_url ? (
                      <Image
                        src={product.gambar_url}
                        alt={product.nama}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
                      />
                    ) : (
                      <span>🛍️</span>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-[#e2e8f0] leading-tight mb-1 line-clamp-2">
                    {product.nama}
                  </div>
                  <div className="text-green-400 font-black text-sm font-mono">
                    {formatRupiah(product.harga_jual)}
                  </div>
                  <div className={`text-xs mt-1 ${product.stok <= product.stok_minimum ? 'text-yellow-400' : 'text-[#64748b]'}`}>
                    Stok: {product.stok} {product.satuan}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}