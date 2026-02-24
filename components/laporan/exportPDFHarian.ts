import { formatRupiah, formatJam } from '@/lib/utils'

export function exportPDFHarian(storeName: string, tanggal: string, data: any) {
  const tanggalLabel = new Date(tanggal).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const itemsRows = data.transactions.map((t: any) => `
    <tr>
      <td>${formatJam(t.created_at)}</td>
      <td>${t.nomor_transaksi}</td>
      <td>${t.customers?.nama ?? 'Umum'}</td>
      <td style="text-align:right">${formatRupiah(t.total)}</td>
      <td style="text-align:center">${t.metode_bayar.toUpperCase()}</td>
    </tr>`).join('')

  const produkRows = data.produkTerlaris.map((p: any, i: number) => `
    <tr>
      <td style="text-align:center">${i + 1}</td>
      <td>${p.nama}</td>
      <td style="text-align:center">${p.qty}</td>
      <td style="text-align:right">${formatRupiah(p.total)}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <title>Laporan Harian - ${tanggal}</title>
    <style>
      * { margin:0;padding:0;box-sizing:border-box }
      body { font-family:Arial,sans-serif;font-size:11px;color:#1a1a1a;padding:30px }
      .header { border-bottom:2px solid #22c55e;padding-bottom:12px;margin-bottom:20px }
      .header h1 { font-size:20px;color:#16a34a }
      .header p { color:#666;font-size:11px;margin-top:2px }
      .summary { display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px }
      .card { background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px }
      .card .label { font-size:10px;color:#6b7280;text-transform:uppercase }
      .card .value { font-size:16px;font-weight:bold;color:#16a34a;margin-top:3px }
      h2 { font-size:13px;font-weight:bold;margin-bottom:8px;color:#374151;border-left:3px solid #22c55e;padding-left:8px }
      table { width:100%;border-collapse:collapse;margin-bottom:20px;font-size:11px }
      th { background:#f3f4f6;padding:8px;text-align:left;font-size:10px;text-transform:uppercase;color:#6b7280 }
      td { padding:7px 8px;border-bottom:1px solid #f3f4f6 }
      .footer { text-align:center;color:#9ca3af;font-size:10px;margin-top:20px;border-top:1px solid #e5e7eb;padding-top:12px }
      @media print { body { padding:15px } }
    </style></head><body>
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
    </body></html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 400)
}