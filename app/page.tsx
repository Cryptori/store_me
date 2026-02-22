import Link from 'next/link'
import { Store, Check, ArrowRight, ShoppingCart, Package, Users, BarChart2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0d14] text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[#1e2333]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
            <Store className="w-4 h-4 text-[#0a0d14]" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-black">Toko<span className="text-green-400">Ku</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-[#94a3b8] hover:text-white text-sm font-semibold transition-colors">
            Masuk
          </Link>
          <Link href="/register" className="px-4 py-2 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl text-sm font-black transition-colors">
            Daftar Gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 py-24 relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #4ade80 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-green-400 text-xs font-bold uppercase tracking-wide">Gratis untuk mulai</span>
          </div>
          <h1 className="text-5xl font-black leading-tight mb-5">
            Kasir & manajemen toko<br /><span className="text-green-400">simpel untuk UMKM</span>
          </h1>
          <p className="text-[#64748b] text-lg mb-8 max-w-xl mx-auto">
            Catat penjualan, kelola stok, dan pantau hutang pelanggan — semua dari satu tempat. Setup 5 menit.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="flex items-center gap-2 px-6 py-3.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black transition-colors">
              Mulai Gratis <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="px-6 py-3.5 bg-[#181c27] border border-[#2a3045] text-white hover:bg-[#1e2333] rounded-xl font-bold text-sm transition-colors">
              Sudah punya akun?
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: ShoppingCart, label: 'Kasir Cepat', desc: 'Transaksi dalam hitungan detik' },
            { icon: Package, label: 'Kelola Stok', desc: 'Alert otomatis stok menipis' },
            { icon: Users, label: 'Hutang Pelanggan', desc: 'Tidak ada hutang yang terlewat' },
            { icon: BarChart2, label: 'Laporan Harian', desc: 'Ringkasan penjualan otomatis' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-[#181c27] border border-[#2a3045] rounded-xl p-5 hover:border-green-500/30 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-green-400/10 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-green-400" />
              </div>
              <div className="font-bold text-sm mb-1">{label}</div>
              <div className="text-xs text-[#64748b]">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-6 py-16">
        <h2 className="text-2xl font-black mb-3">Mulai kelola toko hari ini</h2>
        <p className="text-[#64748b] mb-6">Gratis selamanya. Upgrade kalau butuh lebih.</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black transition-colors">
          Daftar Sekarang — Gratis <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-[#1e2333] text-[#64748b] text-sm">
        <p>© 2026 TokoKu. Dibuat dengan ❤️ untuk UMKM Indonesia.</p>
      </footer>
    </div>
  )
}