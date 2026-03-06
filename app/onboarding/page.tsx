'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Store, Package, CheckCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react'

type Step = 'toko' | 'produk' | 'selesai'

const CONTOH_PRODUK = [
  { nama: 'Kopi Hitam', harga_jual: 5000, satuan: 'cup', stok: 100 },
  { nama: 'Teh Manis', harga_jual: 4000, satuan: 'cup', stok: 100 },
  { nama: 'Air Mineral', harga_jual: 3000, satuan: 'botol', stok: 50 },
  { nama: 'Mie Instan', harga_jual: 4500, satuan: 'bungkus', stok: 50 },
  { nama: 'Roti Tawar', harga_jual: 8000, satuan: 'bungkus', stok: 20 },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('toko')
  const [namaToko, setNamaToko] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [storeId, setStoreId] = useState('')
  const [loadingSample, setLoadingSample] = useState(false)

  // ── Step 1: Buat toko
  async function handleBuatToko() {
    if (!namaToko.trim() || namaToko.trim().length < 3) {
      setError('Nama toko minimal 3 karakter')
      return
    }
    if (namaToko.trim().length > 50) {
      setError('Nama toko maksimal 50 karakter')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    // Cek duplikat
    const { data: existing } = await (supabase as any)
      .from('stores').select('id').eq('user_id', user.id).single()
    if (existing) { router.replace('/dashboard'); return }

    const { data: store, error: err } = await (supabase as any)
      .from('stores').insert({
        user_id: user.id,
        nama: namaToko.trim(),
        is_pro: false,
      }).select().single()

    if (err || !store) {
      setError('Gagal membuat toko, coba lagi')
      setLoading(false)
      return
    }

    setStoreId(store.id)
    setLoading(false)
    setStep('produk')
  }

  // ── Step 2: Tambah produk contoh
  async function handleTambahSample() {
    if (!storeId) return
    setLoadingSample(true)

    const supabase = createClient()
    await (supabase as any).from('products').insert(
      CONTOH_PRODUK.map(p => ({
        ...p,
        store_id: storeId,
        harga_beli: Math.round(p.harga_jual * 0.7),
        stok_minimum: 10,
        is_active: true,
      }))
    )

    setLoadingSample(false)
    setStep('selesai')
  }

  function handleSkipProduk() {
    setStep('selesai')
  }

  function handleMulai() {
    // Hard reload agar useStore fetch ulang
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-cyan-400 items-center justify-center mb-3">
            <Store className="w-6 h-6 text-[#0a0d14]" strokeWidth={2.5} />
          </div>
          <div className="text-2xl font-black">Toko<span className="text-green-400">Ku</span></div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['toko', 'produk', 'selesai'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step === s
                  ? 'bg-green-400 text-[#0a0d14]'
                  : ['toko', 'produk', 'selesai'].indexOf(step) > i
                    ? 'bg-green-400/30 text-green-400'
                    : 'bg-[#181c27] text-[#64748b]'
              }`}>
                {['toko', 'produk', 'selesai'].indexOf(step) > i
                  ? <CheckCircle className="w-4 h-4" />
                  : i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-0.5 ${['toko', 'produk', 'selesai'].indexOf(step) > i ? 'bg-green-400/40' : 'bg-[#2a3045]'}`} />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Nama Toko ── */}
        {step === 'toko' && (
          <div className="bg-[#0f1117] border border-[#2a3045] rounded-2xl p-6">
            <h1 className="text-xl font-black text-white mb-1">Nama toko kamu apa?</h1>
            <p className="text-sm text-[#64748b] mb-6">Ini akan muncul di struk dan laporan kamu.</p>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Contoh: Warung Bu Siti"
                  value={namaToko}
                  onChange={e => setNamaToko(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleBuatToko()}
                  maxLength={50}
                  autoFocus
                  className="w-full px-4 py-3 bg-[#181c27] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40 transition-colors"
                />
                <div className="flex justify-between mt-1">
                  {error
                    ? <p className="text-xs text-red-400">{error}</p>
                    : <span />}
                  <span className="text-xs text-[#3a4560] ml-auto">{namaToko.length}/50</span>
                </div>
              </div>

              <button
                onClick={handleBuatToko}
                disabled={loading || namaToko.trim().length < 3}
                className="w-full py-3 bg-green-400 hover:bg-green-300 disabled:opacity-40 text-[#0a0d14] rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Membuat toko...</>
                  : <>Lanjut <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Produk Contoh ── */}
        {step === 'produk' && (
          <div className="bg-[#0f1117] border border-[#2a3045] rounded-2xl p-6">
            <h1 className="text-xl font-black text-white mb-1">Tambah produk contoh?</h1>
            <p className="text-sm text-[#64748b] mb-5">Gue bisa isi 5 produk contoh biar kamu bisa langsung coba kasir. Bisa dihapus kapan saja.</p>

            <div className="space-y-2 mb-5">
              {CONTOH_PRODUK.map(p => (
                <div key={p.nama} className="flex items-center justify-between px-3 py-2 bg-[#181c27] rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-green-400/10 flex items-center justify-center">
                      <Package className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{p.nama}</div>
                      <div className="text-xs text-[#64748b]">Stok {p.stok} {p.satuan}</div>
                    </div>
                  </div>
                  <div className="text-sm font-mono font-bold text-green-400">
                    Rp {p.harga_jual.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <button
                onClick={handleTambahSample}
                disabled={loadingSample}
                className="w-full py-3 bg-green-400 hover:bg-green-300 disabled:opacity-40 text-[#0a0d14] rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2">
                {loadingSample
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Menambahkan...</>
                  : <><Sparkles className="w-4 h-4" /> Iya, tambahkan produk contoh</>}
              </button>
              <button
                onClick={handleSkipProduk}
                className="w-full py-3 bg-[#181c27] hover:bg-[#1e2333] text-[#64748b] hover:text-white rounded-xl font-bold text-sm transition-colors">
                Skip, saya isi sendiri nanti
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Selesai ── */}
        {step === 'selesai' && (
          <div className="bg-[#0f1117] border border-[#2a3045] rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-400/20 border-2 border-green-400/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-xl font-black text-white mb-2">Toko kamu siap! 🎉</h1>
            <p className="text-sm text-[#64748b] mb-2">
              <strong className="text-white">{namaToko}</strong> berhasil dibuat.
            </p>
            <p className="text-sm text-[#64748b] mb-6">
              Yuk mulai catat transaksi pertama kamu!
            </p>

            <div className="space-y-2">
              <button onClick={handleMulai}
                className="w-full py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2">
                Buka Dashboard <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => window.location.href = '/kasir'}
                className="w-full py-3 bg-[#181c27] hover:bg-[#1e2333] border border-[#2a3045] text-white rounded-xl font-bold text-sm transition-colors">
                Langsung ke Kasir →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}