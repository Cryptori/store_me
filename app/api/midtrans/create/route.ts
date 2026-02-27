import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// @ts-ignore
const midtransClient = require('midtrans-client')

const snap = new midtransClient.Snap({
  isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
})

// Durasi yang valid dan harganya
const VALID_DURASI: Record<number, number> = {
  1:  49_000,
  3:  147_000,
  6:  294_000,
  12: 449_000,  // hemat 2 bulan
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { durasi, storeId } = body

    // Fix 1: Validasi durasi — jangan percaya input dari client
    if (!VALID_DURASI[durasi]) {
      return NextResponse.json({ error: 'Durasi tidak valid' }, { status: 400 })
    }

    // Fix 2: Validasi storeId format (harus UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!storeId || !uuidRegex.test(storeId)) {
      return NextResponse.json({ error: 'Store ID tidak valid' }, { status: 400 })
    }

    // Fix 3: Verifikasi store milik user yang login
    // Jangan percaya storeId dari client saja
    const supabaseDb = supabase as any
    const { data: store, error: storeError } = await supabaseDb
      .from('stores')
      .select('id, nama, user_id, is_pro, pro_expires_at')
      .eq('id', storeId)
      .eq('user_id', user.id)  // pastikan store milik user ini
      .single()

    if (storeError || !store) {
      return NextResponse.json({ error: 'Store tidak ditemukan' }, { status: 403 })
    }

    // Fix 4: Harga dari server, bukan dari client
    const harga = VALID_DURASI[durasi]

    // Generate order ID unik
    const orderId = `TOKOKU-${storeId.slice(0, 8)}-${Date.now()}`

    // Buat transaksi Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: harga,
      },
      item_details: [
        {
          id: `PRO-${durasi}BLN`,
          price: harga,
          quantity: 1,
          name: `TokoKu PRO ${durasi} Bulan`,
        },
      ],
      customer_details: {
        email: user.email,
      },
      callbacks: {
        finish:  `${process.env.NEXT_PUBLIC_APP_URL}/upgrade/success?order_id=${orderId}`,
        error:   `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?error=payment_failed`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade/success?order_id=${orderId}`,
        // Fix 5: pending arahkan ke success page (ada retry logic di sana)
        // bukan ke /upgrade/pending yang tidak ada
      },
    }

    const transaction = await snap.createTransaction(parameter)

    // Simpan record payment
    await supabaseDb.from('payments').insert({
      store_id: storeId,
      midtrans_order_id: orderId,
      midtrans_token: transaction.token,
      amount: harga,
      status: 'pending',
      durasi_bulan: durasi,
    })

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      order_id: orderId,
    })

  } catch (error: any) {
    console.error('[Create Payment] Error:', error)
    return NextResponse.json(
      { error: error.message ?? 'Gagal membuat transaksi' },
      { status: 500 }
    )
  }
}