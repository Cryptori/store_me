'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { BarChart2, TrendingUp, Package, Users, CreditCard, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useActiveStore } from '@/hooks/useActiveStore'
import { formatRupiah, formatTanggalSingkat } from '@/lib/utils'

type StoreSummary = {
  store_id: string
  store_nama: string
  is_pro: boolean
  total_transaksi: number
  total_penjualan: number
  total_produk: number
  total_pelanggan: number
  hutang_aktif: number
}

type PeriodFilter = '7hari' | '30hari' | 'bulanini'

export default function LaporanGabunganPage() {
  const { stores } = useActiveStore()
  const [summaries, setSummaries] = useState<StoreSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<PeriodFilter>('30hari')

  useEffect(() => {
    if (stores.length > 0) fetchSummaries()
  }, [stores, period])

  async function fetchSummaries() {
    setLoading(true)
    const supabase = createClient()
    const db = supabase as any

    const now = new Date()
    let startDate: Date
    if (period === '7hari') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (period === '30hari') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const storeIds = stores.map(s => s.id)

    // Fetch semua data dalam satu batch
    const [trxRes, produkRes, pelangganRes, hutangRes] = await Promise.all([
      db.from('transactions')
        .select('store_id, total')
        .in('store_id', storeIds)
        .eq('status', 'selesai')
        .gte('created_at', startDate.toISOString()),

      db.from('products')
        .select('store_id')
        .in('store_id', storeIds)
        .eq('is_active', true),

      db.from('customers')
        .select('store_id')
        .in('store_id', storeIds),

      db.from('debts')
        .select('store_id')
        .in('store_id', storeIds)
        .eq('status', 'belum_lunas'),
    ])

    const trxData = (trxRes.data ?? []) as { store_id: string; total: number }[]
    const produkData = (produkRes.data ?? []) as { store_id: string }[]
    const pelangganData = (pelangganRes.data ?? []) as { store_id: string }[]
    const hutangData = (hutangRes.data ?? []) as { store_id: string }[]

    // Aggregate per store
    const result: StoreSummary[] = stores.map(store => {
      const storeTrx    = trxData.filter(t => t.store_id === store.id)
      const storeProduk = produkData.filter(p => p.store_id === store.id)
      const storePelanggan = pelangganData.filter(c => c.store_id === store.id)
      const storeHutang = hutangData.filter(d => d.store_id === store.id)
      return {
        store_id: store.id,
        store_nama: store.nama,
        is_pro: store.is_pro,
        total_transaksi: storeTrx.length,
        total_penjualan: storeTrx.reduce((s, t) => s + t.total, 0),
        total_produk: storeProduk.length,
        total_pelanggan: storePelanggan.length,
        hutang_aktif: storeHutang.length,
      }
    })

    setSummaries(result)
    setLoading(false)
  }

  const totalPenjualan = summaries.reduce((s, r) => s + r.total_penjualan, 0)
  const totalTransaksi = summaries.reduce((s, r) => s + r.total_transaksi, 0)

  if (stores.length <= 1) return (
    <div className="p-6 max-w-2xl text-center py-16">
      <div className="text-4xl mb-3">📊</div>
      <h2 className="font-black text-white mb-2">Laporan Gabungan</h2>
      <p className="text-[#64748b] text-sm">Fitur ini tersedia ketika kamu punya lebih dari 1 toko.</p>
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Laporan Gabungan</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{stores.length} toko</p>
        </div>
        {/* Period filter */}
        <div className="flex gap-1.5">
          {([['7hari', '7 Hari'], ['30hari', '30 Hari'], ['bulanini', 'Bulan Ini']] as [PeriodFilter, string][]).map(([val, label]) => (
            <button key={val} onClick={() => setPeriod(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                period === val
                  ? 'bg-green-400/20 border-green-500/30 text-green-400'
                  : 'bg-[#181c27] border-[#2a3045] text-[#64748b] hover:text-white'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Total semua toko */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-[#1a2a1a] to-[#0f1f1a] border border-green-500/20 rounded-xl p-4">
          <div className="text-xs text-[#64748b] font-semibold mb-1">Total Penjualan Semua Toko</div>
          <div className="text-2xl font-black text-green-400">{formatRupiah(totalPenjualan)}</div>
        </div>
        <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
          <div className="text-xs text-[#64748b] font-semibold mb-1">Total Transaksi</div>
          <div className="text-2xl font-black text-white">{totalTransaksi}</div>
        </div>
      </div>

      {/* Per-store breakdown */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-green-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {summaries.map(s => (
            <div key={s.store_id} className="bg-[#181c27] border border-[#2a3045] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-400/10 flex items-center justify-center">
                    <BarChart2 className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="font-black text-white">{s.store_nama}</span>
                  {s.is_pro && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 rounded">PRO</span>
                  )}
                </div>
                <span className="text-lg font-black text-green-400">{formatRupiah(s.total_penjualan)}</span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: TrendingUp,  label: 'Transaksi',  value: s.total_transaksi },
                  { icon: Package,     label: 'Produk',     value: s.total_produk },
                  { icon: Users,       label: 'Pelanggan',  value: s.total_pelanggan },
                  { icon: CreditCard,  label: 'Hutang',     value: s.hutang_aktif,  warn: s.hutang_aktif > 0 },
                ].map(({ icon: Icon, label, value, warn }) => (
                  <div key={label} className="text-center">
                    <div className={`text-lg font-black ${warn ? 'text-yellow-400' : 'text-white'}`}>{value}</div>
                    <div className="text-[10px] text-[#64748b]">{label}</div>
                  </div>
                ))}
              </div>

              {/* Progress bar kontribusi */}
              {totalPenjualan > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-[#64748b] mb-1">
                    <span>Kontribusi penjualan</span>
                    <span>{Math.round(s.total_penjualan / totalPenjualan * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1e2333] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full transition-all"
                      style={{ width: `${s.total_penjualan / totalPenjualan * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}