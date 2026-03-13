'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Store } from '@/types/database'

const ACTIVE_STORE_KEY = 'tokoku_active_store_id'

// ─── Single source of truth untuk semua store data ───────────────────────────
export function useActiveStore() {
  const [stores, setStores]           = useState<Store[]>([])
  const [activeStore, setActiveStore] = useState<Store | null>(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [isOwner, setIsOwner]         = useState(true)
  const router = useRouter()

  useEffect(() => { fetchStores() }, [])

  async function fetchStores() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const db = supabase as any

      // 1. Cek toko milik user (owner)
      const { data: ownedStores } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .order('urutan' as any)

      if (ownedStores && ownedStores.length > 0) {
        const list = ownedStores as Store[]
        setStores(list)
        setIsOwner(true)
        const savedId = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_STORE_KEY) : null
        const saved   = savedId ? list.find(s => s.id === savedId) : null
        setActiveStore(saved ?? list[0])
        setLoading(false)
        return
      }

      // 2. Cek kasir (store_members)
      const { data: membership } = await db
        .from('store_members')
        .select('store_id, role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (membership) {
        const { data: memberStore } = await supabase
          .from('stores').select('*').eq('id', membership.store_id).single()
        if (memberStore) {
          setStores([memberStore as Store])
          setActiveStore(memberStore as Store)
          setIsOwner(false)
          setLoading(false)
          return
        }
      }

      // 3. Buat toko baru atau redirect onboarding
      const namaToko = user.user_metadata?.nama_toko
      if (namaToko) {
        const { data: newStore } = await db
          .from('stores').insert({ user_id: user.id, nama: namaToko }).select().single()
        if (newStore) {
          try { await db.rpc('activate_trial', { p_store_id: newStore.id }) } catch {}
          setStores([newStore])
          setActiveStore(newStore)
          setIsOwner(true)
        } else {
          setError('Gagal membuat toko, coba refresh')
        }
      } else {
        router.push('/onboarding')
      }
    } catch (err) {
      setError('Gagal memuat data toko')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const switchStore = useCallback((store: Store) => {
    setActiveStore(store)
    if (typeof window !== 'undefined') localStorage.setItem(ACTIVE_STORE_KEY, store.id)
    router.refresh()
  }, [router])

  const updateActiveStore = useCallback((updated: Store) => {
    setActiveStore(updated)
    setStores(prev => prev.map(s => s.id === updated.id ? updated : s))
  }, [])

  const addStore = useCallback((newStore: Store) => {
    setStores(prev => [...prev, newStore])
    switchStore(newStore)
  }, [switchStore])

  const removeStore = useCallback((storeId: string) => {
    setStores(prev => {
      const remaining = prev.filter(s => s.id !== storeId)
      if (activeStore?.id === storeId && remaining.length > 0) switchStore(remaining[0])
      return remaining
    })
  }, [activeStore, switchStore])

  return {
    store: activeStore,
    activeStore,
    stores,
    loading,
    error,
    isOwner,
    switchStore,
    updateActiveStore,
    addStore,
    removeStore,
    setStore: updateActiveStore,
    refetch: fetchStores,
  }
}

// Backward compat — useStore() tetap jalan di semua file lama
export { useActiveStore as useStore }