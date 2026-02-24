import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'TokoKu — Aplikasi Kasir & Manajemen Toko',
  description: 'Kelola toko, kasir, stok, hutang pelanggan, dan laporan penjualan dalam satu aplikasi. Gratis selamanya.',
  keywords: ['kasir', 'toko', 'pos', 'manajemen stok', 'laporan penjualan', 'hutang pelanggan'],
  authors: [{ name: 'TokoKu' }],
  metadataBase: new URL('https://store-me-8n38.vercel.app'),
  openGraph: {
    title: 'TokoKu — Aplikasi Kasir & Manajemen Toko',
    description: 'Kelola toko, kasir, stok, hutang pelanggan, dan laporan penjualan dalam satu aplikasi.',
    type: 'website',
    locale: 'id_ID',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}