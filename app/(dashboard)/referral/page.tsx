'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Gift, Copy, Check, Users, Share2, Loader2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useActiveStore } from '@/hooks/useStore'

type ReferralStats = {
  code: string
  totalUsed: number
  totalRewardDays: number
}

export default function ReferralPage() {
  const { store } = useActiveStore()
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = stats
    ? `${process.env.NEXT_PUBLIC_APP_URL}/register?ref=${stats.code}`
    : ''

  useEffect(() => {
    if (store) fetchStats()
  }, [store])

  async function fetchStats() {
    const supabase = createClient()
    const db = supabase as any

    // Generate kode kalau belum ada
    if (!store!.referral_code) {
      setGenerating(true)
      await db.rpc('generate_referral_code', { p_store_id: store!.id })
      setGenerating(false)
    }

    // Ambil data referral
    const [storeRes, referralRes] = await Promise.all([
      db.from('stores').select('referral_code, referral_reward_days').eq('id', store!.id).single(),
      db.from('referrals').select('id', { count: 'exact', head: true })
        .eq('referrer_store_id', store!.id).eq('status', 'used'),
    ])

    setStats({
      code: storeRes.data?.referral_code ?? '',
      totalUsed: referralRes.count ?? 0,
      totalRewardDays: storeRes.data?.referral_reward_days ?? 0,
    })
    setLoading(false)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: 'Coba TokoKu — Kasir gratis untuk UMKM',
        text: `Pakai kode referral ${stats?.code} saat daftar dan kita berdua dapat 30 hari PRO gratis!`,
        url: shareUrl,
      })
    } else {
      handleCopy()
    }
  }

  if (loading || generating) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-green-400" />
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Referral</h1>
        <p className="text-[#64748b] text-sm mt-0.5">Ajak teman, berdua dapat bonus PRO 30 hari</p>
      </div>

      {/* Hero card */}
      <div className="bg-gradient-to-br from-[#1a2a1a] to-[#0f1f1a] border border-green-500/30 rounded-2xl p-6 mb-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-cyan-400" />
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-400/20 border border-green-400/30 flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="font-black text-white mb-1">Bagikan & Dapat Bonus</h2>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              Setiap teman yang daftar pakai kode kamu, <strong className="text-green-400">kamu dapat 30 hari PRO</strong> dan teman kamu juga dapat 30 hari PRO. Gratis!
            </p>
          </div>
        </div>
      </div>

      {/* Kode referral */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-5 mb-4">
        <div className="text-xs font-bold text-[#64748b] uppercase tracking-wide mb-3">Kode Referral Kamu</div>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 px-4 py-3 bg-[#0f1117] border border-[#2a3045] rounded-xl font-mono font-black text-xl text-green-400 tracking-widest text-center">
            {stats?.code}
          </div>
          <button onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-3 bg-[#1e2333] border border-[#2a3045] hover:border-green-500/40 rounded-xl text-sm font-bold transition-all">
            {copied ? <><Check className="w-4 h-4 text-green-400" /><span className="text-green-400">Tersalin!</span></> : <><Copy className="w-4 h-4" />Salin</>}
          </button>
        </div>

        {/* Share link */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#0f1117] border border-[#2a3045] rounded-xl mb-3">
          <span className="text-xs text-[#64748b] flex-1 truncate font-mono">{shareUrl}</span>
        </div>

        <button onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
          <Share2 className="w-4 h-4" />
          Bagikan Link Referral
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-green-400">{stats?.totalUsed ?? 0}</div>
          <div className="text-xs text-[#64748b] mt-1">Teman Bergabung</div>
        </div>
        <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4 text-center">
          <div className="text-2xl font-black text-green-400">{stats?.totalRewardDays ?? 0}</div>
          <div className="text-xs text-[#64748b] mt-1">Total Hari Bonus</div>
        </div>
      </div>

      {/* Cara kerja */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-5">
        <div className="text-xs font-bold text-[#64748b] uppercase tracking-wide mb-4">Cara Kerja</div>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Bagikan kode atau link referral ke teman' },
            { step: '2', text: 'Teman daftar dan masukkan kode saat register' },
            { step: '3', text: 'Kamu dan teman masing-masing dapat 30 hari PRO gratis!' },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-green-400/20 border border-green-400/30 flex items-center justify-center text-xs font-black text-green-400 flex-shrink-0">
                {step}
              </div>
              <p className="text-sm text-[#94a3b8]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}