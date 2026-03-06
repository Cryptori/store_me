'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
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
import UpgradeModal from '@/components/shared/UpgradeModal'

// Data dummy untuk preview blur laporan bulanan
const DUMMY_BULANAN = [
  { label: 'Jan', value: 4_200_000 },
  { label: 'Feb', value: 3_800_000 },
  { label: 'Mar', value: 5_100_000 },
]

export default function LaporanPage() {
  const { store } = useStore()
  const { isPro, canExportPDF } = useFreemium()
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState<'laporan_bulanan' | 'export_pdf' | null>(null)

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
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: false })

    const transactions = trxData ?? []
    const totalPenjualan = transactions.reduce((s: number, t: any) => s + t.total, 0)
    const totalTransaksi = transactions.length

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Laporan Harian</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Ringkasan penjualan per hari</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Laporan Bulanan — blur preview + upgrade modal kalau FREE */}
          {isPro ? (
            <a href="/laporan/bulanan"
              className="px-4 py-2.5 bg-[#181c27] border border-[#2a3045] text-[#94a3b8] hover:text-white rounded-xl text-sm font-semibold transition-colors">
              Laporan Bulanan →
            </a>
          ) : (
            <button onClick={() => setShowUpgradeModal('laporan_bulanan')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#181c27] border border-[#2a3045] text-[#64748b] rounded-xl text-sm font-semibold hover:border-green-500/30 hover:text-green-400 transition-all">
              <Lock className="w-3.5 h-3.5" /> Bulanan (PRO)
            </button>
          )}

          {/* Export PDF */}
          {canExportPDF && data ? (
            <button onClick={() => exportPDFHarian(store?.nama ?? 'Toko', tanggal, data)}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-400/10 border border-green-500/20 text-green-400 hover:bg-green-400/20 rounded-xl text-sm font-bold transition-colors">
              <FileDown className="w-4 h-4" /> Export PDF
            </button>
          ) : !isPro ? (
            <button onClick={() => setShowUpgradeModal('export_pdf')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#181c27] border border-[#2a3045] text-[#64748b] rounded-xl text-sm font-semibold hover:border-green-500/30 hover:text-green-400 transition-all">
              <Lock className="w-3.5 h-3.5" /> Export PDF (PRO)
            </button>
          ) : null}

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

          {/* Laporan Bulanan blur teaser — hanya untuk FREE */}
          {!isPro && (
            <div className="mt-6 relative rounded-2xl overflow-hidden border border-[#2a3045]">
              {/* Blurred fake chart */}
              <div className="blur-sm pointer-events-none select-none p-6 bg-[#181c27]">
                <div className="text-sm font-bold text-[#64748b] mb-4">Tren Penjualan Bulanan</div>
                <div className="flex items-end gap-3 h-24">
                  {DUMMY_BULANAN.map(d => (
                    <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-xs text-[#64748b]">{formatRupiah(d.value)}</div>
                      <div
                        className="w-full bg-green-400/40 rounded-t"
                        style={{ height: `${(d.value / 5_100_000) * 80}px` }}
                      />
                      <div className="text-xs text-[#64748b]">{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Overlay CTA */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
                <div className="text-center p-6">
                  <div className="w-10 h-10 rounded-full bg-green-400/20 border border-green-400/30 flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-sm font-black text-white mb-1">Tren Penjualan Bulanan</div>
                  <div className="text-xs text-[#64748b] mb-4">Lihat performa toko kamu per bulan dengan grafik lengkap</div>
                  <button onClick={() => setShowUpgradeModal('laporan_bulanan')}
                    className="px-5 py-2.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-xs transition-colors">
                    Unlock dengan PRO
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {showUpgradeModal && (
        <UpgradeModal
          trigger={showUpgradeModal}
          onClose={() => setShowUpgradeModal(null)}
        />
      )}
    </div>
  )
}