'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Camera, Loader2, AlertCircle } from 'lucide-react'

type Props = {
  onDetected: (barcode: string) => void
  onClose: () => void
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const scannerRef = useRef<any>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const detectedRef = useRef(false)
  const containerId = 'barcode-scanner-container'

  useEffect(() => {
    let scanner: any

    async function init() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        scanner = new Html5Qrcode(containerId)
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.5,
          },
          (decodedText: string) => {
            if (detectedRef.current) return
            detectedRef.current = true
            if (navigator.vibrate) navigator.vibrate(100)
            scanner.stop().catch(() => {})
            onDetected(decodedText)
          },
          () => {} // scan error — diabaikan, scan terus
        )

        setStatus('ready')
      } catch (err: any) {
        console.error('Scanner error:', err)
        if (err?.message?.includes('Permission')) {
          setErrorMsg('Izinkan akses kamera di browser untuk scan barcode.')
        } else if (err?.message?.includes('NotFound')) {
          setErrorMsg('Kamera tidak ditemukan di perangkat ini.')
        } else {
          setErrorMsg('Tidak bisa membuka kamera. Coba refresh halaman.')
        }
        setStatus('error')
      }
    }

    init()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-green-400" />
          <span className="font-bold text-white">Scan Barcode</span>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scanner area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3 mb-6">
            <Loader2 className="w-8 h-8 animate-spin text-green-400" />
            <span className="text-white text-sm">Membuka kamera...</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center text-center gap-3">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="text-white font-semibold">Kamera tidak tersedia</p>
            <p className="text-[#94a3b8] text-sm max-w-xs">{errorMsg}</p>
            <button onClick={onClose}
              className="mt-2 px-6 py-2.5 bg-green-400 text-[#0a0d14] rounded-xl font-bold text-sm">
              Tutup
            </button>
          </div>
        )}

        {/* html5-qrcode render target */}
        <div
          id={containerId}
          className={`w-full max-w-sm rounded-2xl overflow-hidden ${status === 'error' ? 'hidden' : ''}`}
        />

        {status === 'ready' && (
          <p className="text-[#94a3b8] text-sm mt-4 text-center">
            Arahkan kamera ke barcode produk
          </p>
        )}
      </div>

      <div className="p-4 text-center">
        <p className="text-[#3a4560] text-xs">Barcode terdeteksi otomatis</p>
      </div>
    </div>
  )
}