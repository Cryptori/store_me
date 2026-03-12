'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Store } from '@/types/database'

export function useStore() {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchStore()
  }, [])

  async function fetchStore() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      // 1. Cek apakah owner
      const { data: ownedStore } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (ownedStore) {
        setStore(ownedStore)
        setIsOwner(true)
        setLoading(false)
        return
      }

      // 2. Cek apakah kasir (store_members)
      const db = supabase as any
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
          .from('stores')
          .select('*')
          .eq('id', membership.store_id)
          .single()

        if (memberStore) {
          setStore(memberStore)
          setIsOwner(false)
          setLoading(false)
          return
        }
      }

      // 3. Store belum ada — proses pembuatan toko baru
      const namaToko = user.user_metadata?.nama_toko

      if (namaToko) {
        const { data: newStore, error: storeError } = await db
          .from('stores')
          .insert({ user_id: user.id, nama: namaToko })
          .select()
          .single()

        if (!storeError && newStore) {
          // Auto-aktivasi trial
          try { await db.rpc('activate_trial', { p_store_id: newStore.id }) } catch {}
          setStore(newStore)
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

  return { store, loading, error, isOwner, setStore }
}