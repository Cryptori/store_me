'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { produkSchema, type ProdukInput } from '@/lib/validations'
import { SATUAN_PRODUK } from '@/lib/constants'
import type { Product } from '@/types/database'

export default function ProdukForm({ product }: { product?: Product }) {
  const router = useRouter()
  const { store } = useStore()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const isEdit = !!product

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProdukInput>({
    resolver: zodResolver(produkSchema) as any,   // ← fix resolver type mismatch
    defaultValues: product ? {
      nama: product.nama,
      sku: product.sku ?? '',
      harga_beli: product.harga_beli,
      harga_jual: product.harga_jual,
      stok: product.stok,
      stok_minimum: product.stok_minimum,
      satuan: product.satuan,
    } : { satuan: 'pcs', stok_minimum: 5 }
  })

  async function onSubmit(data: ProdukInput) {
    if (!store) return
    setLoading(true)
    const db = supabase as any  // bypass type until Supabase types generated

    if (isEdit) {
      await db.from('products').update({ ...data, updated_at: new Date().toISOString() }).eq('id', product.id)
    } else {
      await db.from('products').insert({ ...data, store_id: store.id })
    }

    router.push('/produk')
    router.refresh()
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#181c27] text-[#64748b] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">{isEdit ? 'Edit Produk' : 'Tambah Produk'}</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{isEdit ? `Edit ${product.nama}` : 'Isi detail produk baru'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="bg-[#181c27] border border-[#2a3045] rounded-xl p-6 space-y-4">
        {/* Nama */}
        <div>
          <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Nama Produk</label>
          <input {...register('nama')} placeholder="Indomie Goreng"
            className={`w-full px-4 py-3 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/20 transition-all ${errors.nama ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/40'}`} />
          {errors.nama && <p className="text-red-400 text-xs mt-1">{errors.nama.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">SKU (Opsional)</label>
            <input {...register('sku')} placeholder="SKU-001"
              className="w-full px-4 py-3 rounded-xl bg-[#181c27] border border-[#2a3045] text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Satuan</label>
            <select {...register('satuan')}
              className="w-full px-4 py-3 rounded-xl bg-[#181c27] border border-[#2a3045] text-white text-sm outline-none focus:border-green-500/40">
              {SATUAN_PRODUK.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Harga Beli (Rp)</label>
            <input {...register('harga_beli')} type="number" placeholder="0"
              className={`w-full px-4 py-3 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40 ${errors.harga_beli ? 'border-red-500/50' : 'border-[#2a3045]'}`} />
            {errors.harga_beli && <p className="text-red-400 text-xs mt-1">{errors.harga_beli.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Harga Jual (Rp)</label>
            <input {...register('harga_jual')} type="number" placeholder="3500"
              className={`w-full px-4 py-3 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40 ${errors.harga_jual ? 'border-red-500/50' : 'border-[#2a3045]'}`} />
            {errors.harga_jual && <p className="text-red-400 text-xs mt-1">{errors.harga_jual.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Stok Awal</label>
            <input {...register('stok')} type="number" placeholder="0"
              className={`w-full px-4 py-3 rounded-xl bg-[#181c27] border text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40 ${errors.stok ? 'border-red-500/50' : 'border-[#2a3045]'}`} />
            {errors.stok && <p className="text-red-400 text-xs mt-1">{errors.stok.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Stok Minimum (Alert)</label>
            <input {...register('stok_minimum')} type="number" placeholder="5"
              className="w-full px-4 py-3 rounded-xl bg-[#181c27] border border-[#2a3045] text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white font-bold text-sm hover:bg-[#2a3045] transition-colors">
            Batal
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl bg-green-400 hover:bg-green-300 text-[#0a0d14] font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : (isEdit ? 'Simpan Perubahan' : 'Tambah Produk')}
          </button>
        </div>
      </form>
    </div>
  )
}