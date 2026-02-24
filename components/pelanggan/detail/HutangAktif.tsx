'use client'

import { Plus, Check, AlertCircle, Loader2 } from 'lucide-react'
import { formatRupiah, formatTanggal } from '@/lib/utils'
import type { Debt } from '@/types/database'

type Props = {
  debts: Debt[]
  showBayar: string | null
  bayarAmount: string
  saving: boolean
  onToggleBayar: (id: string) => void
  onChangeBayar: (v: string) => void
  onLunas: (sisa: number) => void
  onProcess: (debtId: string) => void
}

export default function HutangAktif({ debts, showBayar, bayarAmount, saving, onToggleBayar, onChangeBayar, onLunas, onProcess }: Props) {
  const today = new Date()

  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden mb-4">
      <div className="p-4 border-b border-[#2a3045]">
        <h2 className="font-bold text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          Hutang Belum Lunas ({debts.length})
        </h2>
      </div>
      {debts.length === 0 ? (
        <div className="py-8 text-center text-[#64748b] text-sm">Tidak ada hutang aktif ✓</div>
      ) : debts.map(d => {
        const isLate = d.jatuh_tempo && new Date(d.jatuh_tempo) < today
        return (
          <div key={d.id} className="p-4 border-b border-[#2a3045] last:border-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm font-semibold">{formatTanggal(d.created_at)}</div>
                <div className="text-xs text-[#64748b] mt-0.5">
                  Total: {formatRupiah(d.jumlah)} •
                  Sisa: <span className="text-red-400 font-bold"> {formatRupiah(d.sisa)}</span>
                </div>
                {d.jatuh_tempo && (
                  <div className={`text-xs mt-0.5 ${isLate ? 'text-red-400 font-semibold' : 'text-yellow-400'}`}>
                    {isLate ? '⚠ Terlambat: ' : 'Jatuh tempo: '}{formatTanggal(d.jatuh_tempo)}
                  </div>
                )}
              </div>
              <button onClick={() => onToggleBayar(d.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-400/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-400/20 transition-colors">
                <Plus className="w-3 h-3" /> Bayar
              </button>
            </div>

            {showBayar === d.id && (
              <div className="mt-3 bg-[#1e2333] rounded-xl p-3 border border-[#2a3045]">
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={`Maks ${formatRupiah(d.sisa)}`}
                    value={bayarAmount}
                    onChange={e => onChangeBayar(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#0f1117] border border-[#2a3045] rounded-xl text-white text-sm font-mono outline-none focus:border-green-500/40"
                  />
                  <button onClick={() => onLunas(d.sisa)}
                    className="px-3 py-2 bg-[#0f1117] border border-[#2a3045] rounded-xl text-xs text-[#94a3b8] hover:text-white transition-colors whitespace-nowrap">
                    Lunas
                  </button>
                  <button onClick={() => onProcess(d.id)}
                    disabled={saving || !bayarAmount || Number(bayarAmount) <= 0 || Number(bayarAmount) > d.sisa}
                    className="px-4 py-2 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl text-sm font-black transition-all disabled:opacity-50 flex items-center gap-1">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                </div>
                {Number(bayarAmount) > d.sisa && (
                  <p className="text-red-400 text-xs mt-2">Jumlah melebihi sisa hutang</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}