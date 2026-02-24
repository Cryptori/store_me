'use client'

import { AlertTriangle } from 'lucide-react'

type Props = {
  menipis: number
  habis: number
}

export default function StokAlert({ menipis, habis }: Props) {
  if (menipis === 0 && habis === 0) return null

  return (
    <div className="flex flex-wrap gap-3 mb-5">
      {habis > 0 && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-sm text-red-400 font-semibold">{habis} produk stok habis</span>
        </div>
      )}
      {menipis > 0 && (
        <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2.5">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-yellow-400 font-semibold">{menipis} produk stok menipis</span>
        </div>
      )}
    </div>
  )
}