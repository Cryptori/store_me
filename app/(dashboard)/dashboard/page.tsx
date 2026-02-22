'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, ShoppingCart, Users, AlertTriangle, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { formatRupiah, formatTanggal, singkatAngka } from '@/lib/utils'
import type { Product, Transaction, Debt } from '@/types/database'

type DashboardStats = {
  penjualanHariIni: number
  transaksiHariIni: number
  stokMenipis: number
  totalHutang: number
  penjualan7Hari: { tanggal: string; total: number }[]
  transaksiTerakhir: (Transaction & { customer_nama?: string })[]
  hutangAktif: (Debt & { customer_nama: string })[]
  produkMenipis: Product[]
}

export default function DashboardPage() {
  const { store } = useStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!store) return
    async function fetchStats() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()

      const [trxToday, stokMenipis, hutangData, trxTerakhir, hutangList, produkMenipis] = await Promise.all([
        // Transaksi hari ini
        supabase.from('transactions').select('total').eq('store_id', store!.id).gte('created_at', todayISO).eq('status', 'selesai'),
        // Stok menipis
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('store_id', store!.id).lte('stok', 5).gt('stok', 0),
        // Total hutang aktif
        supabase.from('debts').select('sisa').eq('store_id', store!.id).eq('status', 'belum_lunas'),
        // 5 transaksi terakhir
        supabase.from('transactions').select('*, customers(nama)').eq('store_id', store!.id).order('created_at', { ascending: false }).limit(5),
        // Hutang aktif
        supabase.from('debts').select('*, customers(nama)').eq('store_id', store!.id).eq('status', 'belum_lunas').order('created_at', { ascending: false }).limit(5),
        // Produk stok menipis
        supabase.from('products').select('*').eq('store_id', store!.id).lte('stok', 5).gt('stok', 0).order('stok').limit(5),
      ])

      const penjualanHariIni = trxToday.data?.reduce((s, t) => s + t.total, 0) ?? 0
      const transaksiHariIni = trxToday.data?.length ?? 0
      const totalHutang = hutangData.data?.reduce((s, d) => s + d.sisa, 0) ?? 0

      setStats({
        penjualanHariIni,
        transaksiHariIni,
        stokMenipis: stokMenipis.count ?? 0,
        totalHutang,
        penjualan7Hari: [],
        transaksiTerakhir: (trxTerakhir.data ?? []).map((t: any) => ({
          ...t,
          customer_nama: t.customers?.nama,
        })),
        hutangAktif: (hutangList.data ?? []).map((d: any) => ({
          ...d,
          customer_nama: d.customers?.nama ?? 'Unknown',
        })),
        produkMenipis: produkMenipis.data ?? [],
      })
      setLoading(false)
    }
    fetchStats()
  }, [store])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{formatTanggal(new Date())}</p>
        </div>
        <Link href="/kasir" className="flex items-center gap-2 px-4 py-2.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
          <ShoppingCart className="w-4 h-4" /> Buka Kasir
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Penjualan Hari Ini', value: formatRupiah(stats?.penjualanHariIni ?? 0),
            icon: TrendingUp, color: 'green', sub: `${stats?.transaksiHariIni ?? 0} transaksi`
          },
          {
            label: 'Total Transaksi', value: String(stats?.transaksiHariIni ?? 0),
            icon: ShoppingCart, color: 'cyan', sub: 'hari ini'
          },
          {
            label: 'Stok Menipis', value: String(stats?.stokMenipis ?? 0),
            icon: AlertTriangle, color: 'yellow', sub: 'produk perlu restock'
          },
          {
            label: 'Total Hutang', value: formatRupiah(stats?.totalHutang ?? 0),
            icon: Users, color: 'red', sub: 'belum lunas'
          },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className={`bg-[#181c27] border border-[#2a3045] rounded-xl p-4 relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${
              color === 'green' ? 'bg-green-400' :
              color === 'cyan' ? 'bg-cyan-400' :
              color === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
            <Icon className={`w-4 h-4 mb-3 ${
              color === 'green' ? 'text-green-400' :
              color === 'cyan' ? 'text-cyan-400' :
              color === 'yellow' ? 'text-yellow-400' : 'text-red-400'
            }`} />
            <div className="text-xs text-[#64748b] mb-1">{label}</div>
            <div className={`text-xl font-black font-mono ${
              color === 'green' ? 'text-green-400' :
              color === 'cyan' ? 'text-cyan-400' :
              color === 'yellow' ? 'text-yellow-400' : 'text-red-400'
            }`}>{value}</div>
            <div className="text-xs text-[#64748b] mt-1">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaksi terakhir */}
        <div className="lg:col-span-2 bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#2a3045]">
            <h2 className="font-bold text-sm">Transaksi Terakhir</h2>
            <Link href="/laporan" className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a3045]">
                  {['No. Transaksi', 'Pelanggan', 'Total', 'Bayar', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-[#64748b] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats?.transaksiTerakhir.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-[#64748b] text-sm">Belum ada transaksi hari ini</td></tr>
                ) : stats?.transaksiTerakhir.map(trx => (
                  <tr key={trx.id} className="border-b border-[#2a3045] last:border-0 hover:bg-[#1e2333] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#64748b]">{trx.nomor_transaksi}</td>
                    <td className="px-4 py-3 text-sm">{trx.customer_nama ?? 'Umum'}</td>
                    <td className="px-4 py-3 font-mono font-bold text-sm">{formatRupiah(trx.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                        trx.metode_bayar === 'tunai' ? 'bg-green-400/10 text-green-400' :
                        trx.metode_bayar === 'transfer' ? 'bg-cyan-400/10 text-cyan-400' :
                        trx.metode_bayar === 'hutang' ? 'bg-yellow-400/10 text-yellow-400' :
                        'bg-purple-400/10 text-purple-400'
                      }`}>
                        {trx.metode_bayar.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-green-400/10 text-green-400">
                        {trx.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Stok menipis */}
          <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#2a3045]">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" /> Stok Menipis
              </h2>
              <Link href="/stok" className="text-xs text-green-400 hover:text-green-300">Kelola →</Link>
            </div>
            <div className="p-4 space-y-3">
              {stats?.produkMenipis.length === 0 ? (
                <p className="text-center text-[#64748b] text-sm py-4">Semua stok aman ✓</p>
              ) : stats?.produkMenipis.map(p => (
                <div key={p.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{p.nama}</div>
                    <div className="text-xs text-[#64748b] font-mono">{p.sku ?? '-'}</div>
                  </div>
                  <span className={`font-black text-sm font-mono ${p.stok <= 3 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {p.stok}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hutang aktif */}
          <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#2a3045]">
              <h2 className="font-bold text-sm">Hutang Aktif</h2>
              <Link href="/hutang" className="text-xs text-green-400 hover:text-green-300">Kelola →</Link>
            </div>
            <div className="p-4 space-y-3">
              {stats?.hutangAktif.length === 0 ? (
                <p className="text-center text-[#64748b] text-sm py-4">Tidak ada hutang aktif ✓</p>
              ) : stats?.hutangAktif.map(d => (
                <div key={d.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1e2333] flex items-center justify-center text-xs font-black text-cyan-400 flex-shrink-0">
                    {d.customer_nama.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{d.customer_nama}</div>
                    {d.jatuh_tempo && (
                      <div className="text-xs text-[#64748b]">{formatTanggal(d.jatuh_tempo)}</div>
                    )}
                  </div>
                  <span className="text-red-400 font-black text-sm font-mono flex-shrink-0">
                    {formatRupiah(d.sisa)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}