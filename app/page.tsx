import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  ShoppingCart, Package, Users, BarChart2,
  CreditCard, FileDown, Zap, CheckCircle, Store,
  ArrowRight, Star,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'TokoKu — Aplikasi Kasir Gratis untuk UMKM Indonesia',
  description: 'Catat penjualan, kelola stok, dan pantau hutang pelanggan dari satu tempat. Gratis untuk mulai, setup 5 menit. Cocok untuk warung, toko kelontong, dan UMKM.',
  keywords: [
    'aplikasi kasir gratis',
    'kasir online UMKM',
    'aplikasi stok barang toko',
    'catat hutang pelanggan',
    'aplikasi warung',
    'toko kelontong digital',
    'kasir gratis Indonesia',
    'aplikasi jualan online',
  ].join(', '),
  openGraph: {
    title: 'TokoKu — Aplikasi Kasir Gratis untuk UMKM',
    description: 'Catat penjualan, kelola stok, pantau hutang. Gratis selamanya untuk mulai.',
    type: 'website',
    locale: 'id_ID',
  },
}

const FEATURES = [
  {
    icon: ShoppingCart,
    title: 'Kasir Digital',
    desc: 'Catat transaksi dengan cepat. Pilih produk, pilih pelanggan, cetak struk. Semua dalam hitungan detik.',
  },
  {
    icon: Package,
    title: 'Kelola Stok',
    desc: 'Pantau stok barang secara real-time. Dapat notifikasi otomatis kalau stok hampir habis.',
  },
  {
    icon: CreditCard,
    title: 'Catat Hutang',
    desc: 'Tidak perlu buku hutang lagi. Catat hutang pelanggan dan track pembayarannya dengan mudah.',
  },
  {
    icon: Users,
    title: 'Data Pelanggan',
    desc: 'Simpan data pelanggan setia kamu. Lihat riwayat transaksi dan hutang per pelanggan.',
  },
  {
    icon: BarChart2,
    title: 'Laporan Penjualan',
    desc: 'Laporan harian otomatis. Lihat produk terlaris, metode pembayaran, dan jam ramai toko.',
  },
  {
    icon: FileDown,
    title: 'Export PDF',
    desc: 'Export laporan ke PDF untuk arsip atau laporan ke pemilik toko. (Fitur PRO)',
  },
]

const TESTIMONIALS = [
  {
    nama: 'Budi S.',
    toko: 'Warung Makan Bu Budi',
    text: 'Sebelumnya catat hutang di buku, sering lupa. Sekarang semua tercatat rapi di TokoKu.',
    bintang: 5,
  },
  {
    nama: 'Siti R.',
    toko: 'Toko Kelontong Siti',
    text: 'Stok barang jadi lebih terkontrol. Tidak pernah lagi kehabisan barang dadakan.',
    bintang: 5,
  },
  {
    nama: 'Ahmad F.',
    toko: 'Depot Air Minum Ahmad',
    text: 'Laporan hariannya membantu banget buat evaluasi. Tahu mana produk yang paling laku.',
    bintang: 5,
  },
]

const FREE_FEATURES = ['50 produk', 'Kasir & transaksi', '50 pelanggan', 'Kelola hutang', 'Laporan harian']
const PRO_FEATURES = ['Produk unlimited', 'Pelanggan unlimited', 'Laporan bulanan', 'Export PDF', 'Priority support']

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">

      {/* Navbar */}
      <nav className="border-b border-[#2a3045] px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
              <Store className="w-4 h-4 text-[#0a0d14]" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-black">Toko<span className="text-green-400">Ku</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#64748b] hover:text-white transition-colors">
              Masuk
            </Link>
            <Link href="/register"
              className="px-4 py-2 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-4 py-20 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-full px-4 py-1.5 mb-6">
          <Zap className="w-3.5 h-3.5 text-green-400" />
          <span className="text-green-400 text-xs font-bold">Gratis untuk mulai • Setup 5 menit</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
          Aplikasi Kasir Gratis<br />
          untuk <span className="text-green-400">UMKM Indonesia</span>
        </h1>
        <p className="text-[#94a3b8] text-lg mb-8 max-w-xl mx-auto">
          Catat penjualan, kelola stok, dan pantau hutang pelanggan dari satu tempat.
          Cocok untuk warung, toko kelontong, dan usaha kecil.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black transition-colors">
            Mulai Gratis Sekarang <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#181c27] border border-[#2a3045] text-[#94a3b8] hover:text-white rounded-xl font-bold transition-colors">
            Sudah punya akun? Masuk
          </Link>
        </div>
        <p className="text-xs text-[#3a4560] mt-4">
          Tidak perlu kartu kredit • Gratis selamanya untuk paket FREE
        </p>
      </section>

      {/* Features */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black mb-2">Semua yang kamu butuhkan untuk kelola toko</h2>
          <p className="text-[#64748b]">Dari kasir sampai laporan, semua ada di TokoKu</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-[#0f1117] border border-[#2a3045] rounded-2xl p-5 hover:border-green-500/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="font-bold text-white mb-1.5">{title}</h3>
              <p className="text-sm text-[#64748b] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-16 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-black mb-2">Harga yang terjangkau</h2>
          <p className="text-[#64748b]">Mulai gratis, upgrade kapan saja kalau butuh lebih</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0f1117] border border-[#2a3045] rounded-2xl p-6">
            <div className="text-sm font-bold text-[#64748b] uppercase tracking-wide mb-2">FREE</div>
            <div className="text-3xl font-black mb-1">Rp 0</div>
            <div className="text-[#64748b] text-sm mb-5">Selamanya</div>
            <div className="space-y-2 mb-6">
              {FREE_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-[#94a3b8]">
                  <CheckCircle className="w-4 h-4 text-[#64748b] flex-shrink-0" /> {f}
                </div>
              ))}
            </div>
            <Link href="/register"
              className="block w-full py-3 text-center bg-[#181c27] border border-[#2a3045] text-white rounded-xl font-bold text-sm hover:bg-[#1e2333] transition-colors">
              Daftar Gratis
            </Link>
          </div>
          <div className="bg-gradient-to-br from-[#1a2a1a] to-[#142020] border border-green-500/30 rounded-2xl p-6 relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-cyan-400 rounded-t-2xl" />
            <div className="flex items-center gap-2 mb-2">
              <div className="text-sm font-bold text-green-400 uppercase tracking-wide">PRO</div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-green-400/20 text-green-400 rounded-full">POPULER</span>
            </div>
            <div className="text-3xl font-black mb-1">Rp 49.000</div>
            <div className="text-[#64748b] text-sm mb-5">per bulan</div>
            <div className="space-y-2 mb-6">
              {PRO_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-[#94a3b8]">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /> {f}
                </div>
              ))}
            </div>
            <Link href="/register"
              className="block w-full py-3 text-center bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
              Coba Gratis Dulu
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black mb-2">Dipercaya pemilik toko Indonesia</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TESTIMONIALS.map(t => (
            <div key={t.nama} className="bg-[#0f1117] border border-[#2a3045] rounded-2xl p-5">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.bintang }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-[#94a3b8] mb-4 leading-relaxed">"{t.text}"</p>
              <div>
                <div className="text-sm font-bold text-white">{t.nama}</div>
                <div className="text-xs text-[#64748b]">{t.toko}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 text-center max-w-xl mx-auto">
        <h2 className="text-2xl font-black mb-3">Mulai kelola toko kamu sekarang</h2>
        <p className="text-[#64748b] mb-8">Gratis selamanya. Tidak perlu kartu kredit.</p>
        <Link href="/register"
          className="inline-flex items-center gap-2 px-8 py-4 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black transition-colors">
          Daftar Gratis <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a3045] px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
              <Store className="w-3.5 h-3.5 text-[#0a0d14]" strokeWidth={2.5} />
            </div>
            <span className="font-black text-sm">Toko<span className="text-green-400">Ku</span></span>
          </div>
          <p className="text-xs text-[#3a4560]">
            © {new Date().getFullYear()} TokoKu. Dibuat untuk UMKM Indonesia.
          </p>
          <div className="flex gap-4 text-xs text-[#3a4560]">
            <Link href="/login" className="hover:text-[#64748b] transition-colors">Masuk</Link>
            <Link href="/register" className="hover:text-[#64748b] transition-colors">Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}