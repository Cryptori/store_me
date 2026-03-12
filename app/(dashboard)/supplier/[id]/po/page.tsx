'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Plus, ArrowLeft, Package, Loader2, Eye } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { formatRupiah } from '@/lib/utils'
import type { Supplier, PurchaseOrder } from '@/types/supplier'
import { PO_STATUS_LABEL, PO_STATUS_COLOR } from '@/types/supplier'
import POForm from '@/components/supplier/POForm'

export default function SupplierPOPage() {
  const { id: supplierId } = useParams<{ id: string }>()
  const { store } = useStore()
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [orders, setOrders]     = useState<PurchaseOrder[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { if (store && supplierId) fetchData() }, [store, supplierId])

  async function fetchData() {
    setLoading(true)
    const db = createClient() as any
    const [{ data: sup }, { data: pos }] = await Promise.all([
      db.from('suppliers').select('*').eq('id', supplierId).single(),
      db.from('purchase_orders')
        .select('*')
        .eq('store_id', store!.id)
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: false }),
    ])
    setSupplier(sup)
    setOrders((pos ?? []) as PurchaseOrder[])
    setLoading(false)
  }

  const totalHutang = orders
    .filter(o => o.status === 'diterima' || o.status === 'sebagian_diterima')
    .reduce((s, o) => s + (o.total - o.sudah_dibayar), 0)

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/supplier"
          className="p-2 rounded-xl bg-[#181c27] border border-[#2a3045] text-[#64748b] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-black text-white">{supplier?.nama ?? 'Supplier'}</h1>
          <p className="text-[#64748b] text-xs mt-0.5">{orders.length} Purchase Order</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
          <Plus className="w-4 h-4" /> Buat PO
        </button>
      </div>

      {/* Summary */}
      {totalHutang > 0 && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 mb-4">
          <div className="text-xs text-red-400/70 font-semibold mb-0.5">Hutang ke Supplier</div>
          <div className="text-xl font-black text-red-400">{formatRupiah(totalHutang)}</div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-green-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-10 h-10 text-[#2a3045] mx-auto mb-3" />
          <div className="text-[#64748b] text-sm">Belum ada PO untuk supplier ini</div>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map(po => {
            const sisa = po.total - po.sudah_dibayar
            return (
              <Link key={po.id} href={`/supplier/${supplierId}/po/${po.id}`}
                className="flex items-center gap-4 bg-[#181c27] border border-[#2a3045] hover:border-[#3a4560] rounded-xl p-4 transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-white text-sm">{po.nomor_po}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${PO_STATUS_COLOR[po.status]}`}>
                      {PO_STATUS_LABEL[po.status]}
                    </span>
                  </div>
                  <div className="text-xs text-[#64748b]">
                    {new Date(po.tanggal_po).toLocaleDateString('id-ID')}
                    {po.tanggal_kirim && ` · Kirim: ${new Date(po.tanggal_kirim).toLocaleDateString('id-ID')}`}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-black text-white text-sm">{formatRupiah(po.total)}</div>
                  {sisa > 0 && <div className="text-[10px] text-red-400">Sisa: {formatRupiah(sisa)}</div>}
                </div>
                <Eye className="w-4 h-4 text-[#3a4560] flex-shrink-0" />
              </Link>
            )
          })}
        </div>
      )}

      {showForm && supplier && store && (
        <POForm
          storeId={store.id}
          supplier={supplier}
          onSave={saved => { setOrders(prev => [saved, ...prev]); setShowForm(false) }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}