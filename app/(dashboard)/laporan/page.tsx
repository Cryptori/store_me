'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BarChart2, TrendingUp, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { useFreemium } from '@/hooks/useFreemium'
import { formatRupiah, formatTanggal, formatJam } from '@/lib/utils'

export default function LaporanPage() {
  const { store } = useStore()
  const { isPro, canExportPDF } = useFreemium()
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  

  useEffect(() => { if (store) fetchLaporan() }, [store, tanggal])

  async function fetchLaporan() {
    setLoading(true)
    const start = new Date(tanggal)
    start.setHours(0, 0, 0, 0)
    const end = new Date(tanggal)
    end.setHours(23, 59, 59, 999)

    const { data: trxData } = await supabase
      .from('transactions')
      .select('*, transaction_items(*, products(nama)), customers(nama)')
      .eq('store_id', store!.id)
      .eq('status', 'selesai')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: false })

    const transactions = trxData ?? []
    const totalPenjualan = transactions.reduce((s: number, t: any) => s + t.total, 0)
    const totalTransaksi = transactions.length

    // Produk terlaris
    const produkMap: { [nama: string]: { qty: number; total: number } } = {}
    transactions.forEach((t: any) => {
      t.transaction_items?.forEach((item: any) => {
        if (!produkMap[item.nama_produk]) produkMap[item.nama_produk] = { qty: 0, total: 0 }
        produkMap[item.nama_produk].qty += item.qty
        produkMap[item.nama_produk].total += item.subtotal
      })
    })
    const produkTerlaris = Object.entries(produkMap)
      .map(([nama, v]) => ({ nama, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    // Metode bayar breakdown
    const metodeMap: { [key: string]: number } = {}
    transactions.forEach((t: any) => {
      metodeMap[t.metode_bayar] = (metodeMap[t.metode_bayar] ?? 0) + t.total
    })

    setData({ transactions, totalPenjualan, totalTransaksi, produkTerlaris, metodeMap })
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Laporan Harian</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Ringkasan penjualan per hari</p>
        </div>
        <div className="flex items-center gap-3">
          {isPro ? (
            <Link href="/laporan/bulanan" className="px-4 py-2.5 bg-[#181c27] border border-[#2a3045] text-[#94a3b8] hover:text-white rounded-xl text-sm font-semibold transition-colors">
              Laporan Bulanan →
            </Link>
          ) : (
            <Link href="/upgrade" className="flex items-center gap-2 px-4 py-2.5 bg-[#181c27] border border-[#2a3045] text-[#64748b] rounded-xl text-sm font-semibold hover:border-green-500/30 hover:text-green-400 transition-all">
              <Lock className="w-3.5 h-3.5" /> Laporan Bulanan (PRO)
            </Link>
          )}
          <input
            type="date"
            value={tanggal}
            onChange={e => setTanggal(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="px-4 py-2.5 bg-[#181c27] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full" />
        </div>
      ) : !data ? null : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Penjualan', value: formatRupiah(data.totalPenjualan), color: 'green' },
              { label: 'Jumlah Transaksi', value: data.totalTransaksi.toString(), color: 'cyan' },
              { label: 'Rata-rata/Transaksi', value: data.totalTransaksi > 0 ? formatRupiah(data.totalPenjualan / data.totalTransaksi) : 'Rp 0', color: 'yellow' },
              { label: 'Transaksi Hutang', value: data.transactions.filter((t: any) => t.metode_bayar === 'hutang').length.toString(), color: 'red' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
                <div className="text-xs text-[#64748b] mb-1">{label}</div>
                <div className={`text-xl font-black font-mono ${
                  color === 'green' ? 'text-green-400' : color === 'cyan' ? 'text-cyan-400' :
                  color === 'yellow' ? 'text-yellow-400' : 'text-red-400'
                }`}>{value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Produk terlaris */}
            <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#2a3045]">
                <h2 className="font-bold text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" /> Produk Terlaris
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {data.produkTerlaris.length === 0 ? (
                  <p className="text-center text-[#64748b] text-sm py-4">Belum ada data</p>
                ) : data.produkTerlaris.map((p: any, i: number) => (
                  <div key={p.nama} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-md bg-[#1e2333] text-[10px] font-black text-[#64748b] flex items-center justify-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{p.nama}</div>
                      <div className="text-xs text-[#64748b]">{p.qty} terjual</div>
                    </div>
                    <span className="text-sm font-bold font-mono text-green-400">{formatRupiah(p.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metode bayar */}
            <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#2a3045]">
                <h2 className="font-bold text-sm">Metode Pembayaran</h2>
              </div>
              <div className="p-4 space-y-3">
                {Object.entries(data.metodeMap).length === 0 ? (
                  <p className="text-center text-[#64748b] text-sm py-4">Belum ada data</p>
                ) : Object.entries(data.metodeMap).map(([metode, total]: any) => (
                  <div key={metode} className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                      metode === 'tunai' ? 'bg-green-400/10 text-green-400' :
                      metode === 'transfer' ? 'bg-cyan-400/10 text-cyan-400' :
                      metode === 'qris' ? 'bg-purple-400/10 text-purple-400' : 'bg-yellow-400/10 text-yellow-400'
                    }`}>{metode.toUpperCase()}</span>
                    <span className="font-mono font-bold text-sm">{formatRupiah(total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Jam ramai */}
            <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#2a3045]">
                <h2 className="font-bold text-sm">Jam Transaksi</h2>
              </div>
              <div className="p-4 space-y-2">
                {data.transactions.slice(0, 5).map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <span className="text-[#64748b] font-mono text-xs">{formatJam(t.created_at)}</span>
                    <span className="font-mono font-bold text-sm">{formatRupiah(t.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daftar transaksi */}
          <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#2a3045]">
              <h2 className="font-bold text-sm">Semua Transaksi ({data.totalTransaksi})</h2>
              {canExportPDF && (
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2333] border border-[#2a3045] text-[#94a3b8] hover:text-white rounded-lg text-xs font-semibold transition-colors">
                  Export PDF
                </button>
              )}
            </div>
            {data.transactions.length === 0 ? (
              <div className="py-12 text-center text-[#64748b] text-sm">Tidak ada transaksi pada tanggal ini</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a3045]">
                      {['Waktu', 'No. Transaksi', 'Pelanggan', 'Total', 'Metode'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((t: any) => (
                      <tr key={t.id} className="border-b border-[#2a3045] last:border-0 hover:bg-[#1e2333] transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-[#64748b]">{formatJam(t.created_at)}</td>
                        <td className="px-4 py-3 font-mono text-xs text-[#64748b]">{t.nomor_transaksi}</td>
                        <td className="px-4 py-3 text-sm">{t.customers?.nama ?? 'Umum'}</td>
                        <td className="px-4 py-3 font-mono font-bold text-sm">{formatRupiah(t.total)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                            t.metode_bayar === 'tunai' ? 'bg-green-400/10 text-green-400' :
                            t.metode_bayar === 'transfer' ? 'bg-cyan-400/10 text-cyan-400' :
                            t.metode_bayar === 'hutang' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-purple-400/10 text-purple-400'
                          }`}>{t.metode_bayar.toUpperCase()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}