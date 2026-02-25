'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Store } from '@/types/database'

// Simple in-memory cache agar tidak re-fetch setiap render
let storeCache: Store | null = null

export function useStore() {
  const [store, setStoreState] = useState<Store | null>(storeCache)
  const [loading, setLoading] = useState(!storeCache) // skip loading kalau sudah ada cache
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (storeCache) return // sudah ada cache, skip fetch
    fetchStore()
  }, [])

  async function fetchStore() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        router.replace('/login')
        return
      }

      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        // Tidak ada store → ke onboarding
        // Jangan buat store di sini (itu tugas onboarding/page.tsx)
        router.replace('/onboarding')
        setLoading(false)
        return
      }

      storeCache = data
      setStoreState(data)
    } catch (err) {
      setError('Gagal memuat data toko')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function setStore(newStore: Store) {
    storeCache = newStore // update cache juga
    setStoreState(newStore)
  }

  return { store, loading, error, setStore }
}