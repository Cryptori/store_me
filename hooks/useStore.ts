'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Store } from '@/types/database'

export function useStore() {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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

        if (data) {
          setStore(data)
          setLoading(false)
          return
        }

        // Store belum ada
        const namaToko = user.user_metadata?.nama_toko

        if (namaToko) {
          // User email — buat store dari metadata
          const db = supabase as any
          const { data: newStore, error: storeError } = await db
            .from('stores')
            .insert({ user_id: user.id, nama: namaToko })
            .select()
            .single()

          if (!storeError && newStore) {
            setStore(newStore)
          } else {
            setError('Gagal membuat toko, coba refresh')
          }
        } else {
          // User Google — redirect ke onboarding
          router.push('/onboarding')
        }
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