import { formatRupiah } from '@/lib/utils'

export type BulanData = {
  bulan: string
  label: string
  totalPenjualan: number
  totalTransaksi: number
  rataRata: number
}

export function exportPDFBulanan(storeName: string, tahun: number, data: BulanData[], totalTahunan: number) {
  const bulanTerbaik = data.reduce((best, d) => d.totalPenjualan > best.totalPenjualan ? d : best, data[0])

  const rowsHtml = data.map((d, i) => `
    <tr style="${i % 2 === 0 ? '' : 'background:#f9fafb'}">
      <td>${d.label}</td>
      <td style="text-align:right">${formatRupiah(d.totalPenjualan)}</td>
      <td style="text-align:center">${d.totalTransaksi}</td>
      <td style="text-align:right">${formatRupiah(d.rataRata)}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <title>Laporan Bulanan ${tahun} - ${storeName}</title>
    <style>
      * { margin:0;padding:0;box-sizing:border-box }
      body { font-family:Arial,sans-serif;font-size:11px;color:#1a1a1a;padding:30px }
      .header { border-bottom:2px solid #22c55e;padding-bottom:12px;margin-bottom:20px }
      .header h1 { font-size:20px;color:#16a34a }
      .header p { color:#666;font-size:11px;margin-top:2px }
      .summary { display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px }
      .card { background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px }
      .card .label { font-size:10px;color:#6b7280;text-transform:uppercase }
      .card .value { font-size:16px;font-weight:bold;color:#16a34a;margin-top:3px }
      h2 { font-size:13px;font-weight:bold;margin-bottom:8px;color:#374151;border-left:3px solid #22c55e;padding-left:8px }
      table { width:100%;border-collapse:collapse;margin-bottom:20px;font-size:11px }
      th { background:#f3f4f6;padding:8px;text-align:left;font-size:10px;text-transform:uppercase;color:#6b7280 }
      td { padding:7px 8px;border-bottom:1px solid #f3f4f6 }
      tfoot td { font-weight:bold;background:#f0fdf4;border-top:2px solid #22c55e }
      .footer { text-align:center;color:#9ca3af;font-size:10px;margin-top:20px;border-top:1px solid #e5e7eb;padding-top:12px }
    </style></head><body>
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
    </body></html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 400)
}