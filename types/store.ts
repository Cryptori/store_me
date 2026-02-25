import type { Store } from './database'
import type { FREE_TIER } from '@/lib/constants'

// State dari useStore hook
export type StoreState = {
  store: Store | null
  loading: boolean
  error: string | null
  setStore: (store: Store) => void
}

// State dari useFreemium hook
export type FreemiumState = {
  isPro: boolean
  loading: boolean
  limits: typeof FREE_TIER
  canAddProduk: (currentCount: number) => boolean
  canAddPelanggan: (currentCount: number) => boolean
  canExportPDF: boolean
  canViewLaporanBulanan: boolean
  canMultiUser: boolean
}