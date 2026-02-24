'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { useFreemium } from '@/hooks/useFreemium'
import type { Customer } from '@/types/database'
import type { FormPelanggan } from '@/components/pelanggan/types'
import PelangganTable from '@/components/pelanggan/PelangganTable'
import PelangganCards from '@/components/pelanggan/PelangganCards'
import TambahModal from '@/components/pelanggan/TambahModal'

export default function PelangganPage() {
  const { store } = useStore()
  const { canAddPelanggan } = useFreemium()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filtered, setFiltered] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormPelanggan>({ nama: '', telepon: '', alamat: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (store) fetchCustomers() }, [store])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(customers.filter(c =>
      c.nama.toLowerCase().includes(q) || (c.telepon ?? '').includes(q)
    ))
  }, [search, customers])

  async function fetchCustomers() {
    const supabase = createClient()
    const { data } = await supabase.from('customers').select('*').eq('store_id', store!.id).order('nama')
    setCustomers(data ?? [])
    setLoading(false)
  }

  async function addCustomer() {
    if (!form.nama.trim()) return
    setSaving(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.from('customers').insert({
      nama: form.nama.trim(),
      telepon: form.telepon.trim() || null,
      alamat: form.alamat.trim() || null,
      store_id: store!.id,
      total_hutang: 0,
    })
    if (err) {
      setError('Gagal menyimpan, coba lagi')
      setSaving(false)
      return
    }
    setForm({ nama: '', telepon: '', alamat: '' })
    setShowForm(false)
    await fetchCustomers()
    setSaving(false)
  }

  function closeForm() {
    setShowForm(false)
    setForm({ nama: '', telepon: '', alamat: '' })
    setError('')
  }

  const canAdd = canAddPelanggan(customers.length)

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Pelanggan</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{customers.length} pelanggan terdaftar</p>
        </div>
        {canAdd ? (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
            <Plus className="w-4 h-4" /> Tambah
          </button>
        ) : (
          <Link href="/upgrade"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1a2a1a] border border-green-500/30 text-green-400 rounded-xl font-bold text-sm">
            ✨ Upgrade
          </Link>
        )}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
        <input type="text" placeholder="Cari nama atau nomor HP..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#181c27] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
      </div>

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
          <>
            <PelangganTable customers={filtered} />
            <PelangganCards customers={filtered} />
          </>
        )}
      </div>

      {showForm && (
        <TambahModal
          form={form}
          saving={saving}
          error={error}
          onChange={setForm}
          onSave={addCustomer}
          onClose={closeForm}
        />
      )}
    </div>
  )
}