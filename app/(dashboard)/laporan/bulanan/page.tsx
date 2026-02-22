'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, TrendingUp, FileDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { useFreemium } from '@/hooks/useFreemium'
import { formatRupiah } from '@/lib/utils'

type BulanData = {
  bulan: string
  label: string
  totalPenjualan: number
  totalTransaksi: number
  rataRata: number
}

function exportPDFBulanan(storeName: string, tahun: number, data: BulanData[], totalTahunan: number) {
  const rowsHtml = data.map((d, i) => `
    <tr style="${i % 2 === 0 ? '' : 'background:#f9fafb'}">
      <td>${d.label}</td>
      <td style="text-align:right">${formatRupiah(d.totalPenjualan)}</td>
      <td style="text-align:center">${d.totalTransaksi}</td>
      <td style="text-align:right">${formatRupiah(d.rataRata)}</td>
    </tr>
  `).join('')

  const bulanTerbaik = data.reduce((best, d) => d.totalPenjualan > best.totalPenjualan ? d : best, data[0])

  const html = `
    <!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <title>Laporan Bulanan ${tahun} - ${storeName}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; padding: 30px; }
      .header { border-bottom: 2px solid #22c55e; padding-bottom: 12px; margin-bottom: 20px; }
      .header h1 { font-size: 20px; color: #16a34a; }
      .header p { color: #666; font-size: 11px; margin-top: 2px; }
      .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
      .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
      .card .label { font-size: 10px; color: #6b7280; text-transform: uppercase; }
      .card .value { font-size: 16px; font-weight: bold; color: #16a34a; margin-top: 3px; }
      h2 { font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #374151; border-left: 3px solid #22c55e; padding-left: 8px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
      th { background: #f3f4f6; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; color: #6b7280; }
      td { padding: 7px 8px; border-bottom: 1px solid #f3f4f6; }
      tfoot td { font-weight: bold; background: #f0fdf4; border-top: 2px solid #22c55e; }
      .footer { text-align: center; color: #9ca3af; font-size: 10px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    </style>
    </head><body>
    <div class="header">
      <h1>${storeName}</h1>
      <p>Laporan Bulanan — Tahun ${tahun}</p>
      <p>Dicetak: ${new Date().toLocaleString('id-ID')}</p>
    </div>
    <div class="summary">
      <div class="card"><div class="label">Total Penjualan ${tahun}</div><div class="value">${formatRupiah(totalTahunan)}</div></div>
      <div class="card"><div class="label">Bulan Terbaik</div><div class="value">${bulanTerbaik?.label ?? '-'}</div></div>
      <div class="card"><div class="label">Penjualan Bulan Terbaik</div><div class="value">${formatRupiah(bulanTerbaik?.totalPenjualan ?? 0)}</div></div>
    </div>
    <h2>Detail Per Bulan</h2>
    <table>
      <thead><tr><th>Bulan</th><th style="text-align:right">Total Penjualan</th><th style="text-align:center">Transaksi</th><th style="text-align:right">Rata-rata</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
      <tfoot><tr>
        <td>TOTAL ${tahun}</td>
        <td style="text-align:right">${formatRupiah(totalTahunan)}</td>
        <td style="text-align:center">${data.reduce((s, d) => s + d.totalTransaksi, 0)}</td>
        <td></td>
      </tr></tfoot>
    </table>
    <div class="footer">TokoKu — Laporan dibuat otomatis • ${new Date().toLocaleDateString('id-ID')}</div>
    </body></html>
  `

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 400)
}

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
    const hasil: BulanData[] = []

    for (let bulan = 1; bulan <= 12; bulan++) {
      const start = new Date(tahun, bulan - 1, 1).toISOString()
      const end = new Date(tahun, bulan, 0, 23, 59, 59).toISOString()

      const { data: trx } = await supabase
        .from('transactions').select('total')
        .eq('store_id', store!.id).eq('status', 'selesai')
        .gte('created_at', start).lte('created_at', end)

      const transactions = (trx ?? []) as any[]
      const totalPenjualan = transactions.reduce((s, t) => s + t.total, 0)
      const totalTransaksi = transactions.length

      hasil.push({
        bulan: `${tahun}-${String(bulan).padStart(2, '0')}`,
        label: new Date(tahun, bulan - 1).toLocaleDateString('id-ID', { month: 'long' }),
        totalPenjualan,
        totalTransaksi,
        rataRata: totalTransaksi > 0 ? totalPenjualan / totalTransaksi : 0,
      })
    }

    setData(hasil)
    setLoading(false)
  }

  const totalTahunan = data.reduce((s, d) => s + d.totalPenjualan, 0)
  const bulanTerbaik = data.reduce((best, d) => d.totalPenjualan > best.totalPenjualan ? d : best, data[0] ?? { label: '-', totalPenjualan: 0 })
  const maxPenjualan = Math.max(...data.map(d => d.totalPenjualan), 1)

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

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#181c27] text-[#64748b] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-white">Laporan Bulanan</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Ringkasan penjualan per bulan</p>
        </div>
        <div className="flex items-center gap-3">
          {!loading && data.length > 0 && (
            <button
              onClick={() => exportPDFBulanan(store?.nama ?? 'Toko', tahun, data, totalTahunan)}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-400/10 border border-green-500/20 text-green-400 hover:bg-green-400/20 rounded-xl text-sm font-bold transition-colors"
            >
              <FileDown className="w-4 h-4" /> Export PDF
            </button>
          )}
          <select value={tahun} onChange={e => setTahun(Number(e.target.value))}
            className="px-4 py-2.5 bg-[#181c27] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40">
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: `Total Penjualan ${tahun}`, value: formatRupiah(totalTahunan), color: 'green' },
          { label: 'Bulan Terbaik', value: bulanTerbaik?.label ?? '-', color: 'cyan' },
          { label: 'Penjualan Bulan Terbaik', value: formatRupiah(bulanTerbaik?.totalPenjualan ?? 0), color: 'yellow' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
            <div className="text-xs text-[#64748b] mb-1">{label}</div>
            <div className={`text-xl font-black font-mono ${color === 'green' ? 'text-green-400' : color === 'cyan' ? 'text-cyan-400' : 'text-yellow-400'}`}>{value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-6 mb-5">
            <h2 className="font-bold text-sm mb-5 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" /> Grafik Penjualan {tahun}
            </h2>
            <div className="flex items-end gap-2 h-40">
              {data.map(d => {
                const height = maxPenjualan > 0 ? (d.totalPenjualan / maxPenjualan) * 100 : 0
                const isCurrentMonth = d.bulan === new Date().toISOString().slice(0, 7)
                return (
                  <div key={d.bulan} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex items-end justify-center" style={{ height: '120px' }}>
                      <div className={`w-full rounded-t-lg transition-all ${isCurrentMonth ? 'bg-green-400' : 'bg-[#2a3045] group-hover:bg-green-400/50'}`}
                        style={{ height: `${Math.max(height, 2)}%` }}
                        title={`${d.label}: ${formatRupiah(d.totalPenjualan)}`} />
                    </div>
                    <span className="text-[9px] text-[#64748b] font-mono">{d.label.slice(0, 3)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#2a3045]">
              <h2 className="font-bold text-sm">Detail Per Bulan</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a3045]">
                    {['Bulan', 'Total Penjualan', 'Jumlah Transaksi', 'Rata-rata/Transaksi'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map(d => (
                    <tr key={d.bulan} className={`border-b border-[#2a3045] last:border-0 hover:bg-[#1e2333] transition-colors ${d.bulan === new Date().toISOString().slice(0, 7) ? 'bg-[#1a2a1a]' : ''}`}>
                      <td className="px-4 py-3 font-semibold text-sm">{d.label}</td>
                      <td className="px-4 py-3 font-mono font-bold text-sm text-green-400">{formatRupiah(d.totalPenjualan)}</td>
                      <td className="px-4 py-3 font-mono text-sm">{d.totalTransaksi}</td>
                      <td className="px-4 py-3 font-mono text-sm text-[#94a3b8]">{formatRupiah(d.rataRata)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#2a3045] bg-[#1e2333]">
                    <td className="px-4 py-3 font-black text-sm">Total {tahun}</td>
                    <td className="px-4 py-3 font-mono font-black text-sm text-green-400">{formatRupiah(totalTahunan)}</td>
                    <td className="px-4 py-3 font-mono font-black text-sm">{data.reduce((s, d) => s + d.totalTransaksi, 0)}</td>
                    <td className="px-4 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}