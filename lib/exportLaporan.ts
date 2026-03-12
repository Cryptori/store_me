// lib/exportLaporan.ts
// Export PDF via browser print, Export Excel via SheetJS (sudah tersedia di browser)

import { formatRupiah } from '@/lib/utils'

// ── Helpers ──────────────────────────────────────────────────────────────────
function printHTML(html: string, title: string) {
  const win = window.open('', '_blank', 'width=1000,height=750')
  if (!win) { alert('Popup diblokir. Izinkan popup untuk export PDF.'); return }
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="utf-8"><title>${title}</title>
    <style>
      *{box-sizing:border-box}
      body{font-family:Arial,sans-serif;font-size:12px;color:#111;padding:20px;margin:0}
      h1{font-size:18px;margin:0 0 2px} h2{font-size:14px;margin:16px 0 8px;color:#374151}
      .meta{color:#6b7280;font-size:11px;margin-bottom:16px}
      table{width:100%;border-collapse:collapse;margin-bottom:16px}
      th{background:#f3f4f6;padding:6px 8px;text-align:left;font-size:11px;font-weight:bold;border:1px solid #e5e7eb}
      td{padding:5px 8px;border:1px solid #e5e7eb;font-size:11px}
      tr:nth-child(even) td{background:#f9fafb}
      .right{text-align:right} .center{text-align:center}
      .summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
      .card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px}
      .card-label{font-size:10px;color:#6b7280;margin-bottom:2px}
      .card-value{font-size:15px;font-weight:bold}
      .green{color:#16a34a} .red{color:#dc2626} .blue{color:#2563eb}
      @media print{body{padding:0} .no-print{display:none}}
    </style>
  </head><body>${html}<script>window.onload=()=>setTimeout(()=>window.print(),200)</script></body></html>`)
  win.document.close()
}

function formatTanggal(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

function periodLabel(dari: string, sampai: string) {
  return `${formatTanggal(dari)} – ${formatTanggal(sampai)}`
}

// ── PDF: Penjualan ────────────────────────────────────────────────────────────
export function exportPDFPenjualan(data: any, storeName: string, dari: string, sampai: string) {
  const perHari = (data.per_hari ?? []).sort((a: any, b: any) => a.tanggal.localeCompare(b.tanggal))
  const rows = perHari.map((h: any) => `
    <tr>
      <td>${formatTanggal(h.tanggal)}</td>
      <td class="center">${h.qty}</td>
      <td class="right">${formatRupiah(h.total)}</td>
      <td class="right">${h.qty > 0 ? formatRupiah(Math.round(h.total / h.qty)) : '-'}</td>
    </tr>`).join('')

  const html = `
    <h1>Laporan Penjualan</h1>
    <div class="meta">${storeName} · ${periodLabel(dari, sampai)}</div>
    <div class="summary">
      <div class="card"><div class="card-label">Total Penjualan</div><div class="card-value green">${formatRupiah(data.total_penjualan)}</div></div>
      <div class="card"><div class="card-label">Jumlah Transaksi</div><div class="card-value blue">${data.total_transaksi}</div></div>
      <div class="card"><div class="card-label">Rata-rata/Transaksi</div><div class="card-value">${formatRupiah(data.rata_transaksi)}</div></div>
    </div>
    <h2>Penjualan per Hari</h2>
    <table>
      <thead><tr><th>Tanggal</th><th class="center">Transaksi</th><th class="right">Total</th><th class="right">Rata-rata</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`
  printHTML(html, `Laporan Penjualan – ${storeName}`)
}

// ── PDF: Laba Rugi ────────────────────────────────────────────────────────────
export function exportPDFLabaRugi(data: any, storeName: string, dari: string, sampai: string) {
  const detail = (data.detail ?? []).slice(0, 30)
  const rows = detail.map((p: any) => `
    <tr>
      <td>${p.nama_produk}</td>
      <td class="center">${p.qty}</td>
      <td class="right">${formatRupiah(p.omzet)}</td>
      <td class="right">${formatRupiah(p.hpp)}</td>
      <td class="right ${p.laba >= 0 ? 'green' : 'red'}">${formatRupiah(p.laba)}</td>
      <td class="center">${p.margin_pct}%</td>
    </tr>`).join('')

  const html = `
    <h1>Laporan Laba Rugi</h1>
    <div class="meta">${storeName} · ${periodLabel(dari, sampai)}</div>
    <div class="summary">
      <div class="card"><div class="card-label">Omzet</div><div class="card-value blue">${formatRupiah(data.omzet)}</div></div>
      <div class="card"><div class="card-label">HPP</div><div class="card-value red">${formatRupiah(data.hpp)}</div></div>
      <div class="card"><div class="card-label">Laba Kotor</div><div class="card-value green">${formatRupiah(data.laba_kotor)} (${data.margin_pct}%)</div></div>
    </div>
    <table>
      <thead><tr><th>Produk</th><th class="center">Qty</th><th class="right">Omzet</th><th class="right">HPP</th><th class="right">Laba</th><th class="center">Margin</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`
  printHTML(html, `Laba Rugi – ${storeName}`)
}

// ── PDF: Stok ─────────────────────────────────────────────────────────────────
export function exportPDFStok(data: any, storeName: string) {
  const rows = (data.semua_produk ?? []).map((p: any) => `
    <tr>
      <td>${p.nama}</td>
      <td>${p.sku ?? '-'}</td>
      <td class="center">${p.stok} ${p.satuan}</td>
      <td class="right">${formatRupiah(p.harga_beli)}</td>
      <td class="right">${formatRupiah(p.harga_jual)}</td>
      <td class="right">${formatRupiah(p.nilai_hpp)}</td>
    </tr>`).join('')

  const html = `
    <h1>Laporan Stok Inventori</h1>
    <div class="meta">${storeName} · ${new Date().toLocaleDateString('id-ID')}</div>
    <div class="summary">
      <div class="card"><div class="card-label">Total SKU</div><div class="card-value blue">${data.total_sku}</div></div>
      <div class="card"><div class="card-label">Nilai HPP</div><div class="card-value">${formatRupiah(data.nilai_hpp)}</div></div>
      <div class="card"><div class="card-label">Nilai Jual</div><div class="card-value green">${formatRupiah(data.nilai_jual)}</div></div>
    </div>
    <table>
      <thead><tr><th>Nama Produk</th><th>SKU</th><th class="center">Stok</th><th class="right">Harga Beli</th><th class="right">Harga Jual</th><th class="right">Nilai HPP</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`
  printHTML(html, `Stok – ${storeName}`)
}

// ── EXCEL via SheetJS (CDN) ───────────────────────────────────────────────────
async function loadXLSX() {
  // SheetJS sudah tersedia di React artifacts, di Next.js load dynamic
  if (typeof window !== 'undefined' && (window as any).XLSX) return (window as any).XLSX
  return await import('https://cdn.sheetjs.com/xlsx-0.20.2/package/xlsx.mjs' as any)
}

export async function exportExcelPenjualan(data: any, storeName: string, dari: string, sampai: string) {
  const XLSX = await loadXLSX()
  const wb = XLSX.utils.book_new()

  // Sheet 1: Summary
  const summary = [
    ['Laporan Penjualan', storeName],
    ['Periode', `${dari} s/d ${sampai}`],
    [],
    ['Total Penjualan', data.total_penjualan],
    ['Total Transaksi', data.total_transaksi],
    ['Total Diskon', data.total_diskon],
    ['Rata-rata/Transaksi', data.rata_transaksi],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(summary)
  ws1['!cols'] = [{ wch: 22 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan')

  // Sheet 2: Per Hari
  const perHari = [
    ['Tanggal', 'Jumlah Transaksi', 'Total Penjualan'],
    ...(data.per_hari ?? [])
      .sort((a: any, b: any) => a.tanggal.localeCompare(b.tanggal))
      .map((h: any) => [h.tanggal, h.qty, h.total]),
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(perHari)
  ws2['!cols'] = [{ wch: 14 }, { wch: 20 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Per Hari')

  XLSX.writeFile(wb, `Penjualan_${storeName}_${dari}_${sampai}.xlsx`)
}

export async function exportExcelLabaRugi(data: any, storeName: string, dari: string, sampai: string) {
  const XLSX = await loadXLSX()
  const wb = XLSX.utils.book_new()

  const summary = [
    ['Laporan Laba Rugi', storeName],
    ['Periode', `${dari} s/d ${sampai}`],
    [],
    ['Omzet', data.omzet],
    ['Total Diskon', data.diskon],
    ['Pendapatan Bersih', data.pendapatan_bersih],
    ['HPP', data.hpp],
    ['Laba Kotor', data.laba_kotor],
    ['Margin (%)', data.margin_pct],
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(summary)
  ws1['!cols'] = [{ wch: 22 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan')

  const detail = [
    ['Nama Produk', 'Qty', 'Omzet', 'HPP', 'Laba', 'Margin (%)'],
    ...(data.detail ?? []).map((p: any) => [p.nama_produk, p.qty, p.omzet, p.hpp, p.laba, p.margin_pct]),
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(detail)
  ws2['!cols'] = [{ wch: 30 }, { wch: 8 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Per Produk')

  XLSX.writeFile(wb, `LabaRugi_${storeName}_${dari}_${sampai}.xlsx`)
}

export async function exportExcelStok(data: any, storeName: string) {
  const XLSX = await loadXLSX()
  const wb = XLSX.utils.book_new()

  const rows = [
    ['Nama Produk', 'SKU', 'Stok', 'Satuan', 'Harga Beli', 'Harga Jual', 'Nilai HPP', 'Nilai Jual'],
    ...(data.semua_produk ?? []).map((p: any) => [
      p.nama, p.sku ?? '', p.stok, p.satuan,
      p.harga_beli, p.harga_jual, p.nilai_hpp, p.nilai_jual,
    ]),
    [],
    ['TOTAL', '', `=SUM(C2:C${(data.semua_produk?.length ?? 0) + 1})`, '', '', '', `=SUM(G2:G${(data.semua_produk?.length ?? 0) + 1})`, `=SUM(H2:H${(data.semua_produk?.length ?? 0) + 1})`],
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 8 }, { wch: 8 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, ws, 'Stok')

  XLSX.writeFile(wb, `Stok_${storeName}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export async function exportExcelHutangPelanggan(data: any, storeName: string) {
  const XLSX = await loadXLSX()
  const wb = XLSX.utils.book_new()

  const rows = [
    ['Laporan Hutang Pelanggan', storeName],
    ['Tanggal', new Date().toLocaleDateString('id-ID')],
    ['Total Hutang', data.total_hutang],
    [],
    ['Nama Pelanggan', 'Telepon', 'Jumlah Tagihan', 'Total Hutang (Rp)'],
    ...(data.detail ?? []).map((d: any) => [d.nama, d.telepon ?? '', d.jml_tagihan, d.sisa]),
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 16 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, ws, 'Hutang Pelanggan')

  XLSX.writeFile(wb, `Hutang_Pelanggan_${storeName}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export async function exportExcelHutangSupplier(data: any, storeName: string) {
  const XLSX = await loadXLSX()
  const wb = XLSX.utils.book_new()

  const rows = [
    ['Laporan Hutang Supplier', storeName],
    ['Tanggal', new Date().toLocaleDateString('id-ID')],
    ['Total Hutang', data.total_hutang],
    [],
    ['Nama Supplier', 'Telepon', 'Jumlah PO', 'Total Hutang (Rp)'],
    ...(data.detail ?? []).map((d: any) => [d.nama, d.telepon ?? '', d.jml_po, d.sisa]),
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 28 }, { wch: 16 }, { wch: 12 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, ws, 'Hutang Supplier')

  XLSX.writeFile(wb, `Hutang_Supplier_${storeName}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}