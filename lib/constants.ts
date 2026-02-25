// Freemium limits
export const FREE_TIER = {
  MAX_PRODUK: 50,
  MAX_PELANGGAN: 50,
  LAPORAN_BULANAN: false,
  EXPORT_PDF: false,
  MULTI_USER: false,
} as const

// Harga PRO
export const PRO_PRICE = {
  BULANAN: 49_000,
  TAHUNAN: 449_000, // hemat 2 bulan vs bulanan
} as const

// Metode bayar
export const METODE_BAYAR = [
  { value: 'tunai',    label: 'Tunai' },
  { value: 'transfer', label: 'Transfer Bank' },
  { value: 'qris',     label: 'QRIS' },
  { value: 'hutang',   label: 'Hutang' },
] as const

export type MetodeBayar = typeof METODE_BAYAR[number]['value']

// Status
export const STATUS_TRANSAKSI = {
  SELESAI: 'selesai',
  BATAL:   'batal',
} as const

export const STATUS_HUTANG = {
  BELUM_LUNAS: 'belum_lunas',
  LUNAS:       'lunas',
} as const

// Satuan produk
export const SATUAN_PRODUK = [
  'pcs', 'kg', 'gram', 'liter', 'ml',
  'lusin', 'pak', 'karton', 'botol', 'kaleng', 'bungkus',
] as const

export type SatuanProduk = typeof SATUAN_PRODUK[number]