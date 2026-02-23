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
  const isEdit = !!product

  const { register, handleSubmit, formState: { errors } } = useForm<ProdukInput>({
    resolver: zodResolver(produkSchema) as any,
    defaultValues: product ? {
      nama: product.nama,
      sku: product.sku ?? '',
      harga_beli: product.harga_beli,
      harga_jual: product.harga_jual,
      stok: product.stok,
      stok_minimum: product.stok_minimum,
      satuan: product.satuan,
      category_id: product.category_id ?? '',
    } : {
      stok: 0,
      stok_minimum: 5,
      satuan: 'pcs',
      harga_beli: 0,
    }
  })

  async function onSubmit(data: ProdukInput) {
    if (!store) return
    setLoading(true)
    const supabase = createClient()

    if (isEdit && product) {
      await (supabase as any).from('products').update({
        nama: data.nama,
        sku: data.sku || null,
        harga_beli: data.harga_beli,
        harga_jual: data.harga_jual,
        stok: data.stok,
        stok_minimum: data.stok_minimum,
        satuan: data.satuan,
        category_id: data.category_id || null,
      }).eq('id', product.id)
    } else {
      await (supabase as any).from('products').insert({
        store_id: store.id,
        nama: data.nama,
        sku: data.sku || null,
        harga_beli: data.harga_beli,
        harga_jual: data.harga_jual,
        stok: data.stok,
        stok_minimum: data.stok_minimum,
        satuan: data.satuan,
        category_id: data.category_id || null,
      })
    }

    setLoading(false)
    router.push('/produk')
    router.refresh()
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#181c27] text-[#64748b] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">{isEdit ? 'Edit Produk' : 'Tambah Produk'}</h1>
          <p className="text-[#64748b] text-sm mt-0.5">{isEdit ? 'Update informasi produk' : 'Tambah produk baru ke toko'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
        <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-5 space-y-4">
          <h2 className="font-bold text-sm text-[#94a3b8] uppercase tracking-wide">Informasi Produk</h2>

          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Nama Produk *</label>
            <input {...register('nama')} placeholder="Contoh: Indomie Goreng"
              className={`w-full px-4 py-3 rounded-xl bg-[#1e2333] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${errors.nama ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'}`} />
            {errors.nama && <p className="text-red-400 text-xs mt-1">{errors.nama.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">SKU / Kode Produk</label>
            <input {...register('sku')} placeholder="Opsional"
              className="w-full px-4 py-3 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Harga Beli (Rp)</label>
              <input {...register('harga_beli', { valueAsNumber: true })} type="number" placeholder="0"
                className={`w-full px-4 py-3 rounded-xl bg-[#1e2333] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${errors.harga_beli ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'}`} />
              {errors.harga_beli && <p className="text-red-400 text-xs mt-1">{errors.harga_beli.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Harga Jual (Rp) *</label>
              <input {...register('harga_jual', { valueAsNumber: true })} type="number" placeholder="5000"
                className={`w-full px-4 py-3 rounded-xl bg-[#1e2333] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${errors.harga_jual ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'}`} />
              {errors.harga_jual && <p className="text-red-400 text-xs mt-1">{errors.harga_jual.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Stok Awal *</label>
              <input {...register('stok', { valueAsNumber: true })} type="number" placeholder="0"
                className={`w-full px-4 py-3 rounded-xl bg-[#1e2333] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${errors.stok ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'}`} />
              {errors.stok && <p className="text-red-400 text-xs mt-1">{errors.stok.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Stok Minimum *</label>
              <input {...register('stok_minimum', { valueAsNumber: true })} type="number" placeholder="5"
                className={`w-full px-4 py-3 rounded-xl bg-[#1e2333] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${errors.stok_minimum ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'}`} />
              {errors.stok_minimum && <p className="text-red-400 text-xs mt-1">{errors.stok_minimum.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Satuan *</label>
            <select {...register('satuan')}
              className="w-full px-4 py-3 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white text-sm outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition-all">
              {SATUAN_PRODUK.map((s: string) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl border border-[#2a3045] text-[#64748b] hover:text-white hover:border-[#3a4560] text-sm font-semibold transition-all">
            Batal
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 rounded-xl bg-green-400 hover:bg-green-300 text-[#0a0d14] font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : isEdit ? 'Update Produk' : 'Simpan Produk'}
          </button>
        </div>
      </form>
    </div>
  )
}