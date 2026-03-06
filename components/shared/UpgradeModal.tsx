'use client'

import { useRouter } from 'next/navigation'
import { X, Zap, Check, ArrowRight } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import { PRO_PRICE } from '@/lib/constants'

type Trigger =
  | 'produk_limit'
  | 'pelanggan_limit'
  | 'laporan_bulanan'
  | 'export_pdf'

type Props = {
  trigger: Trigger
  onClose: () => void
}

const CONTENT: Record<Trigger, {
  emoji: string
  title: string
  desc: string
  features: string[]
}> = {
  produk_limit: {
    emoji: '📦',
    title: 'Limit 50 produk tercapai',
    desc: 'Kamu sudah punya 50 produk. Upgrade ke PRO untuk produk unlimited.',
    features: ['Produk unlimited', 'Pelanggan unlimited', 'Laporan bulanan', 'Export PDF'],
  },
  pelanggan_limit: {
    emoji: '👥',
    title: 'Limit 50 pelanggan tercapai',
    desc: 'Kamu sudah punya 50 pelanggan. Upgrade ke PRO untuk pelanggan unlimited.',
    features: ['Pelanggan unlimited', 'Produk unlimited', 'Laporan bulanan', 'Export PDF'],
  },
  laporan_bulanan: {
    emoji: '📊',
    title: 'Laporan Bulanan — Fitur PRO',
    desc: 'Pantau tren penjualan bulanan dan tahunan dengan grafik lengkap.',
    features: ['Laporan bulanan & tahunan', 'Grafik tren penjualan', 'Bulan terbaik & rata-rata', 'Export PDF laporan'],
  },
  export_pdf: {
    emoji: '📄',
    title: 'Export PDF — Fitur PRO',
    desc: 'Export laporan harian dan bulanan ke PDF untuk arsip atau laporan ke owner.',
    features: ['Export laporan harian ke PDF', 'Export laporan bulanan ke PDF', 'Logo toko di header PDF', 'Laporan bulanan lengkap'],
  },
}

export default function UpgradeModal({ trigger, onClose }: Props) {
  const router = useRouter()
  const content = CONTENT[trigger]

  function handleUpgrade() {
    router.push('/upgrade')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#0f1117] border border-[#2a3045] rounded-2xl w-full max-w-sm overflow-hidden">
        {/* Top gradient bar */}
        <div className="h-1 bg-gradient-to-r from-green-400 to-cyan-400" />

        <div className="p-6">
          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 text-[#3a4560] hover:text-[#64748b] transition-colors">
            <X className="w-4 h-4" />
          </button>

          {/* Icon + title */}
          <div className="text-3xl mb-3">{content.emoji}</div>
          <h2 className="text-lg font-black text-white mb-1">{content.title}</h2>
          <p className="text-sm text-[#64748b] mb-5">{content.desc}</p>

          {/* Features */}
          <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4 mb-5 space-y-2">
            <div className="text-xs font-bold text-green-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Yang kamu dapat dengan PRO
            </div>
            {content.features.map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-[#94a3b8]">
                <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="text-center mb-4">
            <span className="text-2xl font-black text-white">
              {formatRupiah(PRO_PRICE.BULANAN)}
            </span>
            <span className="text-[#64748b] text-sm"> / bulan</span>
            <div className="text-xs text-yellow-400 mt-0.5">
              atau {formatRupiah(PRO_PRICE.TAHUNAN)}/tahun — hemat 2 bulan!
            </div>
          </div>

          {/* CTA */}
          <button onClick={handleUpgrade}
            className="w-full py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors flex items-center justify-center gap-2">
            Upgrade Sekarang <ArrowRight className="w-4 h-4" />
          </button>

          <button onClick={onClose}
            className="w-full py-2 mt-2 text-xs text-[#3a4560] hover:text-[#64748b] transition-colors">
            Nanti saja
          </button>
        </div>
      </div>
    </div>
  )
}