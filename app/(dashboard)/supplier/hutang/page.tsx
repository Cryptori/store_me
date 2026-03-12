'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { formatRupiah } from '@/lib/utils'
import type { SupplierDebt } from '@/types/supplier'

export default function HutangSupplierPage() {
  const { store } = useStore()
  const [debts, setDebts]       = useState<SupplierDebt[]>([])
  const [loading, setLoading]   = useState(true)
  const [bayarId, setBayarId]   = useState<string | null>(null)
  const [bayarAmount, setBayarAmount] = useState('')
  const [paying, setPaying]     = useState(false)

  useEffect(() => { if (store) fetchDebts() }, [store])

  async function fetchDebts() {
    setLoading(true)
    const { data } = await (createClient() as any)
      .from('supplier_debts')
      .select('*, supplier:suppliers(nama), po:purchase_orders(nomor_po)')
      .eq('store_id', store!.id)
      .eq('status', 'belum_lunas')
      .order('created_at', { ascending: false })
    setDebts((data ?? []) as SupplierDebt[])
    setLoading(false)
  }

  async function handleBayar(debt: SupplierDebt) {
    const jumlah = Number(bayarAmount)
    if (!jumlah || jumlah <= 0) return
    setPaying(true)
    await (createClient() as any).rpc('bayar_hutang_supplier', { p_debt_id: debt.id, p_jumlah: jumlah })
    setPaying(false)
    setBayarId(null)
    setBayarAmount('')
    fetchDebts()
  }

  const totalHutang = debts.reduce((s, d) => s + d.sisa, 0)

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Hutang Supplier</h1>
        <p className="text-[#64748b] text-sm mt-0.5">Utang dagang yang belum lunas</p>
      </div>

      {/* Total */}
      {totalHutang > 0 && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 mb-5">
          <div className="text-xs text-red-400/70 font-semibold mb-0.5">Total Hutang ke Supplier</div>
          <div className="text-2xl font-black text-red-400">{formatRupiah(totalHutang)}</div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-green-400" />
        </div>
      ) : debts.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle className="w-10 h-10 text-green-400/40 mx-auto mb-3" />
          <div className="text-[#64748b] text-sm">Tidak ada hutang ke supplier 🎉</div>
        </div>
      ) : (
        <div className="space-y-3">
          {debts.map(debt => (
            <div key={debt.id} className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="font-black text-white">{debt.supplier?.nama}</div>
                  {debt.po && <div className="text-xs text-[#64748b]">PO: {debt.po.nomor_po}</div>}
                  {debt.jatuh_tempo && (
                    <div className={`text-xs mt-0.5 ${new Date(debt.jatuh_tempo) < new Date() ? 'text-red-400' : 'text-[#64748b]'}`}>
                      Jatuh tempo: {new Date(debt.jatuh_tempo).toLocaleDateString('id-ID')}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-red-400">{formatRupiah(debt.sisa)}</div>
                  <div className="text-[10px] text-[#64748b]">dari {formatRupiah(debt.jumlah)}</div>
                </div>
              </div>

              {/* Progress bayar */}
              <div className="h-1.5 bg-[#1e2333] rounded-full overflow-hidden mb-3">
                <div className="h-full bg-green-400 rounded-full"
                  style={{ width: `${debt.sudah_dibayar / debt.jumlah * 100}%` }} />
              </div>

              {/* Bayar form */}
              {bayarId === debt.id ? (
                <div className="flex gap-2">
                  <input type="number" value={bayarAmount} onChange={e => setBayarAmount(e.target.value)}
                    placeholder={`Maks ${formatRupiah(debt.sisa)}`}
                    className="flex-1 px-3 py-2 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
                  <button onClick={() => handleBayar(debt)} disabled={paying || !bayarAmount}
                    className="px-4 py-2 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm disabled:opacity-50 transition-colors">
                    {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Bayar'}
                  </button>
                  <button onClick={() => { setBayarId(null); setBayarAmount('') }}
                    className="px-3 py-2 bg-[#1e2333] border border-[#2a3045] rounded-xl text-[#64748b] text-sm hover:text-white transition-colors">
                    Batal
                  </button>
                </div>
              ) : (
                <button onClick={() => { setBayarId(debt.id); setBayarAmount(String(debt.sisa)) }}
                  className="flex items-center gap-2 px-3 py-2 bg-[#1e2333] border border-[#2a3045] hover:border-green-500/40 hover:text-green-400 text-[#64748b] rounded-xl text-sm font-semibold transition-all">
                  <CreditCard className="w-3.5 h-3.5" />
                  Catat Pembayaran
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}