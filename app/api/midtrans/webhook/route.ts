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
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { order_id, transaction_status, fraud_status, gross_amount } = body

    // ─── 1. VERIFIKASI SIGNATURE MIDTRANS ───────────────────────────
    // coreApi.transaction.notification() otomatis verifikasi signature
    // Kalau signature tidak valid, akan throw error
    let statusResponse: any
    try {
      statusResponse = await coreApi.transaction.notification(body)
    } catch (err) {
      console.error('[Webhook] Signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const supabase = await createClient()
    const db = supabase as any

    // ─── 2. CARI DATA PAYMENT ────────────────────────────────────────
    const { data: payment, error: paymentError } = await db
      .from('payments')
      .select('*, stores(id, nama)')
      .eq('midtrans_order_id', order_id)
      .single()

    if (paymentError || !payment) {
      console.error('[Webhook] Payment not found:', order_id)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // ─── 3. CEGAH DOUBLE PROCESSING ─────────────────────────────────
    if (payment.status === 'success') {
      console.log('[Webhook] Already processed:', order_id)
      return NextResponse.json({ status: 'already processed' })
    }

    // ─── 4. VERIFIKASI AMOUNT ────────────────────────────────────────
    const expectedAmount = payment.amount
    const receivedAmount = parseFloat(statusResponse.gross_amount ?? gross_amount ?? '0')

    if (receivedAmount !== expectedAmount) {
      console.error('[Webhook] Amount mismatch:', {
        order_id,
        expected: expectedAmount,
        received: receivedAmount,
      })
      // Log ke database sebagai suspicious
      await db.from('payments').update({
        status: 'suspicious',
        notes: `Amount mismatch: expected ${expectedAmount}, received ${receivedAmount}`,
        updated_at: new Date().toISOString(),
      }).eq('midtrans_order_id', order_id)

      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    // ─── 5. PROSES STATUS TRANSAKSI ──────────────────────────────────
    let newStatus = 'pending'
    let shouldActivatePro = false

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        newStatus = 'success'
        shouldActivatePro = true
      } else if (fraud_status === 'challenge') {
        // Butuh review manual
        newStatus = 'challenge'
        console.warn('[Webhook] Fraud challenge:', order_id)
      }
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      newStatus = 'failed'
    } else if (transaction_status === 'refund') {
      newStatus = 'refunded'
    } else if (transaction_status === 'pending') {
      newStatus = 'pending'
    }

    // ─── 6. AKTIFKAN PRO (hanya kalau success) ───────────────────────
    if (shouldActivatePro) {
      try {
        await db.rpc('activate_pro_subscription', {
          p_store_id: payment.store_id,
          p_durasi_bulan: payment.durasi_bulan ?? 1,
        })
        console.log('[Webhook] PRO activated for store:', payment.store_id)
      } catch (rpcError) {
        console.error('[Webhook] Failed to activate PRO:', rpcError)
        // Update status payment tapi flag error aktivasi
        await db.from('payments').update({
          status: 'success_pending_activation',
          notes: 'Payment success but PRO activation failed, needs manual review',
          updated_at: new Date().toISOString(),
        }).eq('midtrans_order_id', order_id)

        return NextResponse.json({ error: 'Activation failed' }, { status: 500 })
      }
    }

    // ─── 7. UPDATE STATUS PAYMENT ────────────────────────────────────
    await db.from('payments').update({
      status: newStatus,
      midtrans_transaction_id: statusResponse.transaction_id ?? null,
      payment_type: statusResponse.payment_type ?? null,
      updated_at: new Date().toISOString(),
    }).eq('midtrans_order_id', order_id)

    const duration = Date.now() - startTime
    console.log(`[Webhook] Processed ${order_id} → ${newStatus} (${duration}ms)`)

    return NextResponse.json({ status: 'ok', order_id, newStatus })

  } catch (error: any) {
    console.error('[Webhook] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}