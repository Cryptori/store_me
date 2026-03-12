'use client'

import { useState } from 'react'
import { Store, ChevronDown, Plus, Check, Crown } from 'lucide-react'
import Link from 'next/link'
import type { Store as StoreType } from '@/types/database'

type Props = {
  stores: StoreType[]
  activeStore: StoreType
  isPro: boolean
  onSwitch: (store: StoreType) => void
  onClose?: () => void
}

export default function StoreSwitcher({ stores, activeStore, isPro, onSwitch, onClose }: Props) {
  const [open, setOpen] = useState(false)
  const canAddStore = isPro || stores.length === 0

  function handleSwitch(store: StoreType) {
    onSwitch(store)
    setOpen(false)
    onClose?.()
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 p-3 bg-[#181c27] rounded-xl border border-[#2a3045] hover:border-[#3a4560] transition-all">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
          <Store className="w-3.5 h-3.5 text-[#0a0d14]" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-sm font-bold text-white truncate">{activeStore.nama}</div>
          <div className="text-[10px] text-[#64748b]">
            {stores.length > 1 ? `${stores.length} toko` : 'Toko aktif'}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[#64748b] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-[#181c27] border border-[#2a3045] rounded-xl shadow-2xl shadow-black/50 overflow-hidden">

            {/* Daftar toko */}
            <div className="py-1 max-h-48 overflow-y-auto">
              {stores.map(store => (
                <button
                  key={store.id}
                  onClick={() => handleSwitch(store)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#1e2333] transition-colors ${
                    store.id === activeStore.id ? 'bg-[#1a2a1a]' : ''
                  }`}>
                  <div className="w-7 h-7 rounded-lg bg-[#1e2333] border border-[#2a3045] flex items-center justify-center flex-shrink-0">
                    <Store className="w-3.5 h-3.5 text-[#64748b]" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-semibold text-white truncate">{store.nama}</div>
                    <div className="text-[10px] text-[#64748b]">
                      {store.is_pro ? '✨ PRO' : store.is_trial ? '🔥 Trial' : 'FREE'}
                    </div>
                  </div>
                  {store.id === activeStore.id && (
                    <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-[#2a3045] p-2">
              {canAddStore ? (
                <Link
                  href="/toko/tambah"
                  onClick={() => { setOpen(false); onClose?.() }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1e2333] text-green-400 transition-colors text-sm font-semibold">
                  <Plus className="w-4 h-4" />
                  Tambah Toko Baru
                </Link>
              ) : (
                <Link
                  href="/upgrade"
                  onClick={() => { setOpen(false); onClose?.() }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1e2333] text-[#64748b] hover:text-green-400 transition-colors text-sm">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Upgrade PRO untuk toko kedua</span>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}