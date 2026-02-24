'use client'

import { ShoppingCart, Trash2, Plus, Minus, X, User, ChevronUp } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import type { Customer } from '@/types/database'
import type { CartItem } from './types'

type Props = {
  cart: CartItem[]
  total: number
  selectedCustomer: Customer | null
  onUpdateQty: (product_id: string, delta: number) => void
  onRemove: (product_id: string) => void
  onClear: () => void
  onCheckout: () => void
  onSelectCustomer: () => void
  onClearCustomer: () => void
  onCloseCart?: () => void
  isMobile?: boolean
}

export default function CartPanel({
  cart, total, selectedCustomer,
  onUpdateQty, onRemove, onClear, onCheckout,
  onSelectCustomer, onClearCustomer, onCloseCart, isMobile,
}: Props) {
  const totalQty = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="flex flex-col h-full bg-[#181c27] border-l border-[#2a3045]">
      {/* Header */}
      <div className="p-4 border-b border-[#2a3045] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-green-400" />
          <span className="font-bold text-sm">Keranjang</span>
          {cart.length > 0 && (
            <span className="bg-green-400 text-[#0a0d14] text-xs font-black px-1.5 py-0.5 rounded-full">{totalQty}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button onClick={onClear} className="text-xs text-[#64748b] hover:text-red-400 transition-colors flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Kosongkan
            </button>
          )}
          {isMobile && onCloseCart && (
            <button onClick={onCloseCart} className="text-[#64748b] hover:text-white">
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#64748b] py-12">
            <ShoppingCart className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Keranjang kosong</p>
          </div>
        ) : cart.map(item => (
          <div key={item.product_id} className="bg-[#1e2333] rounded-xl p-3 border border-[#2a3045]">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-semibold text-[#e2e8f0] leading-tight flex-1 pr-2">{item.nama_produk}</span>
              <button onClick={() => onRemove(item.product_id)} className="text-[#64748b] hover:text-red-400 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button onClick={() => onUpdateQty(item.product_id, -1)} className="w-6 h-6 rounded-lg bg-[#2a3045] hover:bg-[#3a4055] text-white flex items-center justify-center">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm font-bold font-mono">{item.qty}</span>
                <button onClick={() => onUpdateQty(item.product_id, 1)} disabled={item.qty >= item.stok} className="w-6 h-6 rounded-lg bg-[#2a3045] hover:bg-[#3a4055] text-white flex items-center justify-center disabled:opacity-40">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <span className="text-green-400 font-black text-sm font-mono">{formatRupiah(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#2a3045] space-y-3">
        {/* Pilih pelanggan */}
        <div onClick={onSelectCustomer} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#1e2333] border border-[#2a3045] hover:border-[#3a4560] transition-colors cursor-pointer">
          <User className="w-4 h-4 text-[#64748b] flex-shrink-0" />
          <span className={`text-sm flex-1 ${selectedCustomer ? 'text-white font-semibold' : 'text-[#64748b]'}`}>
            {selectedCustomer ? selectedCustomer.nama : 'Pilih pelanggan (opsional)'}
          </span>
          {selectedCustomer && (
            <div onClick={e => { e.stopPropagation(); onClearCustomer() }} className="text-[#64748b] hover:text-red-400 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between bg-[#1e2333] rounded-xl px-4 py-3 border border-[#2a3045]">
          <span className="text-[#94a3b8] text-sm font-semibold">Total</span>
          <span className="text-xl font-black text-white font-mono">{formatRupiah(total)}</span>
        </div>

        {/* Tombol bayar */}
        <button onClick={onCheckout} disabled={cart.length === 0}
          className="w-full py-3.5 rounded-xl bg-green-400 hover:bg-green-300 text-[#0a0d14] font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          {cart.length === 0 ? 'Keranjang Kosong' : `Bayar ${formatRupiah(total)}`}
        </button>
      </div>
    </div>
  )
}