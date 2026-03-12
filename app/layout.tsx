import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt'
import { PWAInit } from '@/components/pwa/PWAInit'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TokoKu — Kasir Digital UMKM',
  description: 'Aplikasi kasir digital gratis untuk UMKM Indonesia. Catat penjualan, stok, hutang, dan laporan dengan mudah.',
  keywords: ['kasir', 'pos', 'umkm', 'warung', 'toko', 'gratis'],
  authors: [{ name: 'TokoKu' }],
  applicationName: 'TokoKu',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TokoKu',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    title: 'TokoKu — Kasir Digital UMKM',
    description: 'Kasir digital gratis untuk UMKM Indonesia',
    siteName: 'TokoKu',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#4ade80',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <head>
        {/* PWA iOS */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Splash screens iOS — opsional, bisa di-skip */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-1125x2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
      </head>
      <body className={`${inter.className} bg-[#0a0d14] text-[#e2e8f0] antialiased`}>
        <PWAInit />
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  )
}