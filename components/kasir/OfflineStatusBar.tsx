'use client'

import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import type { SyncStatus } from '@/hooks/useOfflineSync'

type Props = {
  isOnline: boolean
  pendingCount: number
  syncStatus: SyncStatus
  onSync: () => void
}

export default function OfflineStatusBar({ isOnline, pendingCount, syncStatus, onSync }: Props) {
  // Online + tidak ada pending = tidak tampil
  if (isOnline && pendingCount === 0 && syncStatus === 'idle') return null

  return (
    <div className={`flex items-center justify-between px-4 py-2 text-xs font-semibold transition-all ${
      !isOnline
        ? 'bg-yellow-400/10 border-b border-yellow-400/30 text-yellow-400'
        : syncStatus === 'syncing'
        ? 'bg-blue-400/10 border-b border-blue-400/30 text-blue-400'
        : syncStatus === 'success'
        ? 'bg-green-400/10 border-b border-green-400/30 text-green-400'
        : syncStatus === 'error'
        ? 'bg-red-400/10 border-b border-red-400/30 text-red-400'
        : 'bg-yellow-400/10 border-b border-yellow-400/30 text-yellow-400'
    }`}>
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <><WifiOff className="w-3.5 h-3.5" />Mode Offline — transaksi disimpan lokal</>
        ) : syncStatus === 'syncing' ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" />Menyinkronkan {pendingCount} transaksi...</>
        ) : syncStatus === 'success' ? (
          <><CheckCircle className="w-3.5 h-3.5" />Semua transaksi berhasil disinkronkan!</>
        ) : syncStatus === 'error' ? (
          <><AlertCircle className="w-3.5 h-3.5" />Gagal sync sebagian transaksi</>
        ) : (
          <><Wifi className="w-3.5 h-3.5" />{pendingCount} transaksi belum tersinkron</>
        )}
      </div>

      {isOnline && pendingCount > 0 && syncStatus === 'idle' && (
        <button onClick={onSync}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-400/20 hover:bg-yellow-400/30 transition-colors">
          <RefreshCw className="w-3 h-3" />
          Sync Sekarang
        </button>
      )}
    </div>
  )
}