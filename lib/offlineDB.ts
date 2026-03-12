/**
 * offlineDB.ts
 * IndexedDB wrapper untuk kasir offline.
 * Menyimpan: produk cache, transaksi pending, pelanggan cache
 */

const DB_NAME = 'tokoku_offline'
const DB_VERSION = 1

export type OfflineTransaction = {
  id: string               // uuid lokal
  store_id: string
  items: OfflineCartItem[]
  total: number
  metode_bayar: string
  bayar: number
  kembalian: number
  customer_id?: string
  customer_nama?: string
  catatan?: string
  created_at: string
  synced: boolean
}

export type OfflineCartItem = {
  product_id: string
  nama_produk: string
  harga_jual: number
  qty: number
  subtotal: number
}

export type CachedProduct = {
  id: string
  store_id: string
  category_id: string | null
  nama: string
  sku: string | null
  harga_jual: number
  harga_beli: number
  stok: number
  stok_minimum: number
  satuan: string
  gambar_url: string | null
  is_active: boolean
  cached_at: string
}

export type CachedCustomer = {
  id: string
  store_id: string
  nama: string
  telepon: string | null
  cached_at: string
}

// ── Open DB ────────────────────────────────────────────────────
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result

      // Store untuk transaksi offline
      if (!db.objectStoreNames.contains('offline_transactions')) {
        const txStore = db.createObjectStore('offline_transactions', { keyPath: 'id' })
        txStore.createIndex('synced', 'synced')
        txStore.createIndex('store_id', 'store_id')
      }

      // Store untuk cache produk
      if (!db.objectStoreNames.contains('products_cache')) {
        const prodStore = db.createObjectStore('products_cache', { keyPath: 'id' })
        prodStore.createIndex('store_id', 'store_id')
      }

      // Store untuk cache pelanggan
      if (!db.objectStoreNames.contains('customers_cache')) {
        const custStore = db.createObjectStore('customers_cache', { keyPath: 'id' })
        custStore.createIndex('store_id', 'store_id')
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// ── Generic helpers ────────────────────────────────────────────
async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).getAll()
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror = () => reject(req.error)
  })
}

async function getAllByIndex<T>(storeName: string, indexName: string, value: string): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).index(indexName).getAll(value)
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror = () => reject(req.error)
  })
}

async function putAll<T>(storeName: string, items: T[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    items.forEach(item => store.put(item))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function putOne<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).put(item)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function deleteOne(storeName: string, id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite')
    tx.objectStore(storeName).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ── Products cache ─────────────────────────────────────────────
export async function cacheProducts(storeId: string, products: CachedProduct[]): Promise<void> {
  const withMeta = products.map(p => ({ ...p, cached_at: new Date().toISOString() }))
  await putAll('products_cache', withMeta)
}

export async function getCachedProducts(storeId: string): Promise<CachedProduct[]> {
  return getAllByIndex<CachedProduct>('products_cache', 'store_id', storeId)
}

// ── Customers cache ────────────────────────────────────────────
export async function cacheCustomers(storeId: string, customers: CachedCustomer[]): Promise<void> {
  const withMeta = customers.map(c => ({ ...c, cached_at: new Date().toISOString() }))
  await putAll('customers_cache', withMeta)
}

export async function getCachedCustomers(storeId: string): Promise<CachedCustomer[]> {
  return getAllByIndex<CachedCustomer>('customers_cache', 'store_id', storeId)
}

// ── Offline transactions ───────────────────────────────────────
export async function saveOfflineTransaction(tx: OfflineTransaction): Promise<void> {
  await putOne('offline_transactions', tx)
}

export async function getPendingTransactions(storeId: string): Promise<OfflineTransaction[]> {
  const all = await getAllByIndex<OfflineTransaction>('offline_transactions', 'store_id', storeId)
  return all.filter(t => !t.synced)
}

export async function getAllOfflineTransactions(storeId: string): Promise<OfflineTransaction[]> {
  return getAllByIndex<OfflineTransaction>('offline_transactions', 'store_id', storeId)
}

export async function markTransactionSynced(id: string): Promise<void> {
  const all = await getAll<OfflineTransaction>('offline_transactions')
  const tx = all.find(t => t.id === id)
  if (tx) await putOne('offline_transactions', { ...tx, synced: true })
}

export async function deleteOfflineTransaction(id: string): Promise<void> {
  await deleteOne('offline_transactions', id)
}

// ── Stok update lokal ──────────────────────────────────────────
export async function decrementCachedStok(productId: string, qty: number): Promise<void> {
  const all = await getAll<CachedProduct>('products_cache')
  const product = all.find(p => p.id === productId)
  if (!product) return
  await putOne('products_cache', {
    ...product,
    stok: Math.max(0, product.stok - qty),
  })
}

// ── Clear cache ────────────────────────────────────────────────
export async function clearCache(storeId: string): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(['products_cache', 'customers_cache'], 'readwrite')
  const productStore = tx.objectStore('products_cache')
  const customerStore = tx.objectStore('customers_cache')

  const products = await new Promise<CachedProduct[]>((res, rej) => {
    const r = productStore.index('store_id').getAll(storeId)
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })

  const customers = await new Promise<CachedCustomer[]>((res, rej) => {
    const r = customerStore.index('store_id').getAll(storeId)
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })

  products.forEach(p => productStore.delete(p.id))
  customers.forEach(c => customerStore.delete(c.id))
}