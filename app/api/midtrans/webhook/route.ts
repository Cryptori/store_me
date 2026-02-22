import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// @ts-ignore
const midtransClient = require('midtrans-client')

const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, transaction_status, fraud_status } = body

    // Verifikasi notifikasi dari Midtrans
    const statusResponse = await coreApi.transaction.notification(body)

    const supabase = await createClient()
    const db = supabase as any

    // Ambil data payment
    const { data: payment } = await db
      .from('payments')
      .select('*, stores(id)')
      .eq('midtrans_order_id', order_id)
      .single()

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    let newStatus = 'pending'

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        newStatus = 'success'
        // Aktifkan PRO
        await db.rpc('activate_pro_subscription', {
          p_store_id: payment.store_id,
          p_durasi_bulan: payment.durasi_bulan ?? 1,
        })
      }
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      newStatus = 'failed'
    } else if (transaction_status === 'pending') {
      newStatus = 'pending'
    }

    // Update status payment
    await db
      .from('payments')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('midtrans_order_id', order_id)

    return NextResponse.json({ status: 'ok' })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}