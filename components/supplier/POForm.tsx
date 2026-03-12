'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Loader2, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/utils'
import type { Supplier, PurchaseOrder, POItem } from '@/types/supplier'
import type { Product } from '@/types/database'

type DraftItem = { product_id: string | null; nama_produk: string; qty_pesan: number; harga_beli: number }

type Props = {
  storeId: string
  supplier: Supplier
  onSave: (po: PurchaseOrder) => void
  onClose: () => void
}

export default function POForm({ storeId, supplier, onSave, onClose }: Props) {
  const [products, setProducts]       = useState<Product[]>([])
  const [items, setItems]             = useState<DraftItem[]>([{ product_id: null, nama_produk: '', qty_pesan: 1, harga_beli: 0 }])
  const [tanggalKirim, setTanggalKirim] = useState('')
  const [catatan, setCatatan]         = useState('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await (createClient() as any).from('products').select('id, nama, harga_beli, sku').eq('store_id', storeId).eq('is_active', true).order('nama')
      setProducts((data ?? []) as Product[])
    }
    fetchProducts()
  }, [storeId])

  function addItem() {
    setItems(prev => [...prev, { product_id: null, nama_produk: '', qty_pesan: 1, harga_beli: 0 }])
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  function updateItem(idx: number, field: keyof DraftItem, value: any) {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item
      if (field === 'product_id' && value) {
        const p = products.find(p => p.id === value)
        return { ...item, product_id: value, nama_produk: p?.nama ?? '', harga_beli: p?.harga_beli ?? 0 }
      }
      return { ...item, [field]: value }
    }))
  }

  const total = items.reduce((s, i) => s + i.qty_pesan * i.harga_beli, 0)

  async function handleSave() {
    const validItems = items.filter(i => i.nama_produk.trim() && i.qty_pesan > 0)
    if (validItems.length === 0) { setError('Tambahkan minimal 1 item'); return }
    setSaving(true)
    setError('')

    const db = createClient() as any
    const { data: nomorData } = await db.rpc('generate_nomor_po', { p_store_id: storeId })

    const { data: po, error: poErr } = await db
      .from('purchase_orders')
      .insert({ store_id: storeId, supplier_id: supplier.id, nomor_po: nomorData, total, tanggal_kirim: tanggalKirim || null, catatan: catatan || null })
      .select().single()

    if (poErr || !po) { setError('Gagal membuat PO'); setSaving(false); return }

    await db.from('purchase_order_items').insert(
      validItems.map(i => ({ po_id: po.id, product_id: i.product_id, nama_produk: i.nama_produk, qty_pesan: i.qty_pesan, harga_beli: i.harga_beli }))
    )

    // Buat hutang supplier otomatis
    await db.from('supplier_debts').insert({
      store_id: storeId, supplier_id: supplier.id, po_id: po.id,
      jumlah: total, sudah_dibayar: 0, status: 'belum_lunas',
    })

    setSaving(false)
    onSave({ ...po, supplier, items: validItems as any })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-2xl bg-[#181c27] border border-[#2a3045] rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#181c27] border-b border-[#2a3045] p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-black text-white">Buat Purchase Order</h2>
            <p className="text-xs text-[#64748b]">{supplier.nama}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-[#64748b] hover:text-white hover:bg-[#1e2333]"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-4 space-y-4">
          {/* Tanggal kirim */}
          <div>
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Estimasi Pengiriman</label>
            <input type="date" value={tanggalKirim} onChange={e => setTanggalKirim(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white text-sm outline-none focus:border-green-500/40" />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-wide">Item Pesanan</label>
              <button onClick={addItem} className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 font-bold">
                <Plus className="w-3.5 h-3.5" /> Tambah Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="bg-[#1e2333] border border-[#2a3045] rounded-xl p-3">
                  <div className="grid grid-cols-12 gap-2 items-end">
                    {/* Produk */}
                    <div className="col-span-12 md:col-span-5">
                      <label className="text-[10px] text-[#64748b] font-bold uppercase mb-1 block">Produk</label>
                      <select
                        value={item.product_id ?? ''}
                        onChange={e => updateItem(idx, 'product_id', e.target.value || null)}
                        className="w-full px-3 py-2 bg-[#0f1117] border border-[#2a3045] rounded-lg text-white text-xs outline-none">
                        <option value="">-- Pilih Produk --</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                      </select>
                    </div>
                    {/* Nama manual */}
                    <div className="col-span-12 md:col-span-3">
                      <label className="text-[10px] text-[#64748b] font-bold uppercase mb-1 block">Nama Item</label>
                      <input value={item.nama_produk} onChange={e => updateItem(idx, 'nama_produk', e.target.value)}
                        placeholder="Atau ketik manual"
                        className="w-full px-3 py-2 bg-[#0f1117] border border-[#2a3045] rounded-lg text-white text-xs outline-none focus:border-green-500/40" />
                    </div>
                    {/* Qty */}
                    <div className="col-span-4 md:col-span-2">
                      <label className="text-[10px] text-[#64748b] font-bold uppercase mb-1 block">Qty</label>
                      <input type="number" min="1" value={item.qty_pesan} onChange={e => updateItem(idx, 'qty_pesan', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#0f1117] border border-[#2a3045] rounded-lg text-white text-xs outline-none focus:border-green-500/40" />
                    </div>
                    {/* Harga */}
                    <div className="col-span-6 md:col-span-2">
                      <label className="text-[10px] text-[#64748b] font-bold uppercase mb-1 block">Harga Beli</label>
                      <input type="number" min="0" value={item.harga_beli} onChange={e => updateItem(idx, 'harga_beli', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#0f1117] border border-[#2a3045] rounded-lg text-white text-xs outline-none focus:border-green-500/40" />
                    </div>
                    {/* Hapus */}
                    <div className="col-span-2 md:col-span-0 flex justify-end">
                      {items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="p-1.5 text-[#3a4560] hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-[#64748b] mt-1">
                    Subtotal: {formatRupiah(item.qty_pesan * item.harga_beli)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-1.5">Catatan</label>
            <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={2}
              className="w-full px-4 py-2.5 bg-[#1e2333] border border-[#2a3045] rounded-xl text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40 resize-none" />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Total + submit */}
          <div className="flex items-center justify-between pt-2 border-t border-[#2a3045]">
            <div>
              <div className="text-xs text-[#64748b]">Total PO</div>
              <div className="text-xl font-black text-white">{formatRupiah(total)}</div>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors disabled:opacity-50">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</> : 'Buat PO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}