import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// shadcn/ui utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format rupiah — guard untuk NaN, null, undefined
export function formatRupiah(amount: number | null | undefined): string {
  const safe = amount ?? 0
  if (isNaN(safe)) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safe)
}

// Format tanggal panjang: "15 Januari 2026"
export function formatTanggal(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

// Format tanggal singkat: "15 Jan 2026"
export function formatTanggalSingkat(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

// Format jam: "14:30"
export function formatJam(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

// Hitung kembalian
export function hitungKembalian(total: number, bayar: number): number {
  return Math.max(0, bayar - total)
}

// Cek apakah stok menipis
export function isStokMenipis(stok: number, stokMinimum: number): boolean {
  return stok <= stokMinimum
}

// Inisial dari nama untuk avatar: "Budi Santoso" → "BS"
export function getInisial(nama: string): string {
  if (!nama?.trim()) return '?'
  return nama
    .trim()
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Singkat angka besar: 1500000 → "1.5jt", 49000 → "49k"
export function singkatAngka(num: number | null | undefined): string {
  const safe = num ?? 0
  if (isNaN(safe)) return '0'
  if (safe >= 1_000_000) return (safe / 1_000_000).toFixed(1).replace('.0', '') + 'jt'
  if (safe >= 1_000) return (safe / 1_000).toFixed(0) + 'k'
  return safe.toString()
}