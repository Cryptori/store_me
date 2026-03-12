// ── Freemium limits ───────────────────────────────────────────
export const FREE_TIER = {
  MAX_PRODUK: 50,
  MAX_PELANGGAN: 50,
  MAX_TRANSAKSI_PER_HARI: 999,  // unlimited
  LAPORAN_BULANAN: false,
  EXPORT_PDF: false,
  MULTI_USER: false,
} as const

// ── Harga PRO ─────────────────────────────────────────────────
export const PRO_PRICE = {
  BULANAN: 49_000,
  TAHUNAN: 449_000,             // hemat 2 bulan
} as const

// ── Referral ──────────────────────────────────────────────────
export const REFERRAL = {
  REWARD_DAYS: 30,              // hari bonus per referral
  MAX_PER_STORE: 100,           // tidak ada batas praktis
} as const

// ── Multi-user limits ─────────────────────────────────────────
export const TEAM_LIMITS = {
  MAX_KASIR: 5,                 // max kasir per toko PRO
} as const

// ── Metode bayar ──────────────────────────────────────────────
export const METODE_BAYAR = [
  { value: 'tunai',    label: 'Tunai'         },
  { value: 'transfer', label: 'Transfer Bank' },
  { value: 'qris',     label: 'QRIS'          },
  { value: 'hutang',   label: 'Hutang'        },
] as const

// ── Status ────────────────────────────────────────────────────
export const STATUS_TRANSAKSI = {
  SELESAI: 'selesai',
  BATAL:   'batal',
} as const

export const STATUS_HUTANG = {
  BELUM_LUNAS: 'belum_lunas',
  LUNAS:       'lunas',
} as const

// ── Satuan produk ─────────────────────────────────────────────
export const SATUAN_PRODUK = [
  'pcs', 'kg', 'gram', 'liter', 'ml', 'lusin',
  'pak', 'karton', 'botol', 'kaleng', 'bungkus',
] as const