'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Users, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { useFreemium } from '@/hooks/useFreemium'
import { formatRupiah } from '@/lib/utils'
import type { Customer } from '@/types/database'

export default function PelangganPage() {
  const { store } = useStore()
  const { canAddPelanggan } = useFreemium()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filtered, setFiltered] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nama: '', telepon: '', alamat: '' })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => { if (store) fetchCustomers() }, [store])
  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(customers.filter(c => c.nama.toLowerCase().includes(q) || (c.telepon ?? '').includes(q)))
  }, [search, customers])

  async function fetchCustomers() {
    const { data } = await supabase.from('customers').select('*').eq('store_id', store!.id).order('nama')
    setCustomers(data ?? [])
    setLoading(false)
  }

  async function addCustomer() {
    if (!form.nama.trim()) return
    setSaving(true)
    await supabase.from('customers').insert({ ...form, store_id: store!.id })
    setForm({ nama: '', telepon: '', alamat: '' })
    setShowForm(false)
    await fetchCustomers()
    setSaving(false)
  }

  const canAdd = canAddPelanggan(customers.length)

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Pelanggan</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{customers.length} pelanggan terdaftar</p>
        </div>
        {canAdd ? (
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
            <Plus className="w-4 h-4" /> Tambah Pelanggan
          </button>
        ) : (
          <Link href="/upgrade" className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2a1a] border border-green-500/30 text-green-400 rounded-xl font-bold text-sm">
            ✨ Upgrade untuk tambah lebih
          </Link>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-5 mb-5">
          <h3 className="font-bold text-sm mb-4">Tambah Pelanggan Baru</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Nama *</label>
              <input type="text" placeholder="Nama pelanggan" value={form.nama} onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">No. HP</label>
              <input type="text" placeholder="08xxxxxxxxxx" value={form.telepon} onChange={e => setForm(f => ({ ...f, telepon: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Alamat</label>
              <input type="text" placeholder="Alamat (opsional)" value={form.alamat} onChange={e => setForm(f => ({ ...f, alamat: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-[#1e2333] border border-[#2a3045] text-white rounded-xl text-sm font-bold hover:bg-[#2a3045] transition-colors">Batal</button>
            <button onClick={addCustomer} disabled={saving || !form.nama.trim()} className="px-4 py-2 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl text-sm font-black transition-all disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
        <input type="text" placeholder="Cari nama atau nomor HP..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#181c27] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
      </div>

      {/* List */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#64748b]">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-semibold">Belum ada pelanggan</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a3045]">
                {['Pelanggan', 'No. HP', 'Total Hutang', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-[#64748b] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-[#2a3045] last:border-0 hover:bg-[#1e2333] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1e2333] flex items-center justify-center text-xs font-black text-cyan-400 flex-shrink-0">
                        {c.nama.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{c.nama}</div>
                        {c.alamat && <div className="text-xs text-[#64748b] truncate max-w-xs">{c.alamat}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#64748b] font-mono">{c.telepon ?? '-'}</td>
                  <td className="px-4 py-3">
                    {c.total_hutang > 0 ? (
                      <span className="flex items-center gap-1.5 text-red-400 font-bold font-mono text-sm">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {formatRupiah(c.total_hutang)}
                      </span>
                    ) : (
                      <span className="text-green-400 text-sm font-semibold">Lunas ✓</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/pelanggan/${c.id}`} className="text-xs text-green-400 hover:text-green-300 font-semibold">
                      Detail →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}