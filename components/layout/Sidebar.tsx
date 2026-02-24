'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ShoppingCart, Package, TrendingDown,
  Users, CreditCard, BarChart2, Settings, Zap, LogOut, Store,
} from 'lucide-react'
import { FREE_TIER } from '@/lib/constants'
import type { Store as StoreType } from '@/types/database'

const NAV_ITEMS = [
  { href: '/dashboard',   label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/kasir',       label: 'Kasir',       icon: ShoppingCart },
  { href: '/produk',      label: 'Produk',      icon: Package },
  { href: '/stok',        label: 'Stok',        icon: TrendingDown,  badge: 'stok' },
  { href: '/pelanggan',   label: 'Pelanggan',   icon: Users },
  { href: '/hutang',      label: 'Hutang',      icon: CreditCard,    badge: 'hutang' },
  { href: '/laporan',     label: 'Laporan',     icon: BarChart2 },
  { href: '/pengaturan',  label: 'Pengaturan',  icon: Settings },
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
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              store.is_pro
                ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20'
                : 'bg-green-400/10 text-green-400 border-green-400/20'
            }`}>
              {store.is_pro ? '✨ PRO' : 'FREE'}
            </span>
            {!store.is_pro && (
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

      {/* Upgrade banner */}
      {store && !store.is_pro && (
        <div className="mx-3 mb-3">
          <div className="bg-gradient-to-br from-[#1a2a1a] to-[#142020] border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-bold text-green-400">Upgrade ke PRO</span>
            </div>
            <p className="text-[10px] text-[#64748b] mb-3">Unlimited produk, laporan bulanan & export PDF</p>
            <Link href="/upgrade" onClick={onClose}
              className="block w-full py-2 text-center bg-green-400 text-[#0a0d14] rounded-lg text-xs font-black hover:bg-green-300 transition-colors">
              Mulai dari Rp 49k/bln
            </Link>
          </div>
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