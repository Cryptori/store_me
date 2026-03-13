'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Check, Zap, Loader2, Clock } from 'lucide-react'
import { useActiveStore } from '@/hooks/useStore'
import { useFreemium } from '@/hooks/useFreemium'
import { PRO_PRICE } from '@/lib/constants'
import { formatRupiah } from '@/lib/utils'

const FREE_FEATURES = [
  '50 produk',
  'Kasir & transaksi harian',
  '50 pelanggan',
  'Kelola hutang',
  'Laporan harian',
]

const PRO_FEATURES = [
  'Produk unlimited',
  'Pelanggan unlimited',
  'Laporan bulanan',
  'Export PDF',
  'Multi-user kasir',
  'Priority support',
  'Semua fitur FREE',
]

const FAQ = [
  { q: 'Bisa cancel kapan saja?', a: 'Ya, kamu bisa cancel langganan kapan saja. Akses PRO tetap aktif sampai akhir periode.' },
  { q: 'Metode pembayaran apa yang tersedia?', a: 'Transfer bank (BCA, Mandiri, BNI, dll), QRIS, GoPay, OVO, dan kartu kredit via Midtrans.' },
  { q: 'Data saya aman jika downgrade?', a: 'Ya, semua data kamu tetap aman. Hanya fitur PRO yang tidak bisa diakses.' },
  { q: 'Berapa lama aktivasi PRO setelah bayar?', a: 'Otomatis aktif dalam hitungan detik setelah pembayaran dikonfirmasi.' },
]

export default function UpgradePage() {
  const { store } = useActiveStore()
  const { isPro, isTrial, trialDaysLeft, trialStatus } = useFreemium()
  const [billing, setBilling] = useState<'bulanan' | 'tahunan'>('bulanan')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const scriptSrc = `https://app${process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true' ? '' : '.sandbox'}.midtrans.com/snap/snap.js`
    if (document.querySelector(`script[src="${scriptSrc}"]`)) return
    const script = document.createElement('script')
    script.src = scriptSrc
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '')
    script.async = true
    document.head.appendChild(script)
    return () => { document.head.removeChild(script) }
  }, [])

  async function handleUpgrade() {
    if (!store) return
    setLoading(true)
    setError('')

    try {
      const durasi = billing === 'tahunan' ? 12 : 1
      const res = await fetch('/api/midtrans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durasi, storeId: store.id }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Gagal membuat transaksi')

      if (typeof window !== 'undefined' && (window as any).snap) {
        ;(window as any).snap.pay(data.token, {
          onSuccess: () => { window.location.href = `/upgrade/success?order_id=${data.order_id}` },
          onPending: () => { window.location.href = `/upgrade/success?order_id=${data.order_id}` },
          onError:   () => { setError('Pembayaran gagal, coba lagi'); setLoading(false) },
          onClose:   () => { setLoading(false) },
        })
      } else {
        window.location.href = data.redirect_url
      }
    } catch (err: any) {
      setError(err.message ?? 'Terjadi kesalahan')
      setLoading(false)
    }
  }

  // Sudah PRO
  if (isPro) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-5xl mb-4">✨</div>
      <h1 className="text-2xl font-black text-white mb-2">Kamu sudah PRO!</h1>
      <p className="text-[#64748b]">Nikmati semua fitur premium TokoKu.</p>
      {store?.pro_expires_at && (
        <p className="text-[#64748b] text-sm mt-2">
          Aktif hingga {new Date(store.pro_expires_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>
      )}
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-full px-4 py-1.5 mb-4">
          <Zap className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400 text-xs font-bold uppercase tracking-wide">Upgrade ke PRO</span>
        </div>

        {/* Trial urgency messaging */}
        {isTrial && trialDaysLeft > 0 && (
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-4 py-2 mb-4 ml-2">
            <Clock className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-bold">
              Trial berakhir dalam {trialDaysLeft} hari
            </span>
          </div>
        )}

        {trialStatus === 'expired' && (
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 mb-4 ml-2">
            <span className="text-red-400 text-sm font-bold">⚠️ Trial kamu sudah berakhir</span>
          </div>
        )}

        <h1 className="text-3xl font-black text-white mb-3">Kelola toko tanpa batas</h1>
        <p className="text-[#64748b]">
          {isTrial
            ? 'Kamu sudah merasakan PRO — jangan sampai kehilangan akses!'
            : 'Upgrade sekarang dan dapatkan semua fitur premium TokoKu'}
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {(['bulanan', 'tahunan'] as const).map(b => (
          <button key={b} onClick={() => setBilling(b)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all border ${
              billing === b
                ? 'bg-[#1a2a1a] border-green-500/30 text-green-400'
                : 'bg-[#181c27] border-[#2a3045] text-[#64748b] hover:text-white'
            }`}>
            {b}{' '}
            {b === 'tahunan' && <span className="text-xs text-yellow-400 ml-1">Hemat 2 bulan</span>}
          </button>
        ))}
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Free */}
        <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl p-6">
          <div className="mb-6">
            <div className="text-sm font-bold text-[#64748b] uppercase tracking-wide mb-2">FREE</div>
            <div className="text-3xl font-black text-white">Rp 0</div>
            <div className="text-[#64748b] text-sm">Selamanya</div>
          </div>
          <div className="space-y-3 mb-6">
            {FREE_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-[#94a3b8]">
                <Check className="w-4 h-4 text-[#64748b] flex-shrink-0" /> {f}
              </div>
            ))}
          </div>
          <div className="w-full py-3 text-center bg-[#1e2333] border border-[#2a3045] text-[#64748b] rounded-xl text-sm font-bold">
            {isTrial ? 'Setelah Trial Berakhir' : 'Paket Saat Ini'}
          </div>
        </div>

        {/* PRO */}
        <div className="bg-gradient-to-br from-[#1a2a1a] to-[#142020] border border-green-500/30 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-cyan-400" />
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm font-bold text-green-400 uppercase tracking-wide">PRO</div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-green-400/20 text-green-400 rounded-full">POPULER</span>
            </div>
            <div className="text-3xl font-black text-white">
              {formatRupiah(billing === 'bulanan' ? PRO_PRICE.BULANAN : Math.round(PRO_PRICE.TAHUNAN / 12))}
            </div>
            <div className="text-[#64748b] text-sm">
              per bulan {billing === 'tahunan' && `(${formatRupiah(PRO_PRICE.TAHUNAN)}/tahun)`}
            </div>
          </div>
          <div className="space-y-3 mb-6">
            {PRO_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-[#94a3b8]">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" /> {f}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button onClick={handleUpgrade} disabled={loading}
            className="w-full py-3.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
              : `Upgrade Sekarang — ${formatRupiah(billing === 'bulanan' ? PRO_PRICE.BULANAN : PRO_PRICE.TAHUNAN)}`}
          </button>

          <p className="text-center text-[#64748b] text-xs mt-3">
            Pembayaran aman via Midtrans • Transfer, QRIS, e-wallet
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-6">
        <h2 className="font-bold text-sm mb-4">Pertanyaan Umum</h2>
        <div className="space-y-4">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="border-b border-[#2a3045] last:border-0 pb-4 last:pb-0">
              <div className="text-sm font-semibold text-white mb-1">{q}</div>
              <div className="text-sm text-[#64748b]">{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}