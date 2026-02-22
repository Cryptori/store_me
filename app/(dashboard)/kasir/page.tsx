'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Minus, Trash2, ShoppingCart, User, CreditCard, Banknote, QrCode, Loader2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah, hitungKembalian } from '@/lib/utils'
import { METODE_BAYAR } from '@/lib/constants'
import { useStore } from '@/hooks/useStore'
import type { Product, Customer } from '@/types/database'

// Tipe item di keranjang
type CartItem = {
  product_id: string
  nama_produk: string
  harga_jual: number
  qty: number
  stok: number
  subtotal: number
}

type MetodeBayar = 'tunai' | 'transfer' | 'qris' | 'hutang'

export default function KasirPage() {
  const { store } = useStore()
  const supabase = createClient()

  // State produk & search
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loadingProducts, setLoadingProducts] = useState(true)

  // State keranjang
  const [cart, setCart] = useState<CartItem[]>([])

  // State checkout
  const [showCheckout, setShowCheckout] = useState(false)
  const [metodeBayar, setMetodeBayar] = useState<MetodeBayar>('tunai')
  const [bayar, setBayar] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showCustomerPicker, setShowCustomerPicker] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  // State sukses
  const [lastTransaction, setLastTransaction] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Fetch produk
  useEffect(() => {
    if (!store) return
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store!.id)
        .eq('is_active', true)
        .gt('stok', 0)
        .order('nama')
      setProducts(data ?? [])
      setFilteredProducts(data ?? [])
      setLoadingProducts(false)
    }
    fetchProducts()
  }, [store])

  // Fetch customers
  useEffect(() => {
    if (!store) return
    async function fetchCustomers() {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', store!.id)
        .order('nama')
      setCustomers(data ?? [])
    }
    fetchCustomers()
  }, [store])

  // Filter produk by search
  useEffect(() => {
    const q = search.toLowerCase()
    setFilteredProducts(
      products.filter(p =>
        p.nama.toLowerCase().includes(q) ||
        (p.sku ?? '').toLowerCase().includes(q)
      )
    )
  }, [search, products])

  // Hitung total
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const kembalian = metodeBayar === 'tunai' ? hitungKembalian(total, Number(bayar)) : 0

  // Tambah ke keranjang
  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id)
      if (existing) {
        if (existing.qty >= product.stok) return prev // stok habis
        return prev.map(i =>
          i.product_id === product.id
            ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.harga_jual }
            : i
        )
      }
      return [...prev, {
        product_id: product.id,
        nama_produk: product.nama,
        harga_jual: product.harga_jual,
        qty: 1,
        stok: product.stok,
        subtotal: product.harga_jual,
      }]
    })
  }

  // Update qty
  function updateQty(product_id: string, delta: number) {
    setCart(prev =>
      prev
        .map(i => i.product_id === product_id
          ? { ...i, qty: i.qty + delta, subtotal: (i.qty + delta) * i.harga_jual }
          : i
        )
        .filter(i => i.qty > 0)
    )
  }

  // Hapus item
  function removeFromCart(product_id: string) {
    setCart(prev => prev.filter(i => i.product_id !== product_id))
  }

  // Bayar cepat (nominal pas)
  function setBayarCepat(amount: number) {
    setBayar(amount.toString())
  }

  // Proses transaksi
  async function processCheckout() {
    if (!store || cart.length === 0) return
    if (metodeBayar === 'tunai' && Number(bayar) < total) return
    if (metodeBayar === 'hutang' && !selectedCustomer) return

    setLoadingCheckout(true)

    // Generate nomor transaksi
    const { data: nomorData } = await supabase
      .rpc('generate_nomor_transaksi', { p_store_id: store.id })

    const nomor = nomorData as string

    // Insert transaksi
    const { data: trx, error: trxError } = await supabase
      .from('transactions')
      .insert({
        store_id: store.id,
        customer_id: selectedCustomer?.id ?? null,
        nomor_transaksi: nomor,
        total,
        bayar: metodeBayar === 'tunai' ? Number(bayar) : total,
        kembalian: metodeBayar === 'tunai' ? kembalian : 0,
        metode_bayar: metodeBayar,
        status: 'selesai',
      })
      .select()
      .single()

    if (trxError || !trx) {
      alert('Gagal menyimpan transaksi')
      setLoadingCheckout(false)
      return
    }

    // Insert items (trigger akan kurangi stok otomatis)
    const items = cart.map(item => ({
      transaction_id: trx.id,
      product_id: item.product_id,
      nama_produk: item.nama_produk,
      harga_jual: item.harga_jual,
      qty: item.qty,
      subtotal: item.subtotal,
    }))

    await supabase.from('transaction_items').insert(items)

    // Kalau hutang, insert ke tabel debts
    if (metodeBayar === 'hutang' && selectedCustomer) {
      await supabase.from('debts').insert({
        store_id: store.id,
        customer_id: selectedCustomer.id,
        transaction_id: trx.id,
        jumlah: total,
        sisa: total,
        status: 'belum_lunas',
      })
    }

    // Reset
    setLastTransaction(nomor)
    setCart([])
    setShowCheckout(false)
    setMetodeBayar('tunai')
    setBayar('')
    setSelectedCustomer(null)
    setLoadingCheckout(false)
    setShowSuccess(true)

    // Refresh stok produk
    const { data: refreshed } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .eq('is_active', true)
      .gt('stok', 0)
      .order('nama')
    setProducts(refreshed ?? [])
  }

  const filteredCustomers = customers.filter(c =>
    c.nama.toLowerCase().includes(customerSearch.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">

      {/* ===== PRODUK GRID ===== */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0f1117]">
        {/* Search */}
        <div className="p-4 border-b border-[#2a3045]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
            <input
              type="text"
              placeholder="Cari produk atau SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#181c27] border border-[#2a3045] text-white placeholder-[#3a4560] text-sm outline-none focus:border-green-500/40 focus:ring-2 focus:ring-green-500/10"
            />
          </div>
        </div>

        {/* Grid produk */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingProducts ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-[#64748b]" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#64748b]">
              <div className="text-4xl mb-3">📦</div>
              <p className="font-semibold">Produk tidak ditemukan</p>
              <p className="text-sm mt-1">Coba kata kunci lain atau tambah produk baru</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map(product => {
                const inCart = cart.find(i => i.product_id === product.id)
                const stokHabis = product.stok === 0
                return (
                  <button
                    key={product.id}
                    onClick={() => !stokHabis && addToCart(product)}
                    disabled={stokHabis}
                    className={`relative text-left p-3 rounded-xl border transition-all ${
                      stokHabis
                        ? 'bg-[#181c27] border-[#1e2333] opacity-50 cursor-not-allowed'
                        : inCart
                        ? 'bg-[#1a2a1a] border-green-500/40 hover:border-green-400'
                        : 'bg-[#181c27] border-[#2a3045] hover:border-[#3a4560] hover:bg-[#1e2333]'
                    }`}
                  >
                    {/* Badge qty di cart */}
                    {inCart && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-green-400 text-[#0a0d14] text-xs font-black flex items-center justify-center">
                        {inCart.qty}
                      </div>
                    )}

                    {/* Emoji/placeholder produk */}
                    <div className="w-full aspect-square rounded-lg bg-[#0f1117] flex items-center justify-center text-2xl mb-2.5">
                      🛍️
                    </div>

                    <div className="text-xs font-semibold text-[#e2e8f0] leading-tight mb-1 line-clamp-2">
                      {product.nama}
                    </div>
                    <div className="text-green-400 font-black text-sm font-mono">
                      {formatRupiah(product.harga_jual)}
                    </div>
                    <div className={`text-xs mt-1 ${product.stok <= (product.stok_minimum ?? 5) ? 'text-yellow-400' : 'text-[#64748b]'}`}>
                      Stok: {product.stok} {product.satuan}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ===== PANEL KASIR (CART) ===== */}
      <div className="w-80 xl:w-96 flex flex-col bg-[#181c27] border-l border-[#2a3045]">
        {/* Header cart */}
        <div className="p-4 border-b border-[#2a3045] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-green-400" />
            <span className="font-bold text-sm">Keranjang</span>
            {cart.length > 0 && (
              <span className="bg-green-400 text-[#0a0d14] text-xs font-black px-1.5 py-0.5 rounded-full">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs text-[#64748b] hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Kosongkan
            </button>
          )}
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#64748b] py-12">
              <ShoppingCart className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Keranjang kosong</p>
              <p className="text-xs mt-1">Klik produk untuk menambahkan</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product_id} className="bg-[#1e2333] rounded-xl p-3 border border-[#2a3045]">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-semibold text-[#e2e8f0] leading-tight flex-1 pr-2">
                    {item.nama_produk}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="text-[#64748b] hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(item.product_id, -1)}
                      className="w-6 h-6 rounded-lg bg-[#2a3045] hover:bg-[#3a4055] text-white flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold font-mono">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.product_id, 1)}
                      disabled={item.qty >= item.stok}
                      className="w-6 h-6 rounded-lg bg-[#2a3045] hover:bg-[#3a4055] text-white flex items-center justify-center transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-green-400 font-black text-sm font-mono">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Total + Bayar */}
        <div className="p-4 border-t border-[#2a3045] space-y-3">
          {/* Pelanggan (opsional) */}
          <div
            onClick={() => setShowCustomerPicker(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#1e2333] border border-[#2a3045] hover:border-[#3a4560] transition-colors text-left cursor-pointer"
          >
            <User className="w-4 h-4 text-[#64748b] flex-shrink-0" />
            <span className={`text-sm flex-1 ${selectedCustomer ? 'text-white font-semibold' : 'text-[#64748b]'}`}>
              {selectedCustomer ? selectedCustomer.nama : 'Pilih pelanggan (opsional)'}
            </span>
            {selectedCustomer && (
              <div
                onClick={e => { e.stopPropagation(); setSelectedCustomer(null) }}
                className="text-[#64748b] hover:text-red-400 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between bg-[#1e2333] rounded-xl px-4 py-3 border border-[#2a3045]">
            <span className="text-[#94a3b8] text-sm font-semibold">Total</span>
            <span className="text-xl font-black text-white font-mono">{formatRupiah(total)}</span>
          </div>

          {/* Tombol bayar */}
          <button
            onClick={() => setShowCheckout(true)}
            disabled={cart.length === 0}
            className="w-full py-3.5 rounded-xl bg-green-400 hover:bg-green-300 text-[#0a0d14] font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {cart.length === 0 ? 'Keranjang Kosong' : `Bayar ${formatRupiah(total)}`}
          </button>
        </div>
      </div>

      {/* ===== MODAL CHECKOUT ===== */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-[#2a3045]">
              <h3 className="font-black text-lg">Proses Pembayaran</h3>
              <button onClick={() => setShowCheckout(false)} className="text-[#64748b] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Summary */}
              <div className="bg-[#1e2333] rounded-xl p-4 border border-[#2a3045]">
                <div className="text-xs text-[#64748b] mb-1 font-semibold uppercase tracking-wide">Total Belanja</div>
                <div className="text-3xl font-black text-green-400 font-mono">{formatRupiah(total)}</div>
                <div className="text-xs text-[#64748b] mt-1">{cart.length} item • {cart.reduce((s, i) => s + i.qty, 0)} qty</div>
              </div>

              {/* Metode bayar */}
              <div>
                <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">Metode Pembayaran</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'tunai', label: 'Tunai', icon: <Banknote className="w-4 h-4" /> },
                    { value: 'transfer', label: 'Transfer', icon: <CreditCard className="w-4 h-4" /> },
                    { value: 'qris', label: 'QRIS', icon: <QrCode className="w-4 h-4" /> },
                    { value: 'hutang', label: 'Hutang', icon: <User className="w-4 h-4" /> },
                  ].map(m => (
                    <button
                      key={m.value}
                      onClick={() => setMetodeBayar(m.value as MetodeBayar)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        metodeBayar === m.value
                          ? 'bg-[#1a2a1a] border-green-500/40 text-green-400'
                          : 'bg-[#1e2333] border-[#2a3045] text-[#94a3b8] hover:border-[#3a4560]'
                      }`}
                    >
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input bayar (tunai) */}
              {metodeBayar === 'tunai' && (
                <div>
                  <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">Uang Diterima</div>
                  <input
                    type="number"
                    placeholder="0"
                    value={bayar}
                    onChange={e => setBayar(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white text-lg font-mono font-bold outline-none focus:border-green-500/40 focus:ring-2 focus:ring-green-500/10"
                  />
                  {/* Bayar cepat */}
                  <div className="flex gap-2 mt-2">
                    {[total, Math.ceil(total / 5000) * 5000, Math.ceil(total / 10000) * 10000, Math.ceil(total / 50000) * 50000]
                      .filter((v, i, arr) => arr.indexOf(v) === i)
                      .slice(0, 4)
                      .map(amount => (
                        <button
                          key={amount}
                          onClick={() => setBayarCepat(amount)}
                          className="flex-1 py-1.5 rounded-lg bg-[#1e2333] border border-[#2a3045] text-xs font-mono font-semibold text-[#94a3b8] hover:border-green-500/30 hover:text-green-400 transition-all"
                        >
                          {amount >= 1000 ? `${amount / 1000}k` : amount}
                        </button>
                      ))
                    }
                  </div>
                  {Number(bayar) >= total && (
                    <div className="mt-2 flex items-center justify-between bg-[#1a2a1a] border border-green-500/20 rounded-xl px-4 py-2">
                      <span className="text-xs text-[#64748b]">Kembalian</span>
                      <span className="font-black text-green-400 font-mono">{formatRupiah(kembalian)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Hutang: wajib pilih pelanggan */}
              {metodeBayar === 'hutang' && (
                <div>
                  <div className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wide mb-2">Pilih Pelanggan</div>
                  <input
                    type="text"
                    placeholder="Cari nama pelanggan..."
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white text-sm outline-none focus:border-green-500/40 mb-2"
                  />
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {filteredCustomers.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCustomer(c)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedCustomer?.id === c.id
                            ? 'bg-[#1a2a1a] text-green-400 border border-green-500/30'
                            : 'hover:bg-[#2a3045] text-[#94a3b8]'
                        }`}
                      >
                        <span className="font-semibold">{c.nama}</span>
                        {c.total_hutang > 0 && (
                          <span className="text-xs text-red-400 ml-2">Hutang: {formatRupiah(c.total_hutang)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tombol proses */}
              <button
                onClick={processCheckout}
                disabled={
                  loadingCheckout ||
                  (metodeBayar === 'tunai' && Number(bayar) < total) ||
                  (metodeBayar === 'hutang' && !selectedCustomer)
                }
                className="w-full py-3.5 rounded-xl bg-green-400 hover:bg-green-300 text-[#0a0d14] font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingCheckout ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                ) : (
                  `✓ Proses Pembayaran ${formatRupiah(total)}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL SUKSES ===== */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl w-full max-w-sm shadow-2xl text-center p-8">
            <div className="w-16 h-16 rounded-full bg-green-400/20 border-2 border-green-400/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="text-xl font-black text-white mb-1">Transaksi Berhasil!</h3>
            <p className="text-[#64748b] text-sm mb-1">Nomor transaksi:</p>
            <p className="font-mono font-bold text-green-400 text-sm mb-6">{lastTransaction}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSuccess(false)}
                className="flex-1 py-3 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white font-bold text-sm hover:bg-[#2a3045] transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setShowSuccess(false)
                  // TODO: print struk
                }}
                className="flex-1 py-3 rounded-xl bg-green-400 text-[#0a0d14] font-black text-sm hover:bg-green-300 transition-colors"
              >
                🖨️ Print Struk
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}