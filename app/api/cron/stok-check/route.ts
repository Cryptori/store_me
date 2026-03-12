import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// ── Vercel Cron: jalankan tiap hari jam 07:00 WIB (00:00 UTC) ──
// Di vercel.json:
// {
//   "crons": [{ "path": "/api/cron/stok-check", "schedule": "0 0 * * *" }]
// }

export const runtime = 'edge'

export async function GET(request: Request) {
  // Verifikasi request dari Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  try {
    // Ambil semua toko yang punya nomor telepon
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, nama, telepon')
      .not('telepon', 'is', null)
      .neq('telepon', '')

    if (storesError || !stores) {
      return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 })
    }

    const results = []

    for (const store of stores) {
      // Ambil produk yang stok menipis atau habis
      const { data: produk } = await supabase
        .from('products')
        .select('id, nama, stok, stok_minimum, satuan')
        .eq('store_id', store.id)
        .eq('is_active', true)
        .lte('stok', supabase.rpc as any) // filter client-side di bawah

      const allProduk = produk ?? []
      const produkHabis = allProduk.filter((p: any) => p.stok === 0)
      const produkMenipis = allProduk.filter((p: any) => p.stok > 0 && p.stok <= p.stok_minimum)

      if (produkHabis.length === 0 && produkMenipis.length === 0) continue

      // Generate WA link dan simpan ke tabel notifikasi (untuk log)
      const message = generatePesan(store.nama, produkMenipis, produkHabis)

      // Simpan log notifikasi
      await supabase.from('stok_notifications').insert({
        store_id: store.id,
        produk_habis: produkHabis.length,
        produk_menipis: produkMenipis.length,
        message_preview: message.slice(0, 200),
        sent_at: new Date().toISOString(),
      }).select()

      results.push({
        store: store.nama,
        habis: produkHabis.length,
        menipis: produkMenipis.length,
      })
    }

    return NextResponse.json({
      success: true,
      processed: stores.length,
      withAlerts: results.length,
      results,
    })
  } catch (err) {
    console.error('Cron error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function generatePesan(
  storeName: string,
  produkMenipis: any[],
  produkHabis: any[],
): string {
  const tanggal = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const lines = [
    `⚠️ *Laporan Stok — ${storeName}*`,
    `📅 ${tanggal}`,
  ]

  if (produkHabis.length > 0) {
    lines.push(`\n🔴 *STOK HABIS (${produkHabis.length})*`)
    produkHabis.slice(0, 10).forEach((p: any) => lines.push(`• ${p.nama}`))
  }

  if (produkMenipis.length > 0) {
    lines.push(`\n🟡 *STOK MENIPIS (${produkMenipis.length})*`)
    produkMenipis.slice(0, 10).forEach((p: any) =>
      lines.push(`• ${p.nama} — sisa ${p.stok} ${p.satuan}`)
    )
  }

  lines.push(`\n_Powered by TokoKu_`)
  return lines.join('\n')
}