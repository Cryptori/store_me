'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Store, Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function JoinPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'confirm' | 'joining' | 'success' | 'error'>('loading')
  const [storeName, setStoreName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) { setStatus('error'); setErrorMsg('Token tidak valid'); return }
    checkToken()
  }, [token])

  async function checkToken() {
    // Cek user sudah login
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push(`/login?redirect=/join?token=${token}`)
      return
    }

    // Cek token valid
    const { data: inv } = await (supabase as any)
      .from('kasir_invitations')
      .select('store_id, status, expires_at')
      .eq('token', token)
      .single()

    if (!inv || inv.status !== 'pending' || new Date(inv.expires_at) < new Date()) {
      setStatus('error')
      setErrorMsg('Undangan tidak valid atau sudah kedaluwarsa')
      return
    }

    const { data: store } = await (supabase as any)
      .from('stores').select('nama').eq('id', inv.store_id).single()

    setStoreName(store?.nama ?? 'toko')
    setStatus('confirm')
  }

  async function handleAccept() {
    if (!token) return
    setStatus('joining')

    const supabase = createClient()
    const { data } = await (supabase as any).rpc('accept_kasir_invitation', { p_token: token })

    if (data?.success) {
      setStoreName(data.store_nama)
      setStatus('success')
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } else {
      setStatus('error')
      setErrorMsg(data?.message ?? 'Gagal bergabung')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-cyan-400 items-center justify-center mb-3">
            <Store className="w-6 h-6 text-[#0a0d14]" strokeWidth={2.5} />
          </div>
          <div className="text-2xl font-black">Toko<span className="text-green-400">Ku</span></div>
        </div>

        <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl p-6 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-green-400 mx-auto mb-3" />
              <p className="text-[#64748b] text-sm">Memverifikasi undangan...</p>
            </>
          )}

          {status === 'confirm' && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center mx-auto mb-4">
                <Store className="w-7 h-7 text-green-400" />
              </div>
              <h2 className="text-lg font-black text-white mb-2">Undangan Kasir</h2>
              <p className="text-[#64748b] text-sm mb-1">Kamu diundang bergabung sebagai kasir di:</p>
              <p className="text-white font-bold text-lg mb-5">{storeName}</p>
              <div className="space-y-2">
                <button onClick={handleAccept}
                  className="w-full py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
                  Terima Undangan
                </button>
                <button onClick={() => router.push('/')}
                  className="w-full py-3 text-[#64748b] hover:text-white text-sm transition-colors">
                  Tolak
                </button>
              </div>
            </>
          )}

          {status === 'joining' && (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-green-400 mx-auto mb-3" />
              <p className="text-[#64748b] text-sm">Bergabung ke {storeName}...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
              <h2 className="text-lg font-black text-white mb-2">Berhasil Bergabung!</h2>
              <p className="text-[#64748b] text-sm">Kamu sekarang bisa akses kasir {storeName}</p>
              <p className="text-[#3a4560] text-xs mt-3">Mengarahkan ke dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-black text-white mb-2">Undangan Tidak Valid</h2>
              <p className="text-[#64748b] text-sm mb-4">{errorMsg}</p>
              <button onClick={() => router.push('/')}
                className="w-full py-3 bg-[#1e2333] border border-[#2a3045] text-white rounded-xl font-bold text-sm">
                Kembali ke Beranda
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}