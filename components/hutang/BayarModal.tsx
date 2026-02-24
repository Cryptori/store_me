'use client'

import { X, Loader2 } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import type { HutangItem } from './types'

type Props = {
  hutang: HutangItem
  jumlahBayar: string
  loading: boolean
  onChange: (v: string) => void
  onProcess: () => void
  onClose: () => void
}

export default function BayarModal({ hutang, jumlahBayar, loading, onChange, onProcess, onClose }: Props) {
  const bayar = Number(jumlahBayar)
  const sisaSetelah = hutang.sisa - bayar
  const isValid = bayar > 0 && bayar <= hutang.sisa

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-[#181c27] border border-[#2a3045] rounded-t-2xl md:rounded-2xl w-full md:max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#2a3045]">
          <h3 className="font-black text-lg">Bayar Hutang</h3>
          <button onClick={onClose} className="text-[#64748b] hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Info pelanggan */}
          <div className="bg-[#1e2333] rounded-xl p-4 border border-[#2a3045]">
            <div className="font-semibold text-white mb-1">{hutang.customer_nama}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#64748b]">Sisa hutang</span>
              <span className="font-black text-red-400 font-mono">{formatRupiah(hutang.sisa)}</span>
            </div>
          </div>

          {/* Input jumlah bayar */}
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">Jumlah Bayar</label>
            <input
              type="number"
              placeholder="0"
              value={jumlahBayar}
              onChange={e => onChange(e.target.value)}
              max={hutang.sisa}
              className="w-full px-4 py-3 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white text-lg font-mono font-bold outline-none focus:border-green-500/40"
            />
            <button onClick={() => onChange(hutang.sisa.toString())}
              className="mt-2 text-xs text-green-400 hover:text-green-300 font-semibold transition-colors">
              + Lunas semua ({formatRupiah(hutang.sisa)})
            </button>
          </div>

          {/* Preview sisa */}
          {isValid && (
            <div className="bg-[#1a2a1a] border border-green-500/20 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#64748b]">Sisa setelah bayar</span>
                <span className={`font-black font-mono ${sisaSetelah <= 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {sisaSetelah <= 0 ? 'LUNAS ✓' : formatRupiah(sisaSetelah)}
                </span>
              </div>
            </div>
          )}

          {bayar > hutang.sisa && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">Jumlah bayar melebihi sisa hutang</p>
            </div>
          )}

          <button onClick={onProcess} disabled={loading || !isValid}
            className="w-full py-3.5 rounded-xl bg-green-400 hover:bg-green-300 text-[#0a0d14] font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
              : `✓ Catat Pembayaran ${formatRupiah(bayar || 0)}`}
          </button>
        </div>
      </div>
    </div>
  )
}