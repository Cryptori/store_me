'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setChecking(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl p-10 text-center max-w-sm w-full">
      {checking ? (
        <>
          <Loader2 className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-black text-white mb-2">Memverifikasi Pembayaran...</h2>
          <p className="text-[#64748b] text-sm">Mohon tunggu sebentar</p>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-green-400/20 border-2 border-green-400/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Pembayaran Berhasil!</h2>
          <p className="text-[#64748b] text-sm mb-1">Akun kamu sudah diupgrade ke PRO.</p>
          <p className="text-[#64748b] text-xs mb-6 font-mono">{orderId}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors"
          >
            Ke Dashboard →
          </button>
        </>
      )}
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