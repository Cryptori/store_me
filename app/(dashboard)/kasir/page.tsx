'use client'
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { ShoppingCart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/utils'
import { useStore } from '@/hooks/useStore'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import {
  getCachedProducts, getCachedCustomers,
  cacheProducts, cacheCustomers,
  saveOfflineTransaction, decrementCachedStok,
} from '@/lib/offlineDB'
import { hitungDiskonPromo, totalDiskon } from '@/types/diskon'
import type { Product, Customer, Category } from '@/types/database'
import type { CartItem, MetodeBayar } from '@/components/kasir/types'
import type { Promo, AppliedPromo } from '@/types/diskon'
import ProductGrid from '@/components/kasir/ProductGrid'
import CartPanel from '@/components/kasir/CartPanel'
import CheckoutModal from '@/components/kasir/CheckoutModal'
import SuccessModal from '@/components/kasir/SuccessModal'
import CustomerPicker from '@/components/kasir/CustomerPicker'
import OfflineStatusBar from '@/components/kasir/OfflineStatusBar'
import { printStruk, shareStrukWA, copyStrukToClipboard } from '@/components/kasir/printStruk'

export default function KasirPage() {
  const { store } = useStore()
  const { isOnline, pendingCount, syncStatus, syncPending } = useOfflineSync(store?.id)

  const [products, setProducts]                     = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts]     = useState<Product[]>([])
  const [customers, setCustomers]                   = useState<Customer[]>([])
  const [categories, setCategories]                 = useState<Category[]>([])
  const [loadingProducts, setLoadingProducts]       = useState(true)
  const [activePromos, setActivePromos]             = useState<Promo[]>([])

  const [cart, setCart]                             = useState<CartItem[]>([])
  const [search, setSearch]                         = useState('')
  const [selectedCategory, setSelectedCategory]     = useState('')

  const [selectedCustomer, setSelectedCustomer]     = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch]         = useState('')
  const [showCustomerPicker, setShowCustomerPicker] = useState(false)

  // Diskon
  const [voucherPromoId, setVoucherPromoId]         = useState<string | null>(null)
  const [voucherDiskon, setVoucherDiskon]           = useState(0)
  const [voucherLabel, setVoucherLabel]             = useState('')

  const [showCheckout, setShowCheckout]             = useState(false)
  const [metodeBayar, setMetodeBayar]               = useState<MetodeBayar>('tunai')
  const [bayar, setBayar]                           = useState('')
  const [loadingCheckout, setLoadingCheckout]       = useState(false)

  const [showSuccess, setShowSuccess]               = useState(false)
  const [lastTransaction, setLastTransaction]       = useState<string | null>(null)
  const [lastCart, setLastCart]                     = useState<CartItem[]>([])
  const [lastMetode, setLastMetode]                 = useState<MetodeBayar>('tunai')
  const [lastBayar, setLastBayar]                   = useState(0)
  const [lastKembalian, setLastKembalian]           = useState(0)
  const [lastTotal, setLastTotal]                   = useState(0)
  const [lastCustomer, setLastCustomer]             = useState<Customer | null>(null)
  const [showCart, setShowCart]                     = useState(false)

  // ── Load data ────────────────────────────────────────────────
  useEffect(() => { if (store) loadData() }, [store, isOnline])

  async function loadData() {
    setLoadingProducts(true)
    if (isOnline) {
      try {
        const supabase = createClient()
        const db = supabase as any
        const [{ data: produkData }, { data: pelangganData }, { data: kategoriData }, { data: promoData }] =
          await Promise.all([
            supabase.from('products').select('*').eq('store_id', store!.id).eq('is_active', true).gt('stok', 0).order('nama'),
            supabase.from('customers').select('*').eq('store_id', store!.id).order('nama'),
            db.from('categories').select('*').eq('store_id', store!.id).order('nama'),
            db.rpc('get_active_promos', { p_store_id: store!.id }),
          ])

        const p = (produkData ?? []) as Product[]
        const c = (pelangganData ?? []) as Customer[]
        setProducts(p)
        setFilteredProducts(p)
        setCustomers(c)
        setCategories((kategoriData ?? []) as Category[])
        setActivePromos((promoData ?? []) as Promo[])
        cacheProducts(store!.id, p as any).catch(() => {})
        cacheCustomers(store!.id, c as any).catch(() => {})
      } catch { await loadFromCache() }
    } else { await loadFromCache() }
    setLoadingProducts(false)
  }

  async function loadFromCache() {
    const [cp, cc] = await Promise.all([getCachedProducts(store!.id), getCachedCustomers(store!.id)])
    setProducts(cp.filter(p => p.stok > 0) as unknown as Product[])
    setFilteredProducts(cp.filter(p => p.stok > 0) as unknown as Product[])
    setCustomers(cc as unknown as Customer[])
    setCategories([])
    setActivePromos([])
  }

  // ── Filter produk ────────────────────────────────────────────
  useEffect(() => {
    const q = search.toLowerCase()
    setFilteredProducts(products.filter(p => {
      const matchSearch = p.nama.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q)
      return matchSearch && (selectedCategory === '' || p.category_id === selectedCategory)
    }))
  }, [search, products, selectedCategory])

  // ── Hitung total & diskon ────────────────────────────────────
  const subtotal = cart.reduce((sum, i) => sum + i.subtotal, 0)

  // Diskon otomatis (persen, nominal, beli_x_gratis_y, otomatis)
  const appliedAutoPromos: AppliedPromo[] = hitungDiskonPromo(activePromos, cart, subtotal)
  const diskonAuto    = totalDiskon(appliedAutoPromos)
  const diskonVoucher = voucherDiskon
  const diskonTotal   = diskonAuto + diskonVoucher
  const total         = Math.max(0, subtotal - diskonTotal)
  const totalQty      = cart.reduce((s, i) => s + i.qty, 0)

  // ── Cart actions ─────────────────────────────────────────────
  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id)
      if (existing) {
        if (existing.qty >= product.stok) return prev
        return prev.map(i => i.product_id === product.id
          ? { ...i, qty: i.qty + 1, subtotal: (i.qty + 1) * i.harga_jual } : i)
      }
      return [...prev, { product_id: product.id, nama_produk: product.nama, harga_jual: product.harga_jual, qty: 1, stok: product.stok, subtotal: product.harga_jual }]
    })
  }

  function updateQty(product_id: string, delta: number) {
    setCart(prev => prev
      .map(i => i.product_id === product_id ? { ...i, qty: i.qty + delta, subtotal: (i.qty + delta) * i.harga_jual } : i)
      .filter(i => i.qty > 0))
  }

  function removeFromCart(product_id: string) {
    setCart(prev => prev.filter(i => i.product_id !== product_id))
  }

  function clearCart() {
    setCart([])
    setVoucherPromoId(null)
    setVoucherDiskon(0)
    setVoucherLabel('')
  }

  // ── Checkout ─────────────────────────────────────────────────
  async function processCheckout() {
    if (!store || cart.length === 0) return
    if (metodeBayar === 'tunai' && Number(bayar) < total) return
    if (metodeBayar === 'hutang' && !selectedCustomer) return
    setLoadingCheckout(true)
    const kembalianFinal = metodeBayar === 'tunai' ? Math.max(0, Number(bayar) - total) : 0

    if (!isOnline) {
      await processOfflineCheckout(kembalianFinal)
    } else {
      await processOnlineCheckout(kembalianFinal)
    }
    setLoadingCheckout(false)
  }

  async function processOfflineCheckout(kembalianFinal: number) {
    await saveOfflineTransaction({
      id: crypto.randomUUID(),
      store_id: store!.id,
      items: cart.map(i => ({ product_id: i.product_id, nama_produk: i.nama_produk, harga_jual: i.harga_jual, qty: i.qty, subtotal: i.subtotal })),
      total,
      metode_bayar: metodeBayar,
      bayar: Number(bayar),
      kembalian: kembalianFinal,
      customer_id: selectedCustomer?.id,
      customer_nama: selectedCustomer?.nama,
      created_at: new Date().toISOString(),
      synced: false,
    })
    await Promise.all(cart.map(item => decrementCachedStok(item.product_id, item.qty)))
    setProducts(prev => prev.map(p => { const item = cart.find(i => i.product_id === p.id); return item ? { ...p, stok: Math.max(0, p.stok - item.qty) } : p }).filter(p => p.stok > 0))
    finalizeCheckout(`OFFLINE-${Date.now()}`, kembalianFinal)
  }

  async function processOnlineCheckout(kembalianFinal: number) {
    try {
      const supabase = createClient()
      const db = supabase as any

      const { data: nomorData } = await db.rpc('generate_nomor_transaksi', { p_store_id: store!.id })
      const { data: trxData, error: trxErr } = await db
        .from('transactions')
        .insert({
          store_id: store!.id,
          customer_id: selectedCustomer?.id ?? null,
          nomor_transaksi: nomorData,
          total,
          bayar: Number(bayar),
          kembalian: kembalianFinal,
          metode_bayar: metodeBayar,
          status: 'selesai',
          promo_id: voucherPromoId ?? appliedAutoPromos[0]?.promo.id ?? null,
          diskon_amount: diskonTotal,
          subtotal_sebelum_diskon: subtotal,
        })
        .select().single()

      if (trxErr || !trxData) throw new Error(trxErr?.message ?? 'Transaksi gagal')

      await db.from('transaction_items').insert(cart.map(i => ({
        transaction_id: trxData.id, product_id: i.product_id, nama_produk: i.nama_produk,
        harga_jual: i.harga_jual, qty: i.qty, subtotal: i.subtotal,
      })))

      await Promise.all(cart.map(item => db.rpc('decrement_stok', { p_product_id: item.product_id, p_qty: item.qty })))

      // Catat pemakaian voucher
      if (voucherPromoId) {
        await Promise.all([
          db.rpc('use_voucher', { p_promo_id: voucherPromoId }),
          db.from('promo_usage').insert({ promo_id: voucherPromoId, transaction_id: trxData.id, store_id: store!.id, diskon_amount: voucherDiskon }),
        ])
      }

      if (metodeBayar === 'hutang' && selectedCustomer) {
        await db.from('debts').insert({ store_id: store!.id, customer_id: selectedCustomer.id, transaction_id: trxData.id, jumlah: total, sisa: total, status: 'belum_lunas' })
        await db.from('customers').update({ total_hutang: (selectedCustomer.total_hutang ?? 0) + total }).eq('id', selectedCustomer.id)
      }

      setProducts(prev => prev.map(p => { const item = cart.find(i => i.product_id === p.id); return item ? { ...p, stok: Math.max(0, p.stok - item.qty) } : p }).filter(p => p.stok > 0))
      finalizeCheckout(trxData.nomor_transaksi, kembalianFinal)
    } catch { alert('Transaksi gagal. Coba lagi.') }
  }

  function finalizeCheckout(nomorTransaksi: string, kembalianFinal: number) {
    setLastTransaction(nomorTransaksi)
    setLastCart([...cart])
    setLastMetode(metodeBayar)
    setLastBayar(Number(bayar))
    setLastKembalian(kembalianFinal)
    setLastTotal(total)
    setLastCustomer(selectedCustomer)
    clearCart()
    setSelectedCustomer(null)
    setBayar('')
    setMetodeBayar('tunai')
    setShowCheckout(false)
    setShowSuccess(true)
  }

  // ── Struk ────────────────────────────────────────────────────
  function getStrukProps() {
    if (!lastTransaction || !store) return null
    return {
      nomorTransaksi: lastTransaction, storeName: store.nama,
      cart: lastCart, total: lastTotal, metodeBayar: lastMetode,
      bayar: lastBayar, kembalian: lastKembalian,
      customerName: lastCustomer?.nama, customerPhone: lastCustomer?.telepon ?? undefined,
    }
  }

  function handlePrint()   { const p = getStrukProps(); if (p) printStruk(p) }
  function handleShareWA() { const p = getStrukProps(); if (p) shareStrukWA(p) }
  async function handleCopyStruk(): Promise<boolean> {
    const p = getStrukProps(); if (!p) return false
    return copyStrukToClipboard(p)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] md:h-screen overflow-hidden">
      <OfflineStatusBar isOnline={isOnline} pendingCount={pendingCount} syncStatus={syncStatus} onSync={syncPending} />

      <div className="flex flex-1 overflow-hidden relative">
        <ProductGrid
          products={filteredProducts} cart={cart} search={search} loading={loadingProducts}
          categories={categories} selectedCategory={selectedCategory} allProducts={products}
          activePromos={activePromos}
          onSearch={setSearch} onAddToCart={addToCart} onCategoryChange={setSelectedCategory}
        />

        <div className="hidden md:flex md:w-80 lg:w-96 flex-col">
          <CartPanel
            cart={cart} total={total} subtotal={subtotal} diskonTotal={diskonTotal}
            appliedPromos={appliedAutoPromos} voucherLabel={voucherLabel}
            storeId={store?.id ?? ''} selectedCustomer={selectedCustomer}
            onUpdateQty={updateQty} onRemove={removeFromCart} onClear={clearCart}
            onCheckout={() => setShowCheckout(true)}
            onSelectCustomer={() => setShowCustomerPicker(true)}
            onClearCustomer={() => setSelectedCustomer(null)}
            onVoucherApply={(pid, diskon, label) => { setVoucherPromoId(pid); setVoucherDiskon(diskon); setVoucherLabel(label) }}
            onVoucherRemove={() => { setVoucherPromoId(null); setVoucherDiskon(0); setVoucherLabel('') }}
            voucherPromoId={voucherPromoId}
          />
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#181c27] border-t border-[#2a3045] p-3">
          {showCart ? (
            <div className="fixed inset-0 z-50 flex flex-col justify-end">
              <div className="flex-1 bg-black/60" onClick={() => setShowCart(false)} />
              <div className="bg-[#181c27] border-t border-[#2a3045] h-[75vh] flex flex-col">
                <CartPanel
                  cart={cart} total={total} subtotal={subtotal} diskonTotal={diskonTotal}
                  appliedPromos={appliedAutoPromos} voucherLabel={voucherLabel}
                  storeId={store?.id ?? ''} selectedCustomer={selectedCustomer}
                  onUpdateQty={updateQty} onRemove={removeFromCart} onClear={clearCart}
                  onCheckout={() => { setShowCart(false); setShowCheckout(true) }}
                  onSelectCustomer={() => setShowCustomerPicker(true)}
                  onClearCustomer={() => setSelectedCustomer(null)}
                  onVoucherApply={(pid, diskon, label) => { setVoucherPromoId(pid); setVoucherDiskon(diskon); setVoucherLabel(label) }}
                  onVoucherRemove={() => { setVoucherPromoId(null); setVoucherDiskon(0); setVoucherLabel('') }}
                  voucherPromoId={voucherPromoId}
                  onCloseCart={() => setShowCart(false)} isMobile
                />
              </div>
            </div>
          ) : (
            <button onClick={() => setShowCart(true)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-green-400 text-[#0a0d14]">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="font-black text-sm">{cart.length === 0 ? 'Keranjang Kosong' : `${totalQty} item`}</span>
              </div>
              <div className="text-right">
                {diskonTotal > 0 && <div className="text-[10px] line-through opacity-60">{formatRupiah(subtotal)}</div>}
                <span className="font-black text-sm">{formatRupiah(total)}</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal
          cart={cart} total={total} subtotal={subtotal} diskonTotal={diskonTotal}
          metodeBayar={metodeBayar} bayar={bayar}
          selectedCustomer={selectedCustomer} customers={customers}
          customerSearch={customerSearch} loading={loadingCheckout}
          onMetode={setMetodeBayar} onBayar={setBayar}
          onCustomerSearch={setCustomerSearch} onSelectCustomer={setSelectedCustomer}
          onProcess={processCheckout} onClose={() => setShowCheckout(false)}
        />
      )}

      {showSuccess && lastTransaction && (
        <SuccessModal
          nomorTransaksi={lastTransaction} hasCustomerPhone={!!lastCustomer?.telepon}
          onClose={() => setShowSuccess(false)} onPrint={handlePrint}
          onShareWA={handleShareWA} onCopyStruk={handleCopyStruk}
        />
      )}

      {showCustomerPicker && (
        <CustomerPicker
          customers={customers} search={customerSearch} selectedCustomer={selectedCustomer}
          onSearch={setCustomerSearch} onSelect={(c) => { setSelectedCustomer(c); setShowCustomerPicker(false) }}
          onClose={() => setShowCustomerPicker(false)}
        />
      )}
    </div>
  )
}