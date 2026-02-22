'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { tokoSchema, type TokoInput } from '@/lib/validations'

export default function PengaturanPage() {
  const { store, setStore } = useStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TokoInput>({
    resolver: zodResolver(tokoSchema),
  })

  useEffect(() => {
    if (store) reset({ nama: store.nama, alamat: store.alamat ?? '', telepon: store.telepon ?? '' })
  }, [store])

  async function onSubmit(data: TokoInput) {
    if (!store) return
    setSaving(true)
    const { data: updated } = await supabase
      .from('stores')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', store.id)
      .select()
      .single()
    if (updated) setStore(updated)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const Field = ({ name, label, placeholder }: { name: keyof TokoInput, label: string, placeholder?: string }) => (
    <div>
      <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">{label}</label>
      <input
        {...register(name)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${
          errors[name] ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/40'
        }`}
      />
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]?.message}</p>}
    </div>
  )

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Pengaturan</h1>
        <p className="text-[#64748b] text-sm mt-0.5">Kelola informasi toko kamu</p>
      </div>

      {/* Info toko */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-6 mb-5">
        <h2 className="font-bold text-sm mb-4">Informasi Toko</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field name="nama" label="Nama Toko" placeholder="Warung Berkah Jaya" />
          <Field name="alamat" label="Alamat (Opsional)" placeholder="Jl. Merdeka No. 1" />
          <Field name="telepon" label="No. HP Toko (Opsional)" placeholder="08xxxxxxxxxx" />
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-all disabled:opacity-50">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> :
             saved ? '✓ Tersimpan!' : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
          </button>
        </form>
      </div>

      {/* Status langganan */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-6">
        <h2 className="font-bold text-sm mb-4">Status Langganan</h2>
        <div className="flex items-center justify-between p-4 bg-[#1e2333] rounded-xl border border-[#2a3045]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                store?.is_pro ? 'bg-cyan-400/10 text-cyan-400' : 'bg-green-400/10 text-green-400'
              }`}>{store?.is_pro ? '✨ PRO' : 'FREE'}</span>
            </div>
            <p className="text-sm text-[#64748b]">
              {store?.is_pro
                ? `Aktif hingga ${store.pro_expires_at ? new Date(store.pro_expires_at).toLocaleDateString('id-ID') : '-'}`
                : 'Gratis selamanya dengan fitur terbatas'}
            </p>
          </div>
          {!store?.is_pro && (
            <a href="/upgrade" className="px-4 py-2 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl text-sm font-black transition-colors">
              Upgrade PRO
            </a>
          )}
        </div>
      </div>
    </div>
  )
}