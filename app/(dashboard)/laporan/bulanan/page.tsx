'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, FileDown, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { useFreemium } from '@/hooks/useFreemium'
import { formatRupiah } from '@/lib/utils'
import LaporanStatsCards from '@/components/laporan/LaporanStatsCards'
import { GrafikBulanan, TabelBulanan } from '@/components/laporan/GrafikBulanan'
import { exportPDFBulanan, type BulanData } from '@/components/laporan/exportPDFBulanan'

const TAHUN_OPTIONS = [2024, 2025, 2026, 2027]

export default function LaporanBulananPage() {
  const router = useRouter()
  const { store } = useStore()
  const { isPro } = useFreemium()
  const [data, setData] = useState<BulanData[]>([])
  const [loading, setLoading] = useState(true)
  const [tahun, setTahun] = useState(new Date().getFullYear())

  useEffect(() => {
    if (!store || !isPro) { setLoading(false); return }
    fetchLaporan()
  }, [store, tahun, isPro])

  async function fetchLaporan() {
    setLoading(true)
    const supabase = createClient()

    // Fix: fetch semua 12 bulan secara paralel (bukan sequential)
    const promises = Array.from({ length: 12 }, (_, i) => {
      const bulan = i + 1
      const start = new Date(tahun, bulan - 1, 1).toISOString()
      const end = new Date(tahun, bulan, 0, 23, 59, 59).toISOString()
      return supabase
        .from('transactions').select('total')
        .eq('store_id', store!.id).eq('status', 'selesai')
        .gte('created_at', start).lte('created_at', end)
    })

    const results = await Promise.all(promises)

    const hasil: BulanData[] = results.map((res, i) => {
      const bulan = i + 1
      const transactions = (res.data ?? []) as { total: number }[]
      const totalPenjualan = transactions.reduce((s, t) => s + t.total, 0)
      const totalTransaksi = transactions.length
      return {
        bulan: `${tahun}-${String(bulan).padStart(2, '0')}`,
        label: new Date(tahun, bulan - 1).toLocaleDateString('id-ID', { month: 'long' }),
        totalPenjualan,
        totalTransaksi,
        rataRata: totalTransaksi > 0 ? totalPenjualan / totalTransaksi : 0,
      }
    })

    setData(hasil)
    setLoading(false)
  }

  if (!isPro) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl p-10 text-center max-w-sm">
        <Lock className="w-10 h-10 text-[#64748b] mx-auto mb-4" />
        <h2 className="text-xl font-black text-white mb-2">Fitur PRO</h2>
        <p className="text-[#64748b] text-sm mb-6">Laporan bulanan hanya tersedia untuk pengguna PRO.</p>
        <button onClick={() => router.push('/upgrade')}
          className="w-full py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
          Upgrade Sekarang
        </button>
      </div>
    </div>
  )

  const totalTahunan = data.reduce((s, d) => s + d.totalPenjualan, 0)
  const bulanTerbaik = data.length > 0
    ? data.reduce((best, d) => d.totalPenjualan > best.totalPenjualan ? d : best, data[0])
    : null

  const statsCards = [
    { label: `Total Penjualan ${tahun}`, value: formatRupiah(totalTahunan), color: 'green' as const },
    { label: 'Bulan Terbaik', value: bulanTerbaik?.label ?? '-', color: 'cyan' as const },
    { label: 'Penjualan Bulan Terbaik', value: formatRupiah(bulanTerbaik?.totalPenjualan ?? 0), color: 'yellow' as const },
  ]

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#181c27] text-[#64748b] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">Laporan Bulanan</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Ringkasan penjualan per bulan</p>
        </div>
        <div className="flex items-center gap-2">
          {!loading && data.length > 0 && (
            <button onClick={() => exportPDFBulanan(store?.nama ?? 'Toko', tahun, data, totalTahunan)}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-400/10 border border-green-500/20 text-green-400 hover:bg-green-400/20 rounded-xl text-sm font-bold transition-colors">
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          )}
          <select value={tahun} onChange={e => setTahun(Number(e.target.value))}
            className="px-4 py-2.5 bg-[#181c27] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40">
            {TAHUN_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <LaporanStatsCards cards={statsCards} />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-green-400" />
        </div>
      ) : (
        <>
          <GrafikBulanan data={data} tahun={tahun} />
          <TabelBulanan data={data} tahun={tahun} />
        </>
      )}
    </div>
  )
}