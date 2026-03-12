'use client'

import { Trash2, X, ShoppingCart, Tag } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import VoucherInput from '@/components/diskon/VoucherInput'
import type { CartItem } from './types'
import type { Customer } from '@/types/database'
import type { AppliedPromo } from '@/types/diskon'

type Props = {
  cart: CartItem[]
  total: number
  subtotal: number
  diskonTotal: number
  appliedPromos: AppliedPromo[]
  voucherPromoId: string | null
  voucherLabel: string
  storeId: string
  selectedCustomer: Customer | null
  onUpdateQty: (product_id: string, delta: number) => void
  onRemove: (product_id: string) => void
  onClear: () => void
  onCheckout: () => void
  onSelectCustomer: () => void
  onClearCustomer: () => void
  onVoucherApply: (promoId: string, diskon: number, label: string) => void
  onVoucherRemove: () => void
  onCloseCart?: () => void
  isMobile?: boolean
}

export default function CartPanel({
  cart, total, subtotal, diskonTotal, appliedPromos,
  voucherPromoId, voucherLabel, storeId,
  selectedCustomer, onUpdateQty, onRemove, onClear,
  onCheckout, onSelectCustomer, onClearCustomer,
  onVoucherApply, onVoucherRemove,
  onCloseCart, isMobile,
}: Props) {
  return (
    <div className="flex flex-col h-full bg-[#181c27] border-l border-[#2a3045]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a3045]">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-green-400" />
          <span className="font-black text-white text-sm">Keranjang</span>
          {cart.length > 0 && (
            <span className="text-[10px] font-black bg-green-400 text-[#0a0d14] px-1.5 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.qty, 0)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {cart.length > 0 && (
            <button onClick={onClear} className="p-1.5 rounded-lg text-[#3a4560] hover:text-red-400 hover:bg-red-400/10 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {isMobile && onCloseCart && (
            <button onClick={onCloseCart} className="p-1.5 rounded-lg text-[#3a4560] hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <ShoppingCart className="w-8 h-8 text-[#2a3045] mb-2" />
            <p className="text-[#3a4560] text-xs">Keranjang kosong</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.product_id} className="flex items-center gap-2.5 p-2.5 bg-[#1e2333] rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{item.nama_produk}</div>
                <div className="text-[10px] text-[#64748b]">{formatRupiah(item.harga_jual)}</div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => onUpdateQty(item.product_id, -1)}
                  className="w-6 h-6 rounded-lg bg-[#2a3045] text-white text-sm font-black flex items-center justify-center hover:bg-[#3a4560] transition-colors">
                  −
                </button>
                <span className="text-sm font-black text-white w-5 text-center">{item.qty}</span>
                <button onClick={() => onUpdateQty(item.product_id, 1)}
                  disabled={item.qty >= item.stok}
                  className="w-6 h-6 rounded-lg bg-[#2a3045] text-white text-sm font-black flex items-center justify-center hover:bg-[#3a4560] transition-colors disabled:opacity-40">
                  +
                </button>
                <button onClick={() => onRemove(item.product_id)}
                  className="w-6 h-6 rounded-lg text-[#3a4560] hover:text-red-400 hover:bg-red-400/10 transition-colors flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom section */}
      {cart.length > 0 && (
        <div className="border-t border-[#2a3045] p-3 space-y-3">
          {/* Pelanggan */}
          <div>
            {selectedCustomer ? (
              <div className="flex items-center justify-between px-3 py-2 bg-[#1e2333] rounded-xl">
                <div className="text-xs">
                  <span className="text-[#64748b]">Pelanggan: </span>
                  <span className="font-semibold text-white">{selectedCustomer.nama}</span>
                </div>
                <button onClick={onClearCustomer} className="text-[#3a4560] hover:text-red-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={onSelectCustomer}
                className="w-full px-3 py-2 border border-dashed border-[#2a3045] hover:border-green-500/40 rounded-xl text-[#64748b] hover:text-green-400 text-xs font-semibold transition-all">
                + Pilih Pelanggan (opsional)
              </button>
            )}
          </div>

          {/* Voucher input */}
          <VoucherInput
            storeId={storeId}
            total={subtotal}
            appliedPromoId={voucherPromoId}
            appliedLabel={voucherLabel}
            onApply={onVoucherApply}
            onRemove={onVoucherRemove}
          />

          {/* Applied auto promos */}
          {appliedPromos.length > 0 && (
            <div className="space-y-1">
              {appliedPromos.map((ap, i) => (
                <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 bg-green-400/5 border border-green-500/20 rounded-lg">
                  <Tag className="w-3 h-3 text-green-400 flex-shrink-0" />
                  <span className="text-[10px] text-green-400 flex-1">{ap.label}</span>
                  <span className="text-[10px] font-black text-green-400">-{formatRupiah(ap.diskon_amount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Summary harga */}
          <div className="space-y-1 text-xs">
            {diskonTotal > 0 && (
              <>
                <div className="flex justify-between text-[#64748b]">
                  <span>Subtotal</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Diskon</span>
                  <span>-{formatRupiah(diskonTotal)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between font-black text-white text-sm pt-1 border-t border-[#2a3045]">
              <span>Total</span>
              <span>{formatRupiah(total)}</span>
            </div>
          </div>

          <button onClick={onCheckout}
            className="w-full py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
            Bayar {formatRupiah(total)}
          </button>
        </div>
      )}
    </div>
  )
}