import type { Product } from '@/types/database'

// ── Generate teks pesan stok menipis ────────────────────────
export function generatePesanStokMenipis({
  storeName,
  produkMenipis,
  produkHabis,
}: {
  storeName: string
  produkMenipis: Product[]
  produkHabis: Product[]
}): string {
  const tanggal = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const lines: string[] = [
    `⚠️ *Laporan Stok — ${storeName}*`,
    `📅 ${tanggal}`,
    `─────────────────────`,
  ]

  if (produkHabis.length > 0) {
    lines.push(`\n🔴 *STOK HABIS (${produkHabis.length} produk)*`)
    produkHabis.forEach(p => {
      lines.push(`• ${p.nama} — *HABIS*`)
    })
  }

  if (produkMenipis.length > 0) {
    lines.push(`\n🟡 *STOK MENIPIS (${produkMenipis.length} produk)*`)
    produkMenipis.forEach(p => {
      lines.push(`• ${p.nama} — sisa *${p.stok} ${p.satuan}* (min. ${p.stok_minimum})`)
    })
  }

  lines.push(`\n─────────────────────`)
  lines.push(`_Segera lakukan restok untuk menghindari kehabisan stok._`)
  lines.push(`_Powered by TokoKu_`)

  return lines.join('\n')
}

// ── Buka WA dengan pesan stok ────────────────────────────────
export function shareStokWA({
  storeName,
  produkMenipis,
  produkHabis,
  phoneNumber,
}: {
  storeName: string
  produkMenipis: Product[]
  produkHabis: Product[]
  phoneNumber?: string   // nomor supplier/owner, opsional
}) {
  const teks = generatePesanStokMenipis({ storeName, produkMenipis, produkHabis })
  const encoded = encodeURIComponent(teks)

  if (phoneNumber) {
    const phone = phoneNumber
      .replace(/\D/g, '')
      .replace(/^0/, '62')
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
    return
  }

  // Buka WA tanpa nomor — user pilih kontak sendiri
  if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
    window.open(`whatsapp://send?text=${encoded}`, '_blank')
  } else {
    window.open(`https://web.whatsapp.com/send?text=${encoded}`, '_blank')
  }
}