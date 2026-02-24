'use client'

import { X, Loader2 } from 'lucide-react'
import type { FormPelanggan } from './types'

type Props = {
  form: FormPelanggan
  saving: boolean
  error: string
  onChange: (form: FormPelanggan) => void
  onSave: () => void
  onClose: () => void
}

export default function TambahModal({ form, saving, error, onChange, onSave, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-[#181c27] border border-[#2a3045] rounded-t-2xl md:rounded-2xl w-full md:max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#2a3045]">
          <h3 className="font-black text-lg">Tambah Pelanggan</h3>
          <button onClick={onClose} className="text-[#64748b] hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1.5">Nama *</label>
            <input type="text" placeholder="Nama pelanggan" value={form.nama}
              onChange={e => onChange({ ...form, nama: e.target.value })}
              className="w-full px-4 py-3 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1.5">No. HP</label>
            <input type="text" placeholder="08xxxxxxxxxx" value={form.telepon}
              onChange={e => onChange({ ...form, telepon: e.target.value })}
              className="w-full px-4 py-3 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-1.5">Alamat</label>
            <input type="text" placeholder="Alamat (opsional)" value={form.alamat}
              onChange={e => onChange({ ...form, alamat: e.target.value })}
              className="w-full px-4 py-3 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 bg-[#1e2333] border border-[#2a3045] text-white rounded-xl text-sm font-bold hover:bg-[#2a3045] transition-colors">
              Batal
            </button>
            <button onClick={onSave} disabled={saving || !form.nama.trim()}
              className="flex-1 py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl text-sm font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}