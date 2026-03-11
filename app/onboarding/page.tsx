'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Store, Package, CheckCircle, ArrowRight, Loader2, Sparkles, Zap } from 'lucide-react'

type Step = 'toko' | 'produk' | 'selesai'

const CONTOH_PRODUK = [
  { nama: 'Kopi Hitam',   harga_jual: 5000,  satuan: 'cup',     stok: 100 },
  { nama: 'Teh Manis',    harga_jual: 4000,  satuan: 'cup',     stok: 100 },
  { nama: 'Air Mineral',  harga_jual: 3000,  satuan: 'botol',   stok: 50  },
  { nama: 'Mie Instan',   harga_jual: 4500,  satuan: 'bungkus', stok: 50  },
  { nama: 'Roti Tawar',   harga_jual: 8000,  satuan: 'bungkus', stok: 20  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('toko')
  const [namaToko, setNamaToko] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [storeId, setStoreId] = useState('')
  const [loadingSample, setLoadingSample] = useState(false)

  const STEPS: Step[] = ['toko', 'produk', 'selesai']
  const stepIndex = STEPS.indexOf(step)

  async function handleBuatToko() {
    const nama = namaToko.trim()
    if (nama.length < 3) { setError('Nama toko minimal 3 karakter'); return }
    if (nama.length > 50) { setError('Nama toko maksimal 50 karakter'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/login'); return }

    // Cek duplikat
    const { data: existing } = await (supabase as any)
      .from('stores').select('id').eq('user_id', user.id).single()
    if (existing) { router.replace('/dashboard'); return }

    // Buat toko
    const { data: store, error: err } = await (supabase as any)
      .from('stores').insert({ user_id: user.id, nama }).select().single()

    if (err || !store) {
      setError('Gagal membuat toko, coba lagi')
      setLoading(false)
      return
    }

    // Auto-aktivasi trial PRO 7 hari
    try {
      await (supabase as any).rpc('activate_trial', { p_store_id: store.id })
    } catch {
      // Trial gagal tidak critical — toko tetap dibuat
      console.warn('Trial activation failed, continuing without trial')
    }

    setStoreId(store.id)
    setLoading(false)
    setStep('produk')
  }

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
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                stepIndex > i
                  ? 'bg-green-400/30 text-green-400'
                  : step === s
                  ? 'bg-green-400 text-[#0a0d14]'
                  : 'bg-[#181c27] text-[#64748b]'
              }`}>
                {stepIndex > i ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 ${stepIndex > i ? 'bg-green-400/40' : 'bg-[#2a3045]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Nama Toko ── */}
        {step === 'toko' && (
          <div className="bg-[#0f1117] border border-[#2a3045] rounded-2xl p-6">
            {/* Trial badge */}
            <div className="flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-xl px-3 py-2 mb-5">
              <Zap className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              <span className="text-xs text-green-400 font-bold">
                Daftar sekarang — dapat PRO gratis 7 hari!
              </span>
            </div>

            <h1 className="text-xl font-black text-white mb-1">Nama toko kamu apa?</h1>
            <p className="text-sm text-[#64748b] mb-5">Ini akan muncul di struk dan laporan kamu.</p>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Contoh: Warung Bu Siti"
                  value={namaToko}
                  onChange={e => { setNamaToko(e.target.value); setError('') }}
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
                  : <>Mulai & Aktifkan Trial PRO <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Produk Contoh ── */}
        {step === 'produk' && (
          <div className="bg-[#0f1117] border border-[#2a3045] rounded-2xl p-6">
            {/* Trial activated confirmation */}
            <div className="flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-xl px-3 py-2 mb-5">
              <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              <span className="text-xs text-green-400 font-bold">
                ✨ PRO Trial 7 hari berhasil diaktifkan!
              </span>
            </div>

            <h1 className="text-xl font-black text-white mb-1">Tambah produk contoh?</h1>
            <p className="text-sm text-[#64748b] mb-5">
              Isi 5 produk contoh biar kamu bisa langsung coba kasir. Bisa dihapus kapan saja.
            </p>

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
              <button onClick={handleTambahSample} disabled={loadingSample}
                className="w-full py-3 bg-green-400 hover:bg-green-300 disabled:opacity-40 text-[#0a0d14] rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2">
                {loadingSample
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Menambahkan...</>
                  : <><Sparkles className="w-4 h-4" /> Iya, tambahkan produk contoh</>}
              </button>
              <button onClick={() => setStep('selesai')}
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
            <h1 className="text-xl font-black text-white mb-2">Toko siap! 🎉</h1>
            <p className="text-sm text-[#64748b] mb-1">
              <strong className="text-white">{namaToko}</strong> berhasil dibuat.
            </p>
            <p className="text-sm text-[#64748b] mb-5">
              Kamu punya akses PRO gratis selama <strong className="text-green-400">7 hari</strong>.
            </p>

            {/* Trial info card */}
            <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-3 mb-5 text-left">
              <div className="text-xs font-bold text-green-400 mb-2">Yang kamu dapat selama trial:</div>
              {['Produk & pelanggan unlimited', 'Laporan bulanan lengkap', 'Export PDF laporan'].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-[#94a3b8] mb-1">
                  <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" /> {f}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <button onClick={() => window.location.href = '/dashboard'}
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