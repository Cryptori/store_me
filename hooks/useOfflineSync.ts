'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getPendingTransactions,
  markTransactionSynced,
  cacheProducts,
  cacheCustomers,
  type OfflineTransaction,
} from '@/lib/offlineDB'

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

export function useOfflineSync(storeId: string | undefined) {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')

  // Deteksi online/offline
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const onOnline  = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  // Hitung pending transaksi
  useEffect(() => {
    if (!storeId) return
    countPending()
  }, [storeId])

  async function countPending() {
    if (!storeId) return
    const pending = await getPendingTransactions(storeId)
    setPendingCount(pending.length)
  }

  // Auto-sync ketika kembali online
  useEffect(() => {
    if (isOnline && storeId && pendingCount > 0) {
      syncPending()
    }
  }, [isOnline, storeId])

  // Sync transaksi pending ke Supabase
  const syncPending = useCallback(async () => {
    if (!storeId) return
    const pending = await getPendingTransactions(storeId)
    if (pending.length === 0) return

    setSyncStatus('syncing')
    const supabase = createClient()
    const db = supabase as any
    let successCount = 0

    for (const tx of pending) {
      try {
        // Generate nomor transaksi
        const { data: nomorData } = await db.rpc('generate_nomor_transaksi', { p_store_id: storeId })
        const nomorTransaksi = nomorData ?? `TRX-OFFLINE-${Date.now()}`

        // Insert transaksi
        const { data: trxData, error: trxError } = await db
          .from('transactions')
          .insert({
            store_id: storeId,
            customer_id: tx.customer_id ?? null,
            nomor_transaksi: nomorTransaksi,
            total: tx.total,
            bayar: tx.bayar,
            kembalian: tx.kembalian,
            metode_bayar: tx.metode_bayar,
            status: 'selesai',
            catatan: tx.catatan ?? null,
            created_at: tx.created_at,
          })
          .select()
          .single()

        if (trxError || !trxData) throw new Error(trxError?.message)

        // Insert items
        const items = tx.items.map(item => ({
          transaction_id: trxData.id,
          product_id: item.product_id,
          nama_produk: item.nama_produk,
          harga_jual: item.harga_jual,
          qty: item.qty,
          subtotal: item.subtotal,
        }))
        await db.from('transaction_items').insert(items)

        // Update stok
        for (const item of tx.items) {
          await db.rpc('decrement_stok', {
            p_product_id: item.product_id,
            p_qty: item.qty,
          }).catch(() => {})
        }

        // Hutang kalau metode = hutang
        if (tx.metode_bayar === 'hutang' && tx.customer_id) {
          await db.from('debts').insert({
            store_id: storeId,
            customer_id: tx.customer_id,
            transaction_id: trxData.id,
            jumlah: tx.total,
            sisa: tx.total,
            status: 'belum_lunas',
          })
        }

        await markTransactionSynced(tx.id)
        successCount++
      } catch (err) {
        console.error('Failed to sync tx:', tx.id, err)
      }
    }

    await countPending()
    setSyncStatus(successCount > 0 ? 'success' : 'error')
    setTimeout(() => setSyncStatus('idle'), 3000)
  }, [storeId])

  // Cache produk & pelanggan untuk offline
  const refreshCache = useCallback(async () => {
    if (!storeId) return
    const supabase = createClient()
    const [{ data: products }, { data: customers }] = await Promise.all([
      supabase.from('products').select('*').eq('store_id', storeId).eq('is_active', true),
      supabase.from('customers').select('id, store_id, nama, telepon').eq('store_id', storeId),
    ])
    if (products) await cacheProducts(storeId, products as any)
    if (customers) await cacheCustomers(storeId, customers as any)
  }, [storeId])

  return {
    isOnline,
    pendingCount,
    syncStatus,
    syncPending,
    refreshCache,
    countPending,
  }
}