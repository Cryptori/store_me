'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Status = 'checking' | 'success' | 'pending' | 'failed'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')
  const [status, setStatus] = useState<Status>('checking')
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!orderId) { setStatus('failed'); return }
    verifyPayment()
  }, [orderId])

  async function verifyPayment() {
    const supabase = createClient()
    const db = supabase as any

    for (let i = 0; i < 10; i++) {
      setAttempts(i + 1)

      // Fix: kolom sudah direname dari order_id ke midtrans_order_id
      // Fix: cast ke any agar tidak 'never'
      const { data: payment } = await db
        .from('payments')
        .select('status, store_id')
        .eq('midtrans_order_id', orderId)
        .single()

      if (payment?.status === 'success') {
        // Fix: stores query pakai typed client, cast hasil
        const { data: store } = await db
          .from('stores')
          .select('is_pro')
          .eq('id', payment.store_id)
          .single()

        if ((store as { is_pro: boolean } | null)?.is_pro) {
          setStatus('success')
          return
        }
      }

      if (payment?.status === 'failed') {
        setStatus('failed')
        return
      }

      await new Promise(r => setTimeout(r, 2000))
    }

    setStatus('pending')
  }

  if (status === 'checking') return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl p-10 text-center max-w-sm w-full">
      <Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
      <h2 className="text-xl font-black text-white mb-2">Memverifikasi Pembayaran...</h2>
      <p className="text-[#64748b] text-sm">Mohon tunggu sebentar</p>
      {attempts > 2 && (
        <p className="text-[#3a4560] text-xs mt-2">Memeriksa ({attempts}/10)...</p>
      )}
    </div>
  )

  if (status === 'success') return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl p-10 text-center max-w-sm w-full">
      <div className="w-16 h-16 rounded-full bg-green-400/20 border-2 border-green-400/30 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-400" />
      </div>
      <h2 className="text-xl font-black text-white mb-2">Pembayaran Berhasil!</h2>
      <p className="text-[#64748b] text-sm mb-1">Akun kamu sudah diupgrade ke PRO.</p>
      {orderId && <p className="text-[#64748b] text-xs mb-6 font-mono">{orderId}</p>}
      <button onClick={() => router.push('/dashboard')}
        className="w-full py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
        Ke Dashboard →
      </button>
    </div>
  )

  if (status === 'pending') return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl p-10 text-center max-w-sm w-full">
      <div className="w-16 h-16 rounded-full bg-yellow-400/20 border-2 border-yellow-400/30 flex items-center justify-center mx-auto mb-4">
        <Loader2 className="w-8 h-8 text-yellow-400" />
      </div>
      <h2 className="text-xl font-black text-white mb-2">Pembayaran Diproses</h2>
      <p className="text-[#64748b] text-sm mb-1">Pembayaran sedang diverifikasi oleh bank.</p>
      <p className="text-[#64748b] text-xs mb-6">Akun akan diupgrade otomatis setelah konfirmasi. Biasanya 1-5 menit.</p>
      {orderId && <p className="text-[#3a4560] text-xs mb-4 font-mono">{orderId}</p>}
      <button onClick={() => router.push('/dashboard')}
        className="w-full py-3 bg-[#1e2333] border border-[#2a3045] hover:bg-[#2a3045] text-white rounded-xl font-black text-sm transition-colors">
        Kembali ke Dashboard
      </button>
    </div>
  )

  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl p-10 text-center max-w-sm w-full">
      <div className="w-16 h-16 rounded-full bg-red-400/20 border-2 border-red-400/30 flex items-center justify-center mx-auto mb-4">
        <XCircle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-xl font-black text-white mb-2">Verifikasi Gagal</h2>
      <p className="text-[#64748b] text-sm mb-6">
        Tidak dapat memverifikasi pembayaran. Jika sudah bayar, hubungi support.
      </p>
      <div className="flex gap-3">
        <button onClick={() => router.push('/upgrade')}
          className="flex-1 py-3 bg-[#1e2333] border border-[#2a3045] text-white rounded-xl font-black text-sm transition-colors hover:bg-[#2a3045]">
          Coba Lagi
        </button>
        <button onClick={() => router.push('/dashboard')}
          className="flex-1 py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
          Dashboard
        </button>
      </div>
    </div>
  )
}

export default function UpgradeSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl p-10 text-center max-w-sm w-full">
          <Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-[#64748b] text-sm">Loading...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  )
}