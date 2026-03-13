'use client'

import { useActiveStore } from '@/hooks/useStore'
import { useFreemium } from '@/hooks/useFreemium'

export default function DebugPage() {
  const { store, activeStore, stores } = useActiveStore()
  const freemium = useFreemium()

  return (
    <div className="p-8 text-white font-mono text-sm">
      <h1 className="text-xl font-bold mb-4 text-green-400">DEBUG — PRO Status</h1>

      <div className="bg-[#1e2333] rounded-xl p-4 mb-4">
        <p className="text-yellow-400 font-bold mb-2">Store (dari useActiveStore)</p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify({
            id: store?.id,
            nama: store?.nama,
            is_pro: store?.is_pro,
            pro_expires_at: store?.pro_expires_at,
            is_trial: store?.is_trial,
            trial_expires_at: store?.trial_expires_at,
          }, null, 2)}
        </pre>
      </div>

      <div className="bg-[#1e2333] rounded-xl p-4 mb-4">
        <p className="text-cyan-400 font-bold mb-2">useFreemium result</p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify({
            isPro: freemium.isPro,
            isTrial: freemium.isTrial,
            isTrialExpired: freemium.isTrialExpired,
            trialStatus: freemium.trialStatus,
            trialDaysLeft: freemium.trialDaysLeft,
            loading: freemium.loading,
          }, null, 2)}
        </pre>
      </div>

      <div className="bg-[#1e2333] rounded-xl p-4">
        <p className="text-red-400 font-bold mb-2">Stores list</p>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(stores?.map(s => ({
            id: s.id, nama: s.nama, is_pro: s.is_pro
          })), null, 2)}
        </pre>
      </div>
    </div>
  )
}