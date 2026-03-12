'use client'

import { useState, useEffect } from 'react'
import { Download, X, Smartphone } from 'lucide-react'

// ── Service Worker Registration ─────────────────────────────────
export function registerServiceWorker() {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.warn('SW registration failed:', err))
  })
}

// ── Push Notification Permission ────────────────────────────────
export async function requestPushPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

// ── PWA Install Prompt Component ────────────────────────────────
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt]         = useState(false)
  const [isIOS, setIsIOS]                   = useState(false)
  const [isInstalled, setIsInstalled]       = useState(false)

  useEffect(() => {
    // Cek apakah sudah diinstall
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Deteksi iOS (tidak support beforeinstallprompt)
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)

    if (ios) {
      // Tampilkan petunjuk iOS setelah 3 detik kalau belum dismiss
      const dismissed = localStorage.getItem('pwa-ios-dismissed')
      if (!dismissed) setTimeout(() => setShowPrompt(true), 3000)
      return
    }

    // Android / Chrome: tangkap beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      const dismissed = localStorage.getItem('pwa-dismissed')
      if (!dismissed) setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setShowPrompt(false)
    setDeferredPrompt(null)
  }

  function handleDismiss() {
    setShowPrompt(false)
    localStorage.setItem(isIOS ? 'pwa-ios-dismissed' : 'pwa-dismissed', '1')
  }

  if (!showPrompt || isInstalled) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-slide-up">
      <div className="bg-[#181c27] border border-green-500/30 rounded-2xl p-4 shadow-2xl shadow-black/50">
        <button onClick={handleDismiss}
          className="absolute top-3 right-3 text-[#3a4560] hover:text-[#64748b]">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-6 h-6 text-[#0a0d14]" />
          </div>
          <div className="flex-1 pr-4">
            <div className="font-black text-white text-sm mb-0.5">Install TokoKu</div>
            <div className="text-xs text-[#64748b]">
              {isIOS
                ? 'Tap ⎙ Share → "Add to Home Screen" untuk install'
                : 'Akses kasir lebih cepat. Bisa dipakai offline!'}
            </div>
          </div>
        </div>

        {!isIOS && (
          <button onClick={handleInstall}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-green-400 hover:bg-green-300 text-[#0a0d14] rounded-xl font-black text-sm transition-colors">
            <Download className="w-4 h-4" />
            Install Sekarang — Gratis
          </button>
        )}

        {isIOS && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-[#0f1117] rounded-xl">
            <span className="text-lg">⎙</span>
            <span className="text-xs text-[#64748b]">Tap Share → "Add to Home Screen"</span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  )
}