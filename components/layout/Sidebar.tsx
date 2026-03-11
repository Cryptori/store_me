'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, ShoppingCart, Package, TrendingDown,
  Users, CreditCard, BarChart2, Settings, Zap, LogOut,
  Store, X, ArrowRight,
} from 'lucide-react'
import { FREE_TIER } from '@/lib/constants'
import { useFreemium } from '@/hooks/useFreemium'
import TrialBanner from '@/components/shared/TrialBanner'
import type { Store as StoreType } from '@/types/database'

const NAV_ITEMS = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/kasir',      label: 'Kasir',       icon: ShoppingCart },
  { href: '/produk',     label: 'Produk',      icon: Package },
  { href: '/stok',       label: 'Stok',        icon: TrendingDown,  badge: 'stok' },
  { href: '/pelanggan',  label: 'Pelanggan',   icon: Users },
  { href: '/hutang',     label: 'Hutang',      icon: CreditCard,    badge: 'hutang' },
  { href: '/laporan',    label: 'Laporan',     icon: BarChart2 },
  { href: '/pengaturan', label: 'Pengaturan',  icon: Settings },
]

const UPGRADE_MESSAGES = [
  { emoji: '📊', text: 'Laporan bulanan tersedia di PRO' },
  { emoji: '📦', text: 'Produk unlimited mulai Rp 49k/bln' },
  { emoji: '📄', text: 'Export PDF laporan dengan PRO' },
  { emoji: '⚡', text: 'Upgrade sekarang, hemat 2 bulan!' },
]

type Props = {
  store: StoreType | null
  stokAlert: number
  hutangAlert: number
  produkCount: number
  onClose?: () => void
  onLogout: () => void
}

export default function Sidebar({ store, stokAlert, hutangAlert, produkCount, onClose, onLogout }: Props) {
  const pathname = usePathname()
  const { isPro, isTrial, trialDaysLeft, showTrialBanner, trialStatus } = useFreemium()

  const [toastVisible, setToastVisible] = useState(false)
  const [toastDismissed, setToastDismissed] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)

  const isFree = store && !isPro && !isTrial

  // Upgrade toast — hanya untuk FREE (bukan trial)
  useEffect(() => {
    if (!isFree || toastDismissed) return
    const showTimer = setTimeout(() => setToastVisible(true), 3000)
    return () => clearTimeout(showTimer)
  }, [isFree, toastDismissed])

  useEffect(() => {
    if (!isFree || toastDismissed || !toastVisible) return
    const cycleTimer = setInterval(() => {
      setMsgIndex(i => {
        const next = (i + 1) % UPGRADE_MESSAGES.length
        if (next === 0) {
          setToastVisible(false)
          setTimeout(() => setToastVisible(true), 10_000)
        }
        return next
      })
    }, 4000)
    return () => clearInterval(cycleTimer)
  }, [isFree, toastDismissed, toastVisible])

  const msg = UPGRADE_MESSAGES[msgIndex]

  // Badge label untuk store info
  const storeBadgeLabel = isPro ? '✨ PRO' : isTrial ? `🔥 TRIAL` : 'FREE'
  const storeBadgeClass = isPro
    ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20'
    : isTrial
    ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
    : 'bg-green-400/10 text-green-400 border-green-400/20'

  return (
    <aside className="flex flex-col h-full bg-[#0f1117] border-r border-[#2a3045]">
      {/* Logo */}
      <div className="p-5 border-b border-[#2a3045]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
            <Store className="w-4 h-4 text-[#0a0d14]" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-black tracking-tight">
            Toko<span className="text-green-400">Ku</span>
          </span>
        </div>
      </div>

      {/* Store info */}
      {store && (
        <div className="mx-3 mt-3 p-3 bg-[#181c27] rounded-xl border border-[#2a3045]">
          <div className="text-sm font-bold text-white truncate">{store.nama}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${storeBadgeClass}`}>
              {storeBadgeLabel}
            </span>
            {isTrial && trialDaysLeft > 0 && (
              <span className="text-[10px] text-yellow-400 font-semibold">
                {trialDaysLeft}h lagi
              </span>
            )}
            {!isPro && !isTrial && (
              <span className="text-[10px] text-[#64748b]">
                {produkCount}/{FREE_TIER.MAX_PRODUK} produk
              </span>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const alertCount = badge === 'stok' ? stokAlert : badge === 'hutang' ? hutangAlert : 0
          return (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#1a2a1a] text-green-400 border border-green-500/20'
                  : 'text-[#64748b] hover:bg-[#181c27] hover:text-[#94a3b8]'
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {alertCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {alertCount > 99 ? '99+' : alertCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Trial banner — muncul kalau trial aktif & <= 3 hari lagi */}
      {isTrial && showTrialBanner && (
        <TrialBanner daysLeft={trialDaysLeft} />
      )}

      {/* Trial expired banner */}
      {trialStatus === 'expired' && (
        <div className="mx-3 mb-2 bg-[#1a1010] border border-red-500/30 rounded-xl p-3">
          <div className="text-[11px] font-black text-red-400 mb-1">Trial sudah berakhir</div>
          <div className="text-[10px] text-[#64748b] mb-2">Upgrade untuk lanjut pakai fitur PRO</div>
          <Link href="/upgrade" onClick={onClose}
            className="flex items-center justify-center gap-1 w-full py-1.5 bg-red-500 hover:bg-red-400 text-white rounded-lg text-[11px] font-black transition-colors">
            Upgrade Sekarang <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Upgrade toast — hanya untuk FREE (tidak pernah trial) */}
      {isFree && !toastDismissed && (
        <div className={`mx-3 mb-2 transition-all duration-500 ease-in-out ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}>
          <div className="relative bg-gradient-to-br from-[#1a2a1a] to-[#0f1f1a] border border-green-500/30 rounded-xl p-3 shadow-lg shadow-green-900/10">
            <button
              onClick={() => { setToastVisible(false); setToastDismissed(true) }}
              className="absolute top-2 right-2 text-[#3a4560] hover:text-[#64748b] transition-colors">
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-start gap-2.5 pr-4">
              <div className="w-7 h-7 rounded-lg bg-green-400/10 border border-green-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="w-3.5 h-3.5 text-green-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-black text-green-400 mb-0.5">Upgrade ke PRO</div>
                <div className="text-[10px] text-[#94a3b8] leading-relaxed">
                  {msg.emoji} {msg.text}
                </div>
              </div>
            </div>
            <Link href="/upgrade" onClick={onClose}
              className="mt-2.5 flex items-center justify-center gap-1.5 w-full py-1.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-lg text-[11px] font-black transition-colors">
              Mulai dari Rp 49k/bln <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Minimalist upgrade link kalau toast di-dismiss */}
      {isFree && toastDismissed && (
        <div className="mx-3 mb-3">
          <Link href="/upgrade" onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-green-500/20 text-green-400 hover:bg-[#1a2a1a] transition-colors">
            <Zap className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs font-bold">Upgrade ke PRO</span>
            <ArrowRight className="w-3 h-3 ml-auto" />
          </Link>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-[#2a3045]">
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#64748b] hover:bg-[#181c27] hover:text-red-400 transition-all">
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  )
}