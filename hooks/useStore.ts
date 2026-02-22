'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Store } from '@/types/database'

export function useStore() {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStore() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) throw error
        setStore(data)
      } catch (err) {
        setError('Gagal memuat data toko')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStore()
  }, [])

  return { store, loading, error, setStore }
}