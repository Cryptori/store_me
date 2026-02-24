'use client'

type Props = {
  nomorTransaksi: string
  onClose: () => void
  onPrint: () => void
}

export default function SuccessModal({ nomorTransaksi, onClose, onPrint }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#181c27] border border-[#2a3045] rounded-2xl w-full max-w-sm shadow-2xl text-center p-8">
        <div className="w-16 h-16 rounded-full bg-green-400/20 border-2 border-green-400/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h3 className="text-xl font-black text-white mb-1">Transaksi Berhasil!</h3>
        <p className="text-[#64748b] text-sm mb-1">Nomor transaksi:</p>
        <p className="font-mono font-bold text-green-400 text-sm mb-6">{nomorTransaksi}</p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#1e2333] border border-[#2a3045] text-white font-bold text-sm hover:bg-[#2a3045] transition-colors">
            Tutup
          </button>
          <button onClick={() => { onPrint(); onClose() }}
            className="flex-1 py-3 rounded-xl bg-green-400 text-[#0a0d14] font-black text-sm hover:bg-green-300 transition-colors">
            🖨️ Print Struk
          </button>
        </div>
      </div>
    </div>
  )
}