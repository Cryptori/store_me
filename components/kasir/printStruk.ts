import { formatRupiah } from '@/lib/utils'
import type { CartItem, MetodeBayar } from './types'

export function printStruk({
  storeName, nomorTransaksi, cart, total, metodeBayar, bayar, kembalian, customerName,
}: {
  storeName: string
  nomorTransaksi: string
  cart: CartItem[]
  total: number
  metodeBayar: MetodeBayar
  bayar: number
  kembalian: number
  customerName?: string
}) {
  const tanggal = new Date().toLocaleDateString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  const metodLabel: Record<MetodeBayar, string> = {
    tunai: 'Tunai', transfer: 'Transfer', qris: 'QRIS', hutang: 'Hutang',
  }
  const itemsHtml = cart.map(item => `
    <tr>
      <td style="padding:2px 0">${item.nama_produk}</td>
      <td style="text-align:center;padding:2px 4px">${item.qty}</td>
      <td style="text-align:right;padding:2px 0">${formatRupiah(item.harga_jual)}</td>
      <td style="text-align:right;padding:2px 0">${formatRupiah(item.subtotal)}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>Struk - ${nomorTransaksi}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family:'Courier New',monospace; font-size:12px; width:280px; margin:0 auto; padding:10px; }
      .center { text-align:center; } .bold { font-weight:bold; }
      .divider { border-top:1px dashed #000; margin:6px 0; }
      table { width:100%; border-collapse:collapse; }
      th { text-align:left; font-size:11px; padding:2px 0; }
      .total-row td { font-weight:bold; font-size:13px; padding-top:4px; }
    </style>
    </head><body>
    <div class="center bold" style="font-size:16px;margin-bottom:4px">${storeName}</div>
    <div class="center" style="font-size:11px;color:#555">Terima kasih telah berbelanja</div>
    <div class="divider"></div>
    <div style="font-size:11px">
      <div>No: ${nomorTransaksi}</div>
      <div>Tgl: ${tanggal}</div>
      ${customerName ? `<div>Pelanggan: ${customerName}</div>` : ''}
      <div>Bayar: ${metodLabel[metodeBayar]}</div>
    </div>
    <div class="divider"></div>
    <table>
      <thead><tr>
        <th>Item</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Harga</th>
        <th style="text-align:right">Total</th>
      </tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div class="divider"></div>
    <table>
      <tr class="total-row">
        <td colspan="3">TOTAL</td>
        <td style="text-align:right">${formatRupiah(total)}</td>
      </tr>
      ${metodeBayar === 'tunai' ? `
      <tr><td colspan="3" style="font-size:11px">Bayar</td><td style="text-align:right;font-size:11px">${formatRupiah(bayar)}</td></tr>
      <tr><td colspan="3" style="font-size:11px">Kembali</td><td style="text-align:right;font-size:11px">${formatRupiah(kembalian)}</td></tr>
      ` : ''}
      ${metodeBayar === 'hutang' ? `
      <tr><td colspan="4" style="font-size:11px;color:#c00">* Dicatat sebagai hutang</td></tr>
      ` : ''}
    </table>
    <div class="divider"></div>
    <div class="center" style="font-size:11px">TokoKu — kelolastok.com</div>
    <div class="center" style="font-size:10px;color:#777;margin-top:2px">Simpan struk ini sebagai bukti pembelian</div>
    </body></html>`

  const win = window.open('', '_blank', 'width=320,height=600')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 300)
}