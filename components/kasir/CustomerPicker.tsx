'use client'

import { X } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import type { Customer } from '@/types/database'

type Props = {
  customers: Customer[]
  search: string
  selectedCustomer: Customer | null
  onSearch: (q: string) => void
  onSelect: (customer: Customer) => void
  onClose: () => void
}

export default function CustomerPicker({ customers, search, selectedCustomer, onSearch, onSelect, onClose }: Props) {
  const filtered = customers.filter(c => c.nama.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50">
      <div className="bg-[#181c27] border border-[#2a3045] rounded-t-2xl md:rounded-2xl w-full md:max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#2a3045]">
          <h3 className="font-bold text-sm">Pilih Pelanggan</h3>
          <button onClick={onClose} className="text-[#64748b] hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4">
          <input
            type="text"
            placeholder="Cari pelanggan..."
            value={search}
            onChange={e => onSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white text-sm outline-none focus:border-green-500/40 mb-3"
          />
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filtered.length === 0 ? (
              <p className="text-center text-[#64748b] text-sm py-4">Pelanggan tidak ditemukan</p>
            ) : filtered.map(c => (
              <button key={c.id} onClick={() => { onSelect(c); onClose() }}
                className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#2a3045] transition-colors ${selectedCustomer?.id === c.id ? 'bg-[#1a2a1a] border border-green-500/30' : ''}`}>
                <div className="font-semibold text-sm">{c.nama}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  {c.telepon && <span className="text-xs text-[#64748b]">{c.telepon}</span>}
                  {c.total_hutang > 0 && <span className="text-xs text-red-400">Hutang: {formatRupiah(c.total_hutang)}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}