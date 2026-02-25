import { z } from 'zod'

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z.object({
  namaToko: z.string()
    .min(3, 'Nama toko minimal 3 karakter')  // fix: konsisten dengan onboarding (sebelumnya min 2)
    .max(50, 'Nama toko maksimal 50 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Password tidak sama',
  path: ['confirmPassword'],
})

// ─── Toko ────────────────────────────────────────────────────────────────────

export const tokoSchema = z.object({
  nama: z.string()
    .min(3, 'Nama toko minimal 3 karakter')
    .max(50, 'Nama toko maksimal 50 karakter'),
  alamat: z.string().max(200, 'Alamat terlalu panjang').optional(),
  telepon: z.string()
    .regex(/^(08|\+62)[0-9]{7,12}$/, 'Format nomor HP tidak valid (contoh: 08123456789)')
    .optional()
    .or(z.literal('')),
})

// ─── Produk ──────────────────────────────────────────────────────────────────

export const produkSchema = z.object({
  nama: z.string().min(1, 'Nama produk wajib diisi').max(100),
  sku: z.string().max(50).optional(),
  harga_beli: z.coerce.number().min(0, 'Harga beli tidak boleh negatif'),
  harga_jual: z.coerce.number().min(1, 'Harga jual wajib diisi'),
  stok: z.coerce.number().int().min(0, 'Stok tidak boleh negatif'),
  stok_minimum: z.coerce.number().int().min(0).default(5),
  satuan: z.string().default('pcs'),
  category_id: z.string().optional(),
}).refine(data => data.harga_jual >= data.harga_beli, {
  message: 'Harga jual tidak boleh lebih kecil dari harga beli',
  path: ['harga_jual'],
})

// ─── Pelanggan ───────────────────────────────────────────────────────────────

export const pelangganSchema = z.object({
  nama: z.string().min(1, 'Nama pelanggan wajib diisi').max(100),
  telepon: z.string()
    .regex(/^(08|\+62)[0-9]{7,12}$/, 'Format nomor HP tidak valid')
    .optional()
    .or(z.literal('')),
  alamat: z.string().max(200).optional(),
})

// ─── Transaksi ───────────────────────────────────────────────────────────────

export const transaksiSchema = z.object({
  customer_id: z.string().optional(),
  metode_bayar: z.enum(['tunai', 'transfer', 'qris', 'hutang']),
  bayar: z.coerce.number().min(0).optional(),
  catatan: z.string().max(500).optional(),
  items: z.array(z.object({
    product_id: z.string(),
    nama_produk: z.string(),
    harga_jual: z.coerce.number().min(0),
    qty: z.coerce.number().int().min(1),
    subtotal: z.coerce.number().min(0),
  })).min(1, 'Keranjang kosong'),
})

// ─── Hutang ──────────────────────────────────────────────────────────────────

export const hutangSchema = z.object({
  customer_id: z.string().min(1, 'Pilih pelanggan'),
  jumlah: z.coerce.number().min(1, 'Jumlah hutang wajib diisi'),
  jatuh_tempo: z.string().optional(),
  catatan: z.string().max(500).optional(),
})

export const bayarHutangSchema = z.object({
  jumlah_bayar: z.coerce.number().min(1, 'Jumlah bayar wajib diisi'),
  catatan: z.string().max(500).optional(),
})

// ─── Types ───────────────────────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type TokoInput = z.infer<typeof tokoSchema>
export type ProdukInput = z.infer<typeof produkSchema>
export type PelangganInput = z.infer<typeof pelangganSchema>
export type TransaksiInput = z.infer<typeof transaksiSchema>
export type HutangInput = z.infer<typeof hutangSchema>
export type BayarHutangInput = z.infer<typeof bayarHutangSchema>