'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart2, TrendingUp, Package, Users, Truck,
  FileDown, FileSpreadsheet, Loader2, Lock,
  ShoppingBag, ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useStore } from '@/hooks/useStore'
import { useFreemium } from '@/hooks/useFreemium'
import { formatRupiah } from '@/lib/utils'
import {
  exportPDFPenjualan, exportPDFLabaRugi, exportPDFStok,
  exportExcelPenjualan, exportExcelLabaRugi, exportExcelStok,
  exportExcelHutangPelanggan, exportExcelHutangSupplier,
} from '@/lib/exportLaporan'

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'penjualan',         label: 'Penjualan',   icon: BarChart2  },
  { id: 'terlaris',          label: 'Terlaris',    icon: TrendingUp },
  { id: 'laba_rugi',         label: 'Laba Rugi',   icon: ShoppingBag},
  { id: 'stok',              label: 'Stok',        icon: Package    },
  { id: 'hutang_pelanggan',  label: 'Piutang',     icon: Users      },
  { id: 'hutang_supplier',   label: 'Hutang',      icon: Truck      },
] as const
type TabId = typeof TABS[number]['id']

const PERIODS = [
  { label: '7 Hari',     dari: (now: Date) => { const d = new Date(now); d.setDate(d.getDate()-6); return d.toISOString().slice(0,10) } },
  { label: '30 Hari',    dari: (now: Date) => { const d = new Date(now); d.setDate(d.getDate()-29); return d.toISOString().slice(0,10) } },
  { label: 'Bulan Ini',  dari: (now: Date) => new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10) },
  { label: 'Bulan Lalu', dari: (now: Date) => new Date(now.getFullYear(), now.getMonth()-1, 1).toISOString().slice(0,10),
    sampai: (now: Date) => new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0,10) },
  { label: 'Custom',     dari: () => '' },
]

export default function LaporanPage() {
  const { store }        = useStore()
  const { isPro }        = useFreemium()
  const today            = new Date().toISOString().slice(0, 10)

  const [tab, setTab]           = useState<TabId>('penjualan')
  const [dari, setDari]         = useState(() => { const d = new Date(); d.setDate(d.getDate()-29); return d.toISOString().slice(0,10) })
  const [sampai, setSampai]     = useState(today)
  const [period, setPeriod]     = useState(1)   // index ke PERIODS
  const [data, setData]         = useState<any>(null)
  const [loading, setLoading]   = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!store || !isPro) return
    setLoading(true)
    setData(null)
    const db = createClient() as any
    try {
      let result: any = null
      if (tab === 'penjualan') {
        const { data: d } = await db.rpc('get_laporan_penjualan', { p_store_id: store.id, p_dari: dari, p_sampai: sampai })
        result = d
      } else if (tab === 'terlaris') {
        const { data: d } = await db.rpc('get_produk_terlaris', { p_store_id: store.id, p_dari: dari, p_sampai: sampai, p_limit: 20 })
        result = d
      } else if (tab === 'laba_rugi') {
        const { data: d } = await db.rpc('get_laporan_laba_rugi', { p_store_id: store.id, p_dari: dari, p_sampai: sampai })
        result = d
      } else if (tab === 'stok') {
        const { data: d } = await db.rpc('get_laporan_stok', { p_store_id: store.id })
        result = d
      } else if (tab === 'hutang_pelanggan') {
        const { data: d } = await db.rpc('get_laporan_hutang_pelanggan', { p_store_id: store.id })
        result = d
      } else if (tab === 'hutang_supplier') {
        const { data: d } = await db.rpc('get_laporan_hutang_supplier', { p_store_id: store.id })
        result = d
      }
      setData(result)
    } finally { setLoading(false) }
  }, [store, isPro, tab, dari, sampai])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Period preset ──────────────────────────────────────────────────────────
  function applyPeriod(idx: number) {
    setPeriod(idx)
    if (idx === 4) return // custom — biarkan user isi manual
    const now = new Date()
    const p = PERIODS[idx]
    setDari(p.dari(now))
    setSampai(p.sampai ? p.sampai(now) : today)
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  async function handleExport(fmt: 'pdf' | 'xlsx') {
    if (!data || !store) return
    setExporting(fmt)
    try {
      if (fmt === 'pdf') {
        if (tab === 'penjualan')   exportPDFPenjualan(data, store.nama, dari, sampai)
        if (tab === 'laba_rugi')   exportPDFLabaRugi(data, store.nama, dari, sampai)
        if (tab === 'stok')        exportPDFStok(data, store.nama)
      } else {
        if (tab === 'penjualan')          await exportExcelPenjualan(data, store.nama, dari, sampai)
        if (tab === 'laba_rugi')          await exportExcelLabaRugi(data, store.nama, dari, sampai)
        if (tab === 'stok')               await exportExcelStok(data, store.nama)
        if (tab === 'hutang_pelanggan')   await exportExcelHutangPelanggan(data, store.nama)
        if (tab === 'hutang_supplier')    await exportExcelHutangSupplier(data, store.nama)
      }
    } finally { setExporting(null) }
  }

  const canExportPDF  = ['penjualan', 'laba_rugi', 'stok'].includes(tab)
  const canExportXLSX = tab !== 'terlaris'
  const needsDateFilter = !['stok', 'hutang_pelanggan', 'hutang_supplier'].includes(tab)

  if (!isPro) return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-green-400/10 border border-green-400/20 flex items-center justify-center mb-4">
        <Lock className="w-6 h-6 text-green-400" />
      </div>
      <h1 className="text-xl font-black text-white mb-2">Laporan & Export</h1>
      <p className="text-[#64748b] text-sm mb-6">Laporan lengkap dengan export PDF & Excel tersedia untuk akun PRO.</p>
      <Link href="/upgrade"
        className="inline-flex items-center gap-2 px-6 py-3 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
        Upgrade ke PRO
      </Link>
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 md:px-6 pt-4 md:pt-6 pb-3 border-b border-[#2a3045]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-black text-white">Laporan</h1>
          <div className="flex gap-2">
            {canExportPDF && (
              <button onClick={() => handleExport('pdf')} disabled={!data || loading || !!exporting}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#181c27] border border-[#2a3045] hover:border-red-400/40 text-[#64748b] hover:text-red-400 rounded-xl text-xs font-semibold transition-all disabled:opacity-40">
                {exporting === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                PDF
              </button>
            )}
            {canExportXLSX && (
              <button onClick={() => handleExport('xlsx')} disabled={!data || loading || !!exporting}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#181c27] border border-[#2a3045] hover:border-green-500/40 text-[#64748b] hover:text-green-400 rounded-xl text-xs font-semibold transition-all disabled:opacity-40">
                {exporting === 'xlsx' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                Excel
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  tab === t.id
                    ? 'bg-green-400/20 border border-green-500/40 text-green-400'
                    : 'bg-[#181c27] border border-[#2a3045] text-[#64748b] hover:text-white'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Date filter */}
        {needsDateFilter && (
          <div className="flex gap-2 mt-3 flex-wrap">
            <div className="flex gap-1">
              {PERIODS.slice(0, 4).map((p, i) => (
                <button key={p.label} onClick={() => applyPeriod(i)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    period === i ? 'bg-[#2a3045] text-white' : 'text-[#64748b] hover:text-white'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <input type="date" value={dari} onChange={e => { setDari(e.target.value); setPeriod(4) }}
                className="px-2 py-1.5 bg-[#181c27] border border-[#2a3045] rounded-lg text-white text-xs outline-none focus:border-green-500/40" />
              <span className="text-[#3a4560] text-xs">–</span>
              <input type="date" value={sampai} onChange={e => { setSampai(e.target.value); setPeriod(4) }}
                className="px-2 py-1.5 bg-[#181c27] border border-[#2a3045] rounded-lg text-white text-xs outline-none focus:border-green-500/40" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-green-400" />
          </div>
        ) : !data ? null : (
          <>
            {tab === 'penjualan'        && <TabPenjualan  data={data} />}
            {tab === 'terlaris'         && <TabTerlaris   data={data} />}
            {tab === 'laba_rugi'        && <TabLabaRugi   data={data} />}
            {tab === 'stok'             && <TabStok       data={data} />}
            {tab === 'hutang_pelanggan' && <TabHutangPelanggan data={data} />}
            {tab === 'hutang_supplier'  && <TabHutangSupplier data={data} />}
          </>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = '' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
      <div className="text-xs text-[#64748b] mb-1">{label}</div>
      <div className={`text-xl font-black ${color || 'text-white'}`}>{value}</div>
      {sub && <div className="text-[10px] text-[#3a4560] mt-0.5">{sub}</div>}
    </div>
  )
}

function TabPenjualan({ data }: { data: any }) {
  const perHari = (data.per_hari ?? []).sort((a: any, b: any) => a.tanggal.localeCompare(b.tanggal))
  const max = Math.max(...perHari.map((h: any) => h.total), 1)
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Total Penjualan" value={formatRupiah(data.total_penjualan)} color="text-green-400" />
        <StatCard label="Jumlah Transaksi" value={String(data.total_transaksi)} color="text-cyan-400" />
        <StatCard label="Rata-rata/Transaksi" value={formatRupiah(data.rata_transaksi)} />
        {data.total_diskon > 0 && <StatCard label="Total Diskon" value={formatRupiah(data.total_diskon)} color="text-yellow-400" />}
      </div>
      {perHari.length > 0 && (
        <div className="bg-[#181c27] border border-[#2a3045] rounded-xl p-4">
          <div className="text-xs font-bold text-[#94a3b8] uppercase tracking-wide mb-4">Penjualan per Hari</div>
          <div className="space-y-2">
            {perHari.map((h: any) => (
              <div key={h.tanggal} className="flex items-center gap-3">
                <span className="text-xs text-[#64748b] w-24 flex-shrink-0">{new Date(h.tanggal).toLocaleDateString('id-ID', { day:'2-digit', month:'short' })}</span>
                <div className="flex-1 h-5 bg-[#1e2333] rounded-full overflow-hidden">
                  <div className="h-full bg-green-400/80 rounded-full transition-all"
                    style={{ width: `${(h.total / max) * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-white w-28 text-right flex-shrink-0">{formatRupiah(h.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TabTerlaris({ data }: { data: any }) {
  const items = Array.isArray(data) ? data : []
  const max = Math.max(...items.map((p: any) => p.total_penjualan), 1)
  return (
    <div className="max-w-2xl">
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a3045] flex items-center justify-between">
          <span className="text-sm font-black text-white">Produk Terlaris</span>
          <span className="text-xs text-[#64748b]">{items.length} produk</span>
        </div>
        <div className="divide-y divide-[#2a3045]">
          {items.length === 0 ? (
            <div className="text-center py-10 text-[#64748b] text-sm">Belum ada data penjualan</div>
          ) : items.map((p: any, i: number) => (
            <div key={p.product_id ?? i} className="px-4 py-3">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs font-black text-[#3a4560] w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{p.nama_produk}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-black text-green-400">{formatRupiah(p.total_penjualan)}</div>
                  <div className="text-[10px] text-[#64748b]">{p.total_qty} pcs</div>
                </div>
              </div>
              <div className="ml-8 h-1 bg-[#1e2333] rounded-full overflow-hidden">
                <div className="h-full bg-green-400/60 rounded-full" style={{ width: `${(p.total_penjualan / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabLabaRugi({ data }: { data: any }) {
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Omzet" value={formatRupiah(data.omzet)} color="text-cyan-400" />
        <StatCard label="Total Diskon" value={formatRupiah(data.diskon)} color="text-yellow-400" />
        <StatCard label="Pendapatan Bersih" value={formatRupiah(data.pendapatan_bersih)} />
        <StatCard label="HPP (Modal)" value={formatRupiah(data.hpp)} color="text-red-400" />
        <StatCard label="Laba Kotor" value={formatRupiah(data.laba_kotor)} color={data.laba_kotor >= 0 ? 'text-green-400' : 'text-red-400'} />
        <StatCard label="Margin" value={`${data.margin_pct}%`} color={data.margin_pct >= 20 ? 'text-green-400' : 'text-yellow-400'} />
      </div>
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a3045]">
          <span className="text-sm font-black text-white">Laba per Produk</span>
        </div>
        <div className="divide-y divide-[#2a3045] max-h-80 overflow-y-auto">
          {(data.detail ?? []).map((p: any, i: number) => (
            <div key={i} className="px-4 py-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{p.nama_produk}</div>
                <div className="text-[10px] text-[#64748b]">HPP: {formatRupiah(p.hpp)}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-sm font-black ${p.laba >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatRupiah(p.laba)}</div>
                <div className="text-[10px] text-[#64748b]">{p.margin_pct}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabStok({ data }: { data: any }) {
  const [showAll, setShowAll] = useState(false)
  const products = data.semua_produk ?? []
  const displayed = showAll ? products : products.slice(0, 15)
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total SKU" value={String(data.total_sku)} color="text-cyan-400" />
        <StatCard label="Total Stok" value={String(data.total_stok)} />
        <StatCard label="Nilai HPP" value={formatRupiah(data.nilai_hpp)} color="text-red-400" />
        <StatCard label="Nilai Jual" value={formatRupiah(data.nilai_jual)} color="text-green-400" />
      </div>
      {(data.stok_menipis ?? []).length > 0 && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4">
          <div className="text-xs font-bold text-red-400 mb-2">⚠ Stok Menipis</div>
          <div className="flex flex-wrap gap-2">
            {data.stok_menipis.map((p: any) => (
              <span key={p.id} className="text-xs px-2 py-1 bg-red-400/10 border border-red-400/20 text-red-400 rounded-lg">
                {p.nama} ({p.stok} {p.satuan})
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a3045]">
          <span className="text-sm font-black text-white">Semua Produk</span>
        </div>
        <div className="divide-y divide-[#2a3045]">
          {displayed.map((p: any) => (
            <div key={p.id} className="px-4 py-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{p.nama}</div>
                {p.sku && <div className="text-[10px] text-[#3a4560] font-mono">{p.sku}</div>}
              </div>
              <div className="text-center w-16 flex-shrink-0">
                <div className="text-sm font-black text-white">{p.stok}</div>
                <div className="text-[10px] text-[#64748b]">{p.satuan}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-bold text-green-400">{formatRupiah(p.nilai_hpp)}</div>
                <div className="text-[10px] text-[#64748b]">HPP</div>
              </div>
            </div>
          ))}
        </div>
        {products.length > 15 && (
          <button onClick={() => setShowAll(v => !v)}
            className="w-full py-2.5 text-xs text-[#64748b] hover:text-white border-t border-[#2a3045] transition-colors">
            {showAll ? 'Sembunyikan' : `Lihat semua ${products.length} produk`}
          </button>
        )}
      </div>
    </div>
  )
}

function TabHutangPelanggan({ data }: { data: any }) {
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Piutang" value={formatRupiah(data.total_hutang)} color="text-red-400" />
        <StatCard label="Jumlah Debitur" value={String(data.jumlah_debitur)} />
      </div>
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a3045]"><span className="text-sm font-black text-white">Detail Piutang</span></div>
        <div className="divide-y divide-[#2a3045]">
          {(data.detail ?? []).length === 0
            ? <div className="text-center py-10 text-[#64748b] text-sm">Tidak ada piutang pelanggan 🎉</div>
            : (data.detail ?? []).map((d: any) => (
              <div key={d.customer_id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{d.nama}</div>
                  {d.telepon && <div className="text-xs text-[#64748b]">{d.telepon}</div>}
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-red-400">{formatRupiah(d.sisa)}</div>
                  <div className="text-[10px] text-[#64748b]">{d.jml_tagihan} tagihan</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

function TabHutangSupplier({ data }: { data: any }) {
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Hutang Supplier" value={formatRupiah(data.total_hutang)} color="text-orange-400" />
        <StatCard label="Jumlah Supplier" value={String(data.jumlah_supplier)} />
      </div>
      <div className="bg-[#181c27] border border-[#2a3045] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#2a3045]"><span className="text-sm font-black text-white">Detail Hutang Supplier</span></div>
        <div className="divide-y divide-[#2a3045]">
          {(data.detail ?? []).length === 0
            ? <div className="text-center py-10 text-[#64748b] text-sm">Tidak ada hutang ke supplier 🎉</div>
            : (data.detail ?? []).map((d: any) => (
              <div key={d.supplier_id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{d.nama}</div>
                  {d.telepon && <div className="text-xs text-[#64748b]">{d.telepon}</div>}
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-orange-400">{formatRupiah(d.sisa)}</div>
                  <div className="text-[10px] text-[#64748b]">{d.jml_po} PO</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}