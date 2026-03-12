'use client'

import { X, Banknote, CreditCard, QrCode, User, Loader2 } from 'lucide-react'
import { formatRupiah, hitungKembalian } from '@/lib/utils'
import type { Customer } from '@/types/database'
import type { CartItem, MetodeBayar } from './types'

type Props = {
  cart: CartItem[]
  total: number
  subtotal?: number       // sebelum diskon (opsional, default = total)
  diskonTotal?: number    // total diskon (opsional, default = 0)
  metodeBayar: MetodeBayar
  bayar: string
  selectedCustomer: Customer | null
  customers: Customer[]
  customerSearch: string
  loading: boolean
  onMetode: (m: MetodeBayar) => void
  onBayar: (v: string) => void
  onCustomerSearch: (q: string) => void
  onSelectCustomer: (c: Customer) => void
  onProcess: () => void
  onClose: () => void
}

export default function CheckoutModal({
  cart, total, subtotal, diskonTotal = 0, metodeBayar, bayar, selectedCustomer, customers, customerSearch,
  loading, onMetode, onBayar, onCustomerSearch, onSelectCustomer, onProcess, onClose,
}: Props) {
  const kembalian = metodeBayar === 'tunai' ? hitungKembalian(total, Number(bayar)) : 0
  const totalQty = cart.reduce((s, i) => s + i.qty, 0)
  const filteredCustomers = customers.filter(c => c.nama.toLowerCase().includes(customerSearch.toLowerCase()))

  const isDisabled = loading
    || (metodeBayar === 'tunai' && Number(bayar) < total)
    || (metodeBayar === 'hutang' && !selectedCustomer)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-[#181c27] border border-[#2a3045] rounded-t-2xl md:rounded-2xl w-full md:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#2a3045]">
          <h3 className="font-black text-lg">Proses Pembayaran</h3>
          <button onClick={onClose} className="text-[#64748b] hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Total */}
          <div className="bg-[#1e2333] rounded-xl p-4 border border-[#2a3045]">
            <div className="text-xs text-[#64748b] mb-1 font-semibold uppercase tracking-wide">Total Belanja</div>
            <div className="text-3xl font-black text-green-400 font-mono">{formatRupiah(total)}</div>
            <div className="text-xs text-[#64748b] mt-1">{cart.length} item • {totalQty} qty</div>
          </div>

          {/* Metode bayar */}
          <div>
            <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">Metode Pembayaran</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'tunai', label: 'Tunai', icon: <Banknote className="w-4 h-4" /> },
                { value: 'transfer', label: 'Transfer', icon: <CreditCard className="w-4 h-4" /> },
                { value: 'qris', label: 'QRIS', icon: <QrCode className="w-4 h-4" /> },
                { value: 'hutang', label: 'Hutang', icon: <User className="w-4 h-4" /> },
              ].map(m => (
                <button key={m.value} onClick={() => onMetode(m.value as MetodeBayar)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    metodeBayar === m.value
                      ? 'bg-[#1a2a1a] border-green-500/40 text-green-400'
                      : 'bg-[#1e2333] border-[#2a3045] text-[#94a3b8] hover:border-[#3a4560]'
                  }`}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input tunai */}
          {metodeBayar === 'tunai' && (
            <div>
              <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">Uang Diterima</div>
              <input type="number" placeholder="0" value={bayar} onChange={e => onBayar(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white text-lg font-mono font-bold outline-none focus:border-green-500/40" />
              <div className="flex gap-2 mt-2">
                {[total, Math.ceil(total / 5000) * 5000, Math.ceil(total / 10000) * 10000, Math.ceil(total / 50000) * 50000]
                  .filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4)
                  .map(amount => (
                    <button key={amount} onClick={() => onBayar(amount.toString())}
                      className="flex-1 py-1.5 rounded-lg bg-[#1e2333] border border-[#2a3045] text-xs font-mono font-semibold text-[#94a3b8] hover:border-green-500/30 hover:text-green-400 transition-all">
                      {amount >= 1000 ? `${amount / 1000}k` : amount}
                    </button>
                  ))}
              </div>
              {Number(bayar) >= total && (
                <div className="mt-2 flex items-center justify-between bg-[#1a2a1a] border border-green-500/20 rounded-xl px-4 py-2">
                  <span className="text-xs text-[#64748b]">Kembalian</span>
                  <span className="font-black text-green-400 font-mono">{formatRupiah(kembalian)}</span>
                </div>
              )}
            </div>
          )}

          {/* Pilih pelanggan untuk hutang */}
          {metodeBayar === 'hutang' && (
            <div>
              <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">Pilih Pelanggan</div>
              <input type="text" placeholder="Cari nama pelanggan..." value={customerSearch} onChange={e => onCustomerSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white text-sm outline-none focus:border-green-500/40 mb-2" />
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredCustomers.map(c => (
                  <button key={c.id} onClick={() => onSelectCustomer(c)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedCustomer?.id === c.id ? 'bg-[#1a2a1a] text-green-400 border border-green-500/30' : 'hover:bg-[#2a3045] text-[#94a3b8]'
                    }`}>
                    <span className="font-semibold">{c.nama}</span>
                    {c.total_hutang > 0 && <span className="text-xs text-red-400 ml-2">Hutang: {formatRupiah(c.total_hutang)}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tombol proses */}
          <button onClick={onProcess} disabled={isDisabled}
            className="w-full py-3.5 rounded-xl bg-green-400 hover:bg-green-300 text-[#0a0d14] font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</> : `✓ Proses Pembayaran ${formatRupiah(total)}`}
          </button>
        </div>
      </div>
    </div>
  )
}