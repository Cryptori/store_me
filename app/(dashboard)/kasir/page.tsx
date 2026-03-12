'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/utils'
import { useStore } from '@/hooks/useStore'
import type { Product, Customer, Category } from '@/types/database'
import type { CartItem, MetodeBayar } from '@/components/kasir/types'
import ProductGrid from '@/components/kasir/ProductGrid'
import CartPanel from '@/components/kasir/CartPanel'
import CheckoutModal from '@/components/kasir/CheckoutModal'
import SuccessModal from '@/components/kasir/SuccessModal'
import CustomerPicker from '@/components/kasir/CustomerPicker'
import { printStruk, shareStrukWA, copyStrukToClipboard } from '@/components/kasir/printStruk'

export default function KasirPage() {
  const { store } = useStore()

  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  const [cart, setCart] = useState<CartItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerPicker, setShowCustomerPicker] = useState(false)

  const [showCheckout, setShowCheckout] = useState(false)
  const [metodeBayar, setMetodeBayar] = useState<MetodeBayar>('tunai')
  const [bayar, setBayar] = useState('')
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  const [showSuccess, setShowSuccess] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<string | null>(null)
  const [lastCart, setLastCart] = useState<CartItem[]>([])
  const [lastMetode, setLastMetode] = useState<MetodeBayar>('tunai')
  const [lastBayar, setLastBayar] = useState(0)
  const [lastKembalian, setLastKembalian] = useState(0)
  const [lastTotal, setLastTotal] = useState(0)
  const [lastCustomer, setLastCustomer] = useState<Customer | null>(null)

  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    if (!store) return
    async function init() {
      const supabase = createClient()
      const [{ data: produkData }, { data: pelangganData }, { data: kategoriData }] = await Promise.all([
        supabase.from('products').select('*')
          .eq('store_id', store!.id).eq('is_active', true).gt('stok', 0).order('nama'),
        supabase.from('customers').select('*')
          .eq('store_id', store!.id).order('nama'),
        (supabase as any).from('categories').select('*')
          .eq('store_id', store!.id).order('nama'),
      ])
      setProducts((produkData ?? []) as Product[])
      setFilteredProducts((produkData ?? []) as Product[])
      setCustomers((pelangganData ?? []) as Customer[])
      setCategories((kategoriData ?? []) as Category[])
      setLoadingProducts(false)
    }
    init()
  }, [store])

  // Filter produk berdasarkan search + kategori
  useEffect(() => {
    const q = search.toLowerCase()
    setFilteredProducts(products.filter(p => {
      const matchSearch = p.nama.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q)
      const matchCategory = selectedCategory === '' || p.category_id === selectedCategory
      return matchSearch && matchCategory
    }))
  }, [search, products, selectedCategory])

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0)
  const totalQty = cart.reduce((s, i) => s + i.qty, 0)
  const kembalian = metodeBayar === 'tunai' ? Math.max(0, Number(bayar) - total) : 0

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id)
      if (existing) {
        if (existing.qty >= product.stok) return prev
        return prev.map(i => i.product_id === product.id
          ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.harga_jual } : i)
      }
      return [...prev, {
        product_id: product.id, nama_produk: product.nama,
        harga_jual: product.harga_jual, qty: 1, stok: product.stok,
        subtotal: product.harga_jual,
      }]
    })
  }

  function updateQty(product_id: string, delta: number) {
    setCart(prev => prev
      .map(i => i.product_id === product_id
        ? { ...i, qty: i.qty + delta, subtotal: (i.qty + delta) * i.harga_jual } : i)
      .filter(i => i.qty > 0))
  }

  function removeFromCart(product_id: string) {
    setCart(prev => prev.filter(i => i.product_id !== product_id))
  }

  async function processCheckout() {
    if (!store || cart.length === 0) return
    if (metodeBayar === 'tunai' && Number(bayar) < total) return
    if (metodeBayar === 'hutang' && !selectedCustomer) return
    setLoadingCheckout(true)

    const supabase = createClient()
    const db = supabase as any

    const { data: nomorData } = await db.rpc('generate_nomor_transaksi', { p_store_id: store.id })
    const nomor = (nomorData ?? `TRX-FALLBACK-${Date.now()}`) as unknown as string

    const { data: trx, error: trxError } = await db.from('transactions').insert({
      store_id: store.id,
      customer_id: selectedCustomer?.id ?? null,
      nomor_transaksi: nomor,
      total,
      bayar: metodeBayar === 'tunai' ? Number(bayar) : total,
      kembalian: metodeBayar === 'tunai' ? kembalian : 0,
      metode_bayar: metodeBayar,
      status: 'selesai',
    }).select().single()

    if (trxError || !trx) {
      alert('Gagal menyimpan transaksi')
      setLoadingCheckout(false)
      return
    }

    await db.from('transaction_items').insert(
      cart.map(item => ({
        transaction_id: trx.id,
        product_id: item.product_id,
        nama_produk: item.nama_produk,
        harga_jual: item.harga_jual,
        qty: item.qty,
        subtotal: item.subtotal,
      }))
    )

    for (const item of cart) {
      const { data: produk } = await db.from('products').select('stok').eq('id', item.product_id).single()
      const stokSebelum = (produk?.stok ?? 0) as number
      const stokSesudah = stokSebelum - item.qty
      await Promise.all([
        db.from('products').update({ stok: stokSesudah, updated_at: new Date().toISOString() }).eq('id', item.product_id),
        db.from('stock_logs').insert({
          product_id: item.product_id, store_id: store.id,
          tipe: 'keluar', jumlah: item.qty,
          stok_sebelum: stokSebelum, stok_sesudah: stokSesudah,
          keterangan: `Transaksi ${nomor}`,
        }),
      ])
    }

    if (metodeBayar === 'hutang' && selectedCustomer) {
      await db.from('debts').insert({
        store_id: store.id, customer_id: selectedCustomer.id,
        transaction_id: trx.id, jumlah: total, sisa: total, status: 'belum_lunas',
      })
    }

    setLastCart([...cart])
    setLastMetode(metodeBayar)
    setLastBayar(Number(bayar))
    setLastKembalian(kembalian)
    setLastTotal(total)
    setLastCustomer(selectedCustomer)
    setLastTransaction(nomor)

    setCart([])
    setShowCheckout(false)
    setMetodeBayar('tunai')
    setBayar('')
    setSelectedCustomer(null)
    setLoadingCheckout(false)
    setShowSuccess(true)
    setShowCart(false)

    const { data: refreshed } = await supabase.from('products').select('*')
      .eq('store_id', store.id).eq('is_active', true).gt('stok', 0).order('nama')
    setProducts((refreshed ?? []) as Product[])
  }

  function getStrukProps() {
    return {
      storeName: store!.nama,
      nomorTransaksi: lastTransaction!,
      cart: lastCart,
      total: lastTotal,
      metodeBayar: lastMetode,
      bayar: lastBayar,
      kembalian: lastKembalian,
      customerName: lastCustomer?.nama,
      customerPhone: lastCustomer?.telepon ?? undefined,
    }
  }

  function handlePrint() { if (store && lastTransaction) printStruk(getStrukProps()) }
  function handleShareWA() { if (store && lastTransaction) shareStrukWA(getStrukProps()) }
  async function handleCopyStruk() {
    if (!store || !lastTransaction) return false
    return copyStrukToClipboard(getStrukProps())
  }

  return (
    <div className="flex h-[calc(100vh-57px)] md:h-screen overflow-hidden relative">
      <ProductGrid
        products={filteredProducts}
        cart={cart}
        search={search}
        loading={loadingProducts}
        categories={categories}
        selectedCategory={selectedCategory}
        onSearch={setSearch}
        onAddToCart={addToCart}
        onCategoryChange={setSelectedCategory}
        allProducts={products} 
      />

      <div className="hidden md:flex md:w-80 lg:w-96 flex-col">
        <CartPanel
          cart={cart}
          total={total}
          selectedCustomer={selectedCustomer}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
          onClear={() => setCart([])}
          onCheckout={() => setShowCheckout(true)}
          onSelectCustomer={() => setShowCustomerPicker(true)}
          onClearCustomer={() => setSelectedCustomer(null)}
        />
      </div>

      {/* Mobile cart */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#181c27] border-t border-[#2a3045] p-3">
        {showCart ? (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div className="flex-1 bg-black/60" onClick={() => setShowCart(false)} />
            <div className="bg-[#181c27] border-t border-[#2a3045] h-[75vh] flex flex-col">
              <CartPanel
                cart={cart}
                total={total}
                selectedCustomer={selectedCustomer}
                onUpdateQty={updateQty}
                onRemove={removeFromCart}
                onClear={() => setCart([])}
                onCheckout={() => { setShowCart(false); setShowCheckout(true) }}
                onSelectCustomer={() => setShowCustomerPicker(true)}
                onClearCustomer={() => setSelectedCustomer(null)}
                onCloseCart={() => setShowCart(false)}
                isMobile
              />
            </div>
          </div>
        ) : (
          <button onClick={() => setShowCart(true)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-green-400 text-[#0a0d14]">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="font-black text-sm">
                {cart.length === 0 ? 'Keranjang Kosong' : `${totalQty} item`}
              </span>
            </div>
            <span className="font-black text-sm">{formatRupiah(total)}</span>
          </button>
        )}
      </div>

      {showCheckout && (
        <CheckoutModal
          cart={cart} total={total} metodeBayar={metodeBayar} bayar={bayar}
          selectedCustomer={selectedCustomer} customers={customers}
          customerSearch={customerSearch} loading={loadingCheckout}
          onMetode={setMetodeBayar} onBayar={setBayar}
          onCustomerSearch={setCustomerSearch} onSelectCustomer={setSelectedCustomer}
          onProcess={processCheckout} onClose={() => setShowCheckout(false)}
        />
      )}

      {showSuccess && lastTransaction && (
        <SuccessModal
          nomorTransaksi={lastTransaction}
          hasCustomerPhone={!!lastCustomer?.telepon}
          onClose={() => setShowSuccess(false)}
          onPrint={handlePrint}
          onShareWA={handleShareWA}
          onCopyStruk={handleCopyStruk}
        />
      )}

      {showCustomerPicker && (
        <CustomerPicker
          customers={customers} search={customerSearch}
          selectedCustomer={selectedCustomer}
          onSearch={setCustomerSearch}
          onSelect={(c) => { setSelectedCustomer(c); setShowCustomerPicker(false) }}
          onClose={() => setShowCustomerPicker(false)}
        />
      )}
    </div>
  )
}