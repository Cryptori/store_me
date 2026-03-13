'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, ShoppingCart, Package, TrendingDown,
  Users, CreditCard, BarChart2, Settings, Zap, LogOut,
  Store, X, ArrowRight, Gift, UserPlus, Copy, Tag, Truck,
} from 'lucide-react'
import { FREE_TIER } from '@/lib/constants'
import { useFreemium } from '@/hooks/useFreemium'
import { useActiveStore } from '@/hooks/useStore'
import TrialBanner from '@/components/shared/TrialBanner'
import StoreSwitcher from '@/components/layout/StoreSwitcher'
import type { Store as StoreType } from '@/types/database'

const NAV_ITEMS = [
  { href: '/dashboard',         label: 'Dashboard',        icon: LayoutDashboard },
  { href: '/kasir',             label: 'Kasir',            icon: ShoppingCart },
  { href: '/produk',            label: 'Produk',           icon: Package },
  { href: '/stok',              label: 'Stok',             icon: TrendingDown,  badge: 'stok' },
  { href: '/pelanggan',         label: 'Pelanggan',        icon: Users },
  { href: '/hutang',            label: 'Hutang',           icon: CreditCard,    badge: 'hutang' },
  { href: '/diskon',            label: 'Diskon & Promo',   icon: Tag,           proOnly: true },
  { href: '/supplier',          label: 'Supplier',         icon: Truck,         proOnly: true },
  { href: '/laporan',           label: 'Laporan',          icon: BarChart2,     proOnly: true },
  { href: '/laporan/gabungan',  label: 'Laporan Gabungan', icon: BarChart2,     multiStoreOnly: true },
  { href: '/produk/copy',       label: 'Copy Produk',      icon: Copy,          multiStoreOnly: true },
  { href: '/tim-kasir',         label: 'Tim Kasir',        icon: UserPlus,      proOnly: true },
  { href: '/referral',          label: 'Referral',         icon: Gift },
  { href: '/pengaturan',        label: 'Pengaturan',       icon: Settings },
]

const UPGRADE_MESSAGES = [
  { emoji: '📊', text: 'Laporan bulanan tersedia di PRO' },
  { emoji: '📦', text: 'Produk unlimited mulai Rp 49k/bln' },
  { emoji: '🏪', text: 'Multi-toko tersedia di PRO' },
  { emoji: '⚡', text: 'Upgrade sekarang, hemat 2 bulan!' },
]

type Props = {
  stokAlert: number
  hutangAlert: number
  produkCount: number
  isOwner?: boolean
  onClose?: () => void
  onLogout: () => void
}

export default function Sidebar({
  stokAlert, hutangAlert, produkCount, isOwner = true, onClose, onLogout,
}: Props) {
  const pathname = usePathname()
  const { stores, activeStore, switchStore } = useActiveStore()
  const { isPro, isTrial, trialDaysLeft, showTrialBanner, trialStatus, hasProAccess } = useFreemium()

  const [toastVisible, setToastVisible]     = useState(false)
  const [toastDismissed, setToastDismissed] = useState(false)
  const [msgIndex, setMsgIndex]             = useState(0)

  const isFree       = activeStore && !isPro && !isTrial
  const hasMultiStore = stores.length > 1
  const kasirOnlyNav  = ['/kasir', '/produk']

  useEffect(() => {
    if (!isFree || toastDismissed) return
    const t = setTimeout(() => setToastVisible(true), 3000)
    return () => clearTimeout(t)
  }, [isFree, toastDismissed])

  useEffect(() => {
    if (!isFree || toastDismissed || !toastVisible) return
    const t = setInterval(() => {
      setMsgIndex(i => {
        const next = (i + 1) % UPGRADE_MESSAGES.length
        if (next === 0) { setToastVisible(false); setTimeout(() => setToastVisible(true), 10_000) }
        return next
      })
    }, 4000)
    return () => clearInterval(t)
  }, [isFree, toastDismissed, toastVisible])

  const msg = UPGRADE_MESSAGES[msgIndex]

  return (
    <aside className="flex flex-col h-full bg-[#0f1117] border-r border-[#2a3045]">
      {/* Logo */}
      <div className="p-4 border-b border-[#2a3045]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
            <Store className="w-4 h-4 text-[#0a0d14]" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-black tracking-tight">
            Toko<span className="text-green-400">Ku</span>
          </span>
        </div>

        {/* Store switcher */}
        {activeStore && isOwner && (
          <StoreSwitcher
            stores={stores}
            activeStore={activeStore}
            isPro={isPro}
            onSwitch={switchStore}
            onClose={onClose}
          />
        )}

        {/* Info kasir */}
        {activeStore && !isOwner && (
          <div className="px-3 py-2 bg-[#181c27] rounded-xl border border-[#2a3045]">
            <div className="text-sm font-bold text-white truncate">{activeStore.nama}</div>
            <div className="text-[10px] text-[#64748b] mt-0.5">Akses kasir</div>
          </div>
        )}
      </div>

      {/* Status bar PRO/Trial */}
      {isOwner && (
        <div className="px-4 py-2 border-b border-[#2a3045]">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              isPro   ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20' :
              isTrial ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' :
                        'bg-green-400/10 text-green-400 border-green-400/20'
            }`}>
              {isPro ? '✨ PRO' : isTrial ? `🔥 TRIAL ${trialDaysLeft}h` : 'FREE'}
            </span>
            {!isPro && !isTrial && (
              <span className="text-[10px] text-[#64748b]">{produkCount}/{FREE_TIER.MAX_PRODUK} produk</span>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_ITEMS
          .filter(item => {
            if (!isOwner) return kasirOnlyNav.includes(item.href)
            if (item.multiStoreOnly && !hasMultiStore) return false
            return true
          })
          .map(({ href, label, icon: Icon, badge, proOnly }) => {
            const isActive   = pathname === href || pathname.startsWith(href + '/')
            const alertCount = badge === 'stok' ? stokAlert : badge === 'hutang' ? hutangAlert : 0
            const isLocked   = proOnly && !hasProAccess

            return (
              <Link key={href} href={isLocked ? '/upgrade' : href} onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#1a2a1a] text-green-400 border border-green-500/20'
                    : 'text-[#64748b] hover:bg-[#181c27] hover:text-[#94a3b8]'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {isLocked && <span className="text-[9px] font-bold text-green-400/60 border border-green-400/20 px-1 rounded">PRO</span>}
                {alertCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {alertCount > 99 ? '99+' : alertCount}
                  </span>
                )}
              </Link>
            )
          })}
      </nav>

      {/* Trial banner */}
      {isTrial && showTrialBanner && <TrialBanner daysLeft={trialDaysLeft} />}

      {/* Trial expired */}
      {trialStatus === 'expired' && (
        <div className="mx-3 mb-2 bg-[#1a1010] border border-red-500/30 rounded-xl p-3">
          <div className="text-[11px] font-black text-red-400 mb-1">Trial sudah berakhir</div>
          <Link href="/upgrade" onClick={onClose}
            className="flex items-center justify-center gap-1 w-full py-1.5 bg-red-500 hover:bg-red-400 text-white rounded-lg text-[11px] font-black transition-colors">
            Upgrade Sekarang <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Upgrade toast */}
      {isFree && !toastDismissed && (
        <div className={`mx-3 mb-2 transition-all duration-500 ${toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
          <div className="relative bg-gradient-to-br from-[#1a2a1a] to-[#0f1f1a] border border-green-500/30 rounded-xl p-3">
            <button onClick={() => { setToastVisible(false); setToastDismissed(true) }}
              className="absolute top-2 right-2 text-[#3a4560] hover:text-[#64748b]">
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-start gap-2.5 pr-4">
              <div className="w-7 h-7 rounded-lg bg-green-400/10 border border-green-400/20 flex items-center justify-center flex-shrink-0">
                <Zap className="w-3.5 h-3.5 text-green-400" />
              </div>
              <div>
                <div className="text-[11px] font-black text-green-400 mb-0.5">Upgrade ke PRO</div>
                <div className="text-[10px] text-[#94a3b8]">{msg.emoji} {msg.text}</div>
              </div>
            </div>
            <Link href="/upgrade" onClick={onClose}
              className="mt-2.5 flex items-center justify-center gap-1.5 w-full py-1.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-lg text-[11px] font-black transition-colors">
              Mulai dari Rp 49k/bln <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

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