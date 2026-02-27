import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// @ts-ignore
const midtransClient = require('midtrans-client')

const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY,
})

// Fix: Webhook harus pakai service role agar bisa update payments
// (RLS policy tidak izinkan user biasa update status payments)
function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')
  return createSupabaseClient<Database>(url, serviceKey)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()
    const { order_id, transaction_status, fraud_status } = body

    // ─── 1. VERIFIKASI SIGNATURE MIDTRANS ───────────────────────────
    let statusResponse: any
    try {
      statusResponse = await coreApi.transaction.notification(body)
    } catch (err) {
      console.error('[Webhook] Signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Fix: Pakai service role untuk bypass RLS
    const db = createServiceClient() as any

    // ─── 2. CARI DATA PAYMENT ────────────────────────────────────────
    const { data: payment, error: paymentError } = await db
      .from('payments')
      .select('id, store_id, amount, status, durasi_bulan, midtrans_order_id')
      .eq('midtrans_order_id', order_id)
      .single()

    if (paymentError || !payment) {
      console.error('[Webhook] Payment not found:', order_id)
      // Return 200 agar Midtrans tidak retry terus
      return NextResponse.json({ error: 'Payment not found' }, { status: 200 })
    }

    // ─── 3. CEGAH DOUBLE PROCESSING (idempotency) ───────────────────
    if (payment.status === 'success') {
      console.log('[Webhook] Already processed:', order_id)
      return NextResponse.json({ status: 'already processed' })
    }

    // ─── 4. VERIFIKASI AMOUNT ────────────────────────────────────────
    const expectedAmount = payment.amount
    const receivedAmount = parseFloat(statusResponse.gross_amount ?? '0')

    if (Math.abs(receivedAmount - expectedAmount) > 1) {
      // Toleransi 1 rupiah untuk floating point
      console.error('[Webhook] Amount mismatch:', { order_id, expectedAmount, receivedAmount })
      await db.from('payments').update({
        status: 'suspicious',
        notes: `Amount mismatch: expected ${expectedAmount}, received ${receivedAmount}`,
        updated_at: new Date().toISOString(),
      }).eq('midtrans_order_id', order_id)
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 200 })
    }

    // ─── 5. TENTUKAN STATUS BARU ─────────────────────────────────────
    let newStatus = 'pending'
    let shouldActivatePro = false

    const txStatus = statusResponse.transaction_status ?? transaction_status
    const txFraud  = statusResponse.fraud_status ?? fraud_status

    if (txStatus === 'capture' || txStatus === 'settlement') {
      if (txFraud === 'accept' || !txFraud) {
        newStatus = 'success'
        shouldActivatePro = true
      } else if (txFraud === 'challenge') {
        newStatus = 'challenge'
        console.warn('[Webhook] Fraud challenge:', order_id)
      }
    } else if (['cancel', 'deny', 'expire'].includes(txStatus)) {
      newStatus = 'failed'
    } else if (txStatus === 'refund') {
      newStatus = 'refunded'
    }

    // ─── 6. AKTIFKAN PRO ─────────────────────────────────────────────
    if (shouldActivatePro) {
      try {
        await db.rpc('activate_pro_subscription', {
          p_store_id: payment.store_id,
          p_durasi_bulan: payment.durasi_bulan ?? 1,
        })
        console.log('[Webhook] PRO activated:', payment.store_id)
      } catch (rpcError) {
        console.error('[Webhook] PRO activation failed:', rpcError)
        await db.from('payments').update({
          status: 'success_pending_activation',
          notes: 'Payment success but PRO activation failed — needs manual review',
          updated_at: new Date().toISOString(),
        }).eq('midtrans_order_id', order_id)
        // Return 200 agar Midtrans tidak retry
        return NextResponse.json({ error: 'Activation failed, flagged for review' }, { status: 200 })
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
    console.log(`[Webhook] Done: ${order_id} → ${newStatus} (${duration}ms)`)

    return NextResponse.json({ status: 'ok', order_id, newStatus })

  } catch (error: any) {
    console.error('[Webhook] Unexpected error:', error)
    // Return 200 agar Midtrans tidak retry (sudah di-log)
    return NextResponse.json({ error: 'Internal server error' }, { status: 200 })
  }
}