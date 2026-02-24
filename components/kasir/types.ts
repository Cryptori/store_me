export type CartItem = {
  product_id: string
  nama_produk: string
  harga_jual: number
  qty: number
  stok: number
  subtotal: number
}

export type MetodeBayar = 'tunai' | 'transfer' | 'qris' | 'hutang'