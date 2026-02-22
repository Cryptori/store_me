'use client'

import { useStore } from './useStore'
import { FREE_TIER } from '@/lib/constants'

export function useFreemium() {
  const { store, loading } = useStore()

  const isPro = store?.is_pro ?? false
  const proExpiresAt = store?.pro_expires_at
    ? new Date(store.pro_expires_at)
    : null

  // Cek apakah PRO masih aktif
  const isProActive = isPro && proExpiresAt
    ? proExpiresAt > new Date()
    : false

  return {
    isPro: isProActive,
    loading,
    limits: FREE_TIER,
    canAddProduk: (currentCount: number) =>
      isProActive || currentCount < FREE_TIER.MAX_PRODUK,
    canAddPelanggan: (currentCount: number) =>
      isProActive || currentCount < FREE_TIER.MAX_PELANGGAN,
    canExportPDF: isProActive,
    canViewLaporanBulanan: isProActive,
    canMultiUser: isProActive,
  }
}