export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: { id: string; store_id: string; nama: string; created_at: string }
        Insert: { id?: string; store_id: string; nama: string; created_at?: string }
        Update: { id?: string; store_id?: string; nama?: string; created_at?: string }
      }
      customers: {
        Row: { id: string; store_id: string; nama: string; telepon: string | null; alamat: string | null; total_hutang: number; created_at: string; updated_at: string }
        Insert: { id?: string; store_id: string; nama: string; telepon?: string | null; alamat?: string | null; total_hutang?: number; created_at?: string; updated_at?: string }
        Update: { id?: string; store_id?: string; nama?: string; telepon?: string | null; alamat?: string | null; total_hutang?: number; created_at?: string; updated_at?: string }
      }
      debt_payments: {
        Row: { id: string; debt_id: string; jumlah_bayar: number; catatan: string | null; created_at: string }
        Insert: { id?: string; debt_id: string; jumlah_bayar: number; catatan?: string | null; created_at?: string }
        Update: { id?: string; debt_id?: string; jumlah_bayar?: number; catatan?: string | null; created_at?: string }
      }
      debts: {
        Row: { id: string; store_id: string; customer_id: string; transaction_id: string | null; jumlah: number; sisa: number; status: string; catatan: string | null; jatuh_tempo: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; store_id: string; customer_id: string; transaction_id?: string | null; jumlah: number; sisa: number; status?: string; catatan?: string | null; jatuh_tempo?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; store_id?: string; customer_id?: string; transaction_id?: string | null; jumlah?: number; sisa?: number; status?: string; catatan?: string | null; jatuh_tempo?: string | null; created_at?: string; updated_at?: string }
      }
      kasir_invitations: {
        Row: { id: string; store_id: string; email: string; token: string; role: string; status: string; expires_at: string; created_at: string }
        Insert: { id?: string; store_id: string; email: string; token: string; role?: string; status?: string; expires_at?: string; created_at?: string }
        Update: { id?: string; store_id?: string; email?: string; token?: string; role?: string; status?: string; expires_at?: string; created_at?: string }
      }
      payments: {
        Row: { id: string; store_id: string; midtrans_order_id: string; midtrans_transaction_id: string | null; midtrans_token: string | null; amount: number; durasi_bulan: number; payment_type: string | null; status: string; notes: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; store_id: string; midtrans_order_id: string; midtrans_transaction_id?: string | null; midtrans_token?: string | null; amount: number; durasi_bulan?: number; payment_type?: string | null; status?: string; notes?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; store_id?: string; midtrans_order_id?: string; midtrans_transaction_id?: string | null; midtrans_token?: string | null; amount?: number; durasi_bulan?: number; payment_type?: string | null; status?: string; notes?: string | null; created_at?: string; updated_at?: string }
      }
      products: {
        Row: { id: string; store_id: string; category_id: string | null; nama: string; sku: string | null; harga_beli: number; harga_jual: number; stok: number; stok_minimum: number; satuan: string; gambar_url: string | null; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; store_id: string; category_id?: string | null; nama: string; sku?: string | null; harga_beli?: number; harga_jual: number; stok?: number; stok_minimum?: number; satuan?: string; gambar_url?: string | null; is_active?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; store_id?: string; category_id?: string | null; nama?: string; sku?: string | null; harga_beli?: number; harga_jual?: number; stok?: number; stok_minimum?: number; satuan?: string; gambar_url?: string | null; is_active?: boolean; created_at?: string; updated_at?: string }
      }
      referrals: {
        Row: { id: string; referrer_store_id: string; referred_store_id: string | null; code: string; status: string; reward_given: boolean; created_at: string; used_at: string | null }
        Insert: { id?: string; referrer_store_id: string; referred_store_id?: string | null; code: string; status?: string; reward_given?: boolean; created_at?: string; used_at?: string | null }
        Update: { id?: string; referrer_store_id?: string; referred_store_id?: string | null; code?: string; status?: string; reward_given?: boolean; created_at?: string; used_at?: string | null }
      }
      stock_logs: {
        Row: { id: string; product_id: string; store_id: string; tipe: string; jumlah: number; stok_sebelum: number | null; stok_sesudah: number | null; keterangan: string | null; created_at: string }
        Insert: { id?: string; product_id: string; store_id: string; tipe: string; jumlah: number; stok_sebelum?: number | null; stok_sesudah?: number | null; keterangan?: string | null; created_at?: string }
        Update: { id?: string; product_id?: string; store_id?: string; tipe?: string; jumlah?: number; stok_sebelum?: number | null; stok_sesudah?: number | null; keterangan?: string | null; created_at?: string }
      }
      store_members: {
        Row: { id: string; store_id: string; user_id: string; role: string; nama: string; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; store_id: string; user_id: string; role?: string; nama: string; is_active?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; store_id?: string; user_id?: string; role?: string; nama?: string; is_active?: boolean; created_at?: string; updated_at?: string }
      }
      stores: {
        Row: {
          id: string; user_id: string; nama: string; alamat: string | null
          telepon: string | null; logo_url: string | null
          is_pro: boolean; pro_expires_at: string | null
          is_trial: boolean; trial_expires_at: string | null; trial_used: boolean
          referral_code: string | null; referral_reward_days: number
          is_active_default: boolean; urutan: number
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; user_id: string; nama: string; alamat?: string | null
          telepon?: string | null; logo_url?: string | null
          is_pro?: boolean; pro_expires_at?: string | null
          is_trial?: boolean; trial_expires_at?: string | null; trial_used?: boolean
          referral_code?: string | null; referral_reward_days?: number
          created_at?: string; updated_at?: string
        }
        Update: {
          id?: string; user_id?: string; nama?: string; alamat?: string | null
          telepon?: string | null; logo_url?: string | null
          is_pro?: boolean; pro_expires_at?: string | null
          is_trial?: boolean; trial_expires_at?: string | null; trial_used?: boolean
          referral_code?: string | null; referral_reward_days?: number
          created_at?: string; updated_at?: string
        }
      }
      transaction_items: {
        Row: { id: string; transaction_id: string; product_id: string | null; nama_produk: string; harga_jual: number; qty: number; subtotal: number }
        Insert: { id?: string; transaction_id: string; product_id?: string | null; nama_produk: string; harga_jual: number; qty: number; subtotal: number }
        Update: { id?: string; transaction_id?: string; product_id?: string | null; nama_produk?: string; harga_jual?: number; qty?: number; subtotal?: number }
      }
      transactions: {
        Row: { id: string; store_id: string; customer_id: string | null; nomor_transaksi: string; total: number; bayar: number | null; kembalian: number | null; metode_bayar: string; status: string; catatan: string | null; created_by: string | null; created_at: string; promo_id: string | null; diskon_amount: number; subtotal_sebelum_diskon: number | null }
        Insert: { id?: string; store_id: string; customer_id?: string | null; nomor_transaksi: string; total: number; bayar?: number | null; kembalian?: number | null; metode_bayar: string; status?: string; catatan?: string | null; created_by?: string | null; created_at?: string; promo_id?: string | null; diskon_amount?: number; subtotal_sebelum_diskon?: number | null }
        Update: { id?: string; store_id?: string; customer_id?: string | null; nomor_transaksi?: string; total?: number; bayar?: number | null; kembalian?: number | null; metode_bayar?: string; status?: string; catatan?: string | null; created_by?: string | null; created_at?: string; promo_id?: string | null; diskon_amount?: number; subtotal_sebelum_diskon?: number | null }
      }
      promos: {
        Row: { id: string; store_id: string; nama: string; tipe: string; nilai: number; min_transaksi: number; maks_diskon: number | null; kode_voucher: string | null; berlaku_mulai: string; berlaku_sampai: string | null; hari_aktif: string[] | null; is_active: boolean; kuota: number | null; terpakai: number; created_at: string }
        Insert: { id?: string; store_id: string; nama: string; tipe: string; nilai: number; min_transaksi?: number; maks_diskon?: number | null; kode_voucher?: string | null; berlaku_mulai?: string; berlaku_sampai?: string | null; hari_aktif?: string[] | null; is_active?: boolean; kuota?: number | null; terpakai?: number; created_at?: string }
        Update: { id?: string; store_id?: string; nama?: string; tipe?: string; nilai?: number; min_transaksi?: number; maks_diskon?: number | null; kode_voucher?: string | null; berlaku_mulai?: string; berlaku_sampai?: string | null; hari_aktif?: string[] | null; is_active?: boolean; kuota?: number | null; terpakai?: number; created_at?: string }
      }
      promo_usage: {
        Row: { id: string; promo_id: string; transaction_id: string; store_id: string; diskon_amount: number; created_at: string }
        Insert: { id?: string; promo_id: string; transaction_id: string; store_id: string; diskon_amount: number; created_at?: string }
        Update: { id?: string; promo_id?: string; transaction_id?: string; store_id?: string; diskon_amount?: number; created_at?: string }
      }
      suppliers: {
        Row: { id: string; store_id: string; nama: string; telepon: string | null; email: string | null; alamat: string | null; catatan: string | null; is_active: boolean; created_at: string }
        Insert: { id?: string; store_id: string; nama: string; telepon?: string | null; email?: string | null; alamat?: string | null; catatan?: string | null; is_active?: boolean; created_at?: string }
        Update: { id?: string; store_id?: string; nama?: string; telepon?: string | null; email?: string | null; alamat?: string | null; catatan?: string | null; is_active?: boolean; created_at?: string }
      }
      purchase_orders: {
        Row: { id: string; store_id: string; supplier_id: string; nomor_po: string; status: string; total: number; dibayar: number; catatan: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; store_id: string; supplier_id: string; nomor_po: string; status?: string; total: number; dibayar?: number; catatan?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; store_id?: string; supplier_id?: string; nomor_po?: string; status?: string; total?: number; dibayar?: number; catatan?: string | null; created_at?: string; updated_at?: string }
      }
      purchase_order_items: {
        Row: { id: string; po_id: string; product_id: string | null; nama_produk: string; qty_pesan: number; qty_diterima: number; harga_beli: number; subtotal: number }
        Insert: { id?: string; po_id: string; product_id?: string | null; nama_produk: string; qty_pesan: number; qty_diterima?: number; harga_beli: number; subtotal: number }
        Update: { id?: string; po_id?: string; product_id?: string | null; nama_produk?: string; qty_pesan?: number; qty_diterima?: number; harga_beli?: number; subtotal?: number }
      }
      supplier_debts: {
        Row: { id: string; store_id: string; supplier_id: string; po_id: string; total: number; dibayar: number; sisa: number; status: string; created_at: string; updated_at: string }
        Insert: { id?: string; store_id: string; supplier_id: string; po_id: string; total: number; dibayar?: number; sisa?: number; status?: string; created_at?: string; updated_at?: string }
        Update: { id?: string; store_id?: string; supplier_id?: string; po_id?: string; total?: number; dibayar?: number; sisa?: number; status?: string; created_at?: string; updated_at?: string }
      }
      push_subscriptions: {
        Row: { id: string; store_id: string; endpoint: string; p256dh: string; auth: string; created_at: string }
        Insert: { id?: string; store_id: string; endpoint: string; p256dh: string; auth: string; created_at?: string }
        Update: { id?: string; store_id?: string; endpoint?: string; p256dh?: string; auth?: string; created_at?: string }
      }
    }
    Functions: {
      generate_nomor_transaksi:    { Args: { p_store_id: string };                              Returns: string }
      activate_pro_subscription:   { Args: { p_store_id: string; p_durasi_bulan: number };      Returns: void }
      activate_trial:              { Args: { p_store_id: string };                              Returns: void }
      expire_trials:               { Args: Record<string, never>;                               Returns: void }
      generate_referral_code:      { Args: { p_store_id: string };                              Returns: string }
      create_referral:             { Args: { p_store_id: string };                              Returns: string }
      use_referral_code:           { Args: { p_code: string; p_new_store_id: string };          Returns: Json }
      create_kasir_invitation:     { Args: { p_store_id: string; p_email: string };             Returns: Json }
      accept_kasir_invitation:     { Args: { p_token: string };                                 Returns: Json }
      user_has_store_access:       { Args: { p_store_id: string };                              Returns: boolean }
      can_create_store:            { Args: { p_user_id: string };                               Returns: Json }
      copy_products_to_store:      { Args: { p_from_store_id: string; p_to_store_id: string };  Returns: number }
      decrement_stok:              { Args: { p_product_id: string; p_qty: number };             Returns: void }
      validate_voucher:            { Args: { p_kode: string; p_store_id: string; p_total: number }; Returns: Json }
      get_active_promos:           { Args: { p_store_id: string };                              Returns: Json }
      use_voucher:                 { Args: { p_promo_id: string };                              Returns: void }
      generate_nomor_po:           { Args: { p_store_id: string };                              Returns: string }
      terima_barang_po:            { Args: { p_po_id: string; p_items: Json };                  Returns: void }
      bayar_hutang_supplier:       { Args: { p_debt_id: string; p_jumlah: number };             Returns: void }
      get_laporan_penjualan:       { Args: { p_store_id: string; p_dari: string; p_sampai: string }; Returns: Json }
      get_produk_terlaris:         { Args: { p_store_id: string; p_dari: string; p_sampai: string }; Returns: Json }
      get_laporan_laba_rugi:       { Args: { p_store_id: string; p_dari: string; p_sampai: string }; Returns: Json }
      get_laporan_stok:            { Args: { p_store_id: string };                              Returns: Json }
      get_laporan_hutang_pelanggan:{ Args: { p_store_id: string };                              Returns: Json }
      get_laporan_hutang_supplier: { Args: { p_store_id: string };                              Returns: Json }
    }
  }
}

export type Store         = Database['public']['Tables']['stores']['Row']
export type Product       = Database['public']['Tables']['products']['Row']
export type Customer      = Database['public']['Tables']['customers']['Row']
export type Transaction   = Database['public']['Tables']['transactions']['Row']
export type TransactionItem = Database['public']['Tables']['transaction_items']['Row']
export type Debt          = Database['public']['Tables']['debts']['Row']
export type DebtPayment   = Database['public']['Tables']['debt_payments']['Row']
export type StockLog      = Database['public']['Tables']['stock_logs']['Row']
export type Category      = Database['public']['Tables']['categories']['Row']
export type Payment       = Database['public']['Tables']['payments']['Row']
export type StoreMember   = Database['public']['Tables']['store_members']['Row']
export type KasirInvitation = Database['public']['Tables']['kasir_invitations']['Row']
export type Referral      = Database['public']['Tables']['referrals']['Row']
export type Promo         = Database['public']['Tables']['promos']['Row']
export type PromoUsage    = Database['public']['Tables']['promo_usage']['Row']
export type Supplier      = Database['public']['Tables']['suppliers']['Row']
export type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row']
export type POItem        = Database['public']['Tables']['purchase_order_items']['Row']
export type SupplierDebt  = Database['public']['Tables']['supplier_debts']['Row']
export type PushSubscription = Database['public']['Tables']['push_subscriptions']['Row']