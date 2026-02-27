'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { store } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [stokAlert, setStokAlert] = useState(0)
  const [hutangAlert, setHutangAlert] = useState(0)
  const [produkCount, setProdukCount] = useState(0)

  useEffect(() => {
    if (!store) return
    fetchAlerts()
  }, [store])

  async function fetchAlerts() {
    const supabase = createClient()
    const db = supabase as any

    const [stokRes, hutangRes, produkRes] = await Promise.all([
      db.from('products')
        .select('id, stok, stok_minimum')
        .eq('store_id', store!.id)
        .eq('is_active', true),

      supabase.from('debts')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store!.id)
        .eq('status', 'belum_lunas'),

      supabase.from('products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store!.id)
        .eq('is_active', true),
    ])

    const stokData = (stokRes.data ?? []) as { id: string; stok: number; stok_minimum: number }[]
    const menipis = stokData.filter(p => p.stok <= p.stok_minimum).length
    setStokAlert(menipis)
    setHutangAlert(hutangRes.count ?? 0)
    setProdukCount(produkRes.count ?? 0)
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0d14]">
      <div className="hidden md:flex md:w-56 lg:w-60 flex-col flex-shrink-0">
        <Sidebar
          store={store}
          stokAlert={stokAlert}
          hutangAlert={hutangAlert}
          produkCount={produkCount}
          onLogout={handleLogout}
        />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-60 flex flex-col">
            <Sidebar
              store={store}
              stokAlert={stokAlert}
              hutangAlert={hutangAlert}
              produkCount={produkCount}
              onClose={() => setMobileOpen(false)}
              onLogout={handleLogout}
            />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
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