// types/supplier.ts

export type Supplier = {
  id: string
  store_id: string
  nama: string
  kontak_nama: string | null
  telepon: string | null
  email: string | null
  alamat: string | null
  catatan: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type POStatus = 'draft' | 'dikirim' | 'sebagian_diterima' | 'diterima' | 'dibatalkan'

export type PurchaseOrder = {
  id: string
  store_id: string
  supplier_id: string
  nomor_po: string
  status: POStatus
  tanggal_po: string
  tanggal_kirim: string | null
  tanggal_terima: string | null
  total: number
  sudah_dibayar: number
  catatan: string | null
  created_at: string
  updated_at: string
  // joined
  supplier?: Supplier
  items?: POItem[]
}

export type POItem = {
  id: string
  po_id: string
  product_id: string | null
  nama_produk: string
  qty_pesan: number
  qty_diterima: number
  harga_beli: number
  subtotal: number
}

export type SupplierDebt = {
  id: string
  store_id: string
  supplier_id: string
  po_id: string | null
  jumlah: number
  sudah_dibayar: number
  sisa: number
  status: 'belum_lunas' | 'lunas'
  jatuh_tempo: string | null
  catatan: string | null
  created_at: string
  // joined
  supplier?: Supplier
  po?: PurchaseOrder
}

export const PO_STATUS_LABEL: Record<POStatus, string> = {
  draft:             'Draft',
  dikirim:           'Dikirim',
  sebagian_diterima: 'Sebagian Diterima',
  diterima:          'Diterima',
  dibatalkan:        'Dibatalkan',
}

export const PO_STATUS_COLOR: Record<POStatus, string> = {
  draft:             'text-[#64748b]  bg-[#1e2333]       border-[#2a3045]',
  dikirim:           'text-blue-400   bg-blue-400/10     border-blue-400/20',
  sebagian_diterima: 'text-yellow-400 bg-yellow-400/10   border-yellow-400/20',
  diterima:          'text-green-400  bg-green-400/10    border-green-400/20',
  dibatalkan:        'text-red-400    bg-red-400/10      border-red-400/20',
}