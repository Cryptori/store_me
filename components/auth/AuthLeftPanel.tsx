import { Store, Check } from 'lucide-react'

type Stat = { num: string; label: string }
type Feature = string
type Testimonial = { text: string; name: string; toko: string }

type Props = {
  variant: 'login' | 'register'
}

const LOGIN_STATS: Stat[] = [
  { num: '2.400+', label: 'Toko aktif' },
  { num: 'Rp 0', label: 'Untuk mulai' },
  { num: '5 menit', label: 'Setup awal' },
]

const REGISTER_FEATURES: Feature[] = [
  '50 produk gratis',
  'Kasir & transaksi harian',
  'Kelola hutang pelanggan',
  'Laporan harian otomatis',
]

const TESTIMONIAL: Testimonial = {
  text: '"TokoKu bantu saya catat hutang pelanggan yang biasa lupa. Sekarang gak ada yang lolos!"',
  name: 'Ibu Sari',
  toko: 'Warung Sembako, Surabaya',
}

export default function AuthLeftPanel({ variant }: Props) {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-[#0f1117] border-r border-[#1e2333] flex-col justify-between p-12 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #4ade80 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />

      {/* Top content */}
      <div className="relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-16">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
            <Store className="w-5 h-5 text-[#0a0d14]" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            Toko<span className="text-green-400">Ku</span>
          </span>
        </div>

        {variant === 'login' ? (
          <div>
            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Kelola toko,<br />
              <span className="text-green-400">stok & hutang</span><br />
              dari satu tempat.
            </h1>
            <p className="text-[#64748b] text-base leading-relaxed">
              Aplikasi kasir simpel untuk toko kecil Indonesia. Gratis untuk mulai, tanpa ribet.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <div className="inline-block bg-green-400/10 border border-green-400/20 rounded-full px-4 py-1.5 mb-6">
                <span className="text-green-400 text-xs font-bold uppercase tracking-wide">Gratis untuk mulai</span>
              </div>
              <h1 className="text-4xl font-black text-white leading-tight mb-4">
                Mulai kelola<br />toko lo <span className="text-green-400">hari ini.</span>
              </h1>
              <p className="text-[#64748b] text-sm leading-relaxed">
                Setup 5 menit, langsung bisa pakai. Tidak perlu kartu kredit.
              </p>
            </div>
            <div className="space-y-3">
              {REGISTER_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-400/20 border border-green-400/30 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-green-400" strokeWidth={3} />
                  </div>
                  <span className="text-[#94a3b8] text-sm">{f}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom content */}
      <div className="relative z-10">
        {variant === 'login' ? (
          <div className="grid grid-cols-3 gap-4">
            {LOGIN_STATS.map(stat => (
              <div key={stat.label} className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
                <div className="text-green-400 font-black text-lg font-mono">{stat.num}</div>
                <div className="text-[#64748b] text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-5">
            <p className="text-[#94a3b8] text-sm italic mb-3">{TESTIMONIAL.text}</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-xs font-black text-[#0a0d14]">
                {TESTIMONIAL.name[0]}
              </div>
              <div>
                <div className="text-white text-xs font-semibold">{TESTIMONIAL.name}</div>
                <div className="text-[#64748b] text-xs">{TESTIMONIAL.toko}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}