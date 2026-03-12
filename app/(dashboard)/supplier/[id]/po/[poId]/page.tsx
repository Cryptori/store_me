'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { ArrowLeft, CheckCircle, Printer, Loader2, Package } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { formatRupiah } from '@/lib/utils'
import type { PurchaseOrder, POItem } from '@/types/supplier'
import { PO_STATUS_LABEL, PO_STATUS_COLOR } from '@/types/supplier'
import TerimaBarangModal from '@/components/supplier/TerimaBarangModal'

export default function PODetailPage() {
  const { id: supplierId, poId } = useParams<{ id: string; poId: string }>()
  const { store } = useStore()
  const [po, setPo]               = useState<PurchaseOrder | null>(null)
  const [items, setItems]         = useState<POItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [showTerima, setShowTerima] = useState(false)

  useEffect(() => { if (store && poId) fetchData() }, [store, poId])

  async function fetchData() {
    setLoading(true)
    const db = createClient() as any
    const [{ data: poData }, { data: itemsData }] = await Promise.all([
      db.from('purchase_orders').select('*, supplier:suppliers(*)').eq('id', poId).single(),
      db.from('purchase_order_items').select('*').eq('po_id', poId).order('nama_produk'),
    ])
    setPo(poData)
    setItems((itemsData ?? []) as POItem[])
    setLoading(false)
  }

  function exportPDF() {
    if (!po) return
    const rows = items.map(i => `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee">${i.nama_produk}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${i.qty_pesan}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${i.qty_diterima}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${formatRupiah(i.harga_beli)}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${formatRupiah(i.subtotal)}</td>
      </tr>`).join('')

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>PO ${po.nomor_po}</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:13px;color:#111;padding:24px;max-width:800px;margin:0 auto}
        h1{font-size:20px;margin:0 0 4px} .meta{color:#666;font-size:12px;margin-bottom:20px}
        table{width:100%;border-collapse:collapse} th{background:#f3f4f6;padding:8px;text-align:left;font-size:12px}
        .total{text-align:right;margin-top:12px;font-size:15px;font-weight:bold}
        .badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;background:#e0fce7;color:#166534}
      </style></head><body>
      <h1>Purchase Order</h1>
      <div class="meta">
        <b>No. PO:</b> ${po.nomor_po} &nbsp;|&nbsp;
        <b>Tanggal:</b> ${new Date(po.tanggal_po).toLocaleDateString('id-ID')} &nbsp;|&nbsp;
        <b>Status:</b> <span class="badge">${PO_STATUS_LABEL[po.status]}</span>
      </div>
      <p><b>Supplier:</b> ${po.supplier?.nama ?? '-'}</p>
      ${po.supplier?.telepon ? `<p><b>Telepon:</b> ${po.supplier.telepon}</p>` : ''}
      ${po.catatan ? `<p><b>Catatan:</b> ${po.catatan}</p>` : ''}
      <table>
        <thead><tr>
          <th>Nama Produk</th><th style="text-align:center">Qty Pesan</th>
          <th style="text-align:center">Qty Terima</th>
          <th style="text-align:right">Harga Beli</th><th style="text-align:right">Subtotal</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="total">Total: ${formatRupiah(po.total)}</div>
      <div style="margin-top:8px;color:#666;font-size:11px">Sudah dibayar: ${formatRupiah(po.sudah_dibayar)} | Sisa: ${formatRupiah(po.total - po.sudah_dibayar)}</div>
      </body></html>`

    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print() }, 300)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-5 h-5 animate-spin text-green-400" />
    </div>
  )
  if (!po) return <div className="p-6 text-[#64748b]">PO tidak ditemukan</div>

  const sisa = po.total - po.sudah_dibayar
  const canTerima = po.status === 'dikirim' || po.status === 'sebagian_diterima' || po.status === 'draft'

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/supplier/${supplierId}/po`}
          className="p-2 rounded-xl bg-[#181c27] border border-[#2a3045] text-[#64748b] hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white">{po.nomor_po}</h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${PO_STATUS_COLOR[po.status]}`}>
              {PO_STATUS_LABEL[po.status]}
            </span>
          </div>
          <p className="text-[#64748b] text-xs mt-0.5">
            {po.supplier?.nama} · {new Date(po.tanggal_po).toLocaleDateString('id-ID')}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF}
            className="p-2 rounded-xl bg-[#181c27] border border-[#2a3045] text-[#64748b] hover:text-white transition-colors" title="Export PDF">
            <Printer className="w-4 h-4" />
          </button>
          {canTerima && (
            <button onClick={() => setShowTerima(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
              <CheckCircle className="w-4 h-4" /> Terima Barang
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total PO', value: formatRupiah(po.total), color: 'text-white' },
          { label: 'Sudah Dibayar', value: formatRupiah(po.sudah_dibayar), color: 'text-green-400' },
          { label: 'Sisa Hutang', value: formatRupiah(sisa), color: sisa > 0 ? 'text-red-400' : 'text-[#64748b]' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#181c27] border border-[#2a3045] rounded-xl p-3 text-center">
            <div className="text-[10px] text-[#64748b] mb-1">{label}</div>
            <div className={`font-black text-sm ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Items */}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a3045]">
          <span className="text-sm font-black text-white">Item Pesanan</span>
        </div>
        <div className="divide-y divide-[#2a3045]">
          {items.map(item => {
            const pct = item.qty_pesan > 0 ? Math.round(item.qty_diterima / item.qty_pesan * 100) : 0
            return (
              <div key={item.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-white text-sm">{item.nama_produk}</span>
                  <span className="font-mono text-sm text-green-400">{formatRupiah(item.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#64748b] mb-1.5">
                  <span>{formatRupiah(item.harga_beli)} × {item.qty_pesan} pcs</span>
                  <span>Diterima: {item.qty_diterima}/{item.qty_pesan}</span>
                </div>
                <div className="h-1 bg-[#1e2333] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-green-400' : 'bg-yellow-400'}`}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {po.catatan && (
        <div className="mt-3 bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
          <div className="text-xs font-bold text-[#64748b] mb-1">Catatan</div>
          <div className="text-sm text-[#94a3b8]">{po.catatan}</div>
        </div>
      )}

      {showTerima && (
        <TerimaBarangModal
          po={po}
          items={items}
          onSave={() => { fetchData(); setShowTerima(false) }}
          onClose={() => setShowTerima(false)}
        />
      )}
    </div>
  )
}