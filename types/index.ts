// Barrel export untuk semua types
// Import dari '@/types' bukan '@/types/database' atau '@/types/store'

export type {
  Store,
  Product,
  Customer,
  Transaction,
  TransactionItem,
  Debt,
  DebtPayment,
  StockLog,
  Category,
  Payment,
  Database,
  Json,
} from './database'

export type { StoreState, FreemiumState } from './store'