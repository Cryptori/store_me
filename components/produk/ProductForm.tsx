'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowLeft, Upload, X, Plus, Tag } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { produkSchema, type ProdukInput } from '@/lib/validations'
import { SATUAN_PRODUK } from '@/lib/constants'
import type { Product, Category } from '@/types/database'

export default function ProdukForm({ product }: { product?: Product }) {
  const router = useRouter()
  const { store } = useStore()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [newKategori, setNewKategori] = useState('')
  const [showAddKategori, setShowAddKategori] = useState(false)
  const [addingKategori, setAddingKategori] = useState(false)

  // Foto state
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(product?.gambar_url ?? null)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEdit = !!product

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProdukInput>({
    resolver: zodResolver(produkSchema) as any,
    defaultValues: product ? {
      nama: product.nama,
      harga_jual: product.harga_jual,
      harga_beli: product.harga_beli ?? 0,
      stok: product.stok,
      stok_minimum: product.stok_minimum,
      satuan: product.satuan,
      category_id: product.category_id ?? '',
      sku: product.sku ?? '',
    } : {
      stok: 0,
      stok_minimum: 5,
      satuan: 'pcs',
      harga_beli: 0,
    }
  })

  const selectedCategoryId = watch('category_id')

  useEffect(() => {
    if (store) fetchCategories()
  }, [store])

  async function fetchCategories() {
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('categories')
      .select('*')
      .eq('store_id', store!.id)
      .order('nama')
    setCategories((data ?? []) as Category[])
  }

  async function handleAddKategori() {
    const nama = newKategori.trim()
    if (!nama || !store) return
    setAddingKategori(true)
    const supabase = createClient()
    const { data } = await (supabase as any)
      .from('categories')
      .insert({ store_id: store.id, nama })
      .select()
      .single()
    if (data) {
      setCategories(prev => [...prev, data as Category].sort((a, b) => a.nama.localeCompare(b.nama)))
      setValue('category_id', data.id)
    }
    setNewKategori('')
    setShowAddKategori(false)
    setAddingKategori(false)
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto maksimal 2MB')
      return
    }
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  function removeFoto() {
    setFotoFile(null)
    setFotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadFoto(productId: string): Promise<string | null> {
    if (!fotoFile || !store) return product?.gambar_url ?? null
    setUploadingFoto(true)
    const supabase = createClient()
    const ext = fotoFile.name.split('.').pop()
    const path = `${store.id}/${productId}.${ext}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, fotoFile, { upsert: true })

    if (error) {
      setUploadingFoto(false)
      return product?.gambar_url ?? null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(path)

    setUploadingFoto(false)
    return publicUrl
  }

  async function onSubmit(data: ProdukInput) {
    if (!store) return
    setLoading(true)
    const supabase = createClient()
    const db = supabase as any

    try {
      if (isEdit && product) {
        // Upload foto dulu kalau ada file baru
        const gambarUrl = fotoFile ? await uploadFoto(product.id) : fotoPreview

        await db.from('products').update({
          nama: data.nama,
          harga_jual: data.harga_jual,
          harga_beli: data.harga_beli || 0,
          stok: data.stok,
          stok_minimum: data.stok_minimum,
          satuan: data.satuan,
          category_id: data.category_id || null,
          sku: data.sku || null,
          gambar_url: gambarUrl,
          updated_at: new Date().toISOString(),
        }).eq('id', product.id)
      } else {
        // Insert dulu dapat ID, lalu upload foto
        const { data: newProduct } = await db.from('products').insert({
          store_id: store.id,
          nama: data.nama,
          harga_jual: data.harga_jual,
          harga_beli: data.harga_beli || 0,
          stok: data.stok,
          stok_minimum: data.stok_minimum,
          satuan: data.satuan,
          category_id: data.category_id || null,
          sku: data.sku || null,
          is_active: true,
        }).select().single()

        if (newProduct && fotoFile) {
          const gambarUrl = await uploadFoto(newProduct.id)
          if (gambarUrl) {
            await db.from('products').update({ gambar_url: gambarUrl }).eq('id', newProduct.id)
          }
        }
      }

      router.push('/produk')
      router.refresh()
    } catch {
      alert('Gagal menyimpan produk')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-[#181c27] text-[#64748b] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">{isEdit ? 'Edit Produk' : 'Tambah Produk'}</h1>
          <p className="text-[#64748b] text-sm mt-0.5">
            {isEdit ? 'Update informasi produk' : 'Tambah produk baru ke toko'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">

        {/* ── Foto Produk ── */}
        <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-5">
          <h2 className="font-bold text-sm text-[#94a3b8] uppercase tracking-wide mb-4">Foto Produk</h2>
          <div className="flex items-start gap-4">
            {/* Preview */}
            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[#2a3045] flex items-center justify-center flex-shrink-0 overflow-hidden bg-[#0f1117] relative">
              {fotoPreview ? (
                <>
                  <Image src={fotoPreview} alt="Foto produk" fill className="object-cover" />
                  <button type="button" onClick={removeFoto}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </>
              ) : (
                <span className="text-3xl">🛍️</span>
              )}
            </div>

            {/* Upload button */}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFotoChange}
                className="hidden"
                id="foto-input"
              />
              <label htmlFor="foto-input"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e2333] border border-[#2a3045] text-sm text-[#94a3b8] hover:border-green-500/40 hover:text-white cursor-pointer transition-all w-full justify-center">
                <Upload className="w-4 h-4" />
                {fotoPreview ? 'Ganti Foto' : 'Upload Foto'}
              </label>
              <p className="text-[10px] text-[#3a4560] mt-2">JPG, PNG, WebP — maks. 2MB</p>
              {uploadingFoto && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-green-400" />
                  <span className="text-xs text-green-400">Mengupload...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Informasi Produk ── */}
        <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-5 space-y-4">
          <h2 className="font-bold text-sm text-[#94a3b8] uppercase tracking-wide">Informasi Produk</h2>

          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Nama Produk *</label>
            <input {...register('nama')} placeholder="Contoh: Indomie Goreng"
              className={`w-full px-4 py-3 rounded-xl bg-[#1e2333] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${
                errors.nama ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'}`} />
            {errors.nama && <p className="text-red-400 text-xs mt-1">{errors.nama.message}</p>}
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Kategori</label>
            <div className="flex gap-2">
              <div className="flex-1 flex flex-wrap gap-1.5">
                {/* Chip "Semua" */}
                <button type="button"
                  onClick={() => setValue('category_id', '')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    !selectedCategoryId
                      ? 'bg-green-400/20 border-green-500/40 text-green-400'
                      : 'bg-[#1e2333] border-[#2a3045] text-[#64748b] hover:border-[#3a4560]'
                  }`}>
                  Tanpa Kategori
                </button>
                {categories.map(cat => (
                  <button key={cat.id} type="button"
                    onClick={() => setValue('category_id', cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      selectedCategoryId === cat.id
                        ? 'bg-green-400/20 border-green-500/40 text-green-400'
                        : 'bg-[#1e2333] border-[#2a3045] text-[#64748b] hover:border-[#3a4560] hover:text-white'
                    }`}>
                    <Tag className="w-3 h-3" /> {cat.nama}
                  </button>
                ))}

                {/* Tambah kategori baru */}
                {showAddKategori ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newKategori}
                      onChange={e => setNewKategori(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddKategori())}
                      placeholder="Nama kategori"
                      autoFocus
                      maxLength={30}
                      className="px-2 py-1 rounded-lg bg-[#1e2333] border border-green-500/40 text-white text-xs outline-none w-28"
                    />
                    <button type="button" onClick={handleAddKategori} disabled={addingKategori || !newKategori.trim()}
                      className="p-1.5 rounded-lg bg-green-400 text-[#0a0d14] disabled:opacity-50">
                      {addingKategori ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    </button>
                    <button type="button" onClick={() => { setShowAddKategori(false); setNewKategori('') }}
                      className="p-1.5 rounded-lg bg-[#1e2333] text-[#64748b] hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowAddKategori(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-[#3a4560] text-[#64748b] text-xs hover:border-green-500/40 hover:text-green-400 transition-all">
                    <Plus className="w-3 h-3" /> Baru
                  </button>
                )}
              </div>
            </div>
            {/* Hidden input untuk form */}
            <input type="hidden" {...register('category_id')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Harga Jual (Rp) *</label>
              <input {...register('harga_jual', { valueAsNumber: true })} type="number" placeholder="5000"
                className={`w-full px-4 py-3 rounded-xl bg-[#1e2333] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${
                  errors.harga_jual ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'}`} />
              {errors.harga_jual && <p className="text-red-400 text-xs mt-1">{errors.harga_jual.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Harga Beli (Rp)</label>
              <input {...register('harga_beli', { valueAsNumber: true })} type="number" placeholder="0"
                className="w-full px-4 py-3 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Stok Awal *</label>
              <input {...register('stok', { valueAsNumber: true })} type="number" placeholder="0"
                className={`w-full px-4 py-3 rounded-xl bg-[#1e2333] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${
                  errors.stok ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'}`} />
              {errors.stok && <p className="text-red-400 text-xs mt-1">{errors.stok.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Stok Minimum *</label>
              <input {...register('stok_minimum', { valueAsNumber: true })} type="number" placeholder="5"
                className={`w-full px-4 py-3 rounded-xl bg-[#1e2333] border text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 transition-all ${
                  errors.stok_minimum ? 'border-red-500/50' : 'border-[#2a3045] focus:border-green-500/50'}`} />
              {errors.stok_minimum && <p className="text-red-400 text-xs mt-1">{errors.stok_minimum.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">Satuan *</label>
              <select {...register('satuan')}
                className="w-full px-4 py-3 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white text-sm outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition-all">
                {SATUAN_PRODUK.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wide">SKU / Kode</label>
              <input {...register('sku')} placeholder="Opsional"
                className="w-full px-4 py-3 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white placeholder-[#3a4560] text-sm outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition-all" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-3 rounded-xl border border-[#2a3045] text-[#64748b] hover:text-white hover:border-[#3a4560] text-sm font-semibold transition-all">
            Batal
          </button>
          <button type="submit" disabled={loading || uploadingFoto}
            className="flex-1 py-3 rounded-xl bg-green-400 hover:bg-green-300 text-[#0a0d14] font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading || uploadingFoto
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
              : isEdit ? 'Update Produk' : 'Simpan Produk'}
          </button>
        </div>
      </form>
    </div>
  )
}