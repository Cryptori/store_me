'use client'

import { useState } from 'react'
import { X, Loader2, Truck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Supplier } from '@/types/supplier'

type Props = { storeId: string; supplier: Supplier | null; onSave: (s: Supplier) => void; onClose: () => void }

export default function SupplierForm({ storeId, supplier, onSave, onClose }: Props) {
  const [nama, setNama]               = useState(supplier?.nama ?? '')
  const [kontakNama, setKontakNama]   = useState(supplier?.kontak_nama ?? '')
  const [telepon, setTelepon]         = useState(supplier?.telepon ?? '')
  const [email, setEmail]             = useState(supplier?.email ?? '')
  const [alamat, setAlamat]           = useState(supplier?.alamat ?? '')
  const [catatan, setCatatan]         = useState(supplier?.catatan ?? '')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  async function handleSave() {
    if (!nama.trim()) { setError('Nama supplier wajib diisi'); return }
    setSaving(true)
    const db = createClient() as any
    const payload = { store_id: storeId, nama: nama.trim(), kontak_nama: kontakNama || null, telepon: telepon || null, email: email || null, alamat: alamat || null, catatan: catatan || null }
    const { data } = supplier
      ? await db.from('suppliers').update(payload).eq('id', supplier.id).select().single()
      : await db.from('suppliers').insert(payload).select().single()
    setSaving(false)
    if (data) onSave(data)
    else setError('Gagal menyimpan')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-md bg-[#181c27] border border-[#2a3045] rounded-t-2xl md:rounded-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#2a3045]">
          <h2 className="font-black text-white">{supplier ? 'Edit Supplier' : 'Tambah Supplier'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-[#64748b] hover:text-white hover:bg-[#1e2333]"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 space-y-3">
          {[
            { label: 'Nama Supplier *', value: nama, onChange: setNama, placeholder: 'PT. Sumber Makmur' },
            { label: 'Nama Kontak', value: kontakNama, onChange: setKontakNama, placeholder: 'Budi Santoso' },
            { label: 'Nomor WA / Telepon', value: telepon, onChange: setTelepon, placeholder: '08123456789' },
            { label: 'Email', value: email, onChange: setEmail, placeholder: 'supplier@email.com' },
            { label: 'Alamat', value: alamat, onChange: setAlamat, placeholder: 'Jl. Raya No.1' },
          ].map(({ label, value, onChange, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">{label}</label>
              <input value={value} onChange={e => { onChange(e.target.value); setError('') }} placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Catatan</label>
            <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={2} placeholder="Catatan internal..."
              className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40 resize-none" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</> : supplier ? 'Simpan' : 'Tambah Supplier'}
          </button>
        </div>
      </div>
    </div>
  )
}