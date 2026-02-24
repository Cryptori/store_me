export type HutangItem = {
  id: string
  jumlah: number
  sisa: number
  status: string
  jatuh_tempo: string | null
  created_at: string
  customer_id: string
  customer_nama: string
  customer_telepon: string | null
}

export type FilterType = 'semua' | 'belum_lunas' | 'terlambat' | 'lunas'