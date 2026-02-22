'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, ShoppingCart, Package, TrendingDown,
  Users, CreditCard, BarChart2, Settings, Zap,
  LogOut, Store, Menu, X, ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { FREE_TIER } from '@/lib/constants'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kasir', label: 'Kasir', icon: ShoppingCart },
  { href: '/produk', label: 'Produk', icon: Package },
  { href: '/stok', label: 'Stok', icon: TrendingDown, badge: 'stok' },
  { href: '/pelanggan', label: 'Pelanggan', icon: Users },
  { href: '/hutang', label: 'Hutang', icon: CreditCard, badge: 'hutang' },
  { href: '/laporan', label: 'Laporan', icon: BarChart2 },
  { href: '/pengaturan', label: 'Pengaturan', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { store, loading } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [stokAlert, setStokAlert] = useState(0)
  const [hutangAlert, setHutangAlert] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!store) return
    async function fetchAlerts() {
      // Stok menipis
      const { count: stokCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store!.id)
        .lte('stok', 5)
        .gt('stok', 0)
      setStokAlert(stokCount ?? 0)

      // Hutang belum lunas
      const { count: hutangCount } = await supabase
        .from('debts')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store!.id)
        .eq('status', 'belum_lunas')
      setHutangAlert(hutangCount ?? 0)
    }
    fetchAlerts()
  }, [store])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const Sidebar = () => (
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
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              store.is_pro
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                : 'bg-green-400/10 text-green-400 border border-green-400/20'
            }`}>
              {store.is_pro ? '✨ PRO' : 'FREE'}
            </span>
            {!store.is_pro && (
              <span className="text-[10px] text-[#64748b]">32/{FREE_TIER.MAX_PRODUK} produk</span>
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
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#1a2a1a] text-green-400 border border-green-500/20'
                  : 'text-[#64748b] hover:bg-[#181c27] hover:text-[#94a3b8]'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {alertCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {alertCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade card */}
      {store && !store.is_pro && (
        <div className="mx-3 mb-3">
          <div className="bg-gradient-to-br from-[#1a2a1a] to-[#142020] border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-bold text-green-400">Upgrade ke PRO</span>
            </div>
            <p className="text-[10px] text-[#64748b] mb-3">Unlimited produk, laporan bulanan & export PDF</p>
            <Link
              href="/upgrade"
              className="block w-full py-2 text-center bg-green-400 text-[#0a0d14] rounded-lg text-xs font-black hover:bg-green-300 transition-colors"
            >
              Mulai dari Rp 49k/bln
            </Link>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-[#2a3045]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#64748b] hover:bg-[#181c27] hover:text-red-400 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0d14]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-56 lg:w-60 flex-col flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-60 flex flex-col">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0f1117] border-b border-[#2a3045]">
          <button onClick={() => setMobileOpen(true)} className="text-[#64748b] hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-black text-base">Toko<span className="text-green-400">Ku</span></span>
          <div className="w-5" />
        </div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}