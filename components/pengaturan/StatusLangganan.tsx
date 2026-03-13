'use client'

import Link from 'next/link'
import type { Store } from '@/types/database'

type Props = { store: Store }

export default function StatusLangganan({ store }: Props) {
  const now = new Date()

  const proExpiresAt   = store.pro_expires_at   ? new Date(store.pro_expires_at)   : null
  const trialExpiresAt = store.trial_expires_at ? new Date(store.trial_expires_at) : null

  const isPro          = store.is_pro && (proExpiresAt  ? proExpiresAt  > now : true)
  const isTrialActive  = !isPro && !!(store.is_trial && trialExpiresAt && trialExpiresAt > now)
  const isTrialExpired = !isPro && !isTrialActive && !!store.trial_used

  const trialDaysLeft = isTrialActive && trialExpiresAt
    ? Math.max(0, Math.ceil((trialExpiresAt.getTime() - now.getTime()) / 86_400_000))
    : 0

  const fmt = (d: Date) => d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  // ── Badge ────────────────────────────────────────────────────
  const badge = isPro
    ? { label: '✨ PRO',       cls: 'bg-cyan-400/10 text-cyan-400'   }
    : isTrialActive
    ? { label: '🎯 TRIAL AKTIF', cls: 'bg-yellow-400/10 text-yellow-400' }
    : isTrialExpired
    ? { label: 'TRIAL HABIS',  cls: 'bg-red-400/10 text-red-400'    }
    : { label: 'FREE',         cls: 'bg-gray-400/10 text-gray-400'  }

  // ── Deskripsi ────────────────────────────────────────────────
  const desc = isPro
    ? proExpiresAt
      ? `PRO aktif hingga ${fmt(proExpiresAt)}`
      : 'PRO aktif selamanya'
    : isTrialActive
    ? `Trial berakhir ${fmt(trialExpiresAt!)} · ${trialDaysLeft} hari lagi`
    : isTrialExpired
    ? 'Trial sudah berakhir — upgrade untuk akses fitur PRO'
    : 'Gratis selamanya dengan fitur terbatas'

  // ── CTA ──────────────────────────────────────────────────────
  const ctaLabel = isTrialExpired ? 'Upgrade Sekarang' : 'Upgrade PRO'

  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-6">
      <h2 className="font-bold text-sm mb-4">Status Langganan</h2>

      <div className="flex items-center justify-between p-4 bg-[#1e2333] rounded-xl border border-[#2a3045]">
        <div>
          <div className="mb-1.5">
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-sm text-[#64748b]">{desc}</p>

          {/* Progress bar sisa trial */}
          {isTrialActive && trialDaysLeft <= 3 && (
            <div className="mt-2 w-40 h-1.5 bg-[#2a3045] rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all"
                style={{ width: `${(trialDaysLeft / 7) * 100}%` }}
              />
            </div>
          )}
        </div>

        {!isPro && (
          <Link
            href="/upgrade"
            className="px-4 py-2 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl text-sm font-black transition-colors whitespace-nowrap ml-4"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </div>
  )
}