'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Lock, FileDown, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { useFreemium } from '@/hooks/useFreemium'
import { formatRupiah, formatJam } from '@/lib/utils'

function exportPDFHarian(storeName: string, tanggal: string, data: any) {
  const tanggalLabel = new Date(tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const itemsRows = data.transactions.map((t: any) => `
    <tr>
      <td>${formatJam(t.created_at)}</td>
      <td>${t.nomor_transaksi}</td>
      <td>${t.customers?.nama ?? 'Umum'}</td>
      <td style="text-align:right">${formatRupiah(t.total)}</td>
      <td style="text-align:center">${t.metode_bayar.toUpperCase()}</td>
    </tr>
  `).join('')

  const produkRows = data.produkTerlaris.map((p: any, i: number) => `
    <tr>
      <td style="text-align:center">${i + 1}</td>
      <td>${p.nama}</td>
      <td style="text-align:center">${p.qty}</td>
      <td style="text-align:right">${formatRupiah(p.total)}</td>
    </tr>
  `).join('')

  const html = `
    <!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <title>Laporan Harian - ${tanggal}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; padding: 30px; }
      .header { border-bottom: 2px solid #22c55e; padding-bottom: 12px; margin-bottom: 20px; }
      .header h1 { font-size: 20px; color: #16a34a; }
      .header p { color: #666; font-size: 11px; margin-top: 2px; }
      .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
      .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
      .card .label { font-size: 10px; color: #6b7280; text-transform: uppercase; }
      .card .value { font-size: 16px; font-weight: bold; color: #16a34a; margin-top: 3px; }
      h2 { font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #374151; border-left: 3px solid #22c55e; padding-left: 8px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
      th { background: #f3f4f6; padding: 8px; text-align: left; font-size: 10px; text-transform: uppercase; color: #6b7280; }
      td { padding: 7px 8px; border-bottom: 1px solid #f3f4f6; }
      tr:hover td { background: #fafafa; }
      .footer { text-align: center; color: #9ca3af; font-size: 10px; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 12px; }
      @media print { body { padding: 15px; } }
    </style>
    </head><body>
    <div class="header">
      <h1>${storeName}</h1>
      <p>Laporan Harian — ${tanggalLabel}</p>
      <p>Dicetak: ${new Date().toLocaleString('id-ID')}</p>
    </div>
    <div class="summary">
      <div class="card"><div class="label">Total Penjualan</div><div class="value">${formatRupiah(data.totalPenjualan)}</div></div>
      <div class="card"><div class="label">Jumlah Transaksi</div><div class="value">${data.totalTransaksi}</div></div>
      <div class="card"><div class="label">Rata-rata</div><div class="value">${data.totalTransaksi > 0 ? formatRupiah(data.totalPenjualan / data.totalTransaksi) : 'Rp 0'}</div></div>
      <div class="card"><div class="label">Transaksi Hutang</div><div class="value">${data.transactions.filter((t: any) => t.metode_bayar === 'hutang').length}</div></div>
    </div>
    <h2>Produk Terlaris</h2>
    <table><thead><tr><th>#</th><th>Produk</th><th style="text-align:center">Qty</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>${produkRows || '<tr><td colspan="4" style="text-align:center;color:#9ca3af">Tidak ada data</td></tr>'}</tbody></table>
    <h2>Semua Transaksi (${data.totalTransaksi})</h2>
    <table><thead><tr><th>Waktu</th><th>No. Transaksi</th><th>Pelanggan</th><th style="text-align:right">Total</th><th style="text-align:center">Metode</th></tr></thead>
    <tbody>${itemsRows || '<tr><td colspan="5" style="text-align:center;color:#9ca3af">Tidak ada transaksi</td></tr>'}</tbody>
    <tfoot><tr style="font-weight:bold;background:#f9fafb"><td colspan="3">TOTAL</td><td style="text-align:right">${formatRupiah(data.totalPenjualan)}</td><td></td></tr></tfoot>
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
      .sort((a, b) => b.total - a.total).slice(0, 5)

    const metodeMap: { [key: string]: number } = {}
    transactions.forEach((t: any) => { metodeMap[t.metode_bayar] = (metodeMap[t.metode_bayar] ?? 0) + t.total })

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
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>
      ) : !data ? null : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Penjualan', value: formatRupiah(data.totalPenjualan), color: 'green' },
              { label: 'Jumlah Transaksi', value: data.totalTransaksi.toString(), color: 'cyan' },
              { label: 'Rata-rata/Transaksi', value: data.totalTransaksi > 0 ? formatRupiah(data.totalPenjualan / data.totalTransaksi) : 'Rp 0', color: 'yellow' },
              { label: 'Transaksi Hutang', value: data.transactions.filter((t: any) => t.metode_bayar === 'hutang').length.toString(), color: 'red' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
                <div className="text-xs text-[#64748b] mb-1">{label}</div>
                <div className={`text-xl font-black font-mono ${color === 'green' ? 'text-green-400' : color === 'cyan' ? 'text-cyan-400' : color === 'yellow' ? 'text-yellow-400' : 'text-red-400'}`}>{value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#2a3045]">
                <h2 className="font-bold text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> Produk Terlaris</h2>
              </div>
              <div className="p-4 space-y-3">
                {data.produkTerlaris.length === 0 ? <p className="text-center text-[#64748b] text-sm py-4">Belum ada data</p>
                  : data.produkTerlaris.map((p: any, i: number) => (
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

            <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#2a3045]"><h2 className="font-bold text-sm">Metode Pembayaran</h2></div>
              <div className="p-4 space-y-3">
                {Object.entries(data.metodeMap).length === 0 ? <p className="text-center text-[#64748b] text-sm py-4">Belum ada data</p>
                  : Object.entries(data.metodeMap).map(([metode, total]: any) => (
                    <div key={metode} className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${metode === 'tunai' ? 'bg-green-400/10 text-green-400' : metode === 'transfer' ? 'bg-cyan-400/10 text-cyan-400' : metode === 'qris' ? 'bg-purple-400/10 text-purple-400' : 'bg-yellow-400/10 text-yellow-400'}`}>{metode.toUpperCase()}</span>
                      <span className="font-mono font-bold text-sm">{formatRupiah(total)}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#2a3045]"><h2 className="font-bold text-sm">Jam Transaksi</h2></div>
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

          <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#2a3045]">
              <h2 className="font-bold text-sm">Semua Transaksi ({data.totalTransaksi})</h2>
              {!canExportPDF && (
                <Link href="/upgrade" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2333] border border-[#2a3045] text-[#64748b] hover:text-green-400 rounded-lg text-xs font-semibold transition-colors">
                  <Lock className="w-3 h-3" /> Export PDF (PRO)
                </Link>
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
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${t.metode_bayar === 'tunai' ? 'bg-green-400/10 text-green-400' : t.metode_bayar === 'transfer' ? 'bg-cyan-400/10 text-cyan-400' : t.metode_bayar === 'hutang' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-purple-400/10 text-purple-400'}`}>{t.metode_bayar.toUpperCase()}</span>
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