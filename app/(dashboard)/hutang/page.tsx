'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Search, AlertTriangle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import type { HutangItem, FilterType } from '@/components/hutang/types'
import SummaryCards from '@/components/hutang/SummaryCards'
import HutangTable from '@/components/hutang/HutangTable'
import HutangCards from '@/components/hutang/HutangCards'
import BayarModal from '@/components/hutang/BayarModal'

export default function HutangPage() {
  const { store } = useStore()
  const [hutangs, setHutangs] = useState<HutangItem[]>([])
  const [filtered, setFiltered] = useState<HutangItem[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('belum_lunas')
  const [loading, setLoading] = useState(true)

  // Modal bayar
  const [showBayar, setShowBayar] = useState(false)
  const [selectedHutang, setSelectedHutang] = useState<HutangItem | null>(null)
  const [jumlahBayar, setJumlahBayar] = useState('')
  const [loadingBayar, setLoadingBayar] = useState(false)

  useEffect(() => { if (store) fetchHutang() }, [store])

  useEffect(() => {
    const today = new Date()
    let list = hutangs
    if (filter === 'belum_lunas') list = list.filter(h => h.status === 'belum_lunas')
    if (filter === 'terlambat') list = list.filter(h => h.status === 'belum_lunas' && h.jatuh_tempo && new Date(h.jatuh_tempo) < today)
    if (filter === 'lunas') list = list.filter(h => h.status === 'lunas')
    const q = search.toLowerCase()
    if (q) list = list.filter(h => h.customer_nama.toLowerCase().includes(q))
    setFiltered(list)
  }, [hutangs, filter, search])

  async function fetchHutang() {
    const supabase = createClient()
    const { data } = await supabase
      .from('debts')
      .select('*, customers(nama, telepon)')
      .eq('store_id', store!.id)
      .order('created_at', { ascending: false })

    setHutangs((data ?? []).map((d: any) => ({
      ...d,
      customer_nama: d.customers?.nama ?? '',
      customer_telepon: d.customers?.telepon,
    })))
    setLoading(false)
  }

  function openBayar(hutang: HutangItem) {
    setSelectedHutang(hutang)
    setJumlahBayar(hutang.sisa.toString())
    setShowBayar(true)
  }

  function closeBayar() {
    setShowBayar(false)
    setSelectedHutang(null)
    setJumlahBayar('')
  }

  async function processBayar() {
    if (!store || !selectedHutang) return
    const bayar = Number(jumlahBayar)
    if (!bayar || bayar <= 0 || bayar > selectedHutang.sisa) return
    setLoadingBayar(true)

    const supabase = createClient()
    const sisaBaru = selectedHutang.sisa - bayar
    const statusBaru = sisaBaru <= 0 ? 'lunas' : 'belum_lunas'

    await Promise.all([
      (supabase as any).from('debt_payments').insert({ debt_id: selectedHutang.id, jumlah_bayar: bayar }),
      (supabase as any).from('debts').update({ sisa: sisaBaru, status: statusBaru, updated_at: new Date().toISOString() }).eq('id', selectedHutang.id),
    ])

    // Hitung ulang total_hutang customer
    const { data: allDebts } = await (supabase as any)
      .from('debts').select('sisa').eq('customer_id', selectedHutang.customer_id).eq('status', 'belum_lunas')
    const totalSisa = (allDebts ?? []).reduce((s: number, d: any) => s + d.sisa, 0) - (statusBaru === 'lunas' ? 0 : 0)
    await (supabase as any).from('customers').update({
      total_hutang: Math.max(0, totalSisa),
      updated_at: new Date().toISOString(),
    }).eq('id', selectedHutang.customer_id)

    setLoadingBayar(false)
    closeBayar()
    fetchHutang()
  }

  const today = new Date()
  const jumlahTerlambat = hutangs.filter(h =>
    h.status === 'belum_lunas' && h.jatuh_tempo && new Date(h.jatuh_tempo) < today
  ).length

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Hutang Pelanggan</h1>
        <p className="text-[#64748b] text-sm mt-0.5">Kelola dan pantau hutang pelanggan toko</p>
      </div>

      <SummaryCards hutangs={hutangs} />

      {jumlahTerlambat > 0 && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-400 font-semibold">{jumlahTerlambat} hutang sudah melewati jatuh tempo</span>
        </div>
      )}

      {/* Filter & search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input type="text" placeholder="Cari nama pelanggan..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#181c27] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            { key: 'belum_lunas', label: 'Belum Lunas' },
            { key: 'terlambat', label: 'Terlambat' },
            { key: 'lunas', label: 'Lunas' },
            { key: 'semua', label: 'Semua' },
          ] as const).map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap ${
                filter === key ? 'bg-[#1a2a1a] border-green-500/30 text-green-400' : 'bg-[#181c27] border-[#2a3045] text-[#64748b] hover:text-white'
              }`}>{label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#64748b]">
            <CheckCircle className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-semibold">Tidak ada hutang ditemukan</p>
          </div>
        ) : (
          <>
            <HutangTable hutangs={filtered} onBayar={openBayar} />
            <HutangCards hutangs={filtered} onBayar={openBayar} />
          </>
        )}
      </div>

      {showBayar && selectedHutang && (
        <BayarModal
          hutang={selectedHutang}
          jumlahBayar={jumlahBayar}
          loading={loadingBayar}
          onChange={setJumlahBayar}
          onProcess={processBayar}
          onClose={closeBayar}
        />
      )}
    </div>
  )
}