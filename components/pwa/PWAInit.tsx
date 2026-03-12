'use client'

import { useEffect } from 'react'
import { registerServiceWorker } from '@/components/pwa/PWAInstallPrompt'

export function PWAInit() {
  useEffect(() => {
    registerServiceWorker()
  }, [])
  return null
}