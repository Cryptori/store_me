import { formatRupiah } from '@/lib/utils'
import type { CartItem, MetodeBayar } from './types'

type StrukProps = {
  storeName: string
  nomorTransaksi: string
  cart: CartItem[]
  total: number
  metodeBayar: MetodeBayar
  bayar: number
  kembalian: number
  customerName?: string
  customerPhone?: string  // opsional, untuk WA langsung ke pelanggan
}

const METODE_LABEL: Record<MetodeBayar, string> = {
  tunai: 'Tunai', transfer: 'Transfer', qris: 'QRIS', hutang: 'Hutang',
}

// ── Helper: format tanggal ───────────────────────────────────
function getTanggal() {
  return new Date().toLocaleDateString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── 1. Print struk (tidak berubah) ───────────────────────────
export function printStruk(props: StrukProps) {
  const {
    storeName, nomorTransaksi, cart, total,
    metodeBayar, bayar, kembalian, customerName,
  } = props

  const tanggal = getTanggal()

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
      <div>Bayar: ${METODE_LABEL[metodeBayar]}</div>
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

// ── 2. Generate teks struk untuk WhatsApp ───────────────────
export function generateStrukWA(props: StrukProps): string {
  const {
    storeName, nomorTransaksi, cart, total,
    metodeBayar, bayar, kembalian, customerName,
  } = props

  const tanggal = getTanggal()
  const garis = '─'.repeat(28)
  const garisTipis = '- '.repeat(14)

  // Header
  const lines: string[] = [
    `🏪 *${storeName}*`,
    garis,
    `📋 *${nomorTransaksi}*`,
    `🗓 ${tanggal}`,
  ]

  if (customerName) {
    lines.push(`👤 ${customerName}`)
  }
  lines.push(`💳 ${METODE_LABEL[metodeBayar]}`)
  lines.push(garisTipis)

  // Items
  cart.forEach(item => {
    const harga = formatRupiah(item.harga_jual)
    const subtotal = formatRupiah(item.subtotal)
    lines.push(`*${item.nama_produk}*`)
    lines.push(`  ${item.qty} x ${harga} = ${subtotal}`)
  })

  lines.push(garis)

  // Total
  lines.push(`*TOTAL: ${formatRupiah(total)}*`)

  if (metodeBayar === 'tunai') {
    lines.push(`Bayar: ${formatRupiah(bayar)}`)
    lines.push(`Kembali: ${formatRupiah(kembalian)}`)
  }

  if (metodeBayar === 'hutang') {
    lines.push(`⚠️ _Dicatat sebagai hutang_`)
  }

  lines.push(garisTipis)
  lines.push(`_Terima kasih telah berbelanja!_ 🙏`)
  lines.push(`_Powered by TokoKu_`)

  return lines.join('\n')
}

// ── 3. Share struk via WhatsApp ──────────────────────────────
export function shareStrukWA(props: StrukProps) {
  const teks = generateStrukWA(props)
  const encoded = encodeURIComponent(teks)

  // Kalau ada nomor HP pelanggan, buka WA langsung ke pelanggan
  // Format: 08xxx → 628xxx
  if (props.customerPhone) {
    const phone = props.customerPhone
      .replace(/\D/g, '')           // hapus non-digit
      .replace(/^0/, '62')          // 08 → 628
      .replace(/^62/, '62')         // sudah 62, biarkan
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
    return
  }

  // Tanpa nomor HP — buka WA picker (user pilih kontak sendiri)
  // wa.me/send works di mobile, web.whatsapp.com di desktop
  if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
    window.open(`whatsapp://send?text=${encoded}`, '_blank')
  } else {
    window.open(`https://web.whatsapp.com/send?text=${encoded}`, '_blank')
  }
}

// ── 4. Copy teks struk ke clipboard ─────────────────────────
export async function copyStrukToClipboard(props: StrukProps): Promise<boolean> {
  try {
    const teks = generateStrukWA(props)
    await navigator.clipboard.writeText(teks)
    return true
  } catch {
    return false
  }
}