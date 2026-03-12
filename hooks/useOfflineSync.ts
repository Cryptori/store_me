'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  getPendingTransactions,
  markTransactionSynced,
  cacheProducts,
  cacheCustomers,
} from '@/lib/offlineDB'

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

export function useOfflineSync(storeId: string | undefined) {
  const [isOnline, setIsOnline]       = useState(true)
  const [pendingCount, setPendingCount] = useState(0)
  const [syncStatus, setSyncStatus]   = useState<SyncStatus>('idle')

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

  // Hitung pending saat storeId berubah
  useEffect(() => {
    if (storeId) countPending()
  }, [storeId])

  // Auto-sync saat kembali online
  useEffect(() => {
    if (isOnline && storeId && pendingCount > 0) {
      syncPending()
    }
  }, [isOnline, storeId])

  async function countPending() {
    if (!storeId) return
    const pending = await getPendingTransactions(storeId)
    setPendingCount(pending.length)
  }

  // Sync semua pending transaksi ke Supabase
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
        await db.from('transaction_items').insert(
          tx.items.map(item => ({
            transaction_id: trxData.id,
            product_id: item.product_id,
            nama_produk: item.nama_produk,
            harga_jual: item.harga_jual,
            qty: item.qty,
            subtotal: item.subtotal,
          }))
        )

        // Decrement stok via RPC
        await Promise.all(tx.items.map(item =>
          db.rpc('decrement_stok', { p_product_id: item.product_id, p_qty: item.qty })
        ))

        // Hutang
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
      } catch {
        // Lanjut ke transaksi berikutnya kalau satu gagal
      }
    }

    await countPending()
    setSyncStatus(successCount > 0 ? 'success' : 'error')
    setTimeout(() => setSyncStatus('idle'), 3000)
  }, [storeId])

  // Refresh cache produk & pelanggan
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

  return { isOnline, pendingCount, syncStatus, syncPending, refreshCache, countPending }
}