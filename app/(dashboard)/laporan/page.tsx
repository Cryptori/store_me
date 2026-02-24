'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Lock, FileDown, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { useFreemium } from '@/hooks/useFreemium'
import { formatRupiah } from '@/lib/utils'
import LaporanStatsCards from '@/components/laporan/LaporanStatsCards'
import ProdukTerlaris from '@/components/laporan/ProdukTerlaris'
import { MetodePembayaran, JamTransaksi } from '@/components/laporan/MetodePembayaran'
import TransaksiTable from '@/components/laporan/TransaksiTable'
import { exportPDFHarian } from '@/components/laporan/exportPDFHarian'

export default function LaporanPage() {
  const { store } = useStore()
  const { isPro, canExportPDF } = useFreemium()
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (store) fetchLaporan() }, [store, tanggal])

  async function fetchLaporan() {
    setLoading(true)
    const supabase = createClient()
    const start = new Date(tanggal); start.setHours(0, 0, 0, 0)
    const end = new Date(tanggal); end.setHours(23, 59, 59, 999)

    const { data: trxData } = await supabase
      .from('transactions')
      .select('*, transaction_items(*, products(nama)), customers(nama)')
      .eq('store_id', store!.id).eq('status', 'selesai')
      .gte('created_at', start.toISOString()).lte('created_at', end.toISOString())
      .order('created_at', { ascending: false })

    const transactions = trxData ?? []
    const totalPenjualan = transactions.reduce((s: number, t: any) => s + t.total, 0)
    const totalTransaksi = transactions.length

    // Hitung produk terlaris
    const produkMap: Record<string, { qty: number; total: number }> = {}
    transactions.forEach((t: any) => {
      t.transaction_items?.forEach((item: any) => {
        if (!produkMap[item.nama_produk]) produkMap[item.nama_produk] = { qty: 0, total: 0 }
        produkMap[item.nama_produk].qty += item.qty
        produkMap[item.nama_produk].total += item.subtotal
      })
    })
    const produkTerlaris = Object.entries(produkMap)
      .map(([nama, v]) => ({ nama, ...v }))
      .sort((a, b) => b.total - a.total).slice(0, 5)

    // Hitung per metode
    const metodeMap: Record<string, number> = {}
    transactions.forEach((t: any) => {
      metodeMap[t.metode_bayar] = (metodeMap[t.metode_bayar] ?? 0) + t.total
    })

    setData({ transactions, totalPenjualan, totalTransaksi, produkTerlaris, metodeMap })
    setLoading(false)
  }

  const statsCards = data ? [
    { label: 'Total Penjualan', value: formatRupiah(data.totalPenjualan), color: 'green' as const },
    { label: 'Jumlah Transaksi', value: data.totalTransaksi.toString(), color: 'cyan' as const },
    { label: 'Rata-rata/Transaksi', value: data.totalTransaksi > 0 ? formatRupiah(data.totalPenjualan / data.totalTransaksi) : 'Rp 0', color: 'yellow' as const },
    { label: 'Transaksi Hutang', value: data.transactions.filter((t: any) => t.metode_bayar === 'hutang').length.toString(), color: 'red' as const },
  ] : []

  return (
    <div className="p-4 md:p-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Laporan Harian</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Ringkasan penjualan per hari</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isPro ? (
            <Link href="/laporan/bulanan" className="px-4 py-2.5 bg-[#181c27] border border-[#2a3045] text-[#94a3b8] hover:text-white rounded-xl text-sm font-semibold transition-colors">
              Laporan Bulanan →
            </Link>
          ) : (
            <Link href="/upgrade" className="flex items-center gap-2 px-4 py-2.5 bg-[#181c27] border border-[#2a3045] text-[#64748b] rounded-xl text-sm font-semibold hover:border-green-500/30 hover:text-green-400 transition-all">
              <Lock className="w-3.5 h-3.5" /> Bulanan (PRO)
            </Link>
          )}
          {canExportPDF && data && (
            <button onClick={() => exportPDFHarian(store?.nama ?? 'Toko', tanggal, data)}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-400/10 border border-green-500/20 text-green-400 hover:bg-green-400/20 rounded-xl text-sm font-bold transition-colors">
              <FileDown className="w-4 h-4" /> Export PDF
            </button>
          )}
          <input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="px-4 py-2.5 bg-[#181c27] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-green-400" />
        </div>
      ) : !data ? null : (
        <>
          <LaporanStatsCards cards={statsCards} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <ProdukTerlaris products={data.produkTerlaris} />
            <MetodePembayaran metodeMap={data.metodeMap} />
            <JamTransaksi transactions={data.transactions} />
          </div>

          <TransaksiTable transactions={data.transactions} canExportPDF={canExportPDF} />
        </>
      )}
    </div>
  )
}