'use client'

import Link from 'next/link'
import { Zap, Clock, ArrowRight, X } from 'lucide-react'
import { useState } from 'react'

type Props = {
  daysLeft: number
  onClose?: () => void
}

export default function TrialBanner({ daysLeft, onClose }: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const isUrgent = daysLeft <= 1
  const isWarning = daysLeft <= 3

  return (
    <div className={`mx-3 mb-2 rounded-xl border p-3 relative ${
      isUrgent
        ? 'bg-red-500/10 border-red-500/30'
        : isWarning
        ? 'bg-yellow-400/10 border-yellow-400/30'
        : 'bg-green-400/10 border-green-500/30'
    }`}>
      <button
        onClick={() => { setDismissed(true); onClose?.() }}
        className="absolute top-2 right-2 text-[#3a4560] hover:text-[#64748b] transition-colors">
        <X className="w-3 h-3" />
      </button>

      <div className="flex items-start gap-2 pr-4">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isUrgent ? 'bg-red-500/20' : isWarning ? 'bg-yellow-400/20' : 'bg-green-400/20'
        }`}>
          {isWarning
            ? <Clock className={`w-3 h-3 ${isUrgent ? 'text-red-400' : 'text-yellow-400'}`} />
            : <Zap className="w-3 h-3 text-green-400" />}
        </div>
        <div>
          <div className={`text-[11px] font-black mb-0.5 ${
            isUrgent ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-green-400'
          }`}>
            {isUrgent
              ? '⚠️ Trial berakhir hari ini!'
              : `Trial PRO berakhir ${daysLeft} hari lagi`}
          </div>
          <div className="text-[10px] text-[#64748b]">
            {isUrgent
              ? 'Upgrade sekarang agar tidak kehilangan akses PRO'
              : 'Upgrade sebelum trial habis'}
          </div>
        </div>
      </div>

      <Link href="/upgrade"
        className={`mt-2 flex items-center justify-center gap-1 w-full py-1.5 rounded-lg text-[11px] font-black transition-colors ${
          isUrgent
            ? 'bg-red-500 hover:bg-red-400 text-white'
            : isWarning
            ? 'bg-yellow-400 hover:bg-yellow-300 text-[#0a0d14]'
            : 'bg-green-400 hover:bg-green-300 text-[#0a0d14]'
        }`}>
        Upgrade Sekarang <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )
}