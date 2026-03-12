'use client'
export const dynamic = 'force-dynamic'

import { Store, ArrowRight, Plus, Crown } from 'lucide-react'
import Link from 'next/link'
import { useActiveStore } from '@/hooks/useStore'
import { formatTanggal } from '@/lib/utils'
import type { Store as StoreType } from '@/types/database'

export default function PilihTokoPage() {
  const { stores, activeStore, switchStore, loading } = useActiveStore()

  if (loading) return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full" />
    </div>
  )

  function handlePilih(store: StoreType) {
    switchStore(store)
    window.location.href = '/dashboard'
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
          <p className="text-[#64748b] text-sm mt-1">Pilih toko yang ingin dikelola</p>
        </div>

        {/* Daftar toko */}
        <div className="space-y-2 mb-4">
          {stores.map(store => {
            const isActive = store.id === activeStore?.id
            const badge = store.is_pro ? '✨ PRO'
              : store.is_trial ? '🔥 Trial'
              : 'FREE'
            const badgeClass = store.is_pro
              ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20'
              : store.is_trial
              ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
              : 'bg-[#1e2333] text-[#64748b] border-[#2a3045]'

            return (
              <button
                key={store.id}
                onClick={() => handlePilih(store)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  isActive
                    ? 'bg-[#1a2a1a] border-green-500/40'
                    : 'bg-[#181c27] border-[#2a3045] hover:border-[#3a4560] hover:bg-[#1e2333]'
                }`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-green-400/20' : 'bg-[#1e2333]'
                }`}>
                  <Store className={`w-5 h-5 ${isActive ? 'text-green-400' : 'text-[#64748b]'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-white truncate">{store.nama}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex-shrink-0 ${badgeClass}`}>
                      {badge}
                    </span>
                  </div>
                  {store.alamat && (
                    <div className="text-xs text-[#64748b] truncate">{store.alamat}</div>
                  )}
                  {isActive && (
                    <div className="text-[10px] text-green-400 font-semibold mt-0.5">Toko aktif</div>
                  )}
                </div>
                <ArrowRight className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-green-400' : 'text-[#3a4560]'}`} />
              </button>
            )
          })}
        </div>

        {/* Tambah toko */}
        <Link href="/toko/tambah"
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#181c27] border border-dashed border-[#2a3045] hover:border-green-500/40 hover:text-green-400 rounded-xl text-[#64748b] text-sm font-semibold transition-all">
          <Plus className="w-4 h-4" />
          Tambah Toko Baru
        </Link>
      </div>
    </div>
  )
}