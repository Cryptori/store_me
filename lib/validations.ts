import { z } from 'zod'

// Auth
export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
  namaToko: z.string().min(2, 'Nama toko minimal 2 karakter').max(50),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Password tidak sama',
  path: ['confirmPassword'],
})

// Produk
export const produkSchema = z.object({
  nama: z.string().min(1, 'Nama produk wajib diisi'),
  sku: z.string().optional(),
  harga_beli: z.coerce.number().min(0, 'Harga beli tidak boleh negatif'),
  harga_jual: z.coerce.number().min(1, 'Harga jual wajib diisi'),
  stok: z.coerce.number().int().min(0, 'Stok tidak boleh negatif'),
  stok_minimum: z.coerce.number().int().min(0).default(5),
  satuan: z.string().default('pcs'),
  category_id: z.string().optional(),
})

// Pelanggan
export const pelangganSchema = z.object({
  nama: z.string().min(1, 'Nama pelanggan wajib diisi'),
  telepon: z.string().optional(),
  alamat: z.string().optional(),
})

// Transaksi (kasir)
export const transaksiSchema = z.object({
  customer_id: z.string().optional(),
  metode_bayar: z.enum(['tunai', 'transfer', 'qris', 'hutang']),
  bayar: z.coerce.number().min(0).optional(),
  catatan: z.string().optional(),
  items: z.array(z.object({
    product_id: z.string(),
    nama_produk: z.string(),
    harga_jual: z.coerce.number(),
    qty: z.coerce.number().int().min(1),
    subtotal: z.coerce.number(),
  })).min(1, 'Keranjang kosong'),
})

// Hutang
export const hutangSchema = z.object({
  customer_id: z.string().min(1, 'Pilih pelanggan'),
  jumlah: z.coerce.number().min(1, 'Jumlah hutang wajib diisi'),
  jatuh_tempo: z.string().optional(),
  catatan: z.string().optional(),
})

// Pembayaran hutang
export const bayarHutangSchema = z.object({
  jumlah_bayar: z.coerce.number().min(1, 'Jumlah bayar wajib diisi'),
  catatan: z.string().optional(),
})

// Toko
export const tokoSchema = z.object({
  nama: z.string().min(2, 'Nama toko minimal 2 karakter'),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProdukInput = z.infer<typeof produkSchema>
export type PelangganInput = z.infer<typeof pelangganSchema>
export type TransaksiInput = z.infer<typeof transaksiSchema>
export type HutangInput = z.infer<typeof hutangSchema>
export type BayarHutangInput = z.infer<typeof bayarHutangSchema>
export type TokoInput = z.infer<typeof tokoSchema>