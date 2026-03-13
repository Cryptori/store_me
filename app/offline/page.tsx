'use client'

import Link from 'next/link'
import { WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Kamu Offline</h1>
        <p className="text-[#64748b] text-sm mb-6 leading-relaxed">
          Tidak ada koneksi internet. Kamu masih bisa menggunakan kasir — transaksi akan tersimpan dan otomatis tersinkron saat online kembali.
        </p>
        <div className="space-y-2">
          <Link href="/kasir"
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
            Buka Kasir (Offline Mode)
          </Link>
          <button onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#181c27] border border-[#2a3045] text-[#64748b] hover:text-white rounded-xl font-bold text-sm transition-colors">
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      </div>
    </div>
  )
}