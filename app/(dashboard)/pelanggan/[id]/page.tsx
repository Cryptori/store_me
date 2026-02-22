'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Check, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah, formatTanggal } from '@/lib/utils'
import type { Customer, Debt } from '@/types/database'

export default function PelangganDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [showBayar, setShowBayar] = useState<string | null>(null)
  const [bayarAmount, setBayarAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => { fetchData() }, [id])

  async function fetchData() {
    const [custRes, debtRes] = await Promise.all([
      supabase.from('customers').select('*').eq('id', id).single(),
      supabase.from('debts').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
    ])
    setCustomer(custRes.data)
    setDebts(debtRes.data ?? [])
    setLoading(false)
  }

  async function bayarHutang(debtId: string) {
    const jumlah = Number(bayarAmount)
    if (!jumlah || jumlah <= 0) return
    setSaving(true)

    const debt = debts.find(d => d.id === debtId)!
    const sisaBaru = Math.max(0, debt.sisa - jumlah)

    await supabase.from('debt_payments').insert({ debt_id: debtId, jumlah_bayar: jumlah })
    await supabase.from('debts').update({
      sisa: sisaBaru,
      status: sisaBaru === 0 ? 'lunas' : 'belum_lunas',
      updated_at: new Date().toISOString(),
    }).eq('id', debtId)

    setShowBayar(null)
    setBayarAmount('')
    await fetchData()
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full" /></div>
  if (!customer) return null

  const hutangAktif = debts.filter(d => d.status === 'belum_lunas')
  const hutangLunas = debts.filter(d => d.status === 'lunas')

  return (
    <div className="p-6 max-w-3xl">
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
            <p className="text-[#64748b] text-sm">{customer.telepon ?? 'Tidak ada nomor HP'}</p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Hutang Aktif', value: formatRupiah(customer.total_hutang), color: 'red' },
          { label: 'Transaksi Hutang', value: hutangAktif.length.toString(), color: 'yellow' },
          { label: 'Hutang Lunas', value: hutangLunas.length.toString(), color: 'green' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
            <div className="text-xs text-[#64748b] mb-1">{label}</div>
            <div className={`text-xl font-black font-mono ${
              color === 'red' ? 'text-red-400' : color === 'yellow' ? 'text-yellow-400' : 'text-green-400'
            }`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Hutang aktif */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden mb-4">
        <div className="p-4 border-b border-[#2a3045]">
          <h2 className="font-bold text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" /> Hutang Belum Lunas ({hutangAktif.length})
          </h2>
        </div>
        {hutangAktif.length === 0 ? (
          <div className="py-8 text-center text-[#64748b] text-sm">Tidak ada hutang aktif ✓</div>
        ) : hutangAktif.map(d => (
          <div key={d.id} className="p-4 border-b border-[#2a3045] last:border-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-sm font-semibold">{formatTanggal(d.created_at)}</div>
                <div className="text-xs text-[#64748b]">
                  Total: {formatRupiah(d.jumlah)} •
                  Sisa: <span className="text-red-400 font-bold">{formatRupiah(d.sisa)}</span>
                </div>
                {d.jatuh_tempo && (
                  <div className="text-xs text-yellow-400 mt-0.5">Jatuh tempo: {formatTanggal(d.jatuh_tempo)}</div>
                )}
              </div>
              <button onClick={() => setShowBayar(d.id === showBayar ? null : d.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-400/10 border border-green-500/20 text-green-400 rounded-lg text-xs font-bold hover:bg-green-400/20 transition-colors">
                <Plus className="w-3 h-3" /> Bayar
              </button>
            </div>
            {showBayar === d.id && (
              <div className="flex gap-2 mt-3">
                <input type="number" placeholder={`Maks ${formatRupiah(d.sisa)}`} value={bayarAmount} onChange={e => setBayarAmount(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white text-sm font-mono outline-none focus:border-green-500/40" />
                <button onClick={() => setBayarAmount(d.sisa.toString())} className="px-3 py-2 bg-[#1e2333] border border-[#2a3045] rounded-xl text-xs text-[#94a3b8] hover:text-white transition-colors">Lunas</button>
                <button onClick={() => bayarHutang(d.id)} disabled={saving || !bayarAmount}
                  className="px-4 py-2 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl text-sm font-black transition-all disabled:opacity-50">
                  {saving ? '...' : <Check className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hutang lunas */}
      {hutangLunas.length > 0 && (
        <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[#2a3045]">
            <h2 className="font-bold text-sm text-[#64748b]">Riwayat Lunas ({hutangLunas.length})</h2>
          </div>
          {hutangLunas.map(d => (
            <div key={d.id} className="p-4 border-b border-[#2a3045] last:border-0 opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{formatTanggal(d.created_at)}</div>
                  <div className="text-xs text-[#64748b]">{formatRupiah(d.jumlah)}</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-green-400/10 text-green-400 rounded-md">LUNAS</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}