'use client'

import Link from 'next/link'
import type { Store } from '@/types/database'

type Props = {
  store: Store
}

export default function StatusLangganan({ store }: Props) {
  const expiresAt = store.pro_expires_at
    ? new Date(store.pro_expires_at).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : '-'

  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-6">
      <h2 className="font-bold text-sm mb-4">Status Langganan</h2>
      <div className="flex items-center justify-between p-4 bg-[#1e2333] rounded-xl border border-[#2a3045]">
        <div>
          <div className="mb-1">
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${
              store.is_pro ? 'bg-cyan-400/10 text-cyan-400' : 'bg-green-400/10 text-green-400'
            }`}>
              {store.is_pro ? '✨ PRO' : 'FREE'}
            </span>
          </div>
          <p className="text-sm text-[#64748b]">
            {store.is_pro
              ? `Aktif hingga ${expiresAt}`
              : 'Gratis selamanya dengan fitur terbatas'}
          </p>
        </div>
        {!store.is_pro && (
          <Link href="/upgrade"
            className="px-4 py-2 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl text-sm font-black transition-colors">
            Upgrade PRO
          </Link>
        )}
      </div>
    </div>
  )
}