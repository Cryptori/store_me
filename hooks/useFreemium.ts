'use client'

import { useStore } from './useStore'
import { FREE_TIER } from '@/lib/constants'

export type TrialStatus =
  | 'active'     // trial masih jalan
  | 'expired'    // trial sudah habis, belum upgrade
  | 'converted'  // sudah upgrade ke PRO
  | 'none'       // tidak pernah trial (user lama sebelum fitur ini)

export type FreemiumState = {
  // Status utama
  isPro: boolean
  isTrial: boolean
  isTrialExpired: boolean
  trialStatus: TrialStatus
  trialDaysLeft: number      // hari tersisa, 0 kalau sudah expired
  trialExpiresAt: Date | null

  // Loading
  loading: boolean

  // Batas fitur
  canAddProduk:    (count: number) => boolean
  canAddPelanggan: (count: number) => boolean
  canExportPDF:    boolean
  canLaporanBulanan: boolean

  // Helper UI
  showTrialBanner: boolean   // tampilkan banner trial di sidebar
  showUpgradeCTA:  boolean   // tampilkan CTA upgrade
}

export function useFreemium(): FreemiumState {
  const { store, loading } = useStore()

  if (loading || !store) {
    return {
      isPro: false,
      isTrial: false,
      isTrialExpired: false,
      trialStatus: 'none',
      trialDaysLeft: 0,
      trialExpiresAt: null,
      loading: true,
      canAddProduk:    () => false,
      canAddPelanggan: () => false,
      canExportPDF: false,
      canLaporanBulanan: false,
      showTrialBanner: false,
      showUpgradeCTA: false,
    }
  }

  const now = new Date()

  // ── PRO status ──────────────────────────────────────────────
  const proExpiresAt = store.pro_expires_at ? new Date(store.pro_expires_at) : null
  const isPro = store.is_pro && (proExpiresAt ? proExpiresAt > now : true)

  // ── Trial status ─────────────────────────────────────────────
  const trialExpiresAt = store.trial_expires_at ? new Date(store.trial_expires_at) : null
  const isTrialActive = store.is_trial && (trialExpiresAt ? trialExpiresAt > now : false)
  const isTrialExpired = store.trial_used && !isTrialActive && !isPro

  // Hari tersisa
  const trialDaysLeft = isTrialActive && trialExpiresAt
    ? Math.max(0, Math.ceil((trialExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  // Trial status enum
  let trialStatus: TrialStatus = 'none'
  if (isPro) trialStatus = 'converted'
  else if (isTrialActive) trialStatus = 'active'
  else if (isTrialExpired) trialStatus = 'expired'

  // ── Akses fitur ──────────────────────────────────────────────
  // PRO atau trial aktif = akses penuh
  const hasFullAccess = isPro || isTrialActive

  const canAddProduk    = (count: number) => hasFullAccess || count < FREE_TIER.MAX_PRODUK
  const canAddPelanggan = (count: number) => hasFullAccess || count < FREE_TIER.MAX_PELANGGAN
  const canExportPDF    = hasFullAccess
  const canLaporanBulanan = hasFullAccess

  // ── UI helpers ───────────────────────────────────────────────
  // Banner trial: tampil kalau trial aktif DAN tersisa <= 3 hari
  const showTrialBanner = isTrialActive && trialDaysLeft <= 3

  // CTA upgrade: tampil kalau tidak PRO (trial atau free)
  const showUpgradeCTA = !isPro

  return {
    isPro,
    isTrial: isTrialActive,
    isTrialExpired,
    trialStatus,
    trialDaysLeft,
    trialExpiresAt,
    loading: false,
    canAddProduk,
    canAddPelanggan,
    canExportPDF,
    canLaporanBulanan,
    showTrialBanner,
    showUpgradeCTA,
  }
}