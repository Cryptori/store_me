'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useActiveStore } from '@/hooks/useStore'
import { formatTanggal } from '@/lib/utils'
import type { Product, Transaction, Debt } from '@/types/database'
import StatsCards from '@/components/dashboard/StatsCards'
import TransaksiTerakhir from '@/components/dashboard/TransaksiTerakhir'
import StokMenipis from '@/components/dashboard/StokMenipis'
import HutangAktif from '@/components/dashboard/HutangAktif'
import WeeklySummaryBanner from '@/components/dashboard/WeeklySummaryBanner'
import StokAlertBanner from '@/components/stok/StokAlertBanner'

type DashboardStats = {
  penjualanHariIni: number
  transaksiHariIni: number
  stokMenipis: number
  totalHutang: number
  transaksiTerakhir: (Transaction & { customer_nama?: string })[]
  hutangAktif: (Debt & { customer_nama: string })[]
  produkMenipis: Product[]
  produkHabis: Product[]
}

export default function DashboardPage() {
  const { store } = useActiveStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!store) return
    fetchStats()
  }, [store])

  async function fetchStats() {
    const supabase = createClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISO = today.toISOString()

    const [trxToday, hutangData, trxTerakhir, hutangList, produkAll] = await Promise.all([
      supabase.from('transactions')
        .select('id, total')
        .eq('store_id', store!.id)
        .gte('created_at', todayISO)
        .eq('status', 'selesai'),

      supabase.from('debts')
        .select('id, sisa')
        .eq('store_id', store!.id)
        .eq('status', 'belum_lunas'),

      supabase.from('transactions')
        .select('*')
        .eq('store_id', store!.id)
        .order('created_at', { ascending: false })
        .limit(5),

      supabase.from('debts')
        .select('*')
        .eq('store_id', store!.id)
        .eq('status', 'belum_lunas')
        .order('created_at', { ascending: false })
        .limit(5),

      supabase.from('products')
        .select('*')
        .eq('store_id', store!.id)
        .eq('is_active', true)
        .order('stok')
        .limit(50),
    ])

    const trxTodayData = (trxToday.data ?? []) as Pick<Transaction, 'id' | 'total'>[]
    const hutangRawData = (hutangData.data ?? []) as Pick<Debt, 'id' | 'sisa'>[]
    const produkData = (produkAll.data ?? []) as Product[]

    const penjualanHariIni = trxTodayData.reduce((s, t) => s + t.total, 0)
    const transaksiHariIni = trxTodayData.length
    const totalHutang = hutangRawData.reduce((s, d) => s + d.sisa, 0)

    const produkHabis = produkData.filter(p => p.stok === 0)
    const produkMenipisData = produkData.filter(p => p.stok > 0 && p.stok <= p.stok_minimum).slice(0, 5)

    // Fetch customer nama
    const customerIds = [
      ...new Set([
        ...(trxTerakhir.data ?? []).map((t: any) => t.customer_id).filter(Boolean),
        ...(hutangList.data ?? []).map((d: any) => d.customer_id).filter(Boolean),
      ])
    ] as string[]

    let customerMap: Record<string, string> = {}
    if (customerIds.length > 0) {
      const db = supabase as any
      const { data: customers } = await db
        .from('customers').select('id, nama').in('id', customerIds)
      customerMap = Object.fromEntries(
        ((customers ?? []) as { id: string; nama: string }[]).map(c => [c.id, c.nama])
      )
    }

    setStats({
      penjualanHariIni,
      transaksiHariIni,
      stokMenipis: produkMenipisData.length + produkHabis.length,
      totalHutang,
      transaksiTerakhir: (trxTerakhir.data ?? []).map((t: any) => ({
        ...t,
        customer_nama: t.customer_id ? customerMap[t.customer_id] : undefined,
      })),
      hutangAktif: (hutangList.data ?? []).map((d: any) => ({
        ...d,
        customer_nama: customerMap[d.customer_id] ?? 'Unknown',
      })),
      produkMenipis: produkMenipisData,
      produkHabis: produkHabis.slice(0, 5),
    })
    setLoading(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-green-400" />
    </div>
  )

  if (!stats) return null

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{formatTanggal(new Date().toISOString())}</p>
        </div>
        <Link href="/kasir"
          className="flex items-center gap-2 px-4 py-2.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden sm:inline">Buka Kasir</span>
        </Link>
      </div>

      {/* Weekly summary */}
      {store && <WeeklySummaryBanner storeId={store.id} />}

      {/* Stok alert banner — muncul kalau ada stok habis/menipis */}
      {(stats.produkHabis.length > 0 || stats.produkMenipis.length > 0) && store && (
        <StokAlertBanner
          storeName={store.nama}
          produkMenipis={stats.produkMenipis}
          produkHabis={stats.produkHabis}
          ownerPhone={store.telepon ?? undefined}
        />
      )}

      <StatsCards
        penjualanHariIni={stats.penjualanHariIni}
        transaksiHariIni={stats.transaksiHariIni}
        stokMenipis={stats.stokMenipis}
        totalHutang={stats.totalHutang}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TransaksiTerakhir transaksi={stats.transaksiTerakhir} />
        <div className="space-y-4">
          <StokMenipis products={stats.produkMenipis} />
          <HutangAktif hutangs={stats.hutangAktif} />
        </div>
      </div>
    </div>
  )
}