'use client'

import { useStore } from './useStore'
import { FREE_TIER } from '@/lib/constants'

export function useFreemium() {
  const { store, loading } = useStore()

  // Kalau masih loading, semua akses dianggap false dulu
  // ini penting agar UI tidak flash "bisa akses" sebelum data tiba
  if (loading || !store) {
    return {
      isPro: false,
      loading,
      limits: FREE_TIER,
      canAddProduk: (_: number) => false,
      canAddPelanggan: (_: number) => false,
      canExportPDF: false,
      canViewLaporanBulanan: false,
      canMultiUser: false,
    }
  }

  // Cek PRO aktif: is_pro true DAN belum expired
  const proExpiresAt = store.pro_expires_at ? new Date(store.pro_expires_at) : null
  const isPro = store.is_pro && (proExpiresAt ? proExpiresAt > new Date() : true)

  return {
    isPro,
    loading,
    limits: FREE_TIER,
    canAddProduk: (currentCount: number) =>
      isPro || currentCount < FREE_TIER.MAX_PRODUK,
    canAddPelanggan: (currentCount: number) =>
      isPro || currentCount < FREE_TIER.MAX_PELANGGAN,
    canExportPDF: isPro,
    canViewLaporanBulanan: isPro,
    canMultiUser: isPro,
  }
}