'use client'

import { useState } from 'react'
import { CheckCircle, Printer, MessageCircle, Copy, Check } from 'lucide-react'

type Props = {
  nomorTransaksi: string
  onClose: () => void
  onPrint: () => void
  onShareWA: () => void
  onCopyStruk: () => Promise<boolean>
  hasCustomerPhone?: boolean  // tampilkan label berbeda kalau ada nomor pelanggan
}

export default function SuccessModal({
  nomorTransaksi, onClose, onPrint, onShareWA, onCopyStruk, hasCustomerPhone,
}: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const ok = await onCopyStruk()
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl w-full max-w-sm shadow-2xl text-center p-8">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-green-400/20 border-2 border-green-400/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>

        <h3 className="text-xl font-black text-white mb-1">Transaksi Berhasil!</h3>
        <p className="text-[#64748b] text-sm mb-1">Nomor transaksi:</p>
        <p className="font-mono font-bold text-green-400 text-sm mb-6">{nomorTransaksi}</p>

        {/* Action buttons */}
        <div className="space-y-2">
          {/* WhatsApp — primary action */}
          <button onClick={() => { onShareWA(); onClose() }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] hover:bg-[#20c05a] text-white font-black text-sm transition-colors">
            <MessageCircle className="w-4 h-4" />
            {hasCustomerPhone ? 'Kirim Struk via WhatsApp' : 'Share Struk via WhatsApp'}
          </button>

          {/* Print + Tutup */}
          <div className="flex gap-2">
            <button onClick={() => { onPrint(); onClose() }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white font-bold text-sm hover:bg-[#2a3045] transition-colors">
              <Printer className="w-4 h-4" />
              Print
            </button>

            <button onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white font-bold text-sm hover:bg-[#2a3045] transition-colors">
              {copied
                ? <><Check className="w-4 h-4 text-green-400" /><span className="text-green-400">Tersalin!</span></>
                : <><Copy className="w-4 h-4" />Copy Teks</>}
            </button>
          </div>

          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-[#64748b] hover:text-white text-sm font-medium transition-colors">
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}