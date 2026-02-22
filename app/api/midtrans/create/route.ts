import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// @ts-ignore
const midtransClient = require('midtrans-client')

const snap = new midtransClient.Snap({
  isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { durasi, storeId } = await request.json()

    // Harga berdasarkan durasi
    const harga = durasi === 12 ? 588000 : 49000 * durasi

    // Generate order ID unik
    const orderId = `TOKOKU-${storeId.slice(0, 8)}-${Date.now()}`

    // Ambil data store
    const db = supabase as any
    const { data: store } = await db
      .from('stores')
      .select('nama')
      .eq('id', storeId)
      .single()

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
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade/success?order_id=${orderId}`,
        error: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?error=payment_failed`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade/pending`,
      },
    }

    const transaction = await snap.createTransaction(parameter)

    // Simpan record payment ke database
    await db.from('payments').insert({
      store_id: storeId,
      midtrans_order_id: orderId,
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
    console.error('Midtrans error:', error)
    return NextResponse.json(
      { error: error.message ?? 'Gagal membuat transaksi' },
      { status: 500 }
    )
  }
}