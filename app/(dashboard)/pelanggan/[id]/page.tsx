'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Phone, MapPin, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Customer, Debt } from '@/types/database'
import SummaryCards from '@/components/pelanggan/detail/SummaryCards'
import HutangAktif from '@/components/pelanggan/detail/HutangAktif'
import HutangLunas from '@/components/pelanggan/detail/HutangLunas'

export default function PelangganDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [showBayar, setShowBayar] = useState<string | null>(null)
  const [bayarAmount, setBayarAmount] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [id])

  async function fetchData() {
    const supabase = createClient()
    const [custRes, debtRes] = await Promise.all([
      supabase.from('customers').select('*').eq('id', id).single(),
      supabase.from('debts').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
    ])
    setCustomer(custRes.data)
    setDebts(debtRes.data ?? [])
    setLoading(false)
  }

  function toggleBayar(debtId: string) {
    setShowBayar(prev => prev === debtId ? null : debtId)
    setBayarAmount('')
  }

  async function processBayar(debtId: string) {
    const jumlah = Number(bayarAmount)
    if (!jumlah || jumlah <= 0) return
    setSaving(true)

    const supabase = createClient()
    const debt = debts.find(d => d.id === debtId)!
    const sisaBaru = Math.max(0, debt.sisa - jumlah)
    const statusBaru = sisaBaru === 0 ? 'lunas' : 'belum_lunas'

    await Promise.all([
      supabase.from('debt_payments').insert({ debt_id: debtId, jumlah_bayar: jumlah }),
      (supabase as any).from('debts').update({
        sisa: sisaBaru, status: statusBaru, updated_at: new Date().toISOString(),
      }).eq('id', debtId),
    ])

    // Hitung ulang total_hutang dari semua debt belum lunas
    const { data: allDebts } = await supabase
      .from('debts').select('sisa, id')
      .eq('customer_id', id as string)
      .eq('status', 'belum_lunas')

    const totalSisa = (allDebts ?? [])
      .filter((d: any) => !(statusBaru === 'lunas' && d.id === debtId))
      .reduce((s: number, d: any) => s + d.sisa, 0)

    await (supabase as any).from('customers').update({
      total_hutang: Math.max(0, totalSisa),
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    setShowBayar(null)
    setBayarAmount('')
    await fetchData()
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-green-400" />
    </div>
  )
  if (!customer) return null

  const hutangAktif = debts.filter(d => d.status === 'belum_lunas')
  const hutangLunas = debts.filter(d => d.status === 'lunas')

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#181c27] text-[#64748b] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#181c27] flex items-center justify-center text-sm font-black text-cyan-400">
            {customer.nama.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{customer.nama}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              {customer.telepon && (
                <span className="flex items-center gap-1 text-xs text-[#64748b]">
                  <Phone className="w-3 h-3" /> {customer.telepon}
                </span>
              )}
              {customer.alamat && (
                <span className="flex items-center gap-1 text-xs text-[#64748b]">
                  <MapPin className="w-3 h-3" /> {customer.alamat}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <SummaryCards
        customer={customer}
        hutangAktif={hutangAktif.length}
        hutangLunas={hutangLunas.length}
      />

      <HutangAktif
        debts={hutangAktif}
        showBayar={showBayar}
        bayarAmount={bayarAmount}
        saving={saving}
        onToggleBayar={toggleBayar}
        onChangeBayar={setBayarAmount}
        onLunas={(sisa) => setBayarAmount(sisa.toString())}
        onProcess={processBayar}
      />

      <HutangLunas debts={hutangLunas} />
    </div>
  )
}