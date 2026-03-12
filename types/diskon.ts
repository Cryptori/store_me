// types/diskon.ts

export type PromoTipe = 'persen' | 'nominal' | 'beli_x_gratis_y' | 'voucher' | 'otomatis'

export type Promo = {
  id: string
  store_id: string
  nama: string
  tipe: PromoTipe
  nilai: number
  beli_qty: number | null
  gratis_qty: number | null
  gratis_product_id: string | null
  kode: string | null
  max_penggunaan: number | null
  sudah_dipakai: number
  min_belanja: number
  hari_aktif: string[] | null
  jam_mulai: string | null
  jam_selesai: string | null
  product_ids: string[] | null
  berlaku_mulai: string
  berlaku_sampai: string | null
  is_active: boolean
  created_at: string
}

export type AppliedPromo = {
  promo: Promo
  diskon_amount: number
  label: string          // e.g. "Diskon 10%" / "Voucher HEMAT20" / "Gratis 1x Mie Goreng"
}

export type CartItemWithDiskon = {
  product_id: string
  nama_produk: string
  harga_jual: number
  harga_setelah_diskon: number   // harga_jual setelah diskon per-produk
  qty: number
  stok: number
  subtotal: number               // harga_setelah_diskon * qty
  gratis_qty?: number            // untuk beli X gratis Y
  promo_id?: string
}

// ── Hitung diskon untuk cart ──────────────────────────────────
export function hitungDiskonPromo(
  promos: Promo[],
  cart: { product_id: string; harga_jual: number; qty: number; subtotal: number }[],
  total: number,
): AppliedPromo[] {
  const applied: AppliedPromo[] = []

  for (const promo of promos) {
    if (!promo.is_active) continue

    // Filter: apakah promo berlaku untuk item di cart?
    const relevantItems = promo.product_ids
      ? cart.filter(i => promo.product_ids!.includes(i.product_id))
      : cart

    if (relevantItems.length === 0) continue

    const relevantTotal = relevantItems.reduce((s, i) => s + i.subtotal, 0)

    switch (promo.tipe) {
      case 'persen': {
        if (total < promo.min_belanja) break
        const diskon = Math.round(relevantTotal * promo.nilai / 100)
        applied.push({
          promo,
          diskon_amount: diskon,
          label: `Diskon ${promo.nilai}%`,
        })
        break
      }

      case 'nominal': {
        if (total < promo.min_belanja) break
        const diskon = Math.min(promo.nilai, relevantTotal)
        applied.push({
          promo,
          diskon_amount: diskon,
          label: `Diskon Rp ${promo.nilai.toLocaleString('id-ID')}`,
        })
        break
      }

      case 'otomatis': {
        if (total < promo.min_belanja) break
        // Hitung sama seperti persen/nominal tergantung nilai
        const diskon = promo.nilai <= 100
          ? Math.round(relevantTotal * promo.nilai / 100)
          : Math.min(promo.nilai, relevantTotal)
        const label = promo.nilai <= 100
          ? `${promo.nama} (${promo.nilai}%)`
          : `${promo.nama} (Rp ${promo.nilai.toLocaleString('id-ID')})`
        applied.push({ promo, diskon_amount: diskon, label })
        break
      }

      case 'beli_x_gratis_y': {
        if (!promo.beli_qty || !promo.gratis_qty) break
        // Cek setiap item yang relevan
        for (const item of relevantItems) {
          const eligible = Math.floor(item.qty / promo.beli_qty)
          if (eligible === 0) continue
          const gratisQty = eligible * promo.gratis_qty
          const diskon = gratisQty * item.harga_jual
          applied.push({
            promo,
            diskon_amount: diskon,
            label: `Beli ${promo.beli_qty} Gratis ${promo.gratis_qty}`,
          })
        }
        break
      }

      // voucher ditangani terpisah via validate_voucher RPC
      case 'voucher':
        break
    }
  }

  return applied
}

export function totalDiskon(applied: AppliedPromo[]): number {
  return applied.reduce((s, a) => s + a.diskon_amount, 0)
}

// Hari dalam Bahasa Indonesia
export const HARI = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']
export const HARI_LABEL: Record<string, string> = {
  senin: 'Senin', selasa: 'Selasa', rabu: 'Rabu', kamis: 'Kamis',
  jumat: 'Jumat', sabtu: 'Sabtu', minggu: 'Minggu',
}

export function formatDiskonLabel(promo: Promo): string {
  switch (promo.tipe) {
    case 'persen':    return `${promo.nilai}%`
    case 'nominal':   return `Rp ${promo.nilai.toLocaleString('id-ID')}`
    case 'voucher':   return `Kode: ${promo.kode}`
    case 'beli_x_gratis_y': return `Beli ${promo.beli_qty} Gratis ${promo.gratis_qty}`
    case 'otomatis':
      return promo.nilai <= 100 ? `${promo.nilai}%` : `Rp ${promo.nilai.toLocaleString('id-ID')}`
    default: return ''
  }
}