'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Plus, Search, Truck, Phone, Mail, MapPin, Trash2, Edit2, Loader2, Package } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useActiveStore } from '@/hooks/useStore'
import { useFreemium } from '@/hooks/useFreemium'
import type { Supplier } from '@/types/supplier'
import SupplierForm from '@/components/supplier/SupplierForm'
import UpgradeModal from '@/components/shared/UpgradeModal'

export default function SupplierPage() {
  const { store } = useActiveStore()
  const { isPro, hasProAccess } = useFreemium()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [showForm, setShowForm]   = useState(false)
  const [editItem, setEditItem]   = useState<Supplier | null>(null)

  useEffect(() => { if (store) fetchSuppliers() }, [store])

  async function fetchSuppliers() {
    setLoading(true)
    const { data } = await (createClient() as any)
      .from('suppliers').select('*')
      .eq('store_id', store!.id).order('nama')
    setSuppliers((data ?? []) as Supplier[])
    setLoading(false)
  }

  async function deleteSupplier(id: string) {
    if (!confirm('Hapus supplier ini? PO terkait tidak akan terhapus.')) return
    await (createClient() as any).from('suppliers').update({ is_active: false }).eq('id', id)
    setSuppliers(prev => prev.filter(s => s.id !== id))
  }

  const filtered = suppliers.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    (s.telepon ?? '').includes(search)
  )

  if (!hasProAccess) return (
    <div className="p-6 max-w-lg text-center py-16">
      <div className="text-5xl mb-4">🚚</div>
      <h1 className="text-xl font-black text-white mb-2">Manajemen Supplier</h1>
      <p className="text-[#64748b] text-sm mb-6">Fitur supplier & purchase order tersedia untuk akun PRO.</p>
      <Link href="/upgrade"
        className="inline-flex items-center gap-2 px-6 py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
        Upgrade ke PRO
      </Link>
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Supplier</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{suppliers.length} supplier terdaftar</p>
        </div>
        <div className="flex gap-2">
          <Link href="/supplier/hutang"
            className="flex items-center gap-2 px-3 py-2 bg-[#181c27] border border-[#2a3045] hover:border-[#3a4560] text-[#64748b] hover:text-white rounded-xl text-sm font-semibold transition-all">
            Hutang Supplier
          </Link>
          <button onClick={() => { setEditItem(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama atau telepon..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#181c27] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-green-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Truck className="w-10 h-10 text-[#2a3045] mx-auto mb-3" />
          <div className="text-[#64748b] text-sm">
            {search ? 'Supplier tidak ditemukan' : 'Belum ada supplier. Tambah supplier pertama!'}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(s => (
            <div key={s.id} className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1e2333] border border-[#2a3045] flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4 text-[#64748b]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-white mb-1">{s.nama}</div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[#64748b]">
                    {s.kontak_nama && <span>{s.kontak_nama}</span>}
                    {s.telepon && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.telepon}</span>}
                    {s.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</span>}
                    {s.alamat && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.alamat}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link href={`/supplier/${s.id}/po`}
                    className="p-1.5 rounded-lg text-[#3a4560] hover:text-blue-400 hover:bg-blue-400/10 transition-colors" title="Lihat PO">
                    <Package className="w-3.5 h-3.5" />
                  </Link>
                  <button onClick={() => { setEditItem(s); setShowForm(true) }}
                    className="p-1.5 rounded-lg text-[#3a4560] hover:text-[#94a3b8] hover:bg-[#1e2333] transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteSupplier(s.id)}
                    className="p-1.5 rounded-lg text-[#3a4560] hover:text-red-400 hover:bg-red-400/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <SupplierForm
          storeId={store!.id}
          supplier={editItem}
          onSave={saved => {
            setSuppliers(prev => editItem ? prev.map(s => s.id === saved.id ? saved : s) : [saved, ...prev])
            setShowForm(false)
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}