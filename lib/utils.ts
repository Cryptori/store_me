import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// shadcn/ui utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format tanggal Indonesia
export function formatTanggal(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

// Format tanggal singkat
export function formatTanggalSingkat(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

// Format jam
export function formatJam(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

// Hitung kembalian
export function hitungKembalian(total: number, bayar: number): number {
  return Math.max(0, bayar - total)
}

// Cek apakah stok hampir habis
export function isStokMenipis(stok: number, stokMinimum: number): boolean {
  return stok <= stokMinimum
}

// Inisial dari nama (untuk avatar)
export function getInisial(nama: string): string {
  return nama
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Singkat angka besar (1000 → 1k, 1000000 → 1jt)
export function singkatAngka(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'jt'
  if (num >= 1_000) return (num / 1_000).toFixed(0) + 'k'
  return num.toString()
}