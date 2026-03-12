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
        Row: { id: string; store_id: string; customer_id: string | null; nomor_transaksi: string; total: number; bayar: number | null; kembalian: number | null; metode_bayar: string; status: string; catatan: string | null; created_by: string | null; created_at: string }
        Insert: { id?: string; store_id: string; customer_id?: string | null; nomor_transaksi: string; total: number; bayar?: number | null; kembalian?: number | null; metode_bayar: string; status?: string; catatan?: string | null; created_by?: string | null; created_at?: string }
        Update: { id?: string; store_id?: string; customer_id?: string | null; nomor_transaksi?: string; total?: number; bayar?: number | null; kembalian?: number | null; metode_bayar?: string; status?: string; catatan?: string | null; created_by?: string | null; created_at?: string }
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