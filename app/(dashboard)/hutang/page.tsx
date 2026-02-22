'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { formatRupiah, formatTanggal } from '@/lib/utils'

type HutangItem = {
  id: string
  jumlah: number
  sisa: number
  status: string
  jatuh_tempo: string | null
  created_at: string
  customer_id: string
  customer_nama: string
  customer_telepon: string | null
}

export default function HutangPage() {
  const { store } = useStore()
  const [hutangs, setHutangs] = useState<HutangItem[]>([])
  const [filtered, setFiltered] = useState<HutangItem[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'semua' | 'belum_lunas' | 'terlambat' | 'lunas'>('belum_lunas')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { if (store) fetchHutang() }, [store])

  useEffect(() => {
    let list = hutangs
    const today = new Date()
    if (filter === 'belum_lunas') list = list.filter(h => h.status === 'belum_lunas')
    if (filter === 'terlambat') list = list.filter(h => h.status === 'belum_lunas' && h.jatuh_tempo && new Date(h.jatuh_tempo) < today)
    if (filter === 'lunas') list = list.filter(h => h.status === 'lunas')
    const q = search.toLowerCase()
    if (q) list = list.filter(h => h.customer_nama.toLowerCase().includes(q))
    setFiltered(list)
  }, [hutangs, filter, search])

  async function fetchHutang() {
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

  const today = new Date()
  const totalAktif = hutangs.filter(h => h.status === 'belum_lunas').reduce((s, h) => s + h.sisa, 0)
  const terlambat = hutangs.filter(h => h.status === 'belum_lunas' && h.jatuh_tempo && new Date(h.jatuh_tempo) < today).length

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Hutang Pelanggan</h1>
        <p className="text-[#64748b] text-sm mt-0.5">Total hutang aktif: <span className="text-red-400 font-bold">{formatRupiah(totalAktif)}</span></p>
      </div>

      {terlambat > 0 && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-sm text-red-400 font-semibold">{terlambat} hutang sudah melewati jatuh tempo</span>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input type="text" placeholder="Cari nama pelanggan..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#181c27] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
        </div>
        {([
          { key: 'belum_lunas', label: 'Belum Lunas' },
          { key: 'terlambat', label: 'Terlambat' },
          { key: 'lunas', label: 'Lunas' },
          { key: 'semua', label: 'Semua' },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              filter === key ? 'bg-[#1a2a1a] border-green-500/30 text-green-400' : 'bg-[#181c27] border-[#2a3045] text-[#64748b] hover:text-white'
            }`}>{label}</button>
        ))}
      </div>

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
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a3045]">
                {['Pelanggan', 'Total Hutang', 'Sisa', 'Jatuh Tempo', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(h => {
                const isLate = h.status === 'belum_lunas' && h.jatuh_tempo && new Date(h.jatuh_tempo) < today
                return (
                  <tr key={h.id} className="border-b border-[#2a3045] last:border-0 hover:bg-[#1e2333] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#1e2333] flex items-center justify-center text-xs font-black text-cyan-400 flex-shrink-0">
                          {h.customer_nama.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{h.customer_nama}</div>
                          {h.customer_telepon && <div className="text-xs text-[#64748b]">{h.customer_telepon}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">{formatRupiah(h.jumlah)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-sm text-red-400">{formatRupiah(h.sisa)}</td>
                    <td className="px-4 py-3 text-sm">
                      {h.jatuh_tempo ? (
                        <span className={isLate ? 'text-red-400 font-semibold' : 'text-[#94a3b8]'}>
                          {isLate && '⚠ '}{formatTanggal(h.jatuh_tempo)}
                        </span>
                      ) : <span className="text-[#64748b]">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                        h.status === 'lunas' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'
                      }`}>
                        {h.status === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/pelanggan/${h.customer_id}`} className="text-xs text-green-400 hover:text-green-300 font-semibold">
                        Bayar →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}