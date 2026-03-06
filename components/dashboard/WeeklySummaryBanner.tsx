'use client'

import { useEffect, useState } from 'react'
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/utils'

type Summary = {
  totalMingguIni: number
  totalMingguLalu: number
  transaksiMingguIni: number
  growth: number // percentage
}

type Props = {
  storeId: string
}

const DISMISS_KEY = 'weekly_summary_dismissed'

export default function WeeklySummaryBanner({ storeId }: Props) {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [dismissed, setDismissed] = useState(true) // default hidden
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hanya tampil di hari Senin atau kalau belum di-dismiss minggu ini
    const today = new Date()
    const isMonday = today.getDay() === 1

    const lastDismissed = localStorage.getItem(DISMISS_KEY)
    const dismissedThisWeek = lastDismissed
      ? new Date(lastDismissed) > getStartOfWeek(today)
      : false

    if (!isMonday && !dismissedThisWeek) {
      // Tampil kalau belum dismiss minggu ini (bukan hanya Senin)
      setDismissed(false)
    } else if (isMonday && !dismissedThisWeek) {
      setDismissed(false)
    } else {
      setLoading(false)
      return
    }

    fetchSummary()
  }, [storeId])

  function getStartOfWeek(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    d.setDate(diff)
    d.setHours(0, 0, 0, 0)
    return d
  }

  async function fetchSummary() {
    const supabase = createClient()
    const now = new Date()

    // Minggu ini: Senin - sekarang
    const startMingguIni = getStartOfWeek(now)

    // Minggu lalu: Senin - Minggu
    const startMingguLalu = new Date(startMingguIni)
    startMingguLalu.setDate(startMingguLalu.getDate() - 7)
    const endMingguLalu = new Date(startMingguIni)
    endMingguLalu.setMilliseconds(-1)

    const [mingguIni, mingguLalu] = await Promise.all([
      supabase.from('transactions')
        .select('id, total')
        .eq('store_id', storeId)
        .eq('status', 'selesai')
        .gte('created_at', startMingguIni.toISOString()),
      supabase.from('transactions')
        .select('id, total')
        .eq('store_id', storeId)
        .eq('status', 'selesai')
        .gte('created_at', startMingguLalu.toISOString())
        .lte('created_at', endMingguLalu.toISOString()),
    ])

    const totalMingguIni = ((mingguIni.data ?? []) as any[]).reduce((s, t) => s + t.total, 0)
    const totalMingguLalu = ((mingguLalu.data ?? []) as any[]).reduce((s, t) => s + t.total, 0)
    const transaksiMingguIni = (mingguIni.data ?? []).length

    const growth = totalMingguLalu > 0
      ? Math.round(((totalMingguIni - totalMingguLalu) / totalMingguLalu) * 100)
      : 0

    setSummary({ totalMingguIni, totalMingguLalu, transaksiMingguIni, growth })
    setLoading(false)
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString())
    setDismissed(true)
  }

  if (loading || dismissed || !summary) return null

  const GrowthIcon = summary.growth > 0 ? TrendingUp : summary.growth < 0 ? TrendingDown : Minus
  const growthColor = summary.growth > 0 ? 'text-green-400' : summary.growth < 0 ? 'text-red-400' : 'text-[#64748b]'
  const growthBg = summary.growth > 0 ? 'bg-green-400/10' : summary.growth < 0 ? 'bg-red-400/10' : 'bg-[#181c27]'

  // Tidak tampilkan kalau tidak ada data sama sekali
  if (summary.transaksiMingguIni === 0 && summary.totalMingguLalu === 0) return null

  return (
    <div className="mb-4 bg-[#0f1117] border border-[#2a3045] rounded-2xl p-4 relative">
      <button onClick={handleDismiss}
        className="absolute top-3 right-3 text-[#3a4560] hover:text-[#64748b] transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="text-xs font-bold text-[#64748b] uppercase tracking-wide mb-3">
        📈 Ringkasan Minggu Ini
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <div className="text-xl font-black text-white">{formatRupiah(summary.totalMingguIni)}</div>
          <div className="text-xs text-[#64748b]">{summary.transaksiMingguIni} transaksi</div>
        </div>

        {summary.totalMingguLalu > 0 && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${growthBg}`}>
            <GrowthIcon className={`w-3.5 h-3.5 ${growthColor}`} />
            <span className={`text-sm font-bold ${growthColor}`}>
              {summary.growth > 0 ? '+' : ''}{summary.growth}%
            </span>
            <span className="text-xs text-[#64748b]">vs minggu lalu</span>
          </div>
        )}

        {summary.totalMingguLalu > 0 && (
          <div className="text-xs text-[#64748b]">
            Minggu lalu: {formatRupiah(summary.totalMingguLalu)}
          </div>
        )}
      </div>
    </div>
  )
}