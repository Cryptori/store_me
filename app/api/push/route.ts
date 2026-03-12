import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Setup VAPID keys — generate sekali dengan:
// npx web-push generate-vapid-keys
// Lalu set di .env:
// NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
// VAPID_PRIVATE_KEY=...
// VAPID_EMAIL=mailto:admin@tokoku.vercel.app

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(request: NextRequest) {
  try {
    const { store_id, subscription } = await request.json()

    if (!store_id || !subscription) {
      return NextResponse.json({ error: 'Missing store_id or subscription' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    // Simpan subscription ke database
    await (supabase as any)
      .from('push_subscriptions')
      .upsert({
        store_id,
        endpoint: subscription.endpoint,
        subscription: JSON.stringify(subscription),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'endpoint' })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Push subscribe error:', err)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}

// Send push notification
export async function PUT(request: NextRequest) {
  // Verifikasi dari cron job
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { store_id, title, body, url } = await request.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: subs } = await (supabase as any)
      .from('push_subscriptions')
      .select('subscription')
      .eq('store_id', store_id)

    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    const payload = JSON.stringify({ title, body, url, tag: 'stok-alert' })
    let sent = 0

    for (const sub of subs) {
      try {
        await webpush.sendNotification(JSON.parse(sub.subscription), payload)
        sent++
      } catch (err: any) {
        if (err.statusCode === 410) {
          // Subscription expired — hapus
          await (supabase as any)
            .from('push_subscriptions')
            .delete()
            .eq('subscription', sub.subscription)
        }
      }
    }

    return NextResponse.json({ sent })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send push' }, { status: 500 })
  }
}